<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Tests\Integration;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Finder\Finder;

/**
 * The header layout (category menu and its mobile toggle) belongs to Sylius and
 * the themes. The apps load YAML hook configs after the themes' PHP ones, so a
 * package touching these hookables silently wins over every theme.
 */
#[CoversNothing]
final class StorefrontHeaderContractTest extends TestCase
{
    private const HEADER_LAYOUT_HOOKABLES = [
        'taxon_hamburger',
        'taxon_menu',
        'sylius_shop.base.header.navbar',
    ];

    public function testOnlyThemesConfigureTheHeaderCategoryMenu(): void
    {
        $offenders = [];

        $files = (new Finder())
            ->files()
            ->in(\dirname(__DIR__, 2) . '/src/*/resources')
            ->path('#config/sylius/twig_hooks/#')
            ->name(['*.php', '*.yaml', '*.yml']);

        foreach ($files as $file) {
            if (str_contains($file->getRealPath(), '/src/Themes/resources/')) {
                continue;
            }

            foreach (self::HEADER_LAYOUT_HOOKABLES as $hookable) {
                if (str_contains($file->getContents(), $hookable)) {
                    $offenders[] = $file->getRelativePathname() . ' (' . $hookable . ')';
                }
            }
        }

        static::assertSame([], $offenders, 'The header category menu and its mobile toggle belong to the themes.');
    }

    public function testImportDoesNotShipHeaderHookOverrides(): void
    {
        static::assertFileDoesNotExist(\dirname(__DIR__, 2) . '/src/Import/resources/templates/application/config/sylius/twig_hooks/shop/header.yaml');
    }
}
