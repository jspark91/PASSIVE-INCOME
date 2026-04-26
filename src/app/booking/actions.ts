"use server";

import { bookingRequestSchema } from "@/lib/booking-schema";
import { getAdminSupabase } from "@/lib/supabase";

export type BookingFormState = {
  ok: boolean;
  message: string;
};

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createBookingRequest(
  _previousState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const raw = {
    name: textValue(formData, "name"),
    nationality: textValue(formData, "nationality"),
    language: textValue(formData, "language"),
    email: textValue(formData, "email"),
    instagram: textValue(formData, "instagram"),
    whatsapp: textValue(formData, "whatsapp"),
    travel_start: textValue(formData, "travel_start"),
    travel_end: textValue(formData, "travel_end"),
    preferred_date: textValue(formData, "preferred_date"),
    preferred_time: textValue(formData, "preferred_time"),
    style: textValue(formData, "style"),
    size_cm: textValue(formData, "size_cm"),
    placement: textValue(formData, "placement"),
    budget_krw: textValue(formData, "budget_krw"),
    reference_image_url: textValue(formData, "reference_image_url"),
    preferred_artist_id: textValue(formData, "preferred_artist_id"),
    source: textValue(formData, "source"),
    utm_source: textValue(formData, "utm_source"),
    utm_medium: textValue(formData, "utm_medium"),
    utm_campaign: textValue(formData, "utm_campaign"),
    privacy_agreement: textValue(formData, "privacy_agreement")
  };

  const parsed = bookingRequestSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Please check the form."
    };
  }

  const supabase = getAdminSupabase();

  if (!supabase) {
    return {
      ok: false,
      message:
        "Booking request captured locally by the form, but Supabase is not configured yet. Add environment variables before running live ads."
    };
  }

  const input = parsed.data;
  const budget =
    typeof input.budget_krw === "number" ? input.budget_krw : null;

  const { error } = await supabase.from("booking_requests").insert({
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
    budget_krw: budget,
    reference_image_url: input.reference_image_url || null,
    preferred_artist_id: input.preferred_artist_id || null,
    source: input.source || null,
    utm_source: input.utm_source || null,
    utm_medium: input.utm_medium || null,
    utm_campaign: input.utm_campaign || null,
    memo: null,
    status: "new"
  });

  if (error) {
    return {
      ok: false,
      message: `Could not save booking request: ${error.message}`
    };
  }

  return {
    ok: true,
    message:
      "Request received. We will review your idea, travel dates, and artist availability before replying."
  };
}

