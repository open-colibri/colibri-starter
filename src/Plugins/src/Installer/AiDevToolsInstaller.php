<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Installer;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\InstallerInterface;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Docker;

use function Castor\io;

final readonly class AiDevToolsInstaller implements InstallerInterface
{
    public function name(): string
    {
        return 'ai_dev_tools';
    }

    public function description(): string
    {
        return 'Dev-only AI tooling for Sylius';
    }

    public function __invoke(App $app): void
    {
        io()->title('Adding AI dev tools plugin');

        Composer::allowContribRecipes($app);
        Docker::run($app, 'composer require --dev sylius/sylius-ai-dev-tools');

        Docker::run($app, 'vendor/bin/mate init');
        Docker::run($app, 'vendor/bin/mate discover');
    }
}
