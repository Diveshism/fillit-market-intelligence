/**
 * Build step — turn the handed-over Excel workbooks into the dataset the site imports.
 *
 * Source of truth: data/submission/FILLIT_Master_Database.xlsx, the workbook handed
 * over with Divesh_Anand_FILLIT_Final.pptx. Every figure on the site is computed from
 * it, or read from its own Summary / Weekly / Sectors / Zones sheets.
 *
 * The six lead files (Hot, Warm, Cold, Self-generated, CAFU-affected, Blocked) are
 * cuts of the same master rows, so they are used only to verify that the cuts agree
 * with the master. A mismatch fails the build.
 *
 * Run by `predev` and `prebuild`.
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SUBMISSION = resolve(here, '../data/submission');
const TMP = resolve(here, '../.xlsx-cache');
const TARGET = resolve(here, '../src/data/fillit.json');

/* ------------------------------------------------------------------ *
 * Minimal xlsx reader
 *
 * These workbooks are flat value-only sheets with inline strings, so a
 * full spreadsheet library would be a large dependency for three regexes.
 * ------------------------------------------------------------------ */

function decode(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#10;/g, '\n')
    .replace(/&#13;/g, '')
    .replace(/&amp;/g, '&');
}

function columnIndex(ref) {
  const letters = ref.match(/^([A-Z]+)/)[1];
  let n = 0;
  for (const c of letters) n = n * 26 + (c.charCodeAt(0) - 64);
  return n - 1;
}

function parseSheet(xml, shared) {
  const rows = [];
  for (const rowMatch of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = [];
    for (const cellMatch of rowMatch[1].matchAll(/<c([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cellMatch[1] ?? '';
      const inner = cellMatch[2] ?? '';
      const ref = (attrs.match(/r="([A-Z]+\d+)"/) || [])[1];
      if (!ref) continue;
      const type = (attrs.match(/t="([^"]*)"/) || [])[1];
      let value = null;
      if (type === 'inlineStr') {
        value = decode([...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(''));
      } else {
        const v = inner.match(/<v>([\s\S]*?)<\/v>/);
        if (v) {
          if (type === 's') value = shared[parseInt(v[1], 10)];
          else if (type === 'str') value = decode(v[1]);
          else {
            const n = Number(v[1]);
            value = Number.isFinite(n) ? n : decode(v[1]);
          }
        }
      }
      cells[columnIndex(ref)] = value ?? null;
    }
    rows.push(cells);
  }
  return rows;
}

function readWorkbook(file) {
  const out = resolve(TMP, file.replace(/\W/g, '_'));
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  execSync(`unzip -o -q "${resolve(SUBMISSION, file)}" -d "${out}"`);

  let shared = [];
  const sharedPath = resolve(out, 'xl/sharedStrings.xml');
  if (existsSync(sharedPath)) {
    shared = [...readFileSync(sharedPath, 'utf8').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
      decode([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')),
    );
  }

  const wb = readFileSync(resolve(out, 'xl/workbook.xml'), 'utf8');
  const rels = readFileSync(resolve(out, 'xl/_rels/workbook.xml.rels'), 'utf8');
  const relMap = {};
  for (const r of rels.matchAll(/<Relationship\b[^>]*\/>/g)) {
    const id = (r[0].match(/Id="([^"]*)"/) || [])[1];
    const target = (r[0].match(/Target="([^"]*)"/) || [])[1];
    if (id && target) relMap[id] = target;
  }

  const sheets = {};
  for (const s of wb.matchAll(/<sheet\b[^>]*\/>/g)) {
    const name = decode((s[0].match(/name="([^"]*)"/) || [])[1] ?? '');
    const rid = (s[0].match(/r:id="([^"]*)"/) || [])[1];
    const target = relMap[rid];
    if (!target) continue;
    const path = resolve(out, 'xl', target.replace(/^\/?xl\//, '').replace(/^\//, ''));
    if (!existsSync(path)) continue;
    sheets[name] = parseSheet(readFileSync(path, 'utf8'), shared);
  }
  return sheets;
}

/** Rows → objects keyed by the header row, with blanks normalised to null. */
function toObjects(rows) {
  const header = rows[0].map((h) => String(h ?? '').trim());
  return rows
    .slice(1)
    .filter((r) => r && String(r[0] ?? '').trim() !== '')
    .map((r) => {
      const o = {};
      header.forEach((h, i) => {
        const v = r[i];
        o[h] = typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : (v ?? null);
      });
      return o;
    });
}

/* ------------------------------------------------------------------ *
 * Zone coordinates
 *
 * The workbook groups companies into named areas but carries no geography.
 * These are approximate centroids for each area, used only to place a marker
 * on the territory map — never to compute a figure. "Unspecified" has no
 * location by definition and is excluded from the map.
 * ------------------------------------------------------------------ */

const ZONE_POINTS = {
  'Al Sajaa, Sharjah': [25.32, 55.66],
  'Warsan / International City': [25.16, 55.41],
  'Dubai Industrial City': [24.9, 55.18],
  'Nadd Al Hamar': [25.19, 55.36],
  'Dubai Investment Park': [24.99, 55.16],
  'Al Jurf, Ajman': [25.43, 55.47],
  'Sharjah Industrial Areas': [25.31, 55.42],
  'Dubai Silicon Oasis': [25.12, 55.38],
  'Umm Al Quwain': [25.56, 55.58],
  'Al Quoz': [25.14, 55.24],
  'Business Bay / Jumeirah / Barsha': [25.19, 55.26],
  'Ajman Industrial Area': [25.39, 55.5],
  'Dubai (other)': [25.23, 55.33],
  'Jebel Ali / JAFZA': [24.99, 55.02],
  'Al Qusais': [25.28, 55.38],
  'Ras Al Khor': [25.18, 55.35],
  Hamriyah: [25.47, 55.51],
};

/** Deck slide 13 — where to send the team next. */
const ZONE_TIER = {
  'Al Sajaa, Sharjah': 'work',
  'Sharjah Industrial Areas': 'work',
  'Dubai Industrial City': 'work',
  'Dubai Investment Park': 'work',
  'Al Jurf, Ajman': 'work',
  'Ajman Industrial Area': 'work',
  'Jebel Ali / JAFZA': 'unlock',
  Hamriyah: 'unlock',
  'Business Bay / Jumeirah / Barsha': 'stop',
  'Dubai Silicon Oasis': 'stop',
};

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const EMIRATES = ['Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Abu Dhabi', 'Fujairah'];

/**
 * The Emirate column carries a handful of column-entry faults recorded in the
 * handover notes: a website typed into the field, and inconsistent casing.
 */
function normaliseEmirate(value) {
  if (!value) return null;
  const v = String(value).trim();
  if (!v || /^n\/?a$/i.test(v) || /^no website$/i.test(v)) return null;
  if (/^https?:\/\//i.test(v) || /\.(ae|com|net|org)\b/i.test(v)) return null;
  return EMIRATES.find((e) => e.toLowerCase() === v.toLowerCase()) ?? v;
}

function slug(name) {
  return String(name)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

function percent(value) {
  if (typeof value === 'number') return value;
  const m = String(value ?? '').match(/-?[\d.]+/);
  return m ? Number(m[0]) : 0;
}

/** Excel serial date or ISO string → ISO date string. */
function isoDate(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    const ms = Math.round((value - 25569) * 86400 * 1000);
    return new Date(ms).toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  return s;
}

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */

const master = readWorkbook('FILLIT_Master_Database.xlsx');
const rawCompanies = toObjects(master['All companies']);

if (rawCompanies.length !== 568) {
  console.error(`build-dataset: expected 568 companies, found ${rawCompanies.length}`);
  process.exit(1);
}

/* Visit history: "2026-08-27 Revisit | 2026-09-03 Revisit | 2026-09-09 Hot" */
const historyByCompany = new Map();
for (const row of toObjects(master['Visit history'])) {
  const raw = row['Status history (date status)'];
  if (!raw) continue;
  const entries = String(raw)
    .split(/\s*[|;]\s*|\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{4})\s*[-—:]?\s*(.+)/);
      if (!m) return null;
      return { date: isoDate(m[1]), status: m[2].trim() };
    })
    .filter(Boolean);
  if (entries.length) historyByCompany.set(row.Company, entries);
}

const ids = new Set();
const companies = rawCompanies.map((r) => {
  let id = slug(r.Company);
  let n = 2;
  while (ids.has(id)) id = `${slug(r.Company)}-${n++}`;
  ids.add(id);

  const status = r['Final status'];
  const litres = typeof r['Est. litres / month'] === 'number' ? r['Est. litres / month'] : null;
  const first = isoDate(r['First visit']);
  const last = isoDate(r['Last visit']);

  const history = historyByCompany.get(r.Company) ?? [
    { date: last ?? first, status },
  ];

  return {
    id,
    company: r.Company,
    status,
    zone: r.Zone,
    sector: r.Sector,
    location: r.Location,
    emirate: normaliseEmirate(r.Emirate),
    contact_person: r['Contact person'],
    phone: r.Phone,
    direct_number: r['Direct no.'],
    email: r.Email,
    current_supplier: r['Current supplier'],
    consumption_raw: r['Consumption (as recorded)'],
    litres_per_month: litres,
    fleet: r['Fleet / equipment'],
    pain_points: r['Pain points'],
    comments: r['Latest comments'],
    first_visit: first,
    last_visit: last,
    visits: Number(r.Visits) || 1,
    lead_source: r['Lead source'],
    mentions_cafu: String(r['Mentions CAFU'] ?? '').toLowerCase() === 'yes',
    status_by_colour: r['Status by colour'],
    interest_level_written: r['Interest level (written)'],
    /** True where written interest level overrode the cell colour. */
    interest_level_applied: String(r['Interest level applied'] ?? '').toLowerCase() === 'yes',
    status_history: history,
  };
});

/* ---------- summary sheet, as key/value ---------- */
const summaryRows = toObjects(master.Summary);
const metric = (name) => summaryRows.find((r) => r.Metric === name)?.Value ?? null;

/* ---------- verification against the handed-over cuts ---------- */
const cuts = [
  ['FILLIT_Hot_Leads.xlsx', 'Hot leads', (c) => c.status === 'Hot'],
  ['FILLIT_Warm_Leads.xlsx', 'Warm leads', (c) => c.status === 'Warm'],
  ['FILLIT_Cold_Leads.xlsx', 'Cold leads', (c) => c.status === 'Cold'],
  ['FILLIT_Self_Generated_Leads.xlsx', 'Self-generated leads', (c) => c.lead_source === 'Self-generated'],
  ['FILLIT_CAFU_Affected_Accounts.xlsx', 'CAFU mentions', (c) => c.mentions_cafu],
  ['FILLIT_Blocked_and_Revisit.xlsx', 'Appointment and revisit', (c) => c.status === 'Appointment' || c.status === 'Revisit'],
];

const checks = [];
for (const [file, sheet, predicate] of cuts) {
  const rows = toObjects(readWorkbook(file)[sheet]);
  const mine = companies.filter(predicate).length;
  if (rows.length !== mine) {
    console.error(`build-dataset: ${file} has ${rows.length} rows, master gives ${mine}`);
    process.exit(1);
  }
  checks.push(`${sheet}: ${mine}`);
}

/* ---------- reference tables ---------- */
const weekly = toObjects(master.Weekly).map((r) => ({
  week: Number(String(r.Week).replace(/\D/g, '')),
  visits: Number(r.Visits) || 0,
  hot: Number(r.Hot) || 0,
  warm: Number(r.Warm) || 0,
  cold: Number(r.Cold) || 0,
  green_rate: percent(r['Green rate']),
  dead_end_rate: percent(r['Dead-end rate']),
  new_leads: Number(r['New leads']) || 0,
}));

const sectors = toObjects(master.Sectors).map((r) => ({
  sector: r.Sector,
  companies: Number(r.Companies) || 0,
  hot: Number(r.Hot) || 0,
  warm: Number(r.Warm) || 0,
  cold: Number(r.Cold) || 0,
  appointment: Number(r.Appointment) || 0,
  invalid: Number(r.Invalid) || 0,
  green_rate: percent(r['Green rate']),
  self_generated: Number(r['Self-generated']) || 0,
}));

const zones = toObjects(master.Zones).map((r) => {
  const point = ZONE_POINTS[r.Zone];
  return {
    zone: r.Zone,
    companies: Number(r.Companies) || 0,
    hot: Number(r.Hot) || 0,
    warm: Number(r.Warm) || 0,
    cold: Number(r.Cold) || 0,
    appointment: Number(r.Appointment) || 0,
    invalid: Number(r.Invalid) || 0,
    green_rate: percent(r['Green rate']),
    self_generated: Number(r['Self-generated']) || 0,
    lat: point ? point[0] : null,
    lng: point ? point[1] : null,
    tier: ZONE_TIER[r.Zone] ?? 'covered',
  };
});

const missingPoints = zones.filter((z) => z.lat === null && z.zone !== 'Unspecified');
if (missingPoints.length) {
  console.error(`build-dataset: no coordinates for ${missingPoints.map((z) => z.zone).join(', ')}`);
  process.exit(1);
}

/* ---------- volume, computed from the rows ---------- */
const withVolume = companies.filter((c) => c.litres_per_month !== null);
const largest = [...withVolume].sort((a, b) => b.litres_per_month - a.litres_per_month)[0];
const volumeByStatus = (status) =>
  withVolume
    .filter((c) => c.status === status && c.id !== largest.id)
    .reduce((t, c) => t + c.litres_per_month, 0);

const hotVolume = volumeByStatus('Hot');
const warmVolume = volumeByStatus('Warm');
const coldVolume = volumeByStatus('Cold');
const measured = hotVolume + warmVolume + coldVolume;

const dataset = {
  meta: {
    author: 'Divesh Anand',
    role: 'Market Research Intern',
    team: 'Vision Crafters',
    company: 'FILLIT Diesel Trading LLC',
    field_period: '7 August – 17 September 2026',
    weeks: 6,
    emirates: ['Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain'],
    source: 'Combined_week1-week5.xlsx and Combined_week6.xlsx',
    generated_from: 'FILLIT_Master_Database.xlsx',
  },
  summary: {
    field_visits: metric('Field visits (rows)'),
    companies: metric('Unique companies'),
    hot: metric('Hot'),
    warm: metric('Warm'),
    cold: metric('Cold'),
    appointment: metric('Appointment'),
    revisit: metric('Revisit'),
    invalid: metric('Invalid'),
    diesel_users: metric('Confirmed diesel users'),
    qualified: metric('Qualified'),
    blocked_or_unresolved: metric('Blocked or unresolved'),
    visited_more_than_once: metric('Companies visited more than once'),
    status_changed: metric('Status changed between visits'),
    colour_conflicts: metric('Colour vs interest level conflicts'),
    decision_makers: metric('Named fuel decision-makers'),
    self_generated: metric('Self-generated leads'),
    self_generated_green_rate: percent(metric('Self-generated green rate')),
    planned_list_green_rate: percent(metric('Planned list green rate')),
    cafu_mentions: metric('Companies mentioning CAFU'),
    invalid_wrong_address: metric('Invalid: wrong address'),
    invalid_no_requirement: metric('Invalid: no diesel requirement'),
  },
  volume: {
    measured_excl_largest: measured,
    hot: hotVolume,
    warm: warmVolume,
    cold: coldVolume,
    cold_share_pct: Number(((coldVolume / measured) * 100).toFixed(1)),
    companies_with_volume: withVolume.length,
    largest_account: largest.company,
    largest_account_id: largest.id,
    largest_account_lpm: largest.litres_per_month,
    diesel_price_aed_per_litre: 4.3,
  },
  weekly,
  sectors,
  zones,
  companies,
};

/* ---------- final consistency gate ---------- */
const counted = {
  hot: companies.filter((c) => c.status === 'Hot').length,
  warm: companies.filter((c) => c.status === 'Warm').length,
  cold: companies.filter((c) => c.status === 'Cold').length,
  appointment: companies.filter((c) => c.status === 'Appointment').length,
  revisit: companies.filter((c) => c.status === 'Revisit').length,
  invalid: companies.filter((c) => c.status === 'Invalid').length,
};
for (const [key, value] of Object.entries(counted)) {
  if (dataset.summary[key] !== value) {
    console.error(`build-dataset: summary says ${key}=${dataset.summary[key]}, rows give ${value}`);
    process.exit(1);
  }
}
if (companies.reduce((t, c) => t + c.visits, 0) !== dataset.summary.field_visits) {
  console.error('build-dataset: visit counts do not sum to the recorded field visits');
  process.exit(1);
}

mkdirSync(dirname(TARGET), { recursive: true });
writeFileSync(TARGET, JSON.stringify(dataset));
rmSync(TMP, { recursive: true, force: true });

console.log(
  `build-dataset: ${companies.length} companies · ${dataset.summary.field_visits} visits · ` +
    `${measured.toLocaleString('en-GB')} L/month measured (Cold ${dataset.volume.cold_share_pct}%) · ` +
    `cuts verified — ${checks.join(', ')}`,
);
