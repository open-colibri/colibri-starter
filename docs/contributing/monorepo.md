---
title: Monorepo
description: The layout of the monorepo and its castor monorepo:* tasks.
sidebar:
  order: 1
---

This repository is the development monorepo of every `open-colibri/starter-*` package. Each package is split into its own
**read-only** repository by the CI: issues and pull requests always go here.

## Layout

```
src/
├── Core/              open-colibri/starter-core
│   ├── composer.json
│   ├── src/           OpenColibri\Starter\Core\
│   └── tests/
├── Plugins/           open-colibri/starter-plugins     (+ resources/)
├── Themes/            open-colibri/starter-themes      (+ resources/)
├── Menu/              open-colibri/starter-menu
├── Datasets/          open-colibri/starter-datasets    (+ datasets/)
├── Import/            open-colibri/starter-import      (+ resources/)
└── Upsun/             open-colibri/starter-upsun
tests/Integration/     cross-package tests
.castor/monorepo/      monorepo tooling (castor monorepo:*)
```

The `composer.json` of each package is the source of truth: the root `composer.json` (require, `replace`, autoload)
is **generated** from them. Internal dependencies use `self.version` so all packages are always released together.

## Monorepo tasks

| Task                                   | What it does                                                                                    |
|----------------------------------------|-------------------------------------------------------------------------------------------------|
| `castor monorepo:packages [--json]`    | Lists the packages (`--json` is used to build the CI matrix)                                    |
| `castor monorepo:merge`                | Regenerates the root `composer.json` from the packages                                          |
| `castor monorepo:validate`             | Checks package metadata, internal dependencies and the root `composer.json`                     |
| `castor monorepo:split [<package>...]` | Splits packages with [splitsh-lite](https://github.com/splitsh/lite) (dry-run without `--push`) |

```bash
castor monorepo:split                              # dry-run, prints the split SHA of every package
castor monorepo:split core themes --push           # push the current branch of two packages
castor monorepo:split --ref=refs/tags/v0.1.0 --push
```

The remote of each package defaults to `git@github.com:{repository}.git` (`{repository}` = `open-colibri/starter-core`,
`{name}` = `open-colibri/starter-core`, `{short}` = `core`); override it with `--remote-pattern` or the `SPLIT_REMOTE_PATTERN` environment variable.

## Adding a package

1. Create `src/<Name>/` with `composer.json` (name `open-colibri/starter-<name>`, `OpenColibri\Starter\<Name>\` PSR-4
   autoload on `src/`, `"open-colibri/starter-core": "self.version"`), a `README.md` and a `LICENSE`.
2. Register its tasks from an autoloaded `src/functions.php` with `TaskProviderRegistry::register()`.
3. Run `castor monorepo:merge`, then `castor monorepo:validate` and `composer dump-autoload`.
