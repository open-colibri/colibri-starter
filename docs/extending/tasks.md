---
title: Custom tasks
description: Add your own tasks to the Sylius service, and hook into the Sylius installer.
sidebar:
  order: 3
---

Every task package registers its tasks in the core `TaskProviderRegistry`. You can do the same from your
`castor.php`: the tasks are then exposed by every `SyliusService`, like the built-in ones.

```php
use Castor\Attribute\AsTask;
use OpenColibri\Starter\Core\Service\SyliusService;
use OpenColibri\Starter\Core\Task\TaskProviderRegistry;

use function Castor\io;

TaskProviderRegistry::register('my_tasks', static fn (SyliusService $service): iterable => [
    [
        'task' => new AsTask('hello', 'sylius:my', 'Say hello'),
        'function' => static fn () => io()->success(\sprintf('Hello from %s', $service->getName())),
    ],
]);
```

## Installer extensions

A package can also hook into `castor docker:service:install sylius` (extra questions and steps run once Sylius is
installed) by registering a `SyliusInstallerExtensionInterface` in `SyliusInstallerExtensions`, as `opencolibri/starter-themes` does to ask
which storefront theme to use.
