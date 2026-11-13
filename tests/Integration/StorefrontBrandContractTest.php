<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Tests\Integration;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Finder\Finder;

/**
 * The shop identity (logo) is a slot owned by opencolibri/starter-core. These checks
 * keep the import from shipping templates at paths themes write to: a theme
 * installer overwrites them and a theme remover deletes them.
 */
#[CoversNothing]
final class StorefrontBrandContractTest extends TestCase
{
    private const CORE_SLOT_DIR = 'src/Core/resources/storefront/brand';

    private const IMPORT_APPLICATION_DIR = 'src/Import/resources/templates/application';

    public function testImportShipsNoFileAThemeAlsoShips(): void
    {
        $root = \dirname(__DIR__, 2);
        $themeFiles = [];

        foreach ((new Finder())->files()->in($root . '/src/Themes/resources') as $file) {
            $relative = $file->getRelativePathname();
            $themeFiles[substr($relative, strpos($relative, '/') + 1)] = true;
        }

        $collisions = [];

        foreach ((new Finder())->files()->in($root . '/' . self::IMPORT_APPLICATION_DIR) as $file) {
            if (isset($themeFiles[$file->getRelativePathname()])) {
                $collisions[] = $file->getRelativePathname();
            }
        }

        sort($collisions);

        static::assertSame([], $collisions, 'Themes overwrite and remove these paths: use a core slot (hero, brand) or a path of your own.');
    }

    public function testNoPackageOverridesTheSyliusLogo(): void
    {
        $offenders = [];

        foreach ($this->packageResources()->path('#templates/bundles/SyliusShopBundle/shared/logo\.html\.twig$#') as $file) {
            $offenders[] = $file->getRelativePathname();
        }

        static::assertSame([], $offenders, 'Contribute a logo with a BrandContributorInterface instead of overriding the Sylius logo.');
    }

    public function testOnlyCoreConfiguresTheHeaderLogoContentHook(): void
    {
        $offenders = [];

        foreach ($this->packageResources()->path('#config/sylius/#')->name(['*.php', '*.yaml', '*.yml']) as $file) {
            if (str_contains($file->getContents(), 'sylius_shop.base.header.content.logo')) {
                $offenders[] = $file->getRelativePathname();
            }
        }

        static::assertSame([], $offenders, 'The "sylius_shop.base.header.content.logo" hook belongs to core (config/sylius/storefront/brand.yaml).');
    }

    /**
     * @return iterable<string, array{string}>
     */
    public static function themes(): iterable
    {
        $themesDir = \dirname(__DIR__, 2) . '/src/Themes/resources';

        foreach ((new Finder())->directories()->in($themesDir)->depth(0) as $dir) {
            yield $dir->getFilename() => [$dir->getFilename()];
        }
    }

    #[DataProvider('themes')]
    public function testEveryThemeRendersTheContributedLogo(string $theme): void
    {
        $identity = \dirname(__DIR__, 2) . '/src/Themes/resources/' . $theme . '/templates/shop/shared/layout/brand/identity.html.twig';

        static::assertFileExists($identity);
        static::assertStringContainsString('storefront_brand()', (string) file_get_contents($identity));
    }

    public function testEveryThemeInstallerInstallsTheBrandSlot(): void
    {
        $installers = (new Finder())->files()->in(\dirname(__DIR__, 2) . '/src/Themes/src/Installer')->name('*Installer.php');

        foreach ($installers as $installer) {
            static::assertStringContainsString('Brand::install($app)', $installer->getContents(), $installer->getFilename());
        }
    }

    private function packageResources(): Finder
    {
        return (new Finder())
            ->files()
            ->in(\dirname(__DIR__, 2) . '/src/*/resources')
            ->notPath('#^' . preg_quote(substr(self::CORE_SLOT_DIR, \strlen('src/Core/resources/')), '#') . '#');
    }
}
