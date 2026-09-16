# Kingdom History Generator

A browser-based, D&D-inspired kingdom history simulator. Generate notable characters, noble families, rulers, wars, and monuments across a chosen number of years. Originally based on Kingdom.js by Adam Edwards.

## Run locally

Requires Node.js 22+ for development checks and Python 3 for the local server.

```sh
# From the repository root
npm install
npm start
```

Open **http://localhost:8000**. No build step, application server, or external API is required. Serve the files over HTTP/HTTPS rather than opening `index.html` directly: the app uses ES modules and a module Web Worker. A modern browser is required.

## Generate a kingdom

Click **Generate kingdom** for a random 100-year history, or choose 1–10,000 years. The page stays interactive while events arrive from the worker. Cancel stops the worker and keeps the partial chronicle visible.

Expand **Shape the starting world** to supply any combination of:

- Kingdom name, noble houses, neighboring kingdoms, and character names.
- A starting monarch's name, title, house, ancestry, age, profession, level, or attributes.
- Ancestry weights for humans, elves, dwarves, halflings, gnomes, and dragonborn.
- A random seed and whether rival houses can usurp the throne.

Blank fields use generated defaults. Custom name lists replace the corresponding default pool. An explicitly selected monarch's ancestry may be excluded from the random population. Incompatible inputs, such as a 500-year-old human monarch, are rejected.

The final summary includes the current ruler and heir, noble houses, reign records, wars, monuments, and ruins. **Characters & family trees** lets you search all recorded characters, filter by living/deceased status, and inspect their attributes and life dates. Click a parent, current or former partner, or child to explore another generation. Earlier partnerships remain visible after death.

**Download full history** saves all events and character records as JSON. **Use these settings for the next run** restores the resolved settings for replay. A seed reproduces a history only with the same settings and engine version.

The chronicle displays events **newest first**, with the latest year at the top and year 0 at the end. Only 100 events are mounted at once. Use **Older events** / **Newer events** to browse the complete history, or **Follow new events** to keep the newest entries at the top. Progress pauses when the browser suspends rendering in a background tab and resumes when it becomes active.

## Simulation model

- Six rolled attributes, professions, experience, levels 1–20, derived hit points, and personal power.
- Political influence based separately on prestige, legitimacy, house wealth, alliances, Charisma, and the crown.
- Ancestry-specific maturity, lifespan, resilience, and vigilance.
- Contextual mortality: disease checks, age-related mortality, assassination attempts, and battlefield danger for adult participants in active wars.
- Partnerships, children, absolute primogeniture, house-leader fallback, and adult regents for child monarchs.
- Aggregate population, prosperity, and stability; individual simulation for notable characters rather than every resident.

These are custom historical-simulation rules inspired by D&D, not rules-compatible character sheets for a particular edition. See [simulation architecture and rules](docs/simulation.md) for the specific simplifications and extension points.

## Development

```sh
# From the repository root
npm test
npm run lint:generator
```

Tests cover deterministic replay, configuration validation, ancestry and attribute effects, advancement bounds, succession, family/leadership invariants across centuries, and streamed delivery with backpressure.

`npm run lint` also examines the legacy experiments and currently reports existing parsing, global-variable, and style errors in those files. `lint:generator` checks the new app, engine, worker, and tests.

### Entry points

| Path | Responsibility |
| --- | --- |
| `index.html`, `css/generator.css` | Main page and responsive presentation |
| `js/app.mjs` | Settings, worker lifecycle, event rendering, summary, export |
| `js/family.mjs` | Family links, including historical partnerships from union events |
| `js/icons.mjs`, `img/phosphor.svg` | Accessible icon helper and locally hosted Phosphor SVG symbols |
| `js/generation.worker.mjs` | Worker messages and per-batch acknowledgements |
| `js/simulation/run.mjs` | Incremental transport, also usable without a browser |
| `js/simulation/engine.mjs` | Annual simulation, structured events, final summary |
| `js/simulation/character.mjs` | Character creation, capability, mortality, advancement |
| `js/simulation/config.mjs`, `data.mjs`, `random.mjs` | Validation/defaults, content/rules data, seeded RNG |

The **Other generators** menu links to the original experimental pages.

### Icons

The UI uses a selected set of **Phosphor Icons 2.1.1**, regular weight, from [`@phosphor-icons/core`](https://github.com/phosphor-icons/core). Icons are bundled in `img/phosphor.svg`, so no CDN, icon font, or build step is needed at runtime. The original MIT license is included in `img/phosphor-LICENSE.txt`.

Icons accompany visible text, inherit the interface colors, and are hidden from screen readers. The generation spinner respects reduced-motion preferences. Add new symbols from the same upstream version/weight and render them with `icon()` or static `data-icon` attributes.
