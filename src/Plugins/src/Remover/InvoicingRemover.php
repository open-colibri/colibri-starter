<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Remover;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\RemoverInterface;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Database;
use OpenColibri\Starter\Core\Util\Docker;

use function Castor\io;

final readonly class InvoicingRemover implements RemoverInterface
{
    public function name(): string
    {
        return 'invoicing';
    }

    public function description(): string
    {
        return 'Invoicing plugin for Sylius';
    }

    public function __invoke(App $app): void
    {
        io()->title('Removing Invoicing plugin');

        Composer::allowContribRecipes($app);
        Database::rollbackPluginMigrations($app, 'Sylius\InvoicingPlugin\Migrations');
        Docker::run($app, 'composer remove sylius/invoicing-plugin');
    }
}
