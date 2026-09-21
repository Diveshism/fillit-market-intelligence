/**
 * Narrative copy.
 *
 * Wording is taken from Divesh_Anand_FILLIT_Final.pptx, the final submission.
 * Every figure quoted here is also computed from the dataset, so a page can show
 * either and they agree. Quotations are verbatim, original spelling retained.
 */

import type { Confidence } from './types';

export const HERO = {
  eyebrow: 'Market research internship · September 2026',
  lines: ['568 companies.', 'Six weeks.', 'One market, mapped.'],
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
    phase: 'Weeks 1 to 6',
    what: '651 in-person field visits',
    detail: 'Turn up unannounced, ask reception for the fuel buyer, run the same five questions, log it the same day.',
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
  'Week 1 in the field returned a 59.5% dead-end rate. That told us the list was the problem, so we started building our own.';

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
    slug: 'volume',
    title: 'Our own lead scoring points at the wrong companies',
    evidence:
      'Excluding one outlier, 60% of measured volume sits in Cold. The average Cold company uses 27,525 L a month, 2.4x a Hot one.',
    stat: { value: '60%', caption: 'of measured litres sit in companies we scored Cold' },
    href: '/volume',
    confidence: 'VERIFIED',
  },
  {
    n: '02',
    slug: 'cafu',
    title: 'CAFU has created a vacuum worth taking now',
    evidence:
      '20 companies mentioned CAFU unprompted, 16 negatively. All 20 are confirmed diesel users.',
    stat: { value: '20', caption: 'accounts naming a withdrawing competitor' },
    href: '/competition',
    confidence: 'VERIFIED',
  },
  {
    n: '03',
    slug: 'addresses',
    title: 'Most closed records failed on addresses, not demand',
    evidence:
      '117 of 217 invalid records say the company was not at the address. Only 51 say there is no diesel requirement.',
    stat: { value: '117', caption: 'closed records recoverable by verifying the address' },
    href: '/companies/invalid',
    confidence: 'VERIFIED',
  },
  {
    n: '04',
    slug: 'new-leads',
    title: 'The leads we generated beat the list 3.3 to 1',
    evidence:
      '72 self-generated leads returned 70.8% green and 13.9% dead. The planned list returned 21.4% and 41.7%.',
    stat: { value: '3.3×', caption: 'better green rate than the list we were handed' },
    href: '/new-leads',
    confidence: 'VERIFIED',
  },
  {
    n: '05',
    slug: 'barriers',
    title: '90 companies are blocked, not disqualified',
    evidence:
      '47 sit in free zones. Jebel Ali alone is 62 companies, 40 blocked at the gate, and zero Hot leads.',
    stat: { value: '90', caption: 'companies behind an administrative barrier' },
    href: '/barriers',
    confidence: 'VERIFIED',
  },
];

/* ------------------------------------------------------------------ *
 * Pain points — slide 8
 * ------------------------------------------------------------------ */

export const PAIN_POINTS = [
  { theme: 'Equipment, generator and forklift', companies: 66, hot: 14, warm: 19, cold: 27, green: 91, severity: 'Major' },
  { theme: 'Vehicles driven to a station', companies: 25, hot: 5, warm: 12, cold: 8, green: 100, severity: 'Major' },
  { theme: 'Price and rate', companies: 21, hot: 8, warm: 8, cold: 5, green: 100, severity: 'Major' },
  { theme: 'CAFU service failure', companies: 20, hot: 6, warm: 13, cold: 1, green: 100, severity: 'Major' },
  { theme: 'Delivery and on-site refuelling', companies: 18, hot: 4, warm: 11, cold: 1, green: 89, severity: 'Major' },
  { theme: 'Fuel quality and 10ppm spec', companies: 16, hot: 4, warm: 6, cold: 6, green: 100, severity: 'Major' },
  { theme: 'ADNOC / ENOC chip and prepaid friction', companies: 13, hot: 4, warm: 6, cold: 3, green: 100, severity: 'Moderate' },
  { theme: 'Credit and payment terms', companies: 9, hot: 4, warm: 5, cold: 0, green: 100, severity: 'High value' },
  { theme: 'Trust and vendor verification', companies: 5, hot: 1, warm: 3, cold: 0, green: 80, severity: 'Moderate' },
  { theme: 'Minimum order quantity', companies: 1, hot: 1, warm: 0, cold: 0, green: 100, severity: 'Isolated' },
] as const;

