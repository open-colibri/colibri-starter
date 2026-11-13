<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Remover;

use OpenColibri\Starter\Core\Component\RemoverInterface;
use OpenColibri\Starter\Plugins\Attribute\AsPluginRemover;

final readonly class PluginRemoverDescriptor
{
    public function __construct(
        public AsPluginRemover $attribute,
        public \ReflectionFunction|RemoverInterface $remover,
    ) {}
}
