"use server";

import { revalidatePath } from "next/cache";
import { getAdminSessionToken } from "@/lib/admin-session";
import { isValidAdminToken } from "@/lib/admin";
import { getAdminSupabase } from "@/lib/supabase";
import { leadStatuses } from "@/lib/status";
import type { LeadStatus } from "@/types/domain";

export async function updateLeadStatus(formData: FormData) {
  const token = await getAdminSessionToken();
  const leadId = String(formData.get("lead_id") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  const note = String(formData.get("note") ?? "");
  const matchedArtistId = String(formData.get("matched_artist_id") ?? "");
  const quotedPriceRaw = String(formData.get("quoted_price_krw") ?? "");
  const lostReason = String(formData.get("lost_reason") ?? "");

  if (!isValidAdminToken(token)) {
    throw new Error("Invalid admin token.");
  }

  if (!leadStatuses.includes(status)) {
    throw new Error("Invalid lead status.");
  }

  const supabase = getAdminSupabase();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { error: updateError } = await supabase
    .from("booking_requests")
    .update({
      status,
      memo: note || null,
      matched_artist_id: matchedArtistId || null,
      quoted_price_krw: quotedPriceRaw ? Number(quotedPriceRaw) : null,
      lost_reason: lostReason || null
    })
    .eq("id", leadId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await supabase.from("lead_events").insert({
    booking_request_id: leadId,
    event_type: "status_changed",
    note: note || `Status changed to ${status}`,
    created_by: "admin"
  });

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);
}