export const PAIN_POINT_NOTE =
  '66 companies raised equipment, generator or forklift refuelling. Price, CAFU and fuel quality appear only beside companies that use diesel.';

export const PAIN_POINT_SOURCE =
  'Text-mined from the comments, pain points, fleet and supplier fields across all 568 companies. A company can raise more than one.';

/* ------------------------------------------------------------------ *
 * Buyers — slide 9
 * ------------------------------------------------------------------ */

export const BUYING_BEHAVIOUR = [
  { pattern: 'Fuel decision sits with a named buyer', evidence: '119 named' },
  { pattern: 'Usually procurement, accounts, operations or owner', evidence: 'By role' },
  { pattern: 'Locked into ADNOC / ENOC chip or prepaid cards', evidence: '13 companies' },
  { pattern: 'Buys from unverified independent traders', evidence: '35 companies' },
  { pattern: 'Drives vehicles to a retail station', evidence: '28 companies' },
  { pattern: 'Asks for credit terms before switching', evidence: '9 companies' },
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
  { barrier: 'Inside a free zone', companies: 47, needed: 'A registered free-zone access pass. JAFZA, Hamriyah and Dubai Industrial City.' },
  { barrier: 'Booked appointment required', companies: 43, needed: 'A scheduled meeting rather than a walk-in. Mostly larger corporates.' },
  { barrier: 'Gate pass required', companies: 44, needed: 'Site-level security clearance, usually arranged in advance by the client.' },
] as const;

export const BARRIER_NOTE =
  'A company can face more than one barrier, so the rows overlap. The workbook has a Passes Required field for this problem; it holds two entries against 90 blocked companies.';

export const BARRIER_TAKEAWAY = 'Buying access is cheaper than buying more field days.';

export const JEBEL_ALI = {
  companies: 62,
  blocked: 40,
  hot: 0,
  line: '62 companies visited, 40 blocked at the gate, and zero Hot leads recorded.',
} as const;

/* ------------------------------------------------------------------ *
 * Suppliers — slide 14
 * ------------------------------------------------------------------ */

export const SUPPLIERS = [
  { name: 'Independent third-party traders', companies: 35, hot: 10, warm: 9, cold: 14, note: 'Quality and trust complaints cluster here.' },
  { name: 'ADNOC', companies: 29, hot: 6, warm: 14, cold: 9, note: 'Price, contract difficulty, minimum quantities.' },
  { name: 'Self-fuelling at retail stations', companies: 28, hot: 3, warm: 15, cold: 10, note: 'Not a supplier relationship at all. The competitor is the pump.' },
  { name: 'ENOC / EPPCO', companies: 27, hot: 3, warm: 11, cold: 12, note: 'Price.' },
  { name: 'CAFU', companies: 20, hot: 2, warm: 3, cold: 0, note: 'Withdrawal and service failure. 16 of 20 mentions are negative.' },
  { name: 'Emarat', companies: 1, hot: 0, warm: 0, cold: 0, note: 'Marginal presence in this dataset.' },
] as const;

export const SUPPLIER_SOURCE =
  'Of the 102 companies that named a supplier, the largest single group buys from independent traders.';

export const PRICING_CONTEXT =
  'UAE diesel is price-regulated at AED 4.30 per litre (September 2026), so every station charges the same. CAFU reinstated delivery fees of AED 12 to 20 per order in April 2025. FILLIT’s differentiators are therefore delivery, 10ppm quality, no minimum order and pricing issued before dispatch, not the litre price.';

