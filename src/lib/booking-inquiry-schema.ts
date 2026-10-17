import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");
const date = optionalText(10).refine((value) => !value || (
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
), "Please enter a valid date.");
const checkbox = z.enum(["true", "false"]).optional().default("false").transform((value) => value === "true");
const requiredConsent = (message: string) => z.literal("true", {
  errorMap: () => ({ message })
}).transform(() => true);
const positiveNumber = (maximum: number, message: string) => optionalText(30)
  .refine((value) => !value || (/^\d+(?:\.\d+)?$/.test(value) && Number(value) > 0 && Number(value) <= maximum), message)
  .transform((value) => value ? Number(value) : undefined);
const phone = optionalText(40).refine((value) => !value || (
  /^[+\d().\s-]+$/.test(value) && value.replace(/\D/g, "").length >= 6
), "Please enter a phone number with a country code.");

export const bookingInquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email.").max(254),
  phone,
  instagram: optionalText(100),
  whatsapp: phone,
  visitor_status: z.enum(["planning_trip", "visiting", "resident"], {
    errorMap: () => ({ message: "Please choose your travel status." })
  }),
  travel_start: date,
  travel_end: date,
  dates_flexible: checkbox,
  preferred_date: date,
  preferred_time: optionalText(100),
  style: z.string().trim().min(1, "Please choose a style.").max(100),
  placement: z.string().trim().min(1, "Please enter the tattoo placement.").max(200),
  size_width_cm: positiveNumber(200, "Width must be greater than 0 and no more than 200 cm."),
  size_height_cm: positiveNumber(200, "Height must be greater than 0 and no more than 200 cm."),
  size_unsure: checkbox,
  budget_krw: positiveNumber(2147483647, "Please enter a positive budget in KRW.").refine(
    (value) => value === undefined || Number.isInteger(value), "Please enter the budget as a whole number."
  ),
  preferred_artist_id: optionalText(100),
  preferred_design_id: optionalText(100),
  preferred_design_title: optionalText(200),
  description: z.string().trim().min(10, "Please describe your idea in at least 10 characters.").max(4000),
  reference_image_url: optionalText(2048).refine((value) => {
    if (!value) return true;
    try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
  }, "Please use an http or https reference link."),
  age_confirmation: requiredConsent("Please confirm that you are at least 18 years old."),
  privacy_agreement: requiredConsent("Please agree to the privacy notice."),
  source: optionalText(200),
  utm_source: optionalText(200),
  utm_medium: optionalText(200),
  utm_campaign: optionalText(200),
  website: z.string().max(0).optional().default("")
}).superRefine((input, context) => {
  if (Boolean(input.travel_start) !== Boolean(input.travel_end)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["travel_end"], message: "Please enter both arrival and departure dates." });
  }
  if (input.visitor_status !== "resident" && !input.dates_flexible && (!input.travel_start || !input.travel_end)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["travel_start"], message: "Please enter your travel dates or choose dates not confirmed yet." });
  }
  if (input.travel_start && input.travel_end && input.travel_start > input.travel_end) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["travel_end"], message: "Departure must be on or after arrival." });
  }
  if (input.preferred_date && input.travel_start && input.travel_end && (
    input.preferred_date < input.travel_start || input.preferred_date > input.travel_end
  )) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["preferred_date"], message: "Please choose a date during your stay." });
  }
  if (!input.size_unsure && (!input.size_width_cm || !input.size_height_cm)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["size_width_cm"], message: "Please enter width and height, or choose size not sure yet." });
  }
  if (Boolean(input.size_width_cm) !== Boolean(input.size_height_cm)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["size_height_cm"], message: "Please enter both width and height." });
  }
});

export type BookingInquiryInput = z.infer<typeof bookingInquirySchema>;
