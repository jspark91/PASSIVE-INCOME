import { z } from "zod";

export const bookingPayloadSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  nationality: z.string().optional(),
  language: z.string().optional(),
  email: z.string().email("Please enter a valid email.").optional().or(z.literal("")),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  travel_start: z.string().optional(),
  travel_end: z.string().optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  style: z.string().min(1, "Please choose a style."),
  size_cm: z.string().optional(),
  placement: z.string().optional(),
  budget_krw: z.coerce.number().int().positive().optional().or(z.literal("")),
  reference_image_url: z.string().url().optional().or(z.literal("")),
  preferred_artist_id: z.string().optional(),
  source: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional()
});

export const bookingRequestSchema = bookingPayloadSchema.extend({
  privacy_agreement: z.literal("on", {
    errorMap: () => ({ message: "Please agree to the privacy notice." })
  })
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type BookingPayloadInput = z.infer<typeof bookingPayloadSchema>;
