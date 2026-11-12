---
title: Releasing
description: How the CI splits every package into its read-only repository, and how to tag a release.
sidebar:
  order: 2
---

The [`Split packages`](https://github.com/the-swan-foundation/the-swan-starter/blob/main/.github/workflows/split.yml) workflow runs on every push to `main` and on every tag: it builds
a matrix from `castor monorepo:packages --json` and runs `castor monorepo:split <package> --push` for each package.

Requirements:

1. Create one empty repository per package (`FriendsOfSylius/sylius-starter-core`, `FriendsOfSylius/sylius-starter-themes`...).
2. Add a `SPLIT_TOKEN` secret to this repository: a fine-grained personal access token (or a GitHub App token)
   with *Contents: read and write* on the package repositories.
3. Register the package repositories on Packagist (and this one for `sylius-starter/sylius-starter`).

Tags are split too: tag the monorepo (`git tag v0.1.0 && git push --tags`) and every package receives the same tag.
