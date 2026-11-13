---
title: Set up a theme
description: Install one of the ready-to-use storefront themes in your Sylius application.
sidebar:
  order: 2
---

Install a storefront theme in your Sylius application. Provided by `opencolibri/starter-themes`. Only one theme can be
active: installing a theme automatically removes any other previously installed theme. To give each channel its own
theme, see [one theme per channel](#one-theme-per-channel).

If no argument is provided, an interactive prompt asks you to choose the theme.

```bash
castor sylius:theme:setup canvas
```

## Available themes

The [themes overview](../themes/index.md) shows every theme by category, with a preview. Use `default` to remove the
active theme: no theme is applied and the application assets are rebuilt.

## One theme per channel

By default, a theme is installed over the application (the `flat` target) and applies to every channel. With the
`theme-bundle` target, several themes are installed side by side as [Sylius themes](https://github.com/Sylius/SyliusThemeBundle),
and each channel picks its own:

```bash
castor sylius:theme:setup cellar --target=theme-bundle
castor sylius:theme:setup groove --target=theme-bundle
castor sylius:theme:channel FASHION_WEB groove    # "default" gives the channel back the Sylius look
```

The channel theme can also be picked in the admin (channel form, **Theme** field). Each installed theme gets:

| What | Where |
|------|-------|
| Templates and translations | `themes/<theme>/` (theme `opencolibri/<theme>`, hyphens for underscores: `opencolibri/retro-gaming`) |
| Twig hooks | `config/sylius/twig_hooks/themes/<theme>/`, hook names prefixed with `<theme>:` (`retro-gaming:`) |
| Styles | `assets/themes/<theme>/`, built as the `theme-<theme>` Encore entry, linked after the app styles |
| Other config (image filters…) | `config/`, shared by every channel |

`App\Themes\ThemeHookRenderer` renders the prefixed hooks of the channel theme before the app ones. Twig Hooks merges
the hookables of several hook names shallowly, so the generated hooks are complete: each hookable a theme overrides
is merged with the app definition at install time. Reinstall the themes after changing the hooks they override.

Installing a theme with this target removes the `flat` theme, and installing a `flat` theme removes the themes of this
target. Only the themes shipped with `opencolibri/starter-themes` support it.

## Your own themes

You can [register your own themes](../extending/index.md) with the `AsThemeInstaller` and `AsThemeRemover` attributes.
A theme reads the shared [hero](../storefront/hero.md) and [brand](../storefront/brand.md) slots, so the data other
packages contribute (an imported shop's logo, for instance) shows up in it.
