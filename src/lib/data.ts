import { sampleArtists, sampleDesigns, sampleLeads } from "@/lib/sample-data";
import { getAdminSupabase, getPublicSupabase } from "@/lib/supabase";
import type { Artist, BookingRequest, FlashDesign, LeadEvent } from "@/types/domain";

export async function getArtists(): Promise<Artist[]> {
  const supabase = getPublicSupabase();

  if (!supabase) {
    return sampleArtists;
  }

  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return sampleArtists;
  }

  return data as Artist[];
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const artists = await getArtists();
  return artists.find((artist) => artist.slug === slug) ?? null;
}

export async function getFlashDesigns(): Promise<FlashDesign[]> {
  const supabase = getPublicSupabase();

  if (!supabase) {
    return sampleDesigns;
  }

  const { data, error } = await supabase
    .from("flash_designs")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return sampleDesigns;
  }

  return data as FlashDesign[];
}

export async function getDesignsForArtist(artistId: string) {
  const designs = await getFlashDesigns();
  return designs.filter((design) => design.artist_id === artistId);
}

export async function getBookingRequests(): Promise<BookingRequest[]> {
  const supabase = getAdminSupabase();

  if (!supabase) {
    return sampleLeads;
  }

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data as BookingRequest[];
}

export async function getBookingRequest(id: string): Promise<BookingRequest | null> {
  const supabase = getAdminSupabase();

  if (!supabase) {
    return sampleLeads.find((lead) => lead.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data as BookingRequest;
}

export async function getLeadEvents(bookingRequestId: string): Promise<LeadEvent[]> {
  const supabase = getAdminSupabase();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("lead_events")
    .select("*")
    .eq("booking_request_id", bookingRequestId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data as LeadEvent[];
}
