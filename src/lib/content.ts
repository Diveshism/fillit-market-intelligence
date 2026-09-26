/**
 * Narrative copy.
 *
 * Wording is taken from Divesh_Anand_FILLIT_Final_Presentation.pptx, the final
 * submission — seven weeks, 743 field visits, 636 companies. Every figure quoted
 * here is also computed from the dataset, so a page can show either and they
 * agree. Quotations are verbatim, original spelling retained.
 */

import type { Confidence } from './types';

export const HERO = {
  eyebrow: 'Market research internship · September 2026',
  lines: ['636 companies.', 'Seven weeks.', 'One market, mapped.'],
  byline: 'Divesh Anand · Market Research Intern · Team Vision Crafters · FILLIT Diesel Trading LLC',
} as const;

/** Slide 3 — what FILLIT sells, for readers who need the frame. */
export const ABOUT_FILLIT =
  'FILLIT delivers diesel on demand across the UAE, from 100 litres to 5 million, at a certified 10ppm specification, with GPS tracking and 24/7 dispatch. Its buyers are fleet and plant managers, site and project managers, marine operators and procurement leads.';

export const OBJECTIVES = [
  { n: '01', title: 'Map the market', body: 'Identify businesses that consume diesel across the UAE and record how much they use.' },
  { n: '02', title: 'Understand how they buy', body: 'Current supplier, pain points, decision maker and buying behaviour.' },
  { n: '03', title: 'Map the competition', body: 'Who serves this market today, and where the gaps are.' },
  { n: '04', title: 'Build awareness', body: 'Introduce FILLIT to businesses that had never heard of the name.' },
] as const;

/** Slide 4 — how the research was done. */
export const METHOD = [
  {
    phase: 'First 3 days',
    what: 'Desk research',
    detail: 'Company websites, LinkedIn pages and trade directories to build a picture of who burns diesel in the UAE.',
    told: 'Gave us a starting prospect list and a working vocabulary for the industry.',
  },
  {
    phase: 'First 3 days',
    what: 'Cold calls',
    detail: 'Phone outreach to test the pitch and learn the objections before going door to door.',
    told: 'Taught us which questions actually get answered on a first contact.',
  },
  {
    phase: 'Weeks 1 to 7',
    what: '743 in-person field visits',
    detail: 'Turn up, ask for the fuel buyer, run the questions, log it the same day.',
    told: 'Produced the entire dataset behind this presentation.',
  },
] as const;

export const FIVE_QUESTIONS = [
  'Who supplies you today?',
  'How much do you use?',
  'What burns it?',
  'What goes wrong?',
  'Who decides?',
] as const;

export const METHOD_NOTE =
  'Week 1 in the field returned a 59.5% dead-end rate even with 22 self-generated leads already in the mix. That told us the prospect list itself needed replacing.';

/* ------------------------------------------------------------------ *
 * The three things we were measured on — slide 6
 * ------------------------------------------------------------------ */

export const KPIS = [
  {
    area: 'Outreach volume',
    rows: [
      { measure: 'Companies contacted', result: '636', means: 'Separate businesses reached. Each counted once.' },
      { measure: 'Field visits made', result: '743', means: 'Total visits, including return trips.' },
      { measure: 'Emirates covered', result: '4', means: 'Dubai, Sharjah, Ajman and Umm Al Quwain.' },
    ],
  },
  {
    area: 'Lead quality',
    rows: [
      { measure: 'Confirmed diesel users', result: '182', means: 'Companies that actually burn diesel. 28.6% of the book.' },
      { measure: 'Fuel buyers named', result: '146', means: 'The person who decides, with contact details.' },
      { measure: 'New leads generated', result: '136', means: 'Companies on no list. 65.4% of them turned green.' },
    ],
  },
  {
    area: 'Standard of work',
    rows: [
      { measure: 'Companies classified', result: '636', means: 'Every one given a final status. None left blank.' },
      { measure: 'Weeks delivered on time', result: '7 of 7', means: 'Every weekly sheet consolidated on schedule.' },
    ],
  },
] as const;

export const KPI_TAKEAWAY =
  '136 new leads was a target in its own right, and those leads turned green 3.5 times more often.';

/* ------------------------------------------------------------------ *
 * Findings — slide 19
 * ------------------------------------------------------------------ */

export interface Finding {
  n: string;
  slug: string;
  title: string;
  evidence: string;
  stat: { value: string; caption: string };
  href: string;
  confidence: Confidence;
}