export const SUPPLIER_TAKEAWAY =
  '28 companies have no delivered-fuel supplier at all. They drive to a station. The competitor is the pump.';

/* ------------------------------------------------------------------ *
 * Opportunity map — slide 16
 * ------------------------------------------------------------------ */

export const OPPORTUNITIES = [
  { problem: 'CAFU stopped delivering or will not fill on site', companies: 20, opening: 'Direct replacement of a withdrawn supplier. No price fight required.' },
  { problem: 'Vehicles and machinery driven to a fuel station', companies: 25, opening: 'Sell downtime recovery, not a cheaper litre. Price is regulated, time is not.' },
  { problem: 'Bad fuel from independent traders', companies: 16, opening: 'Verifiable 10ppm with batch certification. Nine of ten quality specs asked for 10ppm.' },
  { problem: 'ADNOC minimum quantities and chip friction', companies: 13, opening: 'No-minimum delivery and post-paid terms. The exclusion is itself a market.' },
  { problem: 'Credit and working capital', companies: 9, opening: 'Structured terms. Four of the nine credit requests are already Hot.' },
  { problem: 'Forklift, generator and machinery refuelling', companies: 66, opening: 'The largest group of all. None of this equipment can be driven to a pump.' },
] as const;

export const OPPORTUNITY_TAKEAWAY = 'Not one of these six openings is a price argument.';

/* ------------------------------------------------------------------ *
 * Territory — slide 13
 * ------------------------------------------------------------------ */

export const TERRITORY_PLAN = [
  { rank: '1', territory: 'Sharjah Industrial Areas + Al Sajaa', why: '64 companies at 35.3% and 84.6% green. Street by street sweep.', action: 'work' },
  { rank: '2', territory: 'Dubai Investment Park + Dubai Industrial City', why: '58 companies at 48% green, and 16 self-generated leads.', action: 'work' },
  { rank: '3', territory: 'Jebel Ali / JAFZA', why: '62 companies, 40 blocked at the gate. Needs passes, not visits.', action: 'unlock' },
  { rank: '4', territory: 'Al Jurf + Ajman Industrial', why: '72 companies. Worth a second sweep with verified addresses.', action: 'work' },
  { rank: 'Stop', territory: 'Business Bay, Jumeirah, Silicon Oasis', why: '102 companies returned 23 green and 2 Hot. Registered offices, not sites.', action: 'stop' },
] as const;

export const TERRITORY_NOTE =
  'Only the areas we actually covered are shown. Abu Dhabi and Ras Al Khaimah were not part of this programme.';

/* ------------------------------------------------------------------ *
 * Recommendations — slides 20, 21, 22
 * ------------------------------------------------------------------ */

export const RECOMMENDATIONS = [
  { n: '01', title: 'Send quotations to all 23 Hot leads this week', why: 'Every Hot lead asked for a quote, sample or visit, and each has a named contact on file.', effect: 'Revenue within 30 days' },
  { n: '02', title: 'Run a named CAFU-replacement campaign', why: '20 identified accounts that mentioned CAFU, 16 of them negatively.', effect: 'Warmest segment in the book' },
  { n: '03', title: 'Escalate the top 10 Cold accounts by volume', why: 'Cold holds 60% of measured litres, excluding one outlier. Give them an account manager.', effect: 'The litres are here' },
  { n: '04', title: 'Sell downtime recovery, not cheaper fuel', why: '28 companies drive vehicles to a station. Price is regulated; time is not.', effect: 'Reframes the pitch' },
  { n: '05', title: 'Buy free-zone access, then work Jebel Ali', why: '90 companies blocked. 47 sit inside free zones. One administrative fix.', effect: '90 companies unlocked' },
] as const;

