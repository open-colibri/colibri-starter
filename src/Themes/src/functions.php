<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Themes;

use Castor\Attribute\AsListener;
use Castor\Event\AfterBootEvent;
use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\CallableInstaller;
use OpenColibri\Starter\Core\Component\CallableRemover;
use OpenColibri\Starter\Core\Component\ComponentResolver;
use OpenColibri\Starter\Core\Installer\SyliusInstallerExtensions;
use OpenColibri\Starter\Core\Service\SyliusService;
use OpenColibri\Starter\Core\Task\TaskProviderRegistry;
use OpenColibri\Starter\Themes\Attribute\AsThemeInstaller;
use OpenColibri\Starter\Themes\Attribute\AsThemeRemover;
use OpenColibri\Starter\Themes\Installer\ArenaInstaller;
use OpenColibri\Starter\Themes\Installer\AuroraInstaller;
use OpenColibri\Starter\Themes\Installer\BloomInstaller;
use OpenColibri\Starter\Themes\Installer\BlushInstaller;
use OpenColibri\Starter\Themes\Installer\CanvasInstaller;
use OpenColibri\Starter\Themes\Installer\CellarInstaller;
use OpenColibri\Starter\Themes\Installer\CultureInstaller;
use OpenColibri\Starter\Themes\Installer\DepotInstaller;
use OpenColibri\Starter\Themes\Installer\DriveInstaller;
use OpenColibri\Starter\Themes\Installer\GrooveInstaller;
use OpenColibri\Starter\Themes\Installer\HearthInstaller;
use OpenColibri\Starter\Themes\Installer\LagoonInstaller;
use OpenColibri\Starter\Themes\Installer\PawsInstaller;
use OpenColibri\Starter\Themes\Installer\PromptInstaller;
use OpenColibri\Starter\Themes\Installer\RetroGamingInstaller;
use OpenColibri\Starter\Themes\Installer\RoasteryInstaller;
use OpenColibri\Starter\Themes\Installer\SummitInstaller;
use OpenColibri\Starter\Themes\Installer\TeahouseInstaller;
use OpenColibri\Starter\Themes\Installer\TechInstaller;
use OpenColibri\Starter\Themes\Installer\TorqueInstaller;
use OpenColibri\Starter\Themes\Installer\ThemeInstallerDescriptor;
use OpenColibri\Starter\Themes\Installer\ThemesSyliusInstallerExtension;
use OpenColibri\Starter\Themes\Installer\VoltInstaller;
use OpenColibri\Starter\Themes\Remover\ArenaRemover;
use OpenColibri\Starter\Themes\Remover\AuroraRemover;
use OpenColibri\Starter\Themes\Remover\BloomRemover;
use OpenColibri\Starter\Themes\Remover\BlushRemover;
use OpenColibri\Starter\Themes\Remover\CanvasRemover;
use OpenColibri\Starter\Themes\Remover\CellarRemover;
use OpenColibri\Starter\Themes\Remover\CultureRemover;
use OpenColibri\Starter\Themes\Remover\DepotRemover;
use OpenColibri\Starter\Themes\Remover\DriveRemover;
use OpenColibri\Starter\Themes\Remover\GrooveRemover;
use OpenColibri\Starter\Themes\Remover\HearthRemover;
use OpenColibri\Starter\Themes\Remover\LagoonRemover;
use OpenColibri\Starter\Themes\Remover\PawsRemover;
use OpenColibri\Starter\Themes\Remover\PromptRemover;
use OpenColibri\Starter\Themes\Remover\RetroGamingRemover;
use OpenColibri\Starter\Themes\Remover\RoasteryRemover;
use OpenColibri\Starter\Themes\Remover\SummitRemover;
use OpenColibri\Starter\Themes\Remover\TeahouseRemover;
use OpenColibri\Starter\Themes\Remover\TechRemover;
use OpenColibri\Starter\Themes\Remover\TorqueRemover;
use OpenColibri\Starter\Themes\Remover\ThemeRemoverDescriptor;
use OpenColibri\Starter\Themes\Remover\VoltRemover;
use OpenColibri\Starter\Themes\Tasks\ThemeTasks;

TaskProviderRegistry::register(
    'themes',
    static fn(SyliusService $service): iterable => (new ThemeTasks($service->getName(), $service->getDirectory()))(),
);