export const FINDINGS: Finding[] = [
  {
    n: '01',
    slug: 'demand',
    title: 'The demand is real, sizeable and already named',
    evidence:
      '72 qualified companies report 814,499 litres a month, about AED 42M a year, excluding RP Group — which alone reports 4.5M litres a month. FILLIT has a named revenue pipeline, not a market estimate.',
    stat: { value: '814,499', caption: 'litres a month from 72 named, qualified companies' },
    href: '/companies/hot',
    confidence: 'VERIFIED',
  },
  {
    n: '02',
    slug: 'volume',
    title: 'The biggest volumes sit with the slowest buyers',
    evidence:
      'Excluding RP Group, 58% of measured volume sits in Cold companies, averaging 32,551 L a month against 15,856 L for Hot. Growth needs key-account management, not just fast follow-ups.',
    stat: { value: '58%', caption: 'of measured litres sit in companies we scored Cold' },
    href: '/volume',
    confidence: 'VERIFIED',
  },
  {
    n: '03',
    slug: 'service',
    title: 'FILLIT wins on service, because price is fixed',
    evidence:
      '36 companies still drive to a pump and 39 buy from unverified traders. Diesel is regulated at AED 4.30 a litre, so the objections we heard were reliability, quality and access, not price.',
    stat: { value: 'AED 4.30', caption: 'a litre, regulated — so nobody competes on price' },
    href: '/competition',
    confidence: 'VERIFIED',
  },
  {
    n: '04',
    slug: 'cafu',
    title: 'A competitor has left the door open',
    evidence:
      '20 companies raised CAFU unprompted, 16 negatively, and every one of them uses diesel. This is the fastest share gain available, with no price war required.',
    stat: { value: '20', caption: 'accounts naming a withdrawing competitor' },
    href: '/competition',
    confidence: 'VERIFIED',
  },
  {
    n: '05',
    slug: 'equipment',
    title: 'Factories and site equipment are the sweet spot',
    evidence:
      'Metals converted at 67%, Al Sajaa at 84.6% and DIC with DIP at 45%. 76 companies raised generator, forklift or machinery refuelling, which no fuel station can serve.',
    stat: { value: '76', caption: 'companies with equipment that cannot be driven to a pump' },
    href: '/pain-points',
    confidence: 'VERIFIED',
  },
];

/* ------------------------------------------------------------------ *
 * Pain points — slide 8
 * ------------------------------------------------------------------ */

export const PAIN_POINTS = [
  { theme: 'Equipment, generator and forklift', companies: 76, hot: 15, warm: 23, cold: 29, green: 88, severity: 'Major' },
  { theme: 'Vehicles driven to a station', companies: 31, hot: 5, warm: 13, cold: 12, green: 97, severity: 'Major' },
  { theme: 'Price and rate', companies: 27, hot: 11, warm: 11, cold: 4, green: 96, severity: 'Major' },
  { theme: 'CAFU service failure', companies: 20, hot: 6, warm: 13, cold: 1, green: 100, severity: 'Major' },
  { theme: 'Delivery and on-site refuelling', companies: 19, hot: 4, warm: 12, cold: 1, green: 89, severity: 'Major' },
  { theme: 'ADNOC / ENOC chip and prepaid friction', companies: 19, hot: 4, warm: 8, cold: 7, green: 100, severity: 'Moderate' },
  { theme: 'Fuel quality and 10ppm spec', companies: 18, hot: 4, warm: 7, cold: 7, green: 100, severity: 'Major' },
  { theme: 'Credit and payment terms', companies: 10, hot: 4, warm: 6, cold: 0, green: 100, severity: 'High value' },
  { theme: 'Trust and vendor verification', companies: 5, hot: 1, warm: 3, cold: 0, green: 80, severity: 'Moderate' },
  { theme: 'Minimum order quantity', companies: 1, hot: 1, warm: 0, cold: 0, green: 100, severity: 'Isolated' },
] as const;

export const PAIN_POINT_NOTE =
  '76 companies raised equipment, generator or forklift refuelling. Price, CAFU and fuel quality appear only beside companies that use diesel.';

export const PAIN_POINT_SOURCE =
  'Text-mined from the comments, pain points, fleet and supplier fields across all 636 companies. A company can raise more than one.';

/* ------------------------------------------------------------------ *
 * Buyers — slide 9
 * ------------------------------------------------------------------ */

