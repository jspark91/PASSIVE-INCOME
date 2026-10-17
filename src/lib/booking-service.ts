import { bookingPayloadSchema, type BookingPayloadInput } from "@/lib/booking-schema";
import type { BookingInquiryInput } from "@/lib/booking-inquiry-schema";
import { getArtists, getFlashDesigns } from "@/lib/data";
import { createdEvent, getBookingDatabase, isUuid, saveLocalBooking, type BookingAttachment, type BookingIntake } from "@/lib/booking-storage";
import type { BookingRequest } from "@/types/domain";

const receiptMessage = "Request received. We will review your idea, travel dates, and artist availability before replying. This is an inquiry, not a confirmed appointment.";

async function persistBookingRequest(input: BookingPayloadInput, intake: BookingIntake) {
  const database = getBookingDatabase();
  const record: Omit<BookingRequest, "id"> = {
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
    budget_krw: typeof input.budget_krw === "number" ? input.budget_krw : null,
    reference_image_url: input.reference_image_url || null,
    preferred_artist_id: input.preferred_artist_id || null,
    preferred_design_id: input.preferred_design_id || null,
    source: input.source || "booking_form",
    utm_source: input.utm_source || null,
    utm_medium: input.utm_medium || null,
    utm_campaign: input.utm_campaign || null,
    memo: null,
    status: "new",
    created_at: intake.submitted_at
  };
  if (!database) {
    const id = await saveLocalBooking(record, intake);
    return { ok: true as const, message: receiptMessage, id };
  }
  // Public sample IDs are slugs; SQL foreign keys are UUIDs. Keep original choices in the immutable intake.
  const { data, error } = await database.from("booking_requests").insert({
    ...record,
    preferred_artist_id: record.preferred_artist_id && isUuid(record.preferred_artist_id) ? record.preferred_artist_id : null,
    preferred_design_id: record.preferred_design_id && isUuid(record.preferred_design_id) ? record.preferred_design_id : null
  }).select("id").single();
  if (error || !data?.id) throw new Error("Could not save the booking request in the database.");
  const { error: eventError } = await database.from("lead_events").insert(createdEvent(data.id as string, intake));
  if (eventError) {
    const { error: rollbackError } = await database.from("booking_requests").delete().eq("id", data.id);
    if (rollbackError) console.error("Booking intake rollback requires review:", data.id);
    throw new Error("Could not save the full booking inquiry.");
  }
  return { ok: true as const, message: receiptMessage, id: data.id as string };
}

export async function insertBookingInquiry(input: BookingInquiryInput, attachments: BookingAttachment[]) {
  const [artists, designs] = await Promise.all([getArtists(), getFlashDesigns()]);
  const artist = artists.find((candidate) => candidate.id === input.preferred_artist_id || candidate.slug === input.preferred_artist_id);
  const design = designs.find((candidate) => candidate.id === input.preferred_design_id);
  const fields = { ...input };
  delete (fields as Partial<BookingInquiryInput>).website;
  const intake: BookingIntake = {
    version: 1,
    submitted_at: new Date().toISOString(),
    fields,
    artist_label: artist?.name || input.preferred_artist_id || "Please recommend an artist",
    design_label: design?.title || input.preferred_design_title || input.preferred_design_id || undefined,
    attachments
  };
  return persistBookingRequest({
    ...input,
    size_cm: input.size_unsure ? "Not sure yet" : `${input.size_width_cm} × ${input.size_height_cm} cm`,
    preferred_artist_id: artist?.id || input.preferred_artist_id,
    preferred_design_id: design?.id || input.preferred_design_id
  }, intake);
}

// Retain the existing JSON endpoint and server action for older clients.
export async function insertBookingRequest(payload: BookingPayloadInput) {
  const parsed = bookingPayloadSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Please check the booking request.", id: null };
  try {
    return await persistBookingRequest(parsed.data, {
      version: 1, submitted_at: new Date().toISOString(), fields: parsed.data, attachments: []
    });
  } catch (error) {
    console.error("Could not persist booking request:", error instanceof Error ? error.message : "Unknown storage error");
    return { ok: false as const, message: "Your request could not be saved. Please try again or contact the studio.", id: null };
  }
}
