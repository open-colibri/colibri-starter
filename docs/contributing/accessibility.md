---
title: Theme accessibility
description: Check that a storefront theme meets WCAG 2.1 AA before committing it.
sidebar:
  order: 5
---

Every storefront theme must meet [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/) contrast:

- **4.5:1** for text (prices, breadcrumbs, labels, placeholders, text on buttons and badges);
- **3:1** for large text (24px, or 18.66px bold), for UI components (input borders, icons that carry meaning) and for
  focus indicators.

A theme must pass the check below before it is committed. A bold palette stays possible: darken or lighten the
accent behind the text, change the text color on it (dark text on a bright green or yellow), or keep the bright color
for decoration (borders, rules, shapes) and use a darker shade for text.

## Run the check

From the repository root, on your own stack (see [one Docker stack per worktree](worktrees.md)):

```bash
castor qa:a11y                                # the active theme
castor qa:a11y canvas volt                    # activate and check these themes
castor qa:a11y all --restore=canvas           # every theme, then switch back to canvas
castor qa:a11y tech --report-dir=var/a11y     # also write var/a11y/tech.json
```

The task activates each theme (`castor sylius:theme:setup <theme>`), runs `scripts/check-theme-accessibility.mjs` and
goes on with the next theme after a failure, then lists the themes that failed. Every page is checked in both
[color schemes](../themes/color-schemes.md), light and dark. `--viewport=desktop` or `--viewport=mobile` limits the
check to one width, `--color-scheme=light` or `--color-scheme=dark` to one scheme.

The script can also run on its own, against the active theme:

```bash
node scripts/check-theme-accessibility.mjs tech --viewport mobile --max-nodes 0
```

## What is checked

[axe-core](https://github.com/dequelabs/axe-core) runs the WCAG 2.1 A and AA rules (color contrast, labels, image
alternatives, link and button names, ARIA…) plus the landmark and heading best practices on the homepage, the first
category, a product that can be bought and the cart holding it, at 1440px and 390px wide. Entrance animations are
finished and the page is scrolled first, so the final state is checked.

Each violation is listed with its CSS selector and text; contrast violations also give the ratio, the expected one
and both colors:

```text
✘ product (mobile) https://tech-theme-fc3548.app.localhost/en_US/products/comet-pulse-t-shirt — 1 violation(s)
  [serious] color-contrast: Elements must meet minimum color contrast ratio thresholds (1)
    - .breadcrumb-item > .text-body-tertiary "CATEGORY": 3.07:1 (needs 4.5:1), #8e9093 on #fbfafd, 9.0pt (12px) normal
```

The script exits with code 1 on a violation. Elements axe-core cannot decide (text over an image or a gradient) are
counted as "to review by hand" without failing. For text over a gradient or next to a pseudo-element, the script
estimates the worst contrast against every gradient stop and prints it as a warning: decorative glows far from the
text make it pessimistic, so check those in the browser.

Sylius' shop CSS sets `.btn-primary { color: #fff }`, which ignores `--bs-btn-color`: a theme that wants dark text on
a bright primary button must also set `.btn-primary { color: var(--bs-btn-color); }`.

Violations that come from the Sylius core templates rather than from the theme (no `<main>` landmark in the shop
layout, header links with `role="menuitem"` outside of a menu, the icon-only "remove" button and the unlabelled
quantity input of the cart) are listed apart and do not fail the check, like the disabled "Previous" link of the
pager (WCAG exempts inactive controls, axe-core does not see it as disabled). The Bootstrap utilities used by core
templates (`text-body-tertiary`, `text-black-50`, `text-muted`…) are not exempt: the theme owns their colors, through
the Bootstrap custom properties (`--bs-tertiary-color`, `--bs-secondary-color`…) or an override of the utility.

## What is not checked

axe-core does not see hover and focus states, open menus or the off-canvas cart, and does not check focus
indicators. Check by hand that the focus ring of links, buttons and inputs is visible with a 3:1 contrast against its
background, and that hover states keep the text readable.

axe-core is downloaded from the npm registry on the first run (pinned version, checked against its integrity) and
cached in `~/.cache/colibri-starter/`; set `AXE_CORE_PATH` to use another `axe.min.js`. The script requires Node.js 22+
and Google Chrome or Chromium (set `CHROME_BIN` if it is not detected).
