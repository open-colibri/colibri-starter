# Repository guidance

## Theme screenshots

Install the theme you want to capture before running the script. From the Sylius
application, run `castor sylius:theme:setup <theme>` (for example,
`castor sylius:theme:setup canvas`). Theme setup switches the active theme; the
screenshot script only captures the storefront and verifies its theme marker.

To refresh the full-page homepage and product page screenshots of a theme, at every screen size, run:

```bash
node scripts/capture-theme-screenshots.mjs canvas
node scripts/capture-theme-screenshots.mjs blush
node scripts/capture-theme-screenshots.mjs prompt
node scripts/capture-theme-screenshots.mjs volt
node scripts/capture-theme-screenshots.mjs lagoon
node scripts/capture-theme-screenshots.mjs aurora
node scripts/capture-theme-screenshots.mjs tech
node scripts/capture-theme-screenshots.mjs retro_gaming
node scripts/capture-theme-screenshots.mjs drive
node scripts/capture-theme-screenshots.mjs cellar
node scripts/capture-theme-screenshots.mjs roastery
node scripts/capture-theme-screenshots.mjs teahouse
node scripts/capture-theme-screenshots.mjs summit
node scripts/capture-theme-screenshots.mjs groove
node scripts/capture-theme-screenshots.mjs arena
node scripts/capture-theme-screenshots.mjs hearth
node scripts/capture-theme-screenshots.mjs bloom
node scripts/capture-theme-screenshots.mjs paws
node scripts/capture-theme-screenshots.mjs culture
node scripts/capture-theme-screenshots.mjs depot
node scripts/capture-theme-screenshots.mjs torque
```

Each page is captured at three screen sizes: `normal` (1440x900), `wide` (2560x1080, to tell full-width layouts from
centered containers) and `mobile` (390x844, emulating a phone: mobile viewport, 2x pixel ratio, iPhone user agent and
touch), in both color schemes (`light` and `dark`, through the emulated system preference). The script saves WebP
screenshots in `docs/images/`, named `<theme>-<page>-<viewport>-<scheme>.webp` (for example
`canvas-homepage-mobile-dark.webp`, pages `homepage`, `product` and `cart`); theme names use hyphens (`retro-gaming`).
When both schemes are captured, it also saves `<theme>-homepage-<viewport>-split.webp`: the full light homepage on the
left half, the dark one on the right half, to show both schemes in one thumbnail.
Use `--color-schemes dark` to capture one scheme only, `--viewports normal,mobile` to capture some sizes only, or `--width <px>` / `--height <px>` for a single custom desktop
viewport (saved with a `<width>x<height>` suffix). Use `--base-url <url>` to capture from another storefront URL, or
`--output-dir <dir>` to choose another output directory. The default storefront is `https://app.test/en_US/` in the main checkout, and the worktree stack (see below) in a git worktree.

Data fixtures differ between installs, so the script evaluates the products listed on the storefront
(homepage, then category pages) and picks the first one that is in stock, has an add-to-cart button and a real
image, preferring the Comet Pulse T-Shirt when it qualifies. Skipped products are listed with the reason. Use
`--product <slug>` to force a product.

Add `--include-cart` to also put the selected product in a fresh browser cart and capture the cart page:

```bash
node scripts/capture-theme-screenshots.mjs canvas --include-cart
node scripts/capture-theme-screenshots.mjs blush --include-cart
node scripts/capture-theme-screenshots.mjs prompt --include-cart
node scripts/capture-theme-screenshots.mjs volt --include-cart
node scripts/capture-theme-screenshots.mjs lagoon --include-cart
node scripts/capture-theme-screenshots.mjs aurora --include-cart
node scripts/capture-theme-screenshots.mjs tech --include-cart
node scripts/capture-theme-screenshots.mjs retro_gaming --include-cart
node scripts/capture-theme-screenshots.mjs drive --include-cart
node scripts/capture-theme-screenshots.mjs cellar --include-cart
node scripts/capture-theme-screenshots.mjs roastery --include-cart
node scripts/capture-theme-screenshots.mjs teahouse --include-cart
node scripts/capture-theme-screenshots.mjs summit --include-cart
node scripts/capture-theme-screenshots.mjs groove --include-cart
node scripts/capture-theme-screenshots.mjs arena --include-cart
node scripts/capture-theme-screenshots.mjs hearth --include-cart
node scripts/capture-theme-screenshots.mjs bloom --include-cart
node scripts/capture-theme-screenshots.mjs paws --include-cart
node scripts/capture-theme-screenshots.mjs culture --include-cart
node scripts/capture-theme-screenshots.mjs depot --include-cart
node scripts/capture-theme-screenshots.mjs torque --include-cart
```

The cart uses an isolated temporary browser profile and does not alter another browser session's cart.

To refresh the screenshots of several themes in one go, run from the repository root:

```bash
castor docs:screenshots                        # asks which themes to capture ("all" by default)
castor docs:screenshots canvas volt            # only these themes
castor docs:screenshots all --restore=canvas   # every theme, then switch back to canvas
```

For each theme, the task runs `castor sylius:theme:setup <theme>` then the screenshot script with `--include-cart`
(`--skip-cart` to leave the cart out, `--viewports` or `--width`/`--height` to change the screen sizes), and stops at
the first failure. Without `--restore`, the last captured theme stays active.

