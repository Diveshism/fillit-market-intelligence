/**
 * Build step — turn the handed-over Excel workbooks into the dataset the site imports.
 *
 * Source of truth: data/submission/FILLIT_Master_Database.xlsx, the workbook handed
 * over with Divesh_Anand_FILLIT_Final_Presentation.pptx — seven weeks, 743 visits,
 * 636 companies. Every figure on the site is computed from it, or read from its own
 * Summary / Weekly / Sectors / Zones sheets.
 *
 * The seven handover cuts (All, Hot, Warm, Cold, Self-generated, CAFU-affected,
 * Blocked, Pain-point) are slices of the same master rows, so they are used only to
 * verify that the cuts agree with the master. A mismatch fails the build.
 *
 * Run by `predev` and `prebuild`.
 */

import { inflateRawSync } from 'node:zlib';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SUBMISSION = resolve(here, '../data/submission');
const TARGET = resolve(here, '../src/data/fillit.json');

/* ------------------------------------------------------------------ *
 * Minimal xlsx reader
 *
 * These workbooks are flat value-only sheets with inline strings, so a
 * full spreadsheet library would be a large dependency for three regexes.
 *
 * An .xlsx is a zip, and the archive is unpacked here rather than shelled out
 * to `unzip`: that binary is absent from a stock Windows machine, so the build
 * has to carry its own reader if it is to run everywhere the site runs.
 * ------------------------------------------------------------------ */

/**
 * Read a zip archive into a Map of entry name → Buffer.
 *
 * Finds the end-of-central-directory record by scanning back from the end,
 * walks the central directory, then reads each entry's own local header to
 * locate its data — the local extra field is frequently a different length
 * from the central one, so it is read rather than assumed.
 *
 * Only the two compression methods xlsx writers emit are handled: stored and
 * deflate.
 */
function readZip(file) {
  const buf = readFileSync(file);

  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 22 - 0xffff; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error(`not a zip archive: ${file}`);

  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);

  const entries = new Map();
  for (let n = 0; n < count; n += 1) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error(`bad central directory in ${file}`);

    const method = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);

    const localNameLen = buf.readUInt16LE(localOffset + 26);
    const localExtraLen = buf.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLen + localExtraLen;
    const raw = buf.subarray(start, start + compressedSize);

    entries.set(name, method === 0 ? raw : inflateRawSync(raw));
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

