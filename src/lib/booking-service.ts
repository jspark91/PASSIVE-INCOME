import { bookingPayloadSchema, type BookingPayloadInput } from "@/lib/booking-schema";
import { getAdminSupabase } from "@/lib/supabase";

function budgetValue(value: BookingPayloadInput["budget_krw"]) {
  return typeof value === "number" ? value : null;
}

export async function insertBookingRequest(payload: BookingPayloadInput) {
  const parsed = bookingPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Please check the booking request.",
      id: null
    };
  }

  const supabase = getAdminSupabase();

  if (!supabase) {
    return {
      ok: false as const,
      message: "Supabase is not configured. Add Supabase environment variables before accepting live bookings.",
      id: null
    };
  }

  const input = parsed.data;
  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      name: input.name,
      nationality: input.nationality || null,
      language: input.language || null,
      email: input.email || null,
      instagram: input.instagram || null,
      whatsapp: input.whatsapp || null,
      travel_start: input.travel_start || null,
      travel_end: input.travel_end || null,
      preferred_date: input.preferred_date || null,
      preferred_time: input.preferred_time || null,
      style: input.style,
      size_cm: input.size_cm || null,
      placement: input.placement || null,
      budget_krw: budgetValue(input.budget_krw),
      reference_image_url: input.reference_image_url || null,
      preferred_artist_id: input.preferred_artist_id || null,
      source: input.source || null,
      utm_source: input.utm_source || null,
      utm_medium: input.utm_medium || null,
      utm_campaign: input.utm_campaign || null,
      memo: null,
      status: "new"
    })
    .select("id")
    .single();

  if (error) {
    return {
      ok: false as const,
      message: `Could not save booking request: ${error.message}`,
      id: null
    };
  }

  return {
    ok: true as const,
    message: "Request received. We will review your idea, travel dates, and artist availability before replying.",
    id: data?.id as string
  };
}
