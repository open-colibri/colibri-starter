<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Core\Component;

use OpenColibri\Starter\Core\App;

final readonly class CallableInstaller implements InstallerInterface
{
    public function __construct(
        public string $name,
        public \Closure $code,
        public ?string $description = null,
    ) {}

    public function name(): string
    {
        return $this->name;
    }

    public function description(): ?string
    {
        return $this->description;
    }

    public function __invoke(App $app): void
    {
        ($this->code)($app);
    }
}
