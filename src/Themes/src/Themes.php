<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Themes;

use OpenColibri\Starter\Core\Component\InstallerInterface;
use OpenColibri\Starter\Core\Component\RemoverInterface;

final class Themes
{
    private static array $installers = [];

    private static array $removers = [];

    public static function installers(): array
    {
        return self::$installers;
    }

    public static function addInstaller(InstallerInterface $installer): void
    {
        self::$installers[$installer->name()] = $installer;
    }

    public static function removers(): array
    {
        return self::$removers;
    }

    public static function addRemover(RemoverInterface $remover): void
    {
        self::$removers[$remover->name()] = $remover;
    }
}
