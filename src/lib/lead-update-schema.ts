import { z } from "zod";
import { leadStatuses } from "@/lib/status";
import type { LeadStatus } from "@/types/domain";

export const leadUpdateSchema = z.object({
  status: z.string().refine((value) => leadStatuses.includes(value as LeadStatus), "Invalid lead status.").transform((value) => value as LeadStatus),
  note: z.string().max(10000).optional(),
  matched_artist_id: z.string().max(100).optional().nullable(),
  quoted_price_krw: z.preprocess((value) => value === "" || value === undefined ? null : value,
    z.coerce.number().int().positive().max(2147483647).nullable()),
  lost_reason: z.string().max(1000).optional().nullable()
});
