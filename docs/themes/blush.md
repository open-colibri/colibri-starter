---
title: Blush theme
description: A storefront theme with a white canvas, raspberry accents, rose panels and a plum footer.
sidebar:
  order: 4
---

Blush is a crisp white canvas with expressive raspberry accents, soft rose panels and a deep
plum footer.

**Desktop** (1440 px)

| Scheme | Homepage | Product page | Cart |
|---|---|---|---|
| Light | ![Blush storefront homepage on desktop, light scheme](../images/blush-homepage-normal-light.webp) | ![Product page in Blush on desktop, light scheme](../images/blush-product-normal-light.webp) | ![Blush cart containing a product on desktop, light scheme](../images/blush-cart-normal-light.webp) |
| Dark | ![Blush storefront homepage on desktop, dark scheme](../images/blush-homepage-normal-dark.webp) | ![Product page in Blush on desktop, dark scheme](../images/blush-product-normal-dark.webp) | ![Blush cart containing a product on desktop, dark scheme](../images/blush-cart-normal-dark.webp) |

**Wide screen** (2560 px)

| Scheme | Homepage | Product page | Cart |
|---|---|---|---|
| Light | ![Blush storefront homepage on a wide screen, light scheme](../images/blush-homepage-wide-light.webp) | ![Product page in Blush on a wide screen, light scheme](../images/blush-product-wide-light.webp) | ![Blush cart containing a product on a wide screen, light scheme](../images/blush-cart-wide-light.webp) |
| Dark | ![Blush storefront homepage on a wide screen, dark scheme](../images/blush-homepage-wide-dark.webp) | ![Product page in Blush on a wide screen, dark scheme](../images/blush-product-wide-dark.webp) | ![Blush cart containing a product on a wide screen, dark scheme](../images/blush-cart-wide-dark.webp) |

**Mobile** (390 px)

| Scheme | Homepage | Product page | Cart |
|---|---|---|---|
| Light | ![Blush storefront homepage on mobile, light scheme](../images/blush-homepage-mobile-light.webp) | ![Product page in Blush on mobile, light scheme](../images/blush-product-mobile-light.webp) | ![Blush cart containing a product on mobile, light scheme](../images/blush-cart-mobile-light.webp) |
| Dark | ![Blush storefront homepage on mobile, dark scheme](../images/blush-homepage-mobile-dark.webp) | ![Product page in Blush on mobile, dark scheme](../images/blush-product-mobile-dark.webp) | ![Blush cart containing a product on mobile, dark scheme](../images/blush-cart-mobile-dark.webp) |

- **Palette** — white and pale rose surfaces (`#FFFFFF`, `#FBF6F8`), raspberry
  (`#B54878`) accents and plum (`#2D141F`) typography and footer.
- **Dark scheme** — the boutique after hours: a plum-black page (`#1A1216`, cards `#251A21`),
  blush-white type, raspberry kept for buttons and badges and lightened to `#F28DB9` for links and
  prices, a bright pink hover on primary buttons, and a wine-plum footer (`#3A1829`).
- **Components** — rounded buttons and product cards, a custom wordmark and
  responsive taxon navigation.
- **Product cards** — rounded white cards with a pale rose image well and a soft
  plum shadow, raspberry prices, a lift on hover; the whole card is clickable, on
  the homepage and on category pages alike.
- **Homepage** — a French editorial hero with a CSS illustration, a direct
  link to the latest products and a link to the promise block; then the
  *"Our little promises"* block (four rose cards with coloured badges, through
  the `theme_promise` hookable) and four latest products; the latest deals and
  new-collection blocks are hidden.
- **Shopping flow** — matching buttons, forms and checkout branding, including
  the Blush wordmark and category navigation in the checkout header.
- **Translations** — the homepage texts live in a `blush` translation domain
  (`translations/blush.en.yaml` and `blush.fr.yaml`).

Install it with:

```bash
castor sylius:theme:setup blush
```
