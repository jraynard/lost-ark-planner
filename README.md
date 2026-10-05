# Lost Ark Planner

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

- `src/data/`: game data (raid gold, tasks, milestones). Patches change numbers here, not code.
  Entries with `verified: false` still need checking; see `docs/in-game-checks.md`.
- `src/engine/`: pure TypeScript planning logic, no React. Unit-tested against the plan doc's numbers.
- `src/features/`: one folder per page (roster, planner, advisor, checklist, triage).
- `src/app/`: router and layout (sidebar on desktop, bottom tabs on mobile).

Uses `HashRouter` so the build also works as a PWA or inside a Capacitor wrapper later.
