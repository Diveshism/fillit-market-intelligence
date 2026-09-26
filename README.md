# FILLIT Market Intelligence

An interactive market intelligence site built on a seven-week field research programme
for FILLIT Diesel Trading LLC — and the drill-down database of all 636 companies
visited.

**Divesh Anand** · Market Research Intern · Team Vision Crafters
**Field period:** 7 August – 17 September 2026 · Dubai, Sharjah, Ajman, Umm Al Quwain

This is the interactive dashboard listed in the final submission's handover assets.

---

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

```bash
npm run build && npm start   # production build
npm run typecheck            # tsc --noEmit
npm run lint                 # next lint
```

`predev` and `prebuild` run `scripts/build-dataset.mjs`, which regenerates the site's
dataset from the Excel workbooks. Never bypass them.

---

## Deploying to Vercel

```bash
npx vercel
```

No configuration, environment variables or backend. The dataset is imported statically
and 588 pages are prerendered at build time, including one for every company.
`prebuild` runs on Vercel as part of `npm run build`.

> The site sets `robots: noindex` in `src/app/layout.tsx`. Remove that line to allow
> search engines to index it.

---

## Where the numbers come from

Everything on this site is generated from **`data/submission/FILLIT_Master_Database.xlsx`**,
the workbook handed over with `Divesh_Anand_FILLIT_Final_Presentation.pptx`.

`scripts/build-dataset.mjs` reads it at build time and writes `src/data/fillit.json`.
No figure is typed into a page by hand: counts, rates, areas, industries, suppliers and
volumes are all recomputed from the 636 rows, or read from the workbook's own Summary,
Weekly, Sectors and Zones sheets.

An `.xlsx` is a zip, and the script carries its own zip reader (`node:zlib`) rather than
shelling out to `unzip` — that binary is not present on a stock Windows machine, and the
build has to run everywhere the site runs.

### The build verifies itself

The lead files handed over alongside the master are cuts of the same rows, so the
build uses them as a check. If any cut disagrees with the master, **the build fails**:

| File | Rows | Verified against |
|---|---|---|
| `FILLIT_All_Companies.xlsx` | 636 | every row |
| `FILLIT_Hot_Leads.xlsx` | 27 | `status === 'Hot'` |
| `FILLIT_Warm_Leads.xlsx` | 45 | `status === 'Warm'` |
| `FILLIT_Cold_Leads.xlsx` | 110 | `status === 'Cold'` |
| `FILLIT_Self_Generated_Leads.xlsx` | 136 | `lead_source === 'Self-generated'` |
| `FILLIT_CAFU_Affected_Accounts.xlsx` | 20 | `mentions_cafu` |
| `FILLIT_Blocked_and_Revisit.xlsx` | 210 | Appointment + Revisit |
| `FILLIT_Pain_Point_Companies.xlsx` | 43 | `pain_points !== null` |

It also re-derives the status counts from the rows and compares them against the
Summary sheet, checks that the per-company visit counts sum to 743, gates the measured
volume against the figure the Summary sheet states independently, and confirms the
self-generated count matches the Lead source column.

### Definitions

Taken from the workbook's own Summary sheet:

- **Green / confirmed diesel user** — Hot + Warm + Cold (182)
- **Qualified** — Hot + Warm (62)
- **Blocked or unresolved** — Appointment + Revisit (194)
- **Dead end** — recorded Invalid

### Scope of the volume figure

`1,282,100 L/month` is the measured volume across the 75 Hot, Warm and Cold companies
whose consumption converts to litres per month, **excluding RP Group – Gulf Asian
Contracting**. At 4,542,000 L/month that one account would outweigh everything else
combined, so it is shown separately everywhere rather than folded in — exactly as the
deck does. Hot 193,531 · Warm 317,881 · Cold 770,688.

### Confidence tiers

Every data view carries a badge:

- **VERIFIED** — computed from the field dataset, or official FILLIT material
- **SOURCED** — from a named external public source (Gulf News, The National, UAE Fuel Price Committee)
- **DERIVED** — computed by a stated rule, or a recommendation rather than a measurement

### Area coordinates

The workbook groups companies into named areas but carries no geography. The build
supplies an approximate centroid per area, used **only to place a marker on the
territory map, never to compute a figure**. Areas without a coordinate — the 28
companies recorded as "Unspecified" — are listed but not placed. A new area without a
coordinate fails the build rather than silently disappearing.

---

## Routes