SyliusInstallerExtensions::register('themes', new ThemesSyliusInstallerExtension());

#[AsListener(AfterBootEvent::class)]
function initialize(AfterBootEvent $afterBootEvent): void
{
    Themes::addInstaller(new CanvasInstaller());
    Themes::addInstaller(new PromptInstaller());
    Themes::addInstaller(new BlushInstaller());
    Themes::addInstaller(new VoltInstaller());
    Themes::addInstaller(new LagoonInstaller());
    Themes::addInstaller(new AuroraInstaller());
    Themes::addInstaller(new TechInstaller());
    Themes::addInstaller(new RetroGamingInstaller());
    Themes::addInstaller(new DriveInstaller());
    Themes::addInstaller(new CellarInstaller());
    Themes::addInstaller(new RoasteryInstaller());
    Themes::addInstaller(new TeahouseInstaller());
    Themes::addInstaller(new SummitInstaller());
    Themes::addInstaller(new GrooveInstaller());
    Themes::addInstaller(new ArenaInstaller());
    Themes::addInstaller(new HearthInstaller());
    Themes::addInstaller(new BloomInstaller());
    Themes::addInstaller(new PawsInstaller());
    Themes::addInstaller(new CultureInstaller());
    Themes::addInstaller(new DepotInstaller());
    Themes::addInstaller(new TorqueInstaller());

    Themes::addRemover(new CanvasRemover());
    Themes::addRemover(new PromptRemover());
    Themes::addRemover(new BlushRemover());
    Themes::addRemover(new VoltRemover());
    Themes::addRemover(new LagoonRemover());
    Themes::addRemover(new AuroraRemover());
    Themes::addRemover(new TechRemover());
    Themes::addRemover(new RetroGamingRemover());
    Themes::addRemover(new DriveRemover());
    Themes::addRemover(new CellarRemover());
    Themes::addRemover(new RoasteryRemover());
    Themes::addRemover(new TeahouseRemover());
    Themes::addRemover(new SummitRemover());
    Themes::addRemover(new GrooveRemover());
    Themes::addRemover(new ArenaRemover());
    Themes::addRemover(new HearthRemover());
    Themes::addRemover(new BloomRemover());
    Themes::addRemover(new PawsRemover());
    Themes::addRemover(new CultureRemover());
    Themes::addRemover(new DepotRemover());
    Themes::addRemover(new TorqueRemover());

    foreach (ComponentResolver::candidates() as $reflection) {
        $descriptor = resolve_theme_installer($reflection);

        if (null !== $descriptor) {
            Themes::addInstaller($descriptor->installer instanceof \ReflectionFunction
                ? new CallableInstaller($descriptor->attribute->name, $descriptor->installer->getClosure())
                : $descriptor->installer);
        }

        $descriptor = resolve_theme_remover($reflection);

        if (null !== $descriptor) {
            Themes::addRemover($descriptor->remover instanceof \ReflectionFunction
                ? new CallableRemover($descriptor->attribute->name, $descriptor->remover->getClosure())
                : $descriptor->remover);
        }
    }
}

function resolve_theme_installer(\ReflectionFunction|\ReflectionClass $reflection): ?ThemeInstallerDescriptor
{
    $resolved = ComponentResolver::resolve($reflection, AsThemeInstaller::class);

    if (null === $resolved) {
        return null;
    }

    [$attribute, $installer] = $resolved;

    if ($installer instanceof \ReflectionFunction) {
        return new ThemeInstallerDescriptor($attribute, $installer);
    }

    return new ThemeInstallerDescriptor($attribute, new CallableInstaller($attribute->name, static fn(App $app) => $installer($app)));
}

function resolve_theme_remover(\ReflectionFunction|\ReflectionClass $reflection): ?ThemeRemoverDescriptor
{
    $resolved = ComponentResolver::resolve($reflection, AsThemeRemover::class);

    if (null === $resolved) {
        return null;
    }

    [$attribute, $remover] = $resolved;

    if ($remover instanceof \ReflectionFunction) {
        return new ThemeRemoverDescriptor($attribute, $remover);
    }

    return new ThemeRemoverDescriptor($attribute, new CallableRemover($attribute->name, static fn(App $app) => $remover($app)));
}
