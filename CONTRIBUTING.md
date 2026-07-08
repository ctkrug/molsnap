# Contributing

## Setup

```
npm install
```

## Workflow

```
npm run dev     # dev server with live rebuild at http://localhost:8080 (app at /app/)
npm run lint    # ESLint
npm test        # unit tests (node:test)
npm run build   # bundle the app into site/app/
```

Run `npm run lint && npm test && npm run build` before opening a pull
request. CI runs the same three steps.

## Project layout

- `src/` is the app: `index.html`, `styles.css`, `main.js`, and `src/chem/`
  for the pure formula/weight logic.
- `site/` is the deployable: `site/index.html` (landing page) plus the built
  app under `site/app/`.
- `scripts/build.js` is the esbuild bundler.
- `test/` holds the unit and build smoke tests.
- `docs/` holds the vision, architecture, design direction, and backlog.

## Commit style

Conventional commits (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`,
`ci`, `build`, `style`, `perf`), imperative subject line, body explaining
what changed and why for anything non-trivial.
