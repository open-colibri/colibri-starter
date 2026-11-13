<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Tests\Integration;

use Castor\Exception\FunctionConfigurationException;
use Castor\Helper\PathHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Plugins\Attribute\AsPluginInstaller;
use OpenColibri\Starter\Plugins\Attribute\AsPluginRemover;
use OpenColibri\Starter\Themes\Attribute\AsThemeInstaller;
use OpenColibri\Starter\Themes\Attribute\AsThemeRemover;

use function OpenColibri\Starter\Plugins\resolve_plugin_installer;
use function OpenColibri\Starter\Plugins\resolve_plugin_remover;
use function OpenColibri\Starter\Themes\resolve_theme_installer;
use function OpenColibri\Starter\Themes\resolve_theme_remover;

#[CoversClass(App::class)]
final class CustomComponentAttributesTest extends TestCase
{
    private App $app;

    protected function setUp(): void
    {
        $this->app = new App('app', '/tmp/app', 'app.test');
        SpiedComponent::$app = null;
    }

    public function testItIgnoresCallablesWithoutAttribute(): void
    {
        static::assertNull(resolve_plugin_installer(new \ReflectionFunction(__NAMESPACE__ . '\unrelated_function')));
        static::assertNull(resolve_plugin_remover(new \ReflectionClass(SpiedComponent::class)));
    }

    public function testItResolvesAFunctionInstaller(): void
    {
        $descriptor = resolve_plugin_installer(new \ReflectionFunction(__NAMESPACE__ . '\spied_installer'));

        static::assertInstanceOf(\ReflectionFunction::class, $descriptor?->installer);
        static::assertSame('spied_installer', $descriptor?->attribute->name);

        $descriptor?->installer->getClosure()($this->app);

        static::assertSame($this->app, SpiedComponent::$app);
    }

    public function testItResolvesAClassInstallerAndForwardsTheApp(): void
    {
        $descriptor = resolve_plugin_installer(new \ReflectionClass(SpiedInstaller::class));

        static::assertSame('spied_installer_class', $descriptor?->attribute->name);
        static::assertSame('spied_installer_class', $descriptor?->installer->name());

        ($descriptor->installer)($this->app);

        static::assertSame($this->app, SpiedComponent::$app);
    }

    public function testItForwardsTheInstallerDescriptionFromTheAttribute(): void
    {
        $descriptor = resolve_plugin_installer(new \ReflectionClass(SpiedInstaller::class));

        static::assertSame('Custom installer for Sylius', $descriptor?->installer->description());
    }

    public function testItForwardsANullDescriptionWhenTheAttributeOmitsIt(): void
    {
        $descriptor = resolve_plugin_installer(new \ReflectionClass(UndescribedInstaller::class));

        static::assertNull($descriptor?->installer->description());
    }

    public function testItResolvesAClassRemoverAndForwardsTheApp(): void
    {
        $descriptor = resolve_plugin_remover(new \ReflectionClass(SpiedRemover::class));

        static::assertSame('spied_remover_class', $descriptor?->attribute->name);

        ($descriptor->remover)($this->app);

        static::assertSame($this->app, SpiedComponent::$app);
    }

    public function testItForwardsTheRemoverDescriptionFromTheAttribute(): void
    {
        $descriptor = resolve_plugin_remover(new \ReflectionClass(SpiedRemover::class));

        static::assertSame('Custom remover for Sylius', $descriptor?->remover->description());
    }

    public function testItResolvesAThemeInstallerAndForwardsTheApp(): void
    {
        $descriptor = resolve_theme_installer(new \ReflectionClass(SpiedThemeInstaller::class));

        static::assertSame('spied_theme', $descriptor?->attribute->name);

        ($descriptor->installer)($this->app);

        static::assertSame($this->app, SpiedComponent::$app);
    }

    public function testItResolvesAThemeRemoverAndForwardsTheApp(): void
    {
        $descriptor = resolve_theme_remover(new \ReflectionClass(SpiedThemeRemover::class));

        static::assertSame('spied_theme', $descriptor?->attribute->name);

        ($descriptor->remover)($this->app);

        static::assertSame($this->app, SpiedComponent::$app);
    }

    public function testItRejectsAnAttributeOnANonCallableClass(): void
    {
        // Castor 1.9+ resolves the root directory when the application boots, and the exception makes paths relative to it.
        if (method_exists(PathHelper::class, 'initialize')) {
            $root = \dirname(__DIR__, 2);
            PathHelper::initialize($root, $root . '/vendor/jolicode/castor', $root);
        }

        $this->expectException(FunctionConfigurationException::class);

        resolve_plugin_installer(new \ReflectionClass(NotCallableInstaller::class));
    }
}

final class SpiedComponent
{
    public static ?App $app = null;
}

#[AsPluginInstaller(name: 'spied_installer')]
function spied_installer(App $app): void
{
    SpiedComponent::$app = $app;
}

function unrelated_function(): void {}

#[AsPluginInstaller(name: 'spied_installer_class', description: 'Custom installer for Sylius')]
final class SpiedInstaller
{
    public function __invoke(App $app): void
    {
        SpiedComponent::$app = $app;
    }
}

#[AsPluginInstaller(name: 'undescribed_installer_class')]
final class UndescribedInstaller
{
    public function __invoke(App $app): void
    {
        SpiedComponent::$app = $app;
    }
}

#[AsPluginRemover(name: 'spied_remover_class', description: 'Custom remover for Sylius')]
final class SpiedRemover
{
    public function __invoke(App $app): void
    {
        SpiedComponent::$app = $app;
    }
}

#[AsThemeInstaller(name: 'spied_theme')]
final class SpiedThemeInstaller
{
    public function __invoke(App $app): void
    {
        SpiedComponent::$app = $app;
    }
}

#[AsThemeRemover(name: 'spied_theme')]
final class SpiedThemeRemover
{
    public function __invoke(App $app): void
    {
        SpiedComponent::$app = $app;
    }
}

#[AsPluginInstaller(name: 'not_callable')]
final class NotCallableInstaller {}
