import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidAdminToken } from "@/lib/admin";
import { getAdminSupabase } from "@/lib/supabase";
import { leadStatuses } from "@/lib/status";

const statusSchema = z.object({
  status: z.enum(leadStatuses as [string, ...string[]]),
  note: z.string().optional()
});

function getToken(request: Request) {
  return request.headers.get("x-admin-token") ?? null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isValidAdminToken(getToken(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid status payload." },
      { status: 400 }
    );
  }

  const supabase = getAdminSupabase();

  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Supabase is not configured." }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("booking_requests")
    .update({
      status: parsed.data.status,
      memo: parsed.data.note ?? null
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ ok: false, message: updateError.message }, { status: 500 });
  }

  await supabase.from("lead_events").insert({
    booking_request_id: id,
    event_type: "status_changed",
    note: parsed.data.note || `Status changed to ${parsed.data.status}`,
    created_by: "api"
  });

  return NextResponse.json({ ok: true });
}
