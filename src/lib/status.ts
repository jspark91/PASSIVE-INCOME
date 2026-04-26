import type { LeadStatus } from "@/types/domain";

export const leadStatuses: LeadStatus[] = [
  "new",
  "contacted",
  "artist_matched",
  "quote_sent",
  "deposit_pending",
  "booked",
  "completed",
  "review_requested",
  "reviewed",
  "lost"
];

export function getStatusLabel(status: LeadStatus) {
  return status
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

