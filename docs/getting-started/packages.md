---
title: Packages
description: The open-colibri/starter-* packages, their namespace and the tasks they provide.
sidebar:
  order: 2
---

| Package                                                                              | Namespace               | Tasks                                                                 |
|--------------------------------------------------------------------------------------|-------------------------|-----------------------------------------------------------------------|
| [`open-colibri/starter-core`](https://github.com/open-colibri/starter-core)       | `OpenColibri\Starter\Core`    | Castor plugin: `SyliusService`, installer, `sylius:fixtures`, helpers |
| [`open-colibri/starter-plugins`](https://github.com/open-colibri/starter-plugins) | `OpenColibri\Starter\Plugins` | [`sylius:plugin:add`, `sylius:plugin:remove`](../commands/plugins.md) |
| [`open-colibri/starter-themes`](https://github.com/open-colibri/starter-themes)   | `OpenColibri\Starter\Themes`  | [`sylius:theme:setup`](../commands/themes.md)                         |
| [`open-colibri/starter-menu`](https://github.com/open-colibri/starter-menu)       | `OpenColibri\Starter\Menu`    | [`sylius:menu:remove`](../commands/admin-menu.md)                     |
| [`open-colibri/starter-datasets`](https://github.com/open-colibri/starter-datasets) | `OpenColibri\Starter\Datasets` | [ready-made datasets](../import/datasets.md) for `sylius:import:shop:create` |
| [`open-colibri/starter-import`](https://github.com/open-colibri/starter-import)   | `OpenColibri\Starter\Import`  | [`sylius:import:*`](../import/index.md)                               |
| [`open-colibri/starter-upsun`](https://github.com/open-colibri/starter-upsun)     | `OpenColibri\Starter\Upsun`   | [`sylius:upsun:*`](../commands/upsun.md)                              |
| `open-colibri/starter`                                                      | —                       | All of the above                                                      |

The core is the Castor plugin itself. Every other package only contributes tasks: it registers them in the core
from a file autoloaded by Composer, so installing a package is enough to get its tasks on your `SyliusService`.
