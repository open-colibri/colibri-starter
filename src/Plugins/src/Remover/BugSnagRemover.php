<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Remover;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\RemoverInterface;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Docker;

use function Castor\io;

final readonly class BugSnagRemover implements RemoverInterface
{
    public function name(): string
    {
        return 'bugsnag';
    }

    public function description(): string
    {
        return 'Official BugSnag notifier for Symfony applications';
    }

    public function __invoke(App $app): void
    {
        io()->title('Removing BugSnag plugin');

        Composer::allowContribRecipes($app);
        Docker::run($app, 'composer remove bugsnag/bugsnag-symfony');
    }
}
