<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Menu;

use OpenColibri\Starter\Core\Service\SyliusService;
use OpenColibri\Starter\Core\Task\TaskProviderRegistry;
use OpenColibri\Starter\Menu\Tasks\MenuTasks;

TaskProviderRegistry::register(
    'menu',
    static fn(SyliusService $service): iterable => (new MenuTasks($service->getName(), $service->getDirectory()))(),
);
