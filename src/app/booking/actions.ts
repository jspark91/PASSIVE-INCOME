"use server";

import { bookingRequestSchema } from "@/lib/booking-schema";
import { insertBookingRequest } from "@/lib/booking-service";

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
    preferred_design_id: textValue(formData, "preferred_design_id"),
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

  const input = parsed.data;
  const result = await insertBookingRequest(input);

  if (!result.ok) {
    return {
      ok: false,
      message: result.message
    };
  }

  return {
    ok: true,
    message: result.message
  };
}
