<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Installer;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\InstallerInterface;
use OpenColibri\Starter\Core\Util\Assets;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Database;
use OpenColibri\Starter\Core\Util\Docker;
use OpenColibri\Starter\Core\Util\Symfony;

use function Castor\fs;
use function Castor\io;

final readonly class WishlistInstaller implements InstallerInterface
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
        io()->title('Adding Wishlist Plugin');

        Composer::allowContribRecipes($app);
        Docker::run($app, 'bin/console assets:install public');
        Docker::run($app, 'yarn install');
        Assets::build($app);
        Database::migrate($app);
        Symfony::cacheClear($app);
    }
}
