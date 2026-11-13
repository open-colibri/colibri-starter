---
title: Overview
description: Import products, collections, images and prices into Sylius fixtures, from AI or an existing website.
sidebar:
  order: 1
---

Import products, collections, images and prices from an **AI-generated catalog**, or load YAML produced by an external
fetch step into Sylius fixtures. Provided by `opencolibri/starter-import`.

## Prerequisites

1. Make sure you have already set up your Sylius application using the `castor docker:service:install sylius` command.

2. Configure AI in .castor/.env (created automatically when you run the first import command). You can copy the default
   values from .castor/.env.example.

You can also create a .castor/.env.local file for your sensitive values or local overrides.

| Variable         | Default                  | Description                             |
|------------------|--------------------------|-----------------------------------------|
| `AI_PROVIDER`    | `openrouter`             | `ollama` (local) or `openrouter`        |
| `AI_MODEL`       | provider-specific        | Text / structured-output model          |
| `AI_IMAGE_MODEL` | provider-specific        | Image generation model (AI import only) |
| `AI_BASE_URL`    | `http://127.0.0.1:11434` | Ollama URL (ignored for OpenRouter)     |
| `AI_API_KEY`     | —                        | Required when `AI_PROVIDER=openrouter`  |

## Workflow

1. Produce the catalog YAML under `.castor/import/var/{project-slug}/`:
   [generate it with AI](ai-catalog.md), or [fetch it from an existing website](existing-website.md).
2. [Generate the Sylius fixtures](fixtures.md) from that YAML, then load them.

To reuse a catalog, build it as a [dataset](datasets.md) instead (catalog and images, downloadable as a zip), or pick a
ready-made one from `opencolibri/starter-datasets`, then create shops from it with `castor sylius:import:shop:create`.

## Managing imported shops

```bash
castor sylius:import:list                  # list the imported shops
castor sylius:import:delete organic-kids   # delete a shop, its files and its channel catalog
```
