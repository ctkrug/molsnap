# Contributing

## Setup

```
npm install
```

## Workflow

```
npm run dev     # serve src/ with live rebuild at http://localhost:8080
npm run lint    # ESLint
npm test        # unit tests (node:test)
npm run build   # bundle into dist/
```

Run `npm run lint && npm test && npm run build` before opening a pull
request — CI runs the same three steps.

## Project layout

- `src/` — the app: `index.html`, `styles.css`, `main.js`, and
  `src/chem/` for the pure formula/weight logic.
- `scripts/build.js` — the esbuild bundler.
- `test/` — unit and build smoke tests.
- `docs/` — vision, design direction, and backlog.

## Commit style

Conventional commits (`feat`, `fix`, `docs`, `test`, `refactor`, `chore`,
`ci`, `build`, `style`, `perf`), imperative subject line, body explaining
what changed and why for anything non-trivial.
