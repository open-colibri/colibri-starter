<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Remover;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\RemoverInterface;
use OpenColibri\Starter\Core\Util\Assets;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Database;
use OpenColibri\Starter\Core\Util\Docker;
use OpenColibri\Starter\Core\Util\Symfony;

use function Castor\io;

final readonly class CmsRemover implements RemoverInterface
{
    public function name(): string
    {
        return 'cms';
    }

    public function description(): string
    {
        return 'CMS plugin for Sylius applications';
    }

    public function __invoke(App $app): void
    {
        io()->title('Removing CMS plugin');

        Composer::allowContribRecipes($app);
        Database::rollbackPluginMigrations($app, 'Sylius\CmsPlugin\Migrations');
        Docker::run($app, 'composer remove sylius/cms-plugin');
        Assets::build($app);
        Symfony::cacheClear($app);
    }
}
