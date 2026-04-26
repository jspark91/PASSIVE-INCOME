export type LeadStatus =
  | "new"
  | "contacted"
  | "artist_matched"
  | "quote_sent"
  | "deposit_pending"
  | "booked"
  | "completed"
  | "review_requested"
  | "reviewed"
  | "lost";

export type Artist = {
  id: string;
  name: string;
  slug: string;
  instagram?: string | null;
  bio_en?: string | null;
  bio_ko?: string | null;
  styles: string[];
  starting_price_krw?: number | null;
  languages: string[];
  location: string;
  is_active: boolean;
};

export type FlashDesign = {
  id: string;
  artist_id: string;
  title: string;
  style?: string | null;
  size_hint?: string | null;
  price_from_krw?: number | null;
  duration_minutes?: number | null;
  image_url?: string | null;
  is_available: boolean;
};

export type BookingRequest = {
  id: string;
  name: string;
  nationality?: string | null;
  language?: string | null;
  email?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  travel_start?: string | null;
  travel_end?: string | null;
  preferred_date?: string | null;
  preferred_time?: string | null;
  style?: string | null;
  size_cm?: string | null;
  placement?: string | null;
  budget_krw?: number | null;
  reference_image_url?: string | null;
  preferred_artist_id?: string | null;
  preferred_design_id?: string | null;
  matched_artist_id?: string | null;
  quoted_price_krw?: number | null;
  lost_reason?: string | null;
  status: LeadStatus;
  source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  memo?: string | null;
  created_at: string;
};

export type LeadEvent = {
  id: string;
  booking_request_id: string;
  event_type: string;
  note?: string | null;
  created_by?: string | null;
  created_at: string;
};
