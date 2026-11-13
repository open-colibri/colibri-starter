---
title: Theme screenshots
description: Refresh the homepage, product and cart screenshots of the storefront themes, on desktop, wide screen and mobile.
sidebar:
  order: 3
---

The screenshots of the [theme pages](../themes/index.md) live in `docs/images/`, as WebP files named
`<theme>-<page>-<viewport>-<scheme>.webp`: pages `homepage`, `product` and `cart`, schemes `light` and `dark` (every
theme ships both [color schemes](../themes/color-schemes.md)), theme names with hyphens
(`retro-gaming-cart-mobile-dark.webp`). Each scheme is captured through the emulated system preference, the switcher
staying in its **Auto** mode. When both schemes are captured, the homepage is also saved as
`<theme>-homepage-<viewport>-split.webp`: the left half of the light page next to the right half of the dark page,
split by a grey line, so that a single thumbnail shows both schemes.

| Viewport | Size     | Purpose                                                                           |
|----------|----------|-----------------------------------------------------------------------------------|
| `normal` | 1440x900 | A usual laptop or desktop screen                                                  |
| `wide`   | 2560x1080 | An ultra-wide screen: tells full-width layouts from centered containers         |
| `mobile` | 390x844  | A phone, emulated: mobile viewport, 2x pixel ratio, iPhone user agent and touch   |

Every theme page shows one table per viewport (desktop, wide screen, mobile), with a light and a dark row.

Before capturing a new or changed theme, check that it passes the [accessibility check](accessibility.md)
(`castor qa:a11y <theme>`).

## Every theme at once

From the repository root:

```bash
castor docs:screenshots                        # asks which themes to capture ("all" by default)
castor docs:screenshots canvas volt            # only these themes
castor docs:screenshots all --restore=canvas   # every theme, then switch back to canvas
```

For each theme, the task runs `castor sylius:theme:setup <theme>` then the screenshot script with `--include-cart`
(`--skip-cart` to leave the cart out, `--viewports` or `--width`/`--height` to change the screen sizes,
`--color-schemes=dark` to capture one scheme only), and stops at
the first failure. Without `--restore`, the last captured theme stays active.

## One theme

Activate the theme first (`castor sylius:theme:setup canvas`), then run:

```bash
node scripts/capture-theme-screenshots.mjs canvas --include-cart
```

| Option            | Description                                                              |
|-------------------|--------------------------------------------------------------------------|
| `--include-cart`  | Also add the product to a fresh cart (isolated browser profile) and capture the cart page |
| `--product <slug>` | Force the captured product                                              |
| `--base-url <url>` | Storefront URL (default: `https://app.test/en_US/`, or the [worktree stack](worktrees.md) one) |
| `--output-dir <dir>` | Output directory (default: `docs/images`)                             |
| `--viewports <list>` | Comma-separated viewports to capture (default: `normal,wide,mobile`)  |
| `--width <px>`    | Capture a single custom desktop viewport instead, saved with a `<width>x<height>` suffix |
| `--height <px>`   | Height of that custom viewport (default: `900`)                          |
| `--color-schemes <list>` | Comma-separated color schemes to capture (default: `light,dark`)  |

The screenshots are full-page: the viewport height only matters for elements sized on it (hero sections, for
example). Very long pages are scaled down to stay within the WebP size limit (16383 pixels).

Without `--product`, the script picks the first product listed on the storefront that is in stock, has an
add-to-cart button and a real image (preferring the Comet Pulse T-Shirt), and lists the skipped ones with the reason.

The script requires Node.js 22+ and Google Chrome or Chromium (set `CHROME_BIN` if it is not detected). It hides the
Symfony web debug toolbar, so the app can stay in the `dev` environment.