| Route | What it is |
|---|---|
| `/` | Hero particle field, the market map, the Cold-volume finding, five findings, opportunity map, weekly progress |
| `/volume` | Finding 01 — 60% of measured litres sit in Cold, with the top 10 Cold accounts |
| `/companies` | The full database — search, filter, sort, CSV export |
| `/companies/[status]` | One list per status: hot, warm, cold, appointment, revisit, invalid |
| `/company/[id]` | Full company profile — 636 of these |
| `/new-leads` | 136 self-generated leads against the 500-company planned list |
| `/territory` | Interactive 3D UAE map, every area ranked, where to send the team next |
| `/sectors` | Effort against yield across twelve industries |
| `/competition` | Supplier landscape, pricing context, and the 20 CAFU-affected accounts |
| `/barriers` | The 90 blocked companies and the Jebel Ali case |
| `/pain-points` | Pain points by status, buying behaviour, verbatim quotes |
| `/recommendations` | Five recommendations, six things ready this week, the action plan |
| `/about` | Brief, method, triage system, journey, content programme, contribution, handover, sources |

Every list and profile is deep-linkable and refresh-safe. A profile keeps the list it
was reached from as its context: `/company/sun-metal-casting-factory?from=hot` renders
"3 of 27 in Hot companies" with working previous/next through the other 26.

---

## The 3D

Four scenes, all lazy-loaded, all with a 2D fallback carrying the same data.

| Scene | File | What it encodes |
|---|---|---|
| Hero particle field | `three/HeroParticles.tsx` | 636 instanced particles, one per company, coloured by status. Scroll migrates them from an unordered cloud into six clusters, then into the market-map bar |
| Territory map | `three/TerritoryScene.tsx` | Emirates extruded from Natural Earth admin-1 geometry. Pillar height = companies visited, colour = green rate |
| Measured volume | `three/VolumeScene.tsx` | Three tanks, one per status, filled to the litres each holds. Cold is tallest by a wide margin — the finding, on sight |
| Forklift | `three/ForkliftScene.tsx` | Low-poly forklift built from primitives — no external asset, no licence |

`src/data/uae_emirates.json` is Natural Earth `ne_10m_admin_1_states_provinces`,
filtered to the UAE and simplified with Ramer–Douglas–Peucker to 567 points (11 KB).

### Scene gating

`three/useSceneGate.ts` mounts a scene only when it is near the viewport, the screen is
at least 768px wide, and the visitor has not asked for reduced motion. It measures the
element's position once on mount rather than relying solely on IntersectionObserver,
because an IO callback can go undelivered on a page the browser is not compositing.

`three/SceneShell.tsx` shows a skeleton while the renderer starts and swaps in the 2D
fallback if it has not come up within six seconds — so a machine with WebGL disabled
gets the data, not a spinner.

---

## Photography

Seven field photographs sit in `public/photos/`, at 960×1280 / 1280×960. They are from
the same fieldwork and are used full-bleed with an ink scrim.

**To swap in full-resolution originals, overwrite the files in place** — the filenames
are the contract and no code changes are needed:

| File | Used on |
|---|---|
| `01_warehouse_forklift_arrival.jpeg` | Home hero |
| `03_onsite_bulk_refuelling.jpeg` | `/competition` |
| `05_decision_maker_meeting.jpeg` | `/pain-points` |
| `06_team_office.jpeg` | `/about` |
| `07_truck_field.jpeg` | `/territory` |

`02_forklift_closeup.jpeg` and `04_ecocoast_visit.jpeg` are available but not currently
placed. No imagery is generated.

---

## Accessibility and print

- Full keyboard navigation with a visible brand-red focus ring and a skip link
- Every chart has a text or table equivalent; the territory map's ranked panel *is* the accessible reading of the map
- `prefers-reduced-motion` disables smooth scroll, reveal animations, count-ups and all 3D
- Semantic landmarks, per-route `<title>` and meta description
- Tabular figures on every numeral
- A print stylesheet drops navigation and canvases and produces a clean PDF from any route

---

## Design system

Taken from FILLIT's own site, [fillit.co](https://fillit.co/), read September 2026:

| Token | Value | Where it comes from |
|---|---|---|
| `--red` | `#8D2635` | The maroon on FILLIT's logo and testimonial cards |
| `--red-deep` | `#8C0000` | The start of its 45° panel gradient |
| `--green` | `#05AF52` | Its Connect Now button |
| `--paper` / `--wash` | `#FFFFFF` / `#F7F7F7` | Pure white page, grey card surface |
| `--ink` / `--graphite` | `#1A1A1A` / `#5C5C5C` | Its `#333`/`#666` text pair |

Cards are 16px, buttons are 50px pills, and page headers carry the faint graph-paper
grid FILLIT lays behind its own hero. FILLIT sets headings in Gotham and body copy in
Visby CF; both are licensed faces that cannot be redistributed, so **Montserrat** and
**Poppins** stand in for them. Its logo is used in `public/brand/` in both published
finishes. Status colours keep the field sheets' green-to-red triage semantics but sit on
the brand scale — Hot is FILLIT's own green, Invalid its own maroon.

This is an internship report *about* FILLIT, not an official FILLIT publication, and the
footer says so.

---

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · React Three Fiber + drei ·
Framer Motion · Lenis · Fuse.js · TanStack Table. Static data import, no backend.
