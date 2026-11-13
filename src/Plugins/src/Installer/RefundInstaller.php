<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Installer;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\InstallerInterface;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Database;
use OpenColibri\Starter\Core\Util\Docker;
use OpenColibri\Starter\Core\Util\Symfony;

use function Castor\fs;
use function Castor\io;

final readonly class RefundInstaller implements InstallerInterface
{
    public function name(): string
    {
        return 'refund';
    }

    public function description(): string
    {
        return 'Basic refunds functionality for Sylius';
    }

    public function __invoke(App $app): void
    {
        io()->title('Adding Refund Plugin');

        Composer::allowContribRecipes($app);
        Docker::run($app, 'composer require sylius/refund-plugin');
        Database::migrate($app);
        Symfony::cacheClear($app);
    }
}