export const READY_NOW = [
  { item: 'Quote pack for the 23 Hot leads', uses: 'Contacts and suppliers already on file.', impact: '23 open requests converted into live conversations.' },
  { item: 'CAFU switch offer for 20 accounts', uses: 'One page: same fuel, on site, invoice before dispatch.', impact: '20 accounts available without a price fight.' },
  { item: 'Forklift and generator refuelling offer', uses: 'A need no station network can serve.', impact: 'A proposition competitors structurally cannot copy.' },
  { item: 'Free-zone access applications', uses: 'JAFZA, Hamriyah and Dubai Industrial City.', impact: '90 blocked companies unlocked by admin, not visits.' },
  { item: 'Split the Red bucket in two', uses: 'No diesel demand versus bad address.', impact: '117 closed records recoverable by verifying the address.' },
  { item: 'Account-manage the top 10 Cold', uses: 'Ranked by measured monthly litres.', impact: 'Re-prioritises 60% of measured volume.' },
] as const;

export const READY_NOW_NOTE =
  'None of this needs new headcount. Every item uses data already collected and handed over.';

export const ACTION_PLAN = [
  {
    window: 'Days 1 to 30',
    theme: 'Convert what is already asking',
    owner: 'Sales + Marketing',
    actions: [
      'Send quotations to the 23 Hot leads.',
      'Launch the CAFU switch campaign across 20 accounts.',
      'Publish LinkedIn Weeks 1 and 2, creative is designed and ready.',
    ],
  },
  {
    window: 'Days 31 to 60',
    theme: 'Go where the litres are',
    owner: 'Sales + Operations',
    actions: [
      'Account-manage the top 10 Cold accounts, which hold 60% of measured volume.',
      'Sweep Sharjah Industrial and Al Sajaa, 64 companies.',
      'Secure free-zone access for 90 blocked companies.',
    ],
  },
  {
    window: 'Days 61 to 90',
    theme: 'Build the repeatable engine',
    owner: 'Marketing + Data',
    actions: [
      'Launch the forklift and generator offer.',
      'Publish the UAE diesel procurement report to generate inbound.',
      'Move 568 records into a CRM with outcome tracking so conversion becomes measurable.',
    ],
  },
  {
    window: 'Months 4 to 6',
    theme: 'Scale what worked',
    owner: 'Leadership',
    actions: [
      'Track quote-to-order conversion by territory and sector.',
      'Re-run field research in Hamriyah and Umm Al Quwain.',
      'Target 1,000+ LinkedIn followers from about 350 today.',
    ],
  },
] as const;

export const PLAN_CLOSE =
  '157 confirmed diesel users, 23 Hot leads asking for a quote, 20 leaving a competitor. The demand is identified and named.';

/* ------------------------------------------------------------------ *
 * Content programme — slide 23
 * ------------------------------------------------------------------ */

export const CONTENT_PLAN = [
  { week: 'Week 1', objective: 'Frame the problem', posts: 'Poll on the biggest refuelling bottleneck. Carousel on dead mileage and idle wages. Generator damage post. White paper launch with a comment-gated CTA.', status: 'Creative complete, 10 images' },
  { week: 'Week 2', objective: 'Prove the difference', posts: '10ppm against standard fuel in a Euro 5/6 engine. Night refuelling carousel. Fuel as a service. The drivers behind the deliveries.', status: 'Full copy written' },
  { week: 'Week 3', objective: 'Show the system', posts: 'Free dead-mileage and ROI audit for 10 fleets. Paper logbooks post. The five-step delivery workflow. The eight-point continuity checklist.', status: 'Full copy written' },
  { week: 'Week 4', objective: 'Convert', posts: 'Resilience by design. 100 litres to 5 million. Emergency top-ups. The dispatch team. One month on from the white paper.', status: 'Full copy written' },
] as const;

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
  'Visit businesses across Dubai, Sharjah, Ajman and UAQ',
  'Identify diesel users and their current supplier',
  'Record volume, fleet, pain points, decision maker',
  'Introduce FILLIT and distribute flyers',
  'Log and classify every visit in the weekly workbook',
  'Generate new leads beyond the supplied list',
] as const;

