<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Upsun;

use OpenColibri\Starter\Core\Service\SyliusService;
use OpenColibri\Starter\Core\Task\TaskProviderRegistry;
use OpenColibri\Starter\Upsun\Tasks\UpsunTasks;

TaskProviderRegistry::register(
    'upsun',
    static fn(SyliusService $service): iterable => (new UpsunTasks($service->getName(), $service->getDirectory(), $service->databaseEngine()))(),
);
