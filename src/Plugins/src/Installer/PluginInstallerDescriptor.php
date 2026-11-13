<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Installer;

use OpenColibri\Starter\Core\Component\InstallerInterface;
use OpenColibri\Starter\Plugins\Attribute\AsPluginInstaller;

final readonly class PluginInstallerDescriptor
{
    public function __construct(
        public AsPluginInstaller $attribute,
        public \ReflectionFunction|InstallerInterface $installer,
    ) {}
}
