---
title: Packages
description: The opencolibri/starter-* packages, their namespace and the tasks they provide.
sidebar:
  order: 2
---

| Package                                                                              | Namespace               | Tasks                                                                 |
|--------------------------------------------------------------------------------------|-------------------------|-----------------------------------------------------------------------|
| [`opencolibri/starter-core`](https://github.com/opencolibri/starter-core)       | `OpenColibri\Starter\Core`    | Castor plugin: `SyliusService`, installer, `sylius:fixtures`, helpers |
| [`opencolibri/starter-plugins`](https://github.com/opencolibri/starter-plugins) | `OpenColibri\Starter\Plugins` | [`sylius:plugin:add`, `sylius:plugin:remove`](../commands/plugins.md) |
| [`opencolibri/starter-themes`](https://github.com/opencolibri/starter-themes)   | `OpenColibri\Starter\Themes`  | [`sylius:theme:setup`](../commands/themes.md)                         |
| [`opencolibri/starter-menu`](https://github.com/opencolibri/starter-menu)       | `OpenColibri\Starter\Menu`    | [`sylius:menu:remove`](../commands/admin-menu.md)                     |
| [`opencolibri/starter-datasets`](https://github.com/opencolibri/starter-datasets) | `OpenColibri\Starter\Datasets` | [ready-made datasets](../import/datasets.md) for `sylius:import:shop:create` |
| [`opencolibri/starter-import`](https://github.com/opencolibri/starter-import)   | `OpenColibri\Starter\Import`  | [`sylius:import:*`](../import/index.md)                               |
| [`opencolibri/starter-upsun`](https://github.com/opencolibri/starter-upsun)     | `OpenColibri\Starter\Upsun`   | [`sylius:upsun:*`](../commands/upsun.md)                              |
| `opencolibri/starter`                                                      | —                       | All of the above                                                      |

The core is the Castor plugin itself. Every other package only contributes tasks: it registers them in the core
from a file autoloaded by Composer, so installing a package is enough to get its tasks on your `SyliusService`.