export const BUYING_BEHAVIOUR = [
  { pattern: 'Fuel decision sits with a named buyer', evidence: '146 named' },
  { pattern: 'Usually procurement, accounts, operations or owner', evidence: 'By role' },
  { pattern: 'Locked into ADNOC / ENOC chip or prepaid cards', evidence: '19 companies' },
  { pattern: 'Buys from unverified independent traders', evidence: '39 companies' },
  { pattern: 'Drives vehicles to a retail station', evidence: '36 companies' },
  { pattern: 'Asks for credit terms before switching', evidence: '10 companies' },
] as const;

export const QUOTES = [
  { quote: 'They used to take from Cafu, but cafu stopped delivering', company: 'SHJ Carbon Factory', status: 'Hot' },
  { quote: "Low quality fuel is reducing their vehicle's efficiency", company: 'Uniforce Contracting', status: 'Hot' },
  { quote: 'ADNOC has minimum quantity requirement', company: 'SCA Shipping', status: 'Hot' },
  { quote: 'Contract with CAFU in 2025 but they stole their credit', company: 'Al Jalal Trading', status: 'Warm' },
  { quote: 'No trust on door step delivery', company: 'Main Crete Contracting', status: 'Warm' },
  { quote: 'Facing problems with ADNOC chip, need to topup', company: 'Daira Carpentry', status: 'Warm' },
] as const;

export const QUOTES_TAKEAWAY =
  'The common objections are reliability, quality, trust and access. Almost none are about price.';

/* ------------------------------------------------------------------ *
 * Barriers — slide 10
 * ------------------------------------------------------------------ */

export const BARRIERS = [
  { barrier: 'Inside a free zone', companies: 49, needed: 'A registered free-zone access pass. JAFZA, Hamriyah and Dubai Industrial City.' },
  { barrier: 'Booked appointment required', companies: 51, needed: 'A scheduled meeting rather than a walk-in. Mostly larger corporates.' },
  { barrier: 'Gate pass required', companies: 46, needed: 'Site-level security clearance, usually arranged in advance by the client.' },
] as const;

export const BARRIER_NOTE =
  'A company can face more than one barrier, so the rows overlap. The workbook has a Passes Required field for this problem; it holds two entries against 100 blocked companies.';

export const BARRIER_TAKEAWAY = 'Buying access is cheaper than buying more field days.';

export const JEBEL_ALI = {
  companies: 65,
  blocked: 42,
  hot: 0,
  line: '65 companies visited, 42 blocked at the gate, and zero Hot leads recorded.',
} as const;

/* ------------------------------------------------------------------ *
 * Suppliers — slide 14
 * ------------------------------------------------------------------ */

export const SUPPLIERS = [
  { name: 'Independent third-party traders', companies: 39, hot: 13, warm: 9, cold: 15, note: 'Quality and trust complaints cluster here.' },
  { name: 'Self-fuelling at retail stations', companies: 36, hot: 3, warm: 17, cold: 15, note: 'Not a supplier relationship at all. The competitor is the pump.' },
  { name: 'ADNOC', companies: 31, hot: 6, warm: 15, cold: 10, note: 'Price, contract difficulty, minimum quantities.' },
  { name: 'ENOC / EPPCO', companies: 30, hot: 3, warm: 10, cold: 16, note: 'Price.' },
  { name: 'CAFU', companies: 20, hot: 2, warm: 3, cold: 0, note: 'Withdrawal and service failure. 16 of 20 mentions are negative.' },
  { name: 'Emarat', companies: 1, hot: 0, warm: 0, cold: 0, note: 'Marginal presence in this dataset.' },
] as const;

export const SUPPLIER_SOURCE =
  'Of the 122 companies that named a supplier, the largest single group buys from independent traders.';

export const PRICING_CONTEXT =
  'UAE diesel is price-regulated at AED 4.30 per litre (September 2026), so every station charges the same. CAFU reinstated delivery fees of AED 12 to 20 per order in April 2025. FILLIT’s differentiators are therefore delivery, 10ppm quality, no minimum order and pricing issued before dispatch, not the litre price.';

export const SUPPLIER_TAKEAWAY =
  '36 companies have no delivered-fuel supplier at all. They drive to a station. The competitor is the pump.';

/* ------------------------------------------------------------------ *
 * Opportunity map — slide 16
 * ------------------------------------------------------------------ */

