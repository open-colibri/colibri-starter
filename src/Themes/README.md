# opencolibri/starter-themes

Ready-to-use Sylius storefront themes (Canvas, Blush, Prompt, Volt, Lagoon, Aurora, Tech, Retro Gaming, Drive, Cellar, Roastery, Teahouse, Summit, Groove, Arena, Hearth, Bloom, Paws, Culture, Depot, Torque), each with a light and a dark color scheme the visitor switches from the header: `sylius:theme:setup`. Custom themes can be declared with the `#[AsThemeInstaller]` and `#[AsThemeRemover]` attributes. It also adds a theme question to `castor docker:service:install sylius`.

## Installation

In your Castor project:

```bash
castor composer require opencolibri/starter-themes
```

Or install every Colibri Starter package at once with `opencolibri/starter`.

Read the [documentation](https://github.com/opencolibri/colibri-starter/blob/main/docs/commands/themes.md) for usage.

## Contributing

This repository is a **read-only split** of the
[opencolibri/colibri-starter](https://github.com/opencolibri/colibri-starter) monorepo.
Please open issues and pull requests there.
