---
title: Datasets
description: Build reusable catalogs with their images, download them, and create shops from them.
sidebar:
  order: 5
---

A **dataset** is a catalog ready to be imported: its products and collections (`products.yaml`, `collections.yaml`),
**their images** (`media/`) and a `dataset.yaml` describing it. A shop is created from a dataset, then its fixtures are
generated and loaded as usual: several shops can share one dataset, and a dataset is built (AI calls, downloads) once.

```
cellar/
├── dataset.yaml       name, description, suggested theme…
├── products.yaml      image: media/<code>.webp
├── collections.yaml
└── media/             the images, in WebP
```

In a dataset, the `image` of a product or a collection is a path relative to the dataset directory: the
[fixtures generation](fixtures.md) copies it instead of downloading it. A URL still works, and is downloaded.

## Ready-made datasets

`open-colibri/starter-datasets` ships ready-made datasets, images included, so a demo shop needs no AI call nor download:

| Dataset        | Catalog                                                       | Suggested theme                           |
|----------------|---------------------------------------------------------------|-------------------------------------------|
| `automotive`   | Eighteen car parts, tyres, tools and workshop equipment       | [Torque](../themes/torque.md)             |
| `bloom`        | Eighteen beauty products and tools, on six shelves            | [Bloom](../themes/bloom.md)               |
| `cellar`       | Seventeen wines from fictional estates, in seven regions      | [Cellar](../themes/cellar.md)             |
| `culture`      | Eighteen books, games, instruments and collectibles           | [Culture](../themes/culture.md)           |
| `depot`        | Eighteen trade supplies and equipment, in six aisles          | [Depot](../themes/depot.md)               |
| `groove`       | Sixteen fictional vinyl records, in six genres                | [Groove](../themes/groove.md)             |
| `home`         | Eighteen pieces of furniture, lighting, linen and tableware   | [Hearth](../themes/hearth.md)             |
| `outdoor`      | Eighteen pieces of hiking, climbing and camping gear          | [Summit](../themes/summit.md)             |
| `pets`         | Eighteen foods, treats, toys, beds and care products for pets | [Paws](../themes/paws.md)                 |
| `retro-gaming` | Sixteen retro consoles, games and accessories, on six shelves | [Retro Gaming](../themes/retro_gaming.md) |
| `roastery`     | Sixteen specialty coffees and brewing tools, on six shelves   | [Roastery](../themes/roastery.md)         |
| `supermarket`  | Nine everyday groceries, one per supermarket aisle            | [Drive](../themes/drive.md)               |
| `teahouse`     | Sixteen fine teas and pieces of teaware, on six shelves       | [Teahouse](../themes/teahouse.md)         |
| `tech`         | Sixteen devices from fictional brands, in six departments     | [Tech](../themes/tech.md)                 |
| `video-games`  | Sixteen fictional video games, in six genres                  | [Arena](../themes/arena.md)               |

To add one, drop its directory in `src/Datasets/datasets/` (a [downloaded dataset](#download-a-dataset) has that
layout). Every product needs a local image, a collection may have one (shown on the homepage category tiles): the
package tests check them. Another package can ship its own datasets by registering its directory from an autoloaded
file:

```php
use OpenColibri\Starter\Core\Dataset\DatasetDirectories;

DatasetDirectories::register('my-datasets', __DIR__ . '/../datasets');
```

## Build a dataset

```bash
castor sylius:import:dataset:build --name="Tea House" --description="Loose leaf teas and tea ware"
castor sylius:import:dataset:build --source=existing --name="Tea House" --url=https://www.example-tea.com
```

The `ai` source [generates the catalog with AI](ai-catalog.md) (`--limit`, 20 products at most); other sources are
registered by the project, such as `existing` (the [fetch of an existing site](existing-website.md)) in the Sales Kit.
The dataset is written to `.castor/import/datasets/<slug>/` (the slug of the name, or `--dataset`), then the image of
every product and collection is downloaded or generated into its `media/`. Building it again replaces its catalog.

```bash
castor sylius:import:dataset:list            # the datasets, with their number of products and images
castor sylius:import:dataset:images tea-house # download or generate the images still missing
castor sylius:import:dataset:delete tea-house # built datasets only, the shops created from it are kept
```

A source is a callable that writes the catalog of the slug it receives, in an import context whose var dir is the
datasets one (the shop import functions then write to the dataset):

```php
use OpenColibri\Starter\Import\Dataset\DatasetBuilders;

DatasetBuilders::register('existing', static function (string $slug, string $name, string $description, ?string $url, int $limit): void {
    fetch_import_data($url, $name, $description, $slug);
});
```

## Download a dataset

```bash
castor sylius:import:dataset:export cellar                   # .castor/import/exports/cellar.zip
castor sylius:import:dataset:export tea-house --output=tea.zip
```

The zip holds a `<slug>/` directory: unzipped in `src/Datasets/datasets/`, it becomes a ready-made dataset.

## Create a shop from a dataset

```bash
castor sylius:import:shop:create cellar                                    # shop "cellar"
castor sylius:import:shop:create cellar --name="Cave du Port" --description="…"  # shop "cave-du-port"
castor sylius:import:fixtures:generate --project=cave-du-port
castor sylius:import:fixtures:load --project=cave-du-port
```

The dataset is copied into `.castor/import/var/<shop>/`, and `project.yaml` records the dataset it comes from
(`dataset: cellar`). The shop then lives on its own: deleting or rebuilding the dataset leaves it unchanged.