export const OPPORTUNITIES = [
  { problem: 'Forklift, generator and machinery refuelling', companies: 76, opening: 'The largest group of all. None of this equipment can be driven to a pump.' },
  { problem: 'Vehicles and machinery driven to a fuel station', companies: 31, opening: 'Sell downtime recovery, not a cheaper litre. Price is regulated, time is not.' },
  { problem: 'CAFU stopped delivering or will not fill on site', companies: 20, opening: 'Direct replacement of a withdrawn supplier. No price fight required.' },
  { problem: 'ADNOC minimum quantities and chip friction', companies: 19, opening: 'No-minimum delivery and post-paid terms. The exclusion is itself a market.' },
  { problem: 'Bad fuel from independent traders', companies: 18, opening: 'Verifiable 10ppm with batch certification. Nine of ten quality specs asked for 10ppm.' },
  { problem: 'Credit and working capital', companies: 10, opening: 'Structured terms. Four of the ten credit requests are already Hot.' },
] as const;

export const OPPORTUNITY_TAKEAWAY = 'Not one of these six openings is a price argument.';

/* ------------------------------------------------------------------ *
 * Territory — slide 13
 * ------------------------------------------------------------------ */

export const TERRITORY_PLAN = [
  { rank: '1', territory: 'Sharjah Industrial Areas + Al Sajaa', why: '65 companies at 34.6% and 84.6% green. Street by street sweep.', action: 'work' },
  { rank: '2', territory: 'Dubai Investment Park + Dubai Industrial City', why: '71 companies at 45% green, and 20 self-generated leads.', action: 'work' },
  { rank: '3', territory: 'Jebel Ali / JAFZA', why: '65 companies, 42 blocked at the gate. Needs passes, not visits.', action: 'unlock' },
  { rank: '4', territory: 'Al Jurf + Ajman Industrial', why: '72 companies. Worth a second sweep with verified addresses.', action: 'work' },
  { rank: 'Stop', territory: 'Business Bay, Jumeirah, Silicon Oasis', why: '113 companies returned 26 green and 3 Hot. Registered offices, not sites.', action: 'stop' },
] as const;

export const TERRITORY_NOTE =
  'Only the areas we actually covered are shown. Abu Dhabi was not part of this programme.';

/* ------------------------------------------------------------------ *
 * Recommendations — slides 20, 21, 22
 * ------------------------------------------------------------------ */

export const RECOMMENDATIONS = [
  {
    n: '01',
    title: 'Turn the 72 qualified leads into first orders',
    why: '27 Hot leads asked for a quote, sample or visit. Their measured demand is 814,499 L a month.',
    effect: 'First orders from 10 accounts in 60 days',
  },
  {
    n: '02',
    title: 'Launch a Site Equipment Fuelling offer',
    why: '76 companies need forklifts, generators or plant refuelled on site, a need no station can meet.',
    effect: '15 paid trials in 90 days',
  },
  {
    n: '03',
    title: 'Win the accounts CAFU has lost',
    why: '20 identified companies, 16 of them unhappy, already buy delivered diesel and want a reliable supplier.',
    effect: '8 switched accounts in 90 days',
  },
  {
    n: '04',
    title: 'Put the top 10 Cold accounts under a key-account manager',
    why: 'Cold holds 58% of measured volume. Two conversions at the Cold average add about 65,000 L a month.',
    effect: '2 contracts, about 65,000 L a month',
  },
  {
    n: '05',
    title: 'Reposition FILLIT on service, backed by content',
    why: 'Price is regulated, so reliability, 10ppm quality and no minimum order must be the message. LinkedIn sits near 350 followers.',
    effect: '1,000 followers and 25 inbound leads a quarter',
  },
] as const;

export const READY_NOW = [
  {
    item: 'Quote pack for the 27 Hot leads',
    uses: 'Price, delivery terms, 10ppm certificate and a sample invoice sent to each named contact.',
    impact: '27 live negotiations against 317,123 L a month of measured Hot demand.',
  },
  {
    item: 'CAFU switch offer',
    uses: 'One-page offer plus a call list of the 20 affected companies.',
    impact: 'Share gained from a competitor, without discounting.',
  },
  {
    item: 'Site Equipment Fuelling pilot',
    uses: 'Free first on-site fill for 5 forklift or generator sites in Al Sajaa and DIC.',
    impact: 'A proven, referenceable use case stations cannot copy.',
  },
  {
    item: 'Key accounts for the top 10 Cold',
    uses: 'Named owner, quarterly review and credit terms for each account.',
    impact: 'Access to a 1,139,293 L a month pool of larger buyers.',
  },
  {
    item: 'Free-zone access',
    uses: 'File access passes for JAFZA, Hamriyah and DIC.',
    impact: 'Unlocks 100 blocked companies, including 42 in JAFZA.',
  },
  {
    item: 'LinkedIn and white paper launch',
    uses: 'Publish Week 1 creative and gate the white paper behind a short form.',
    impact: 'Inbound leads and brand recall from about 350 followers today.',
  },
] as const;

