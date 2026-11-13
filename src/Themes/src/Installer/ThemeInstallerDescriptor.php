<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Themes\Installer;

use OpenColibri\Starter\Core\Component\InstallerInterface;
use OpenColibri\Starter\Themes\Attribute\AsThemeInstaller;

final readonly class ThemeInstallerDescriptor
{
    public function __construct(
        public AsThemeInstaller $attribute,
        public \ReflectionFunction|InstallerInterface $installer,
    ) {}
}
