<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Remover;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\RemoverInterface;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Docker;
use OpenColibri\Starter\Core\Util\Symfony;

use function Castor\fs;
use function Castor\io;

final readonly class GdprRemover implements RemoverInterface
{
    public function name(): string
    {
        return 'gdpr';
    }

    public function description(): string
    {
        return 'Synolia sylius GDPR plugin';
    }

    public function __invoke(App $app): void
    {
        io()->title('Removing GDPR plugin');

        Composer::allowContribRecipes($app);
        Docker::run($app, 'composer remove synolia/sylius-gdpr-plugin --no-scripts');

        fs()->remove($app->directory() . '/config/packages/gdpr.yaml');
        fs()->remove($app->directory() . '/config/routes/gdpr.yaml');

        Symfony::cacheClear($app);
    }
}