export const READY_NOW_NOTE =
  'Every action uses assets already built. Qualified demand alone is worth about AED 42M a year.';

export const ACTION_PLAN = [
  {
    window: 'Days 1 to 30',
    theme: 'Win the warm pipeline',
    owner: 'Sales · Marketing · Ops',
    kpi: '27 quotes sent, 5 first orders',
    actions: [
      'Sales: quote all 27 Hot leads, call the 45 Warm, send the CAFU switch offer.',
      'Marketing: publish LinkedIn Weeks 1 and 2 and the white paper.',
      'Ops: add a pre-visit address check.',
    ],
  },
  {
    window: 'Days 31 to 60',
    theme: 'Expand where demand concentrates',
    owner: 'Sales · Marketing · Ops',
    kpi: '10 key accounts, 10 equipment trials',
    actions: [
      'Sales: assign the top 10 Cold accounts, sweep Al Sajaa, DIC and DIP.',
      'Marketing: Weeks 3 and 4 plus a forklift case study.',
      'Ops: file free-zone passes.',
    ],
  },
  {
    window: 'Days 61 to 90',
    theme: 'Make growth repeatable',
    owner: 'Data · Marketing',
    kpi: 'Conversion rate by sector and zone',
    actions: [
      'Move all 636 companies into a CRM with outcome tracking.',
      'Score leads on volume as well as interest.',
      'Publish a UAE diesel buyer report to drive inbound demand.',
    ],
  },
  {
    window: 'Months 4 to 6',
    theme: 'Scale what converts',
    owner: 'Leadership',
    kpi: 'Litres a month under contract, 1,000 followers',
    actions: [
      'Enter JAFZA with passes, open Hamriyah and Umm Al Quwain.',
      'Launch a customer referral offer.',
      'Review credit terms for key accounts.',
    ],
  },
] as const;

export const PLAN_CLOSE =
  '182 confirmed diesel users, 72 qualified, 20 leaving a competitor. The plan turns them into contracted litres.';

/* ------------------------------------------------------------------ *
 * Content programme — slide 23
 * ------------------------------------------------------------------ */

export const CONTENT_PLAN = [
  { week: 'Week 1', objective: 'Frame the problem', posts: 'Poll on the biggest refuelling bottleneck. Carousel on dead mileage and idle wages. Generator damage post. White paper launch with a comment-gated CTA.', status: 'Creative complete, 10 images' },
  { week: 'Week 2', objective: 'Prove the difference', posts: '10ppm against standard fuel in a Euro 5/6 engine. Night refuelling carousel. Fuel as a service. The drivers behind the deliveries.', status: 'Full copy written' },
  { week: 'Week 3', objective: 'Show the system', posts: 'Free dead-mileage and ROI audit for 10 fleets. Paper logbooks post. The five-step delivery workflow. The eight-point continuity checklist.', status: 'Full copy written' },
  { week: 'Week 4', objective: 'Convert', posts: 'Resilience by design. 100 litres to 5 million. Emergency top-ups. The dispatch team. One month on from the white paper.', status: 'Full copy written' },
] as const;

export const CONTENT_PLAN_NOTE =
  '28 posts, all 10 content pillars, 13 formats. Week 1 creative is designed and ready. Built on this field research.';

export const ENGAGEMENT_RULES = [
  'Links go in the first comment, never the post body',
  'Comment-gated CTAs beat link clicks',
  'Thought leadership publishes from the founder profile',
  'LinkedIn does not expose poll voters, so follow up with commenters',
] as const;

/* ------------------------------------------------------------------ *
 * Journey — slides 24, 25
 * ------------------------------------------------------------------ */

export const TASKS = [
  'Visited 636 companies in 743 visits across four emirates',
  'Interviewed fuel buyers on supplier, volume, equipment and pain points',
  'Introduced FILLIT and left flyers at every site',
  'Logged and colour-coded every visit the same day',
  'Found 136 new leads beyond the supplied list',
  'Turned the data into a growth plan and LinkedIn strategy',
] as const;

