---
title: App and helpers
description: The App instance and the helpers available to your installers, removers and tasks.
sidebar:
  order: 2
---

## The App instance

Installers, removers and tasks receive the targeted Sylius application as a `OpenColibri\Starter\Core\App` instance:

| Method        | Returns                                                                            |
|---------------|------------------------------------------------------------------------------------|
| `name()`      | The Castor service name, e.g. `app`                                                |
| `directory()` | The absolute path to the application directory                                     |
| `domain()`    | The apex domain, `null` when not configured                                        |
| `subdomain()` | Optional shop subdomain prefix, `null` when the channel uses the apex domain       |
| `hostname()`  | Shop hostname (`subdomain.domain` or apex), `null` when no domain is configured    |

> **Note:** The `sylius:*` tasks build the `App` with the service name and the application directory only, so
> `domain()` / `subdomain()` / `hostname()` currently return `null` unless the task passes them (import does).

## Helpers

The installers built into the plugin rely on a small toolbox, which you can use as well — all helpers take the `App`
as their first argument:

| Helper                                                           | What it does                                           |
|------------------------------------------------------------------|--------------------------------------------------------|
| `Docker::run($app, $command)`                                    | Runs a command in the application container (see [Runner](#runner)) |
| `Composer::allowContribRecipes($app)`                            | Allows contrib recipes before installing a package     |
| `Composer::removeDevDependency($app, $package)`                  | Removes a `require-dev` dependency                     |
| `Database::migrate($app)`                                        | Runs the Doctrine migrations                           |
| `Database::diff($app, $namespace)`                               | Generates a migration diff                             |
| `Database::rollbackPluginMigrations($app, $namespace)`           | Rolls back the migrations of a plugin namespace        |
| `Assets::install($app)` / `Assets::build($app)`                  | Installs the JS dependencies / builds the front assets |
| `Symfony::addBundle($app, $bundle, $envs)`                       | Registers a bundle in `config/bundles.php`             |
| `Symfony::addJsController($app, $package, $controller, $config)` | Registers a JS controller                              |
| `Symfony::removeJsController($app, $package, $controller)`       | Unregisters a JS controller                            |
| `Symfony::cacheClear($app)`                                      | Clears (and warms up) the Symfony cache                |
| `Javascript::addImport($app, $file, $resource)`                  | Adds an `import` to a JS entrypoint                    |
| `Javascript::removeImport($app, $file, $resource)`               | Removes it                                             |
| `Yaml::import($app, $file, $resource)`                           | Adds an `imports:` entry to a YAML file, if missing    |
| `Yaml::addImport($app, $file, $resource)`                        | Same as `Yaml::import()`                               |
| `Yaml::addImportWithOptions($app, $file, $resource, $ignore)`    | Same, with `ignore_errors: not_found` on the import    |
| `Yaml::appendToSection($app, $file, $section, $block)`           | Appends a block to a YAML section                      |
| `Yaml::uncommentBlock($app, $file, $block)`                      | Uncomments a block in a YAML file                      |
| `Filesystem::createFile($app, $file, $body)`                     | Writes a file in the application                       |
| `Filesystem::hasFile($app, $file)`                               | Tells whether a file exists                            |
| `Filesystem::latestFile($app, $directory)`                       | Returns the most recent file of a directory            |
| `Fixtures::load($app, ...$args)`                                 | Loads a fixture suite                                  |
| `Fixtures::createSuite($app, $name)`                             | Generates a new fixture suite                          |
| `Fixtures::createDefaultChannel($app, $suite, $currency)`        | Creates the default channel                            |

Castor's own helpers (`io()`, `fs()`, `finder()`) are available too, and are the way to go for anything the toolbox
does not cover.

## Runner

`Docker::run()` (and the import tasks) run their commands in the `{app}-builder` Docker Compose service by default.
Set `COLIBRI_STARTER_RUNNER=local` to run them directly in the application directory instead, for instance when Castor
runs on a server without Docker or inside a container that already has the application runtime:

| Variable                         | Default    | Description                                                  |
|----------------------------------|------------|--------------------------------------------------------------|
| `COLIBRI_STARTER_RUNNER`          | `docker`   | `docker` or `local`                                          |
| `COLIBRI_STARTER_PHP_BINARY`      | `php`      | PHP binary used for `php …` and `bin/console …` commands     |
| `COLIBRI_STARTER_COMPOSER_BINARY` | `composer` | Composer command used for `composer …` commands              |
