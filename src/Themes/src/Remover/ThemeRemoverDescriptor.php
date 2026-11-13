<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Themes\Remover;

use OpenColibri\Starter\Core\Component\RemoverInterface;
use OpenColibri\Starter\Themes\Attribute\AsThemeRemover;

final readonly class ThemeRemoverDescriptor
{
    public function __construct(
        public AsThemeRemover $attribute,
        public \ReflectionFunction|RemoverInterface $remover,
    ) {}
}