export const CHALLENGES = [
  { challenge: 'The list was stale: 59.5% dead ends in Week 1', fix: 'Built our own leads, which reached 65.4% green' },
  { challenge: '125 companies had moved or the address was wrong', fix: 'Logged the reason, so each one is recoverable' },
  { challenge: '100 sites were behind gates or in free zones', fix: 'Logged as blocked, not lost, and planned passes' },
  { challenge: 'Reception would not connect us', fix: 'Asked for the fuel buyer by role: 146 named' },
  { challenge: 'Usage given in litres, gallons and dirhams', fix: 'Converted everything to litres a month' },
  { challenge: 'Colour and written status disagreed on 26 rows', fix: 'Applied the written interest level' },
] as const;

export const TOOLS = [
  'Excel: 743-visit log',
  'Python (Claude code): cleaning, analysis',
  'Google Maps: routes',
  'LinkedIn: research',
  'WhatsApp: team updates',
  'PowerPoint: reporting',
] as const;

export const CHALLENGE_TAKEAWAY =
  'Each challenge became a recommendation FILLIT can act on, from address checks to free-zone passes.';

export const CONTRIBUTION = [
  'Field visits and fuel-buyer interviews across Dubai, Sharjah, Ajman and Umm Al Quwain',
  'Designed the capture sheet and colour-coded status system used for all 743 visits',
  'Verified the master database: 636 companies, latest status, 26 conflicts resolved',
  'Analysed demand by sector, territory, supplier, pain point, volume and lead source',
  'Turned the findings into FILLIT’s growth plan, targets and 90-day roadmap',
  'Wrote the 4-week LinkedIn strategy (28 posts) and the 2026 white paper',
] as const;

export const TEAM_NOTE =
  'Team: Mudar, Gautham, Parasharan and Divesh shared field visits, client conversations, flyers and data logging equally.';

export const HANDOVER = [
  { asset: 'Master database', detail: '636 companies with overrides, weekly, sector and zone sheets' },
  { asset: 'Hot, Warm and Cold lead files', detail: '27, 45 and 110 companies, ready for the sales team' },
  { asset: 'Self-generated leads', detail: 'The 136 companies we found ourselves' },
  { asset: 'CAFU-affected accounts', detail: '20 companies with their verbatim notes' },
  { asset: 'Blocked and revisit list', detail: '210 companies, for access and follow-up planning' },
  { asset: 'LinkedIn strategy, Week 1 creative and the 2026 white paper', detail: '4-week plan, 28 posts, 10 images designed' },
] as const;

export const LEARNINGS = [
  {
    title: 'Interest shows who will talk; volume shows who matters',
    body: 'FILLIT should score leads on both.',
  },
  {
    title: 'In a price-regulated market, service wins',
    body: 'Every objection we heard was reliability, quality or access.',
  },
  {
    title: 'Clean data is a growth lever',
    body: 'A verified address is worth as much as another day in the field.',
  },
] as const;

/* ------------------------------------------------------------------ *
 * Sources
 * ------------------------------------------------------------------ */

export const SOURCES = [
  { source: 'Combined_week1-week5.xlsx, Combined_week6.xlsx and Combined_Week_7.xlsx, 7 Aug to 24 Sep 2026', used: 'Every count, rate, area, industry, supplier, volume and quotation', main: true },
  { source: 'Vision Crafter Diesel Field Research Report', used: 'Analytical approach and qualitative framing only; figures re-verified against the main sheets', main: false },
  { source: 'UAE Fuel Price Committee, via Gulf News and Khaleej Times, Sept 2026', used: 'Diesel retail price of AED 4.30 per litre', main: false },
  { source: 'Gulf News, 24 April 2025', used: 'CAFU reinstating delivery fees of AED 12 to 20', main: false },
  { source: 'The National, 23 January 2026', used: 'CAFU slot-availability and supply problems', main: false },
  { source: 'FILLIT official flyer and fillit.co', used: 'FILLIT service claims: 10ppm, 100 L to 5M L, 24/7, GPS tracking', main: false },
  { source: 'LinkedIn pages of DP World, ENOC, Transguard, G42, Masdar, Mubadala, Gartner and others', used: 'B2B content benchmark behind the LinkedIn strategy', main: false },
] as const;

export const CLOSING_LINE =
  'The demand is identified and named. The next team starts from a map, not a list.';
