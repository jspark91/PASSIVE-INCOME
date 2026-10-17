"use server";

import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/lib/admin-session";
import { isValidAdminToken } from "@/lib/admin";
import { updateBooking } from "@/lib/booking-storage";
import { leadUpdateSchema } from "@/lib/lead-update-schema";

export async function updateLeadStatus(formData: FormData) {
  const token = await getAdminSessionToken();
  const leadId = String(formData.get("lead_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "");
  const matchedArtistId = String(formData.get("matched_artist_id") ?? "");
  const quotedPriceRaw = String(formData.get("quoted_price_krw") ?? "");
  const lostReason = String(formData.get("lost_reason") ?? "");

  if (!isValidAdminToken(token)) {
    throw new Error("Invalid admin token.");
  }

  const parsed = leadUpdateSchema.parse({ status, note, matched_artist_id: matchedArtistId, quoted_price_krw: quotedPriceRaw, lost_reason: lostReason });
  await updateBooking(leadId, {
    status: parsed.status,
    memo: parsed.note || null,
    matched_artist_id: parsed.matched_artist_id || null,
    quoted_price_krw: parsed.quoted_price_krw,
    lost_reason: parsed.lost_reason || null
  }, "admin");

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}
