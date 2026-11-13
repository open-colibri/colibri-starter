---
title: Installation
description: Create a new Sylius project with the Colibri Starter skeleton, in one command.
sidebar:
  order: 1
---

The [Colibri Starter skeleton](https://github.com/open-colibri/starter-skeleton) creates a new Sylius project, ready to
develop: [Castor](https://castor.jolicode.com) installs Sylius-Standard, its Docker stack (FrankenPHP, PostgreSQL,
HTTPS router), the assets and the fixtures, then hands you the tasks to shape your store.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) with Compose
- [Castor](https://castor.jolicode.com/getting-started/installation/)

## Create your project

```bash
git clone --depth=1 https://github.com/open-colibri/starter-skeleton.git my-shop
cd my-shop
rm -rf .git && git init

castor sylius:init
```

On GitHub, **Use this template** on the [skeleton repository](https://github.com/open-colibri/starter-skeleton) gives you a
fresh repository without cloning the history.

`castor sylius:init` asks a few questions (application name, PHP version, domain, database, theme, payment
gateways…), then builds and starts everything. Once done, it removes the skeleton-only files: the README is replaced by
the one of your project, and `.github.dist/` becomes your CI.

## Unattended install

Every question can be answered upfront:

```bash
castor sylius:init --no-interaction \
    --with-name=app \
    --with-domain=my-shop.test \
    --with-database=postgres \
    --with-theme=canvas \
    --with-payment-gateways=stripe
```

| Option                    | Description                                                                                                                          | Default      |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `--with-name`             | Name of the application (and of its tasks)                                                                                           | `app`        |
| `--with-directory`        | Directory of the application                                                                                                         | the name     |
| `--with-version`          | PHP version                                                                                                                          | `8.5`        |
| `--with-mode`             | Runtime: `frankenphp` or `fpm`                                                                                                       | `frankenphp` |
| `--with-domain`           | Domain of the store                                                                                                                  | `app.test`   |
| `--with-sylius-version`   | Sylius-Standard version                                                                                                              | latest       |
| `--with-database`         | `postgres`, `mysql`, `mariadb` or `none`                                                                                             | `postgres`   |
| `--with-theme`            | `default`, `arena`, `aurora`, `bloom`, `blush`, `canvas`, `cellar`, `culture`, `depot`, `drive`, `groove`, `hearth`, `lagoon`, `paws`, `prompt`, `retro_gaming`, `roastery`, `summit`, `teahouse`, `tech`, `torque` or `volt` (each with a light and a dark scheme) | `default`    |
| `--with-payment-gateways` | `mollie`, `paypal`, `stripe` (repeat the option for several)                                                                         | all          |

`castor docker:service:install` (without argument) prints the options of every installable service.

## What's inside

| File                     | Role                                                                 |
|--------------------------|----------------------------------------------------------------------|
| `castor.php`             | Your stack: Castor context, and the services `sylius:init` registers |
| `castor.composer.json`   | The Castor plugins of the project (`open-colibri/starter`)  |
| `.castor/tasks/qa.php`   | `castor qa`: audit, linters, ECS, PHPStan, PHPUnit (and Behat)       |
| `.github.dist/`          | CI of the project: quality checks, Docker build cache, Dependabot    |
| `AGENTS.md`              | Guidance for the AI agents working on the project                    |

## Next steps

Shape your store with the commands: [add plugins](../commands/plugins.md), [switch the theme](../commands/themes.md),
[clean up the Admin menu](../commands/admin-menu.md), or [import a catalog](../import/index.md).

## In an existing Castor project

Without the skeleton, add Colibri Starter to a Castor project (a `castor.php` file at its root), then install Sylius:

```bash
echo '{}' > castor.composer.json
castor composer require open-colibri/starter "@dev"
castor docker:service:install sylius
```

`open-colibri/starter` brings every package. To pick only what you need, require `open-colibri/starter-core` and
the [task packages](packages.md) you want, e.g.
`castor composer require open-colibri/starter-core open-colibri/starter-themes open-colibri/starter-plugins "@dev"`.
