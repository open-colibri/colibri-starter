---
title: Light and dark schemes
description: How every theme ships a light and a dark color scheme, switchable by the visitor.
sidebar:
  order: 99
---

Every theme ships a light and a dark color scheme. The visitor picks **Auto** (follows the operating system, the
default), **Light** or **Dark** from the switcher in the header; the choice is kept in the browser (`localStorage`).
Installing a theme installs both schemes: there is nothing to configure.

## How it works

The switcher is shared by every theme (`src/Themes/color_scheme/`, installed by
`OpenColibri\Starter\Themes\ColorScheme`):

- a script in `<head>` (`sylius_shop.base#stylesheets` hook, before the stylesheets, so the page is painted in the
  right scheme) sets `<html data-bs-theme="light|dark">` and `<html data-color-scheme-mode="auto|light|dark">`,
  and follows the operating system while the mode is **Auto**;
- the switcher itself, a Bootstrap dropdown hooked in `sylius_shop.base.header.content` (`themes_color_scheme`,
  priority 150, between the account links and the cart). It uses `btn btn-icon btn-transparent` like the other
  header icons, so it takes the theme's header styles;
- `_color-scheme.scss`, the few switcher styles, which only rely on Bootstrap's runtime variables. In the dark
  scheme, it also points the Sylius components compiled with constant dark colors (`.nav`, `.navbar`,
  `.pagination`, `.btn-transparent`, `.btn-outline-gray`, `.btn-outline-dark`) to Bootstrap's runtime variables,
  with the weight of a class and before the theme styles: a theme rule always wins.

`data-bs-theme` is Bootstrap's own color mode attribute: on top of the theme styles, native Bootstrap components
(form controls, close buttons...) switch to their dark variant.

## Theme stylesheet structure

A theme compiles all its styles twice, once per scheme, scoped on the `<html>` attribute:

```scss
// app.scss
@import "fonts";        // @font-face rules, outside the scopes
@import "color-scheme"; // shared switcher styles

// Light is also the scheme without JavaScript.
:where(:root:not([data-bs-theme="dark"])) {
  @import "palette-light";
  @import "theme";
}

:where(:root[data-bs-theme="dark"]) {
  @import "palette-dark";
  @import "theme";
}
```

The scopes are wrapped in `:where()`, which adds no specificity: every theme rule keeps the weight it would have
without schemes, so a theme `a` rule still loses to Bootstrap's `.btn`, for example.

- `_palette-light.scss` and `_palette-dark.scss` declare `$color-mode` (`light` or `dark`) and every color of the
  scheme, under the same variable names.
- `_variables.scss` holds what does not depend on the scheme (fonts, radii, mixins) and the variables derived from
  the palette. It defines `$dark: $color-mode == dark;`.
- `_theme.scss` imports `variables` then every partial.

In the partials:

- `:root { ... }` and `html { ... }` are written `@include scheme-root { ... }` (from `_color-scheme.scss`): it
  targets the `<html>` element of that scheme with the weight of `:root`, so that the theme's runtime variables
  still win over Bootstrap's own `:root` and `[data-bs-theme]` blocks (`:root :root` would match nothing);
- a value that differs between schemes uses the palette, or `if($dark, <dark value>, <light value>)`; a rule that
  only exists in one scheme goes in `@if $dark { ... }`;
- Bootstrap's `--bs-*-rgb` variables are computed with `channels($color)` (defined in `_variables.scss`) rather
  than hard-coded;
- colors are never hard-coded in a partial when they belong to the palette, and never in a Twig template: an
  illustration that changes with the scheme is rendered twice, with a `--light` / `--dark` modifier class, and the
  styles hide the other one (`display: none`), with SVG ids prefixed by the scheme;
- a `@keyframes` rule is emitted twice under the same name: if it uses a color that differs between schemes, give
  it a scheme suffix (`#{$color-mode}`) or animate a CSS custom property instead.

Every scheme must keep the accessibility rules of the theme: 4.5:1 for text, 3:1 for form field outlines and
focus indicators (see [Accessibility](../contributing/accessibility.md)).
