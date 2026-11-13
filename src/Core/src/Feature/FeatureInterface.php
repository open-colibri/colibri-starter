<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Core\Feature;

use OpenColibri\Starter\Core\App;

interface FeatureInterface
{
    public function name(): string;

    public function description(): string;

    public function __invoke(App $app): void;
}