The script hides the Symfony web debug toolbar, so the app can stay in the `dev` environment.

Theme pages (`docs/themes/<theme>.md`) show one table per screen size (**Desktop**, **Wide screen**, **Mobile**), each
with a **Light** and a **Dark** row of the homepage, product page and cart; the theme overview uses the `wide` light homepage
as thumbnail, so full-width layouts stand out.

The script requires Node.js 22+ and Google Chrome or Chromium. Set `CHROME_BIN` if the browser executable is not detected automatically. The selected theme must be active on the storefront.

## One Docker stack per git worktree

Every git worktree of this repository gets its own Sylius app, database and domain, so sessions working on different
branches never share (or switch the theme of) the same app. The main checkout keeps the `app` compose project and
`https://app.test`; a worktree uses the `app-<slug>` project and `https://<slug>.app.localhost/` (slug: the worktree
directory name, e.g. `tech-theme-fc3548`). Nothing to configure: every `castor` task run from a worktree targets its
own stack.

```bash
castor worktree:install     # once: copies the main checkout app/, builds, starts, migrates, loads the fixtures
castor sylius:theme:setup volt
castor about                # lists the URLs of the stack
castor stop                 # stop it, keep the database
castor destroy --force      # before "git worktree remove": drop its containers, database volume and images
```

`*.localhost` resolves to the loopback without `/etc/hosts`, and the shared Castor router serves it over HTTPS. Never
run `castor up` from a worktree checked out before this setup existed without updating it first: it would reuse the
`app` project of the main checkout. See `docs/contributing/worktrees.md`.

## Documentation website

The `docs/` pages are published by the Starlight website of the `docs-site/` folder of opencolibri/starter, cloned
next to the main checkout (`DOCS_SITE_DIR` otherwise). Preview the `docs/` of the current checkout or worktree with `castor docs:up`
(http://localhost:4321/docs/, `--port` to change it) and stop it with `castor docs:stop`. One server runs at a time.
See `docs/contributing/documentation.md`.

## Running commands in the Sylius app

Run Symfony console commands through the Castor app container from the repository
root:

```bash
castor app:bash -- php bin/console cache:clear --env=dev
castor app:bash -- php bin/console lint:twig templates --env=test
```

To switch the active storefront theme, use:

```bash
castor sylius:theme:setup <theme>
```

To give each channel its own theme, install the themes with `--target=theme-bundle` and pick one per channel with
`castor sylius:theme:channel <channel> <theme>`. That target generates the theme hooks (prefixed with `<theme>:`) from
the theme resources and the app hooks they override: never edit them in the app, reinstall the theme instead. See
`docs/commands/themes.md`.

## Theme styling

Every theme ships a light and a dark color scheme, switched by the visitor (auto / light / dark) from the header: its
styles are compiled once per scheme, scoped on `<html data-bs-theme>` (wrapped in `:where()`, so no specificity is
added), with the colors in `_palette-light.scss` and `_palette-dark.scss`. Never hard-code a color that differs
between schemes in a partial or a Twig template, and write `@include scheme-root {` instead of `:root {` or `html {`.
See `docs/themes/color-schemes.md`.

Every theme must meet WCAG 2.1 AA contrast: 4.5:1 for text, 3:1 for large text (24px, or 18.66px bold), UI
components and focus indicators. This includes the Bootstrap utilities core templates use (`text-body-tertiary`,
`text-black-50`, `text-muted`…), whose colors the theme owns. Keep a bold palette by darkening the accent behind
text or switching the text on it to a dark color, rather than lowering contrast. Before committing a theme, run
`castor qa:a11y <theme>` on your own stack (it checks both color schemes) and fix every violation it reports (violations from core Sylius templates
are listed apart and do not fail it); check focus rings and hover states by hand. See
`docs/contributing/accessibility.md`.

Never rely on `data-test-*` attributes in CSS selectors. They are testing
helpers and may not be present in the production storefront; target stable
classes or semantic structure instead.

Product cards are wrapped in a `<div>` inside `.products-grid` on the homepage and
in association lists, but are direct grid items on category pages. Style the card
root with `.products-grid div:has(> a.link-reset)` (each theme does it in
`_cards.scss`), never with `.products-grid > div > div`.

## Monorepo

The code is split into packages under `src/<Package>/` (`composer.json`, `src/`, `tests/`, `resources/`). The root
`composer.json` is generated: after changing a package `composer.json`, run `castor monorepo:merge`, then check with
`castor monorepo:validate`. A package must never use another task package's namespace, only `OpenColibri\Starter\Core`.

## Storefront slots

The homepage hero is a shared slot owned by core: themes ship `templates/shop/homepage/hero.html.twig`, packages feed
data through `App\Storefront\Hero\HeroContributorInterface`, and only core configures the `banner`/`hero` hookables.
Prefix any hookable a package adds with the package name. See `docs/storefront/hero.md`.

The shop logo is a shared slot owned by core too: themes read `storefront_brand()` in
`templates/shop/shared/layout/brand/identity.html.twig`, packages feed it through
`App\Storefront\Brand\BrandContributorInterface`, and a package never ships a file at a path a theme ships. See
`docs/storefront/brand.md`.
