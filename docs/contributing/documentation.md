---
title: Documentation website
description: Preview the documentation website locally while editing the docs/ pages.
sidebar:
  order: 5
---

The pages of this documentation live in the `docs/` folder of the monorepo. The website that publishes them on
[the-swan-foundation.github.io/the-swan-starter-docs](https://the-swan-foundation.github.io/the-swan-starter-docs/) is built from the
[the-swan-foundation/the-swan-starter-docs](https://github.com/the-swan-foundation/the-swan-starter-docs) repository with Astro Starlight.

Clone that repository next to the monorepo, then serve the pages of your checkout:

```bash
git clone git@github.com:the-swan-foundation/the-swan-starter-docs.git ../docs
castor docs:up               # http://localhost:4321/the-swan-starter-docs/, follows the changes of docs/
castor docs:up --port=4322   # on another port
castor docs:stop
```

`castor docs:up` installs the website dependencies on the first run and starts its dev server in the background. It
serves the `docs/` of the checkout it runs from: run it from a [worktree](worktrees.md) to preview the pages of its
branch. Only one server runs at a time, so it replaces any server started from another checkout. Set `DOCS_SITE_DIR`
when the website is cloned elsewhere.