/* Patterns used to pick the workbook apart, named so readWorkbook stays legible. */
const RE_SI = /<si>([\s\S]*?)<\/si>/g;
const RE_T = /<t[^>]*>([\s\S]*?)<\/t>/g;
const RE_REL = /<Relationship\b[^>]*\/>/g;
const RE_ID = /Id="([^"]*)"/;
const RE_TARGET = /Target="([^"]*)"/;
const RE_SHEET = /<sheet\b[^>]*\/>/g;
const RE_NAME = /name="([^"]*)"/;
const RE_RID = /r:id="([^"]*)"/;
const RE_XL_PREFIX = /^\/?xl\//;
const RE_SLASH = /^\//;

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
  const zip = readZip(resolve(SUBMISSION, file));
  const text = (name) => {
    const entry = zip.get(name);
    return entry ? entry.toString('utf8') : null;
  };

  let shared = [];
  const sharedXml = text('xl/sharedStrings.xml');
  if (sharedXml) {
    shared = [...sharedXml.matchAll(RE_SI)].map((m) =>
      decode([...m[1].matchAll(RE_T)].map((t) => t[1]).join('')),
    );
  }

  const wb = text('xl/workbook.xml');
  const rels = text('xl/_rels/workbook.xml.rels');
  const relMap = {};
  for (const r of rels.matchAll(RE_REL)) {
    const id = (r[0].match(RE_ID) || [])[1];
    const target = (r[0].match(RE_TARGET) || [])[1];
    if (id && target) relMap[id] = target;
  }

  const sheets = {};
  for (const sheet of wb.matchAll(RE_SHEET)) {
    const name = decode((sheet[0].match(RE_NAME) || [])[1] ?? '');
    const rid = (sheet[0].match(RE_RID) || [])[1];
    const target = relMap[rid];
    if (!target) continue;
    const xml = text('xl/' + target.replace(RE_XL_PREFIX, '').replace(RE_SLASH, ''));
    if (!xml) continue;
    sheets[name] = parseSheet(xml, shared);
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

if (rawCompanies.length !== 636) {
  console.error(`build-dataset: expected 636 companies, found ${rawCompanies.length}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * Interest-level overrides
 *
 * Where the cell colour and the written interest level disagreed, the written
 * level was applied. The workbook lists every one of those visits with its date,
 * and they are now the only dated events between a company's first and last
 * visit that it still records — the separate Visit history sheet was dropped in
 * the seven-week rebuild.
 * ------------------------------------------------------------------ */

const overrideRows = toObjects(master['Interest level overrides']).map((r) => ({
  company: r.Company,
  date: isoDate(r['Visit date']),
  cell_colour: r['Cell colour'],
  status_by_colour: r['Status by colour'],
  applied: r['Interest level applied'],
  comments: r.Comments,
}));

const overridesByCompany = new Map();
for (const row of overrideRows) {
  if (!overridesByCompany.has(row.company)) overridesByCompany.set(row.company, []);
  overridesByCompany.get(row.company).push(row);
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

  const overrides = (overridesByCompany.get(r.Company) ?? []).sort((x, y) =>
    String(x.date).localeCompare(String(y.date)),
  );

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
    interest_level_applied: String(r['Interest level applied'] ?? '').trim() !== '',
    overrides,
  };
});

/* ---------- summary sheet, as key/value ---------- */
const summaryRows = toObjects(master.Summary);
const metric = (name) => summaryRows.find((r) => r.Metric === name)?.Value ?? null;

/* ---------- verification against the handed-over cuts ---------- */
const cuts = [
  ['FILLIT_All_Companies.xlsx', 'All companies', () => true],
  ['FILLIT_Hot_Leads.xlsx', 'Hot leads', (c) => c.status === 'Hot'],
  ['FILLIT_Warm_Leads.xlsx', 'Warm leads', (c) => c.status === 'Warm'],
  ['FILLIT_Cold_Leads.xlsx', 'Cold leads', (c) => c.status === 'Cold'],
  ['FILLIT_Self_Generated_Leads.xlsx', 'Self-generated leads', (c) => c.lead_source === 'Self-generated'],
  ['FILLIT_CAFU_Affected_Accounts.xlsx', 'CAFU mentions', (c) => c.mentions_cafu],
  ['FILLIT_Blocked_and_Revisit.xlsx', 'Appointment and revisit', (c) => c.status === 'Appointment' || c.status === 'Revisit'],
  ['FILLIT_Pain_Point_Companies.xlsx', 'Pain point companies', (c) => c.pain_points !== null],
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

/** Hot + Warm, the deck's "qualified demand" — 814,499 L a month on slide 19. */
const qualifiedVolume = hotVolume + warmVolume;

const dataset = {
  meta: {
    author: 'Divesh Anand',
    role: 'Market Research Intern',
    team: 'Vision Crafters',
    company: 'FILLIT Diesel Trading LLC',
    field_period: '7 August – 24 September 2026',
    weeks: 7,
    emirates: ['Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain'],
    source: 'Combined_week1-week5.xlsx, Combined_week6.xlsx and Combined_Week_7.xlsx',
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
    visited_more_than_once: companies.filter((c) => c.visits > 1).length,
    interest_overrides: metric('Interest-level overrides (colour vs written disagreed)'),
    decision_makers: metric('Named fuel decision-makers'),
    self_generated: metric('Self-generated leads (all 7 weeks)'),
    planned_list: companies.filter((c) => c.lead_source === 'Planned list').length,
    self_generated_green_rate: percent(metric('Self-generated green rate')),
    planned_list_green_rate: percent(metric('Planned list green rate')),
    cafu_mentions: metric('Companies mentioning CAFU'),
    invalid_wrong_address: metric('Invalid: wrong address'),
    invalid_no_requirement: metric('Invalid: no diesel requirement'),
    pain_points_recorded: companies.filter((c) => c.pain_points !== null).length,
    named_suppliers: companies.filter((c) => c.current_supplier !== null).length,
  },
  volume: {
    measured_excl_largest: measured,
    hot: hotVolume,
    warm: warmVolume,
    cold: coldVolume,
    qualified: qualifiedVolume,
    hot_share_pct: Number(((hotVolume / measured) * 100).toFixed(1)),
    warm_share_pct: Number(((warmVolume / measured) * 100).toFixed(1)),
    cold_share_pct: Number(((coldVolume / measured) * 100).toFixed(1)),
    companies_with_volume: withVolume.length,
    largest_account: largest.company,
    largest_account_id: largest.id,
    largest_account_lpm: largest.litres_per_month,
    diesel_price_aed_per_litre: 4.3,
  },
  overrides: overrideRows,
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

/* The Summary sheet states the volume split independently; the rows must agree. */
const statedVolume = metric(`Measured volume excl. ${largest.company.split(' ')[0]} Group (L/month)`);
if (statedVolume !== null && statedVolume !== measured) {
  console.error(`build-dataset: summary states ${statedVolume} L/month measured, rows give ${measured}`);
  process.exit(1);
}
if (dataset.summary.self_generated !== companies.filter((c) => c.lead_source === 'Self-generated').length) {
  console.error('build-dataset: self-generated count does not match the Lead source column');
  process.exit(1);
}

mkdirSync(dirname(TARGET), { recursive: true });
writeFileSync(TARGET, JSON.stringify(dataset));

console.log(
  `build-dataset: ${companies.length} companies · ${dataset.summary.field_visits} visits · ` +
    `${measured.toLocaleString('en-GB')} L/month measured (Cold ${dataset.volume.cold_share_pct}%) · ` +
    `overrides ${overrideRows.length} · cuts verified — ${checks.join(', ')}`,
);
