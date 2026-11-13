<?php

declare(strict_types=1);

namespace worktree;

use Castor\Attribute\AsListener;
use Castor\Attribute\AsTask;
use Castor\Event\BeforeExecuteTaskEvent;
use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Util\Fixtures;

use function Castor\capture;
use function Castor\context;
use function Castor\fs;
use function Castor\io;
use function Castor\run;

/*
 * Every git worktree of this repository runs its own Docker stack, so several themes can be built side by side: the
 * main checkout keeps the "app" compose project and https://app.test, a worktree gets the "app-<slug>" project and
 * https://<slug>.app.localhost, with its own containers, database volume and app/ directory.
 */

function root(): string
{
    return \dirname(__DIR__, 2);
}

/**
 * Slug of the worktree this checkout is (its directory name), or null in the main checkout.
 *
 * Keep in sync with worktreeSlug() in scripts/capture-theme-screenshots.mjs.
 */
function slug(): ?string
{
    // A linked worktree has a ".git" file pointing at the main repository, the main checkout a ".git" directory.
    if (!is_file(root() . '/.git')) {
        return null;
    }

    $slug = trim(substr(strtolower((string) preg_replace('/[^A-Za-z0-9]+/', '-', basename(root()))), 0, 40), '-');

    return '' === $slug ? null : $slug;
}

/**
 * Compose project of the worktree stack, or null to keep the "name" of compose.yaml.
 */
function project_name(): ?string
{
    $slug = slug();

    return null === $slug ? null : 'app-' . $slug;
}

function domain(): string
{
    $slug = slug();

    // *.localhost resolves to the loopback without any /etc/hosts entry, and the router serves it over HTTPS too.
    return null === $slug ? 'app.test' : $slug . '.app.localhost';
}

function storefront_url(): string
{
    return \sprintf('https://%s/en_US/', domain());
}

function main_checkout(): string
{
    $commonDir = capture(['git', 'rev-parse', '--path-format=absolute', '--git-common-dir'], context: context()->withWorkingDirectory(root()));

    return \dirname($commonDir);
}

function is_installed(): bool
{
    return is_file(root() . '/app/composer.json');
}

#[AsTask(description: 'Install the Sylius app of this worktree in its own Docker stack (copy of the main checkout app)')]
function install(): int
{
    if (null === slug()) {
        io()->error('This is the main checkout: its app lives in app/ and https://app.test. Run this task from a git worktree.');

        return 1;
    }

    $target = root() . '/app';

    if (!is_installed()) {
        $source = main_checkout() . '/app';

        if (!is_file($source . '/composer.json')) {
            io()->error(\sprintf('No app to copy in "%s": install it in the main checkout first.', $source));

            return 1;
        }

        if (is_dir($target) && [] !== array_diff((array) scandir($target), ['.', '..'])) {
            io()->error(\sprintf('"%s" is not empty but has no composer.json: remove it first.', $target));

            return 1;
        }

        io()->section(\sprintf('Copying %s', $source));

        fs()->remove($target);
        // Copy-on-write clones (APFS, Btrfs, XFS): vendor/ and node_modules/ take no extra disk space until they change.
        run('Darwin' === \PHP_OS_FAMILY ? ['cp', '-Rc', $source, $target] : ['cp', '-R', '--reflink=auto', $source, $target]);
        fs()->remove([$target . '/var/cache', $target . '/var/log', $target . '/public/media']);

        // Sylius picks the channel by hostname: the fixtures must create it on the worktree domain.
        foreach (glob($target . '/config/sylius/fixtures/*/channels.php') ?: [] as $file) {
            fs()->dumpFile($file, str_replace("'hostname' => 'app.test'", \sprintf("'hostname' => '%s'", domain()), (string) file_get_contents($file)));
        }
    }

    io()->section('Starting the stack');
    // The images of a compose project are its own: the build mostly comes from the BuildKit cache of the main checkout.
    run(['castor', 'build'], context: context()->withWorkingDirectory(root()));
    run(['castor', 'up'], context: context()->withWorkingDirectory(root()));

    io()->section('Creating the database');
    run(['castor', 'app:db:migrate'], context: context()->withWorkingDirectory(root()));
    Fixtures::load(new App('app', $target));
    run(['castor', 'app:cache-clear', '--warm'], context: context()->withWorkingDirectory(root()));

    io()->success([
        \sprintf('The worktree storefront is up: %s', storefront_url()),
        'Switch its theme with "castor sylius:theme:setup <theme>", stop it with "castor stop", remove it with "castor destroy --force".',
    ]);

    return 0;
}

#[AsListener(BeforeExecuteTaskEvent::class)]
function warn_when_not_installed(BeforeExecuteTaskEvent $event): void
{
    $name = (string) $event->task->getName();

    if (null === slug() || is_installed() || !(str_starts_with($name, 'app:') || str_starts_with($name, 'sylius:') || 'docker:up' === $name)) {
        return;
    }

    io()->warning(\sprintf('This worktree has no app yet: run "castor worktree:install" to get its own stack on %s.', storefront_url()));
}