export const CHALLENGES = [
  { challenge: '59.5% dead ends in Week 1', fix: 'Stopped relying on the list and generated our own leads' },
  { challenge: 'Wrong or outdated addresses', fix: 'Recorded the reason, so 117 are recoverable' },
  { challenge: 'Free zones and gate passes', fix: 'Logged 90 as blocked, not disqualified' },
  { challenge: 'Reception gatekeepers', fix: 'Asked specifically for the fuel buyer by role' },
  { challenge: 'Inconsistent consumption units', fix: 'Converted litres, gallons and AED to one measure' },
  { challenge: 'Colour and written status differed', fix: 'Used the written interest level for 26 records' },
] as const;

export const TOOLS = ['Microsoft Excel', 'Python and pandas', 'Google Maps', 'LinkedIn', 'WhatsApp', 'PowerPoint'] as const;

export const CHALLENGE_TAKEAWAY =
  'Each challenge became a finding. The Week 1 dead-end rate is what produced the 72 self-generated leads.';

export const CONTRIBUTION = [
  'Field visits and decision-maker interviews across Dubai, Sharjah, Ajman and Umm Al Quwain',
  'Designed the 23-field capture schema and the colour-coded status system used by the whole team',
  'Built and maintained the consolidated database, including de-duplication and weekly consolidation',
  'Ran the full analysis: funnel, area, industry, supplier, pain-point and lead-source',
  'Authored the LinkedIn content and engagement strategy and the 2026 white paper',
  'Built the interactive lead dashboard handed over with this presentation',
] as const;

export const TEAM_NOTE =
  'Team: Mudar, Gautham, Parasharan and Divesh shared field visits, client conversations, flyers and data logging equally.';

export const HANDOVER = [
  { asset: 'Master company database', detail: '568 companies, latest status, fully classified' },
  { asset: 'Hot, Warm and Cold lead files', detail: 'Separate Excel workbooks with contacts and volumes' },
  { asset: 'Self-generated leads file', detail: 'The 72 companies we found ourselves' },
  { asset: 'CAFU-affected accounts', detail: '20 companies with their verbatim notes' },
  { asset: 'Interactive dashboard', detail: 'Filterable, with drill-down to any single company' },
  { asset: 'LinkedIn strategy and 2026 white paper', detail: '4-week plan, 28 posts, Week 1 creative complete' },
] as const;

export const LEARNINGS = [
  {
    title: 'Lead scoring measures willingness to talk, not commercial value',
    body: 'The two ran in opposite directions here.',
  },
  {
    title: 'Data quality is a commercial variable',
    body: '117 companies were lost to addresses, not to absent demand.',
  },
  {
    title: 'The leads you find yourself beat any list you are handed',
    body: 'By 3.3 to 1 on green rate.',
  },
] as const;

/* ------------------------------------------------------------------ *
 * Sources — slide 26
 * ------------------------------------------------------------------ */

export const SOURCES = [
  { source: 'Combined_week1-week5.xlsx and Combined_week6.xlsx, 7 Aug to 17 Sep 2026', used: 'Every count, rate, area, industry, supplier, volume and quotation', main: true },
  { source: 'Vision Crafter Diesel Field Research Report', used: 'Analytical approach and qualitative framing only; figures re-verified against the main sheets', main: false },
  { source: 'UAE Fuel Price Committee, via Gulf News and Khaleej Times, Sept 2026', used: 'Diesel retail price of AED 4.30 per litre', main: false },
  { source: 'Gulf News, 24 April 2025', used: 'CAFU reinstating delivery fees of AED 12 to 20', main: false },
  { source: 'The National, 23 January 2026', used: 'CAFU slot-availability and supply problems', main: false },
  { source: 'FILLIT official flyer and fillit.co', used: 'FILLIT service claims: 10ppm, 100 L to 5M L, 24/7, GPS tracking', main: false },
  { source: 'LinkedIn pages of DP World, ENOC, Transguard, G42, Masdar, Mubadala, Gartner and others', used: 'B2B content benchmark behind the LinkedIn strategy', main: false },
] as const;

export const CLOSING_LINE =
  'The demand is identified and named. The next team starts from a map, not a list.';
