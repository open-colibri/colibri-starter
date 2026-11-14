# Colibri Starter

A set of [Castor](https://castor.jolicode.com/) packages that turns a PHP description of
your stack into a Sylius app, and gives you the tasks to drive it.

Instead of a list of manual steps, each workflow is a single, deterministic command: installing or removing a plugin
(entities, migrations, assets, cache), switching the storefront theme, cleaning up the Admin menu or
importing a catalog. That makes it a reliable interface for you and for AI agents alike.
[Why Colibri Starter?](docs/index.md#why-colibri-starter)

## Quick start

Requires [Docker](https://docs.docker.com/get-docker/) with Compose and
[Castor](https://castor.jolicode.com/getting-started/installation/). Create a new project with the
[skeleton](https://github.com/opencolibri/starter-skeleton):

```bash
git clone --depth=1 https://github.com/opencolibri/starter-skeleton.git my-shop
cd my-shop
rm -rf .git && git init

castor sylius:init
```

`castor sylius:init` asks a few questions (name, PHP version, domain, database, theme, payment gateways…), then builds
and starts everything.

See [Installation](docs/getting-started/installation.md) for the unattended install, or to add Colibri Starter to an
existing Castor project.

## What you get

| Command                                                        | Package                  |
|----------------------------------------------------------------|--------------------------|
| [`castor sylius:add` / `sylius:remove`](docs/commands/plugins.md) | `opencolibri/starter-plugins` |
| [`castor sylius:theme:setup`](docs/commands/themes.md)          | `opencolibri/starter-themes`  |
| [`castor sylius:menu:remove`](docs/commands/admin-menu.md)      | `opencolibri/starter-menu`    |
| [`castor sylius:import:*`](docs/import/index.md)                | `opencolibri/starter-import`, `opencolibri/starter-datasets` |
| [`castor sylius:upsun:*`](docs/commands/upsun.md)              | `opencolibri/starter-upsun`   |

Every package relies on `opencolibri/starter-core`; `opencolibri/starter` installs them all. See
[Packages](docs/getting-started/packages.md).

| [Canvas](docs/themes/canvas.md) | [Lagoon](docs/themes/lagoon.md) | [Cellar](docs/themes/cellar.md) | [Volt](docs/themes/volt.md) |
|---|---|---|---|
| <img src="docs/images/canvas-homepage-normal-split.webp" alt="Canvas storefront homepage, light and dark schemes" width="180"> | <img src="docs/images/lagoon-homepage-normal-split.webp" alt="Lagoon storefront homepage, light and dark schemes" width="180"> | <img src="docs/images/cellar-homepage-normal-split.webp" alt="Cellar storefront homepage, light and dark schemes" width="180"> | <img src="docs/images/volt-homepage-normal-split.webp" alt="Volt storefront homepage, light and dark schemes" width="180"> |

[All the themes](docs/themes/index.md)

## Documentation

Read it online at [starter.opencolibri.org/docs](https://starter.opencolibri.org/docs/), or here on GitHub:

- **Getting started**: [Introduction](docs/index.md), [Installation](docs/getting-started/installation.md),
  [Packages](docs/getting-started/packages.md)
- **Commands**: [Plugins](docs/commands/plugins.md), [Themes](docs/commands/themes.md),
  [Admin menu](docs/commands/admin-menu.md), [Upsun](docs/commands/upsun.md)
- **E-commerce import**: [Overview](docs/import/index.md), [AI-generated catalog](docs/import/ai-catalog.md),
  [Existing website](docs/import/existing-website.md), [Fixtures](docs/import/fixtures.md), [Datasets](docs/import/datasets.md),
  [Extending the import](docs/import/extending.md)
- **Extending**: [Plugins and themes](docs/extending/index.md), [App and helpers](docs/extending/toolbox.md),
  [Custom tasks](docs/extending/tasks.md)
- **Storefront slots**: [Homepage hero](docs/storefront/hero.md), [Shop logo](docs/storefront/brand.md)
- **Contributing**: [Monorepo](docs/contributing/monorepo.md), [Releasing](docs/contributing/releasing.md),
  [Theme screenshots](docs/contributing/screenshots.md), [Theme accessibility](docs/contributing/accessibility.md)

## Contributing

This repository is the development monorepo of every `opencolibri/starter-*` package: each package is split into its own
**read-only** repository by the CI, so issues and pull requests always go here. See
[Monorepo](docs/contributing/monorepo.md).

## License

Colibri Starter is released under the MIT license.
