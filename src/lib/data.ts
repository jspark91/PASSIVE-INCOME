import { sampleArtists, sampleDesigns } from "@/lib/sample-data";
import { getPublicSupabase } from "@/lib/supabase";
import { getBookingDatabase, isLocalBookingId, isUuid, listLocalBookings, readLocalBooking } from "@/lib/booking-storage";
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
  const supabase = getBookingDatabase();
  const local = await listLocalBookings();
  if (!supabase) return local;

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not read booking requests from the database.");
  return [...local, ...(data as BookingRequest[])].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getBookingRequest(id: string): Promise<BookingRequest | null> {
  if (isLocalBookingId(id)) return (await readLocalBooking(id))?.request ?? null;
  if (!isUuid(id)) return null;
  const supabase = getBookingDatabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error("Could not read the booking request from the database.");
  }

  return data as BookingRequest;
}

export async function getLeadEvents(bookingRequestId: string): Promise<LeadEvent[]> {
  if (isLocalBookingId(bookingRequestId)) return (await readLocalBooking(bookingRequestId))?.events.slice().reverse() ?? [];
  if (!isUuid(bookingRequestId)) return [];
  const supabase = getBookingDatabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("lead_events")
    .select("*")
    .eq("booking_request_id", bookingRequestId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not read the booking timeline.");

  return data as LeadEvent[];
}
