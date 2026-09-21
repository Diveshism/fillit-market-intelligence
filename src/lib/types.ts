/**
 * Types for the FILLIT field research dataset.
 *
 * Shape is produced by scripts/build-dataset.mjs from
 * data/submission/FILLIT_Master_Database.xlsx.
 */

export type Status = 'Hot' | 'Warm' | 'Cold' | 'Appointment' | 'Revisit' | 'Invalid';
export type LeadSource = 'Self-generated' | 'Planned list';
export type Confidence = 'VERIFIED' | 'SOURCED' | 'DERIVED';
export type ZoneTier = 'work' | 'unlock' | 'stop' | 'covered';

export interface StatusHistoryEntry {
  date: string | null;
  status: string;
}

export interface Company {
  id: string;
  company: string;
  status: Status;
  zone: string;
  sector: string;
  location: string | null;
  emirate: string | null;
  contact_person: string | null;
  phone: string | null;
  direct_number: string | null;
  email: string | null;
  current_supplier: string | null;
  consumption_raw: string | null;
  litres_per_month: number | null;
  fleet: string | null;
  pain_points: string | null;
  comments: string | null;
  first_visit: string | null;
  last_visit: string | null;
  visits: number;
  lead_source: LeadSource;
  mentions_cafu: boolean;
  status_by_colour: string | null;
  interest_level_written: string | null;
  /** True where the written interest level overrode the cell colour. */
  interest_level_applied: boolean;
  status_history: StatusHistoryEntry[];
}

export interface WeeklyRow {
  week: number;
  visits: number;
  hot: number;
  warm: number;
  cold: number;
  green_rate: number;
  dead_end_rate: number;
  new_leads: number;
}

export interface SectorRow {
  sector: string;
  companies: number;
  hot: number;
  warm: number;
  cold: number;
  appointment: number;
  invalid: number;
  green_rate: number;
  self_generated: number;
}

export interface ZoneRow {
  zone: string;
  companies: number;
  hot: number;
  warm: number;
  cold: number;
  appointment: number;
  invalid: number;
  green_rate: number;
  self_generated: number;
  lat: number | null;
  lng: number | null;
  tier: ZoneTier;
}

export interface Summary {
  field_visits: number;
  companies: number;
  hot: number;
  warm: number;
  cold: number;
  appointment: number;
  revisit: number;
  invalid: number;
  diesel_users: number;
  qualified: number;
  blocked_or_unresolved: number;
  visited_more_than_once: number;
  status_changed: number;
  colour_conflicts: number;
  decision_makers: number;
  self_generated: number;
  self_generated_green_rate: number;
  planned_list_green_rate: number;
  cafu_mentions: number;
  invalid_wrong_address: number;
  invalid_no_requirement: number;
}

export interface Volume {
  measured_excl_largest: number;
  hot: number;
  warm: number;
  cold: number;
  cold_share_pct: number;
  companies_with_volume: number;
  largest_account: string;
  largest_account_id: string;
  largest_account_lpm: number;
  diesel_price_aed_per_litre: number;
}

export interface Meta {
  author: string;
  role: string;
  team: string;
  company: string;
  field_period: string;
  weeks: number;
  emirates: string[];
  source: string;
  generated_from: string;
}

export interface Dataset {
  meta: Meta;
  summary: Summary;
  volume: Volume;
  weekly: WeeklyRow[];
  sectors: SectorRow[];
  zones: ZoneRow[];
  companies: Company[];
}
