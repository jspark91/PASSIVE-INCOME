import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-request";
import { leadUpdateSchema } from "@/lib/lead-update-schema";
import { updateBooking } from "@/lib/booking-storage";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = leadUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid status payload." },
      { status: 400 }
    );
  }

  try {
    await updateBooking(id, {
      status: parsed.data.status,
      memo: parsed.data.note ?? null,
      matched_artist_id: parsed.data.matched_artist_id || null,
      quoted_price_krw: parsed.data.quoted_price_krw ?? null,
      lost_reason: parsed.data.lost_reason || null
    }, "api");
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, message: "Could not update booking inquiry. Please check the lead and try again." }, { status: 503 });
  }
}
