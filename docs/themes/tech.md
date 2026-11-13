---
title: Tech theme
description: A crisp electronics-store look in carbon, aluminium and signal orange.
sidebar:
  order: 8
---

Tech is built for high-tech and gadget stores: a crisp, product-led storefront
in carbon black and aluminium grey, lit by a single signal-orange accent. Machined
corners, monospace spec labels and datasheet layouts make it read like a modern
electronics shop. It is set in *Inter* (already shipped by the Sylius shop) with
the system monospace font for labels, so no extra font file is needed.

**Desktop** (1440 px)

| Scheme | Homepage | Product page | Cart |
|---|---|---|---|
| Light | ![Tech storefront homepage on desktop, light scheme](../images/tech-homepage-normal-light.webp) | ![Product page in Tech on desktop, light scheme](../images/tech-product-normal-light.webp) | ![Tech cart containing a product on desktop, light scheme](../images/tech-cart-normal-light.webp) |
| Dark | ![Tech storefront homepage on desktop, dark scheme](../images/tech-homepage-normal-dark.webp) | ![Product page in Tech on desktop, dark scheme](../images/tech-product-normal-dark.webp) | ![Tech cart containing a product on desktop, dark scheme](../images/tech-cart-normal-dark.webp) |

**Wide screen** (2560 px)

| Scheme | Homepage | Product page | Cart |
|---|---|---|---|
| Light | ![Tech storefront homepage on a wide screen, light scheme](../images/tech-homepage-wide-light.webp) | ![Product page in Tech on a wide screen, light scheme](../images/tech-product-wide-light.webp) | ![Tech cart containing a product on a wide screen, light scheme](../images/tech-cart-wide-light.webp) |
| Dark | ![Tech storefront homepage on a wide screen, dark scheme](../images/tech-homepage-wide-dark.webp) | ![Product page in Tech on a wide screen, dark scheme](../images/tech-product-wide-dark.webp) | ![Tech cart containing a product on a wide screen, dark scheme](../images/tech-cart-wide-dark.webp) |

**Mobile** (390 px)

| Scheme | Homepage | Product page | Cart |
|---|---|---|---|
| Light | ![Tech storefront homepage on mobile, light scheme](../images/tech-homepage-mobile-light.webp) | ![Product page in Tech on mobile, light scheme](../images/tech-product-mobile-light.webp) | ![Tech cart containing a product on mobile, light scheme](../images/tech-cart-mobile-light.webp) |
| Dark | ![Tech storefront homepage on mobile, dark scheme](../images/tech-homepage-mobile-dark.webp) | ![Product page in Tech on mobile, dark scheme](../images/tech-product-mobile-dark.webp) | ![Tech cart containing a product on mobile, dark scheme](../images/tech-cart-mobile-dark.webp) |

- **Palette** — carbon (`#0D0F12`), graphite (`#171A1F`), aluminium
  (`#F2F3F5`) and signal orange (`#FF5B14`) on a white background, with a
  green status LED (`#2ED47A`) for "in stock" indicators.
- **Dark scheme** — an anodised graphite case: gunmetal panels (page `#111318`, cards `#171A1F`),
  cool white text, the same signal orange and LED (orange text lifted to `#FF7A3D`), and the carbon
  hero, benchmark panel and footer edged with a hairline.
- **Typography** — tightly-tracked *Inter* for headings and prices (tabular
  figures), uppercase monospace for eyebrows, breadcrumbs and spec labels.
- **Components** — square-cornered signal-orange buttons (outlined carbon for
  secondary actions), white product cards on an aluminium image tray whose
  border turns carbon on hover while an orange rule slides along the top (the
  whole card is clickable, on the homepage and on category pages alike), a
  carbon cart button with an orange item counter, a full-width orange
  add-to-cart button, and no default header top bar.
- **Homepage** — a carbon hero over a fine engineering grid: a white headline
  ending in signal orange, a blinking stock LED and two calls to action. On the
  right, the newest product of the channel sits on a **measuring bench**:
  viewfinder corners around its real image, its name, price and three spec
  callouts (dispatch, warranty, returns). A **spec bar** of key figures closes
  the hero. The promise block (`theme_promise` hookable) presents the service
  as a **spec sheet** next to a **benchmark** of measured figures drawn as
  orange gauges on carbon. Then come the four latest products; the deals and
  new collection blocks are hidden.
- **Footer** — a carbon footer with three **support modules** (tech support,
  warranty, returns) linking to the contact page and the customer account,
  above the Tech chip wordmark and the Sylius links.
- **Product page** — the price sits directly below the product name, before reviews.
- **Checkout** — the checkout header uses the Tech wordmark and responsive
  category navigation.
- **Translations** — every Tech-specific text lives in its own `tech`
  translation domain (`translations/tech.en.yaml` and `tech.fr.yaml`), so it
  can be edited or translated without touching the templates.
- **Accessibility** — visible orange focus rings, decorative bench details
  hidden from assistive technologies, and no motion (blinking LED included)
  for visitors who prefer reduced motion.

## Demo catalog

The screenshots above show a demo catalog of sixteen laptops, smartphones, headphones, wearables, smart home devices
and accessories from fictional brands, in six departments (Laptops, Smartphones, Audio, Wearables, Smart Home,
Accessories), shipped as the `tech` dataset of `open-colibri/starter-datasets` (`src/Datasets/datasets/tech/`:
`products.yaml`, `collections.yaml`, and in `media/` a studio photo of each device generated with Ollama, on a brushed
aluminium backdrop with a signal-orange rim light). Descriptions carry what a gadget buyer looks for: key specs,
battery life, what is in the box and the warranty. Create a shop from it with the
[import package](../import/datasets.md), into the default channel:

```bash
castor sylius:import:shop:create tech
castor sylius:import:fixtures:generate --project=tech --subdomain=""
castor sylius:import:fixtures:load --project=tech
```

No AI call is made: `products.yaml` points at the photos of the dataset `media/`. The shop menu then lists the six
departments; `castor sylius:import:delete tech` removes the catalog. The import keeps the products already in the
channel and gives the devices creation dates in the past, so on a store loaded with the default fixtures the latest
products may still show clothing: run `castor app:db:fixtures app` first to start from a store without products.

Install it with:

```bash
castor sylius:theme:setup tech
```
