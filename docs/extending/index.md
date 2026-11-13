---
title: Plugins and themes
description: Register your own plugins and themes in the sylius:add, sylius:remove and sylius:theme:setup commands.
sidebar:
  order: 1
---

The [plugin](../commands/plugins.md) and [theme](../commands/themes.md) lists are not closed: you can add your own
plugins and themes to the commands, from your own `castor.php` (or from any file it `import()`s), using the attributes shipped with each package.

Once registered, your component is offered in the interactive prompt of its command **and** is callable by name on the
command line, exactly like a built-in one.

## Available attributes

The attributes live in the `Attribute` namespace of their package (`OpenColibri\Starter\Plugins\Attribute` and
`OpenColibri\Starter\Themes\Attribute`), take a required `name` argument,
and can be put on a function or on a class.

| Attribute                                           | Command                                              | Called when                            |
|-----------------------------------------------------|------------------------------------------------------|----------------------------------------|
| `#[AsPluginInstaller(name: '…', description: '…')]` | `castor sylius:add <name>`                           | `sylius:add` picks the plugin          |
| `#[AsPluginRemover(name: '…', description: '…')]`   | `castor sylius:remove <name>`                        | `sylius:remove` picks the plugin       |
| `#[AsThemeInstaller(name: '…')]`                    | `castor sylius:theme:setup <name>`                   | the theme is selected                  |
| `#[AsThemeRemover(name: '…')]`                      | `castor sylius:theme:setup <another-theme>`          | another theme gets selected            |

`name` is the identifier you type on the command line, so keep it shell friendly: lowercase letters and underscores.

The two plugin attributes also accept an optional `description`, displayed next to the name in the interactive prompt
of `sylius:add` and `sylius:remove`. Omit it and the plugin is listed by its name alone.

## Declaring a component

### As a function

The most direct option, and a good fit for a component living in your `castor.php`:

```php
<?php

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Plugins\Attribute\AsPluginInstaller;
use OpenColibri\Starter\Plugins\Attribute\AsPluginRemover;
use OpenColibri\Starter\Core\Util\Assets;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Database;
use OpenColibri\Starter\Core\Util\Docker;
use OpenColibri\Starter\Core\Util\Symfony;

use function Castor\io;

#[AsPluginInstaller(name: 'acme_loyalty', description: 'Acme loyalty programme for Sylius')]
function install_acme_loyalty(App $app): void
{
    io()->title('Adding the Acme Loyalty plugin');

    Composer::allowContribRecipes($app);
    Docker::run($app, 'composer require acme/sylius-loyalty-plugin');
    Docker::run($app, 'yarn install');
    Database::migrate($app);
    Assets::build($app);
    Symfony::cacheClear($app);
}

#[AsPluginRemover(name: 'acme_loyalty', description: 'Acme loyalty programme for Sylius')]
function remove_acme_loyalty(App $app): void
{
    io()->title('Removing the Acme Loyalty plugin');

    Composer::allowContribRecipes($app);
    Database::rollbackPluginMigrations($app, 'Acme\SyliusLoyaltyPlugin\Migrations');
    Docker::run($app, 'composer remove acme/sylius-loyalty-plugin');
    Assets::build($app);
    Symfony::cacheClear($app);
}
```

It is now part of the plugin commands:

```bash
castor sylius:add acme_loyalty
castor sylius:remove acme_loyalty
```

### As a class

Handy when the component needs a bit of logic, or when you would rather not pollute the global function namespace. The
class is instantiated once, without arguments, and called on install/remove:

```php
<?php

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Themes\Attribute\AsThemeInstaller;
use OpenColibri\Starter\Themes\Attribute\AsThemeRemover;
use OpenColibri\Starter\Core\Util\Assets;
use OpenColibri\Starter\Core\Util\Javascript;
use OpenColibri\Starter\Core\Util\Symfony;

#[AsThemeInstaller(name: 'acme')]
final class AcmeThemeInstaller
{
    public function __invoke(App $app): void
    {
        Symfony::addBundle($app, 'AcmeShopBundle', ['all' => true]);
        Javascript::addImport($app, 'assets/shop/entrypoint.js', './styles/acme.scss');
        Assets::install($app);
        Assets::build($app);
        Symfony::cacheClear($app);
    }
}

#[AsThemeRemover(name: 'acme')]
final class AcmeThemeRemover
{
    public function __invoke(App $app): void
    {
        Javascript::removeImport($app, 'assets/shop/entrypoint.js', './styles/acme.scss');
        Assets::build($app);
        Symfony::cacheClear($app);
    }
}
```

Themes work exactly the same way, with the `AsThemeInstaller` and `AsThemeRemover` attributes.

The component receives the targeted application as an [`App` instance](toolbox.md), and can use the
[helpers](toolbox.md#helpers) of the core.

## Good to know

- **Components are discovered at boot.** Castor scans the functions and classes it has loaded, once, when the
  application starts. Put them in your `castor.php`, or in a file added with `import(__DIR__ . '/…')`: a class living in
  a file nobody imports is never seen.
- **Names are unique per family.** The `name` is the CLI argument and the label of the interactive prompt. Registering
  it twice, or reusing a built-in name, replaces the previous component.
- **Pair your installers with removers.** `sylius:remove` simply warns when
  the remover is missing, but `sylius:theme:setup` runs the remover of every *other* registered theme: a theme without
  one makes every single theme switch print an `Unknown theme remover` warning.
- **Only one theme is active at a time.** Installing a theme removes the others first, then installs it. Keep the
  remover of your theme idempotent, and reverse exactly what the installer did.
- **Classes must be constructible and callable.** They are instantiated with no arguments and must expose an
  `__invoke()` method; a constructor with required arguments, or a class without `__invoke()`, fails at boot with a
  configuration error.
- **A component can also be a task.** Nothing prevents you from adding `#[AsTask]` next to the attribute, if you want
  the very same code to be reachable as a standalone command.
