# Lost Ark Planner

Live at https://jraynard.github.io/lost-ark-planner/ (deployed from `main` by GitHub Actions).

Turns `docs/progression-plan.md` into a calculator: enter your roster, get each character's best
weekly raids, gold by binding type, the next item-level breakpoint worth chasing, a resetting
checklist and drop triage.

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

## Publishing a game data update

The app ships with `data/game-data.json` and checks the copy on `main` for a newer `version`,
asking the user before switching to it.

1. Edit `data/game-data.json`.
2. Bump `version` and add a `changelog` entry for it.
3. `npm test` (validates the file and the gold fixtures).
4. Commit and push to `main`.
