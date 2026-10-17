import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-request";
import { getBookingRequests } from "@/lib/data";

export async function GET(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    return NextResponse.json({ ok: true, leads: await getBookingRequests() }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ ok: false, message: "Could not read booking inquiries." }, { status: 503 });
  }
}

