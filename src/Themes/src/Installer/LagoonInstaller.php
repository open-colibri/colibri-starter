<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Themes\Installer;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\InstallerInterface;
use OpenColibri\Starter\Core\Storefront\Brand;
use OpenColibri\Starter\Core\Storefront\Hero;
use OpenColibri\Starter\Core\Util\Assets;
use OpenColibri\Starter\Core\Util\Javascript;
use OpenColibri\Starter\Core\Util\Symfony;
use OpenColibri\Starter\Core\Util\Yaml;
use OpenColibri\Starter\Themes\ColorScheme;

use function Castor\finder;
use function Castor\fs;

final class LagoonInstaller implements InstallerInterface
{
    public function name(): string
    {
        return 'lagoon';
    }

    public function description(): ?string
    {
        return 'https://github.com/open-colibri/colibri-starter/blob/main/docs/themes/lagoon.md';
    }

    public function __invoke(App $app): void
    {
        Yaml::import($app, 'config/packages/_sylius.yaml', '../sylius/twig_hooks/**/**.php');
        Hero::install($app);
        Brand::install($app);
        ColorScheme::install($app);

        $resourcesDir = \dirname(__DIR__, 2) . '/resources/lagoon';

        foreach (finder()->files()->in($resourcesDir)->files() as $file) {
            fs()->copy($resourcesDir . '/' . $file->getRelativePathname(), $app->directory() . '/' . $file->getRelativePathname());
        }

        Javascript::addImport($app, 'assets/shop/entrypoint.js', './styles/app.scss');

        Assets::install($app);
        Assets::build($app);
        Symfony::cacheClear($app);
    }
}
