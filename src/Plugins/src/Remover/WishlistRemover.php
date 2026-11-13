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

final readonly class WishlistRemover implements RemoverInterface
{
    public function name(): string
    {
        return 'wishlist';
    }

    public function description(): string
    {
        return 'Wishlist plugin for Sylius';
    }

    public function __invoke(App $app): void
    {
        io()->title('Removing Wishlist plugin');

        Composer::allowContribRecipes($app);
        Database::rollbackPluginMigrations($app, 'Sylius\WishlistPlugin\Migrations');
        Docker::run($app, 'composer remove sylius/wishlist-plugin');
        Docker::run($app, 'bin/console assets:install public');
        Docker::run($app, 'yarn install');
        Assets::build($app);
        Symfony::cacheClear($app);
    }
}
