# Lost Ark Planner

Live at https://lostark.omixia.com/ (deployed from `main` by GitHub Actions).

Helps plan out raid assignments and progression in Lost Ark.

```sh
npm install
npm run dev     # local site
npm test        # engine tests
npm run build
```

## Layout

- `data/game-data.json`: all game data (raid gold, tasks, milestones, honing costs). Patches change
  numbers here, not code. Entries with `verified: false` still need checking; see `docs/in-game-checks.md`.
- `src/data/`: the zod schema for that file, the bundled copy, and the example roster.
- `src/engine/`: pure TypeScript planning logic, no React. Unit-tested against the plan doc's numbers.
- `src/features/`: one folder per page (roster, planner, advisor, checklist, triage).
- `src/app/`: router and layout (sidebar on desktop, bottom tabs on mobile).

Uses `HashRouter` so the build also works as a PWA or inside a Capacitor wrapper later.