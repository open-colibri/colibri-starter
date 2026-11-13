<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Core\Util;

use OpenColibri\Starter\Core\App;
use Symfony\Component\Process\Process;

final readonly class Docker
{
    /**
     * Runs a command in the application builder: Docker by default, or directly
     * on the host when COLIBRI_STARTER_RUNNER=local (see Runner).
     */
    public static function run(App $app, string $command): Process
    {
        return Runner::run($app, $command);
    }
}
