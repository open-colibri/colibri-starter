---
title: Shop identity slot (logo)
description: How themes and packages share the shop logo without overwriting each other.
sidebar:
  order: 2
---

The shop logo is a slot owned by `opencolibri/starter-core`, so that themes and other packages (import...) can all use it
without overwriting each other. Before it, the import shipped `templates/shop/shared/layout/header/logo.html.twig`: a
theme installer overwrote it and the remover of every other theme deleted it.

| Who         | Provides | How                                                                                                                                                                                                    |
|-------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Core        | the slot | `OpenColibri\Starter\Core\Storefront\Brand::install($app)` (idempotent) generates the `storefront_brand()` Twig function and renders the logo in the header when no theme is active (`config/sylius/storefront/brand.yaml`). |
| A theme     | markup   | reads `storefront_brand()` in `templates/shop/shared/layout/brand/identity.html.twig`, with its own artwork as fallback.                                                                              |
| A package   | data     | generates a service implementing `App\Storefront\Brand\BrandContributorInterface` (autoconfigured).                                                                                                   |

`storefront_brand()` returns an `App\Storefront\Brand\BrandContent` (`name`, `logo`, `logoAlt`, every field nullable)
built for the current channel, so every channel of a shared app (sales kit) gets its own logo with the same theme.

## Writing a theme template

```twig
{% set brand = storefront_brand() %}
{% if brand.logo %}
    <img class="my-theme-logo__image" src="{{ brand.logo }}" alt="{{ brand.logoAlt ?? brand.name ?? '' }}">
{% else %}
    {# theme wordmark #}
{% endif %}
```

Links around the logo use `{{ storefront_brand().name ?? 'My theme' }}` in their `aria-label`.

## Writing a contributor

```php
#[AsTaggedItem(priority: 100)] // higher runs first, later contributors can override
final class MyBrandContributor implements BrandContributorInterface
{
    public function contribute(BrandContent $brand): BrandContent
    {
        return $brand->merge(new BrandContent(name: 'My shop', logo: '/media/my-shop/logo.svg'));
    }
}
```

## Rules

- A package never ships a file at a path a theme also ships (checked by `tests/Integration/StorefrontBrandContractTest.php`).
- Only core configures the `sylius_shop.base.header.content.logo` hook; no package overrides
  `@SyliusShop/shared/logo.html.twig`. Themes replace the parent `logo` hookable, so this hook only renders without a
  theme: the checkout and error pages of the default theme keep the Sylius logo.
- Every theme reads `storefront_brand()` in its identity template and every theme installer calls `Brand::install($app)`.
