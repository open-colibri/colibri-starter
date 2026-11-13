<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Tests\Integration;

use Castor\Attribute\AsTask;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use OpenColibri\Starter\Core\Installer\SyliusInstallerExtensions;
use OpenColibri\Starter\Core\Service\SyliusService;
use OpenColibri\Starter\Core\Task\TaskProviderRegistry;
use OpenColibri\Starter\Themes\Installer\ThemesSyliusInstallerExtension;

/**
 * Every package registers its tasks in the core TaskProviderRegistry from a
 * file autoloaded by Composer: once installed, the SyliusService exposes them.
 */
final class TaskRegistrationTest extends TestCase
{
    /**
     * @return iterable<string, array{string, string}>
     */
    public static function packageTaskProvider(): iterable
    {
        yield 'plugins' => ['plugins', 'sylius:plugin:add'];
        yield 'plugins remover' => ['plugins', 'sylius:plugin:remove'];
        yield 'themes' => ['themes', 'sylius:theme:setup'];
        yield 'menu' => ['menu', 'sylius:menu:remove'];
        yield 'import list' => ['import', 'sylius:import:list'];
        yield 'import delete' => ['import', 'sylius:import:delete'];
        yield 'import ai build' => ['import', 'sylius:import:ai:build'];
        yield 'import fixtures generate' => ['import', 'sylius:import:fixtures:generate'];
        yield 'import fixtures load' => ['import', 'sylius:import:fixtures:load'];
        yield 'upsun' => ['upsun', 'sylius:upsun:check'];
        yield 'upsun setup' => ['upsun', 'sylius:upsun:setup'];
        yield 'upsun deploy' => ['upsun', 'sylius:upsun:deploy'];
    }

    #[DataProvider('packageTaskProvider')]
    public function testPackageTasksAreExposedByTheSyliusService(string $provider, string $task): void
    {
        static::assertTrue(TaskProviderRegistry::has($provider));
        static::assertContains($task, $this->taskNames(new SyliusService()));
    }

    public function testThemesExtendTheSyliusInstaller(): void
    {
        static::assertInstanceOf(ThemesSyliusInstallerExtension::class, SyliusInstallerExtensions::all()['themes'] ?? null);
    }

    /**
     * @return list<string>
     */
    private function taskNames(SyliusService $service): array
    {
        $names = [];

        foreach ($service->getTasks() as $task) {
            /** @var AsTask $asTask */
            $asTask = $task['task'];
            $names[] = $asTask->namespace . ':' . $asTask->name;
        }

        return $names;
    }
}
