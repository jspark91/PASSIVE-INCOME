import { NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin";
import { getAdminSupabase } from "@/lib/supabase";

function getToken(request: Request) {
  return request.headers.get("x-admin-token") ?? null;
}

export async function GET(request: Request) {
  if (!isValidAdminToken(getToken(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const supabase = getAdminSupabase();

  if (!supabase) {
    return NextResponse.json({ ok: false, message: "Supabase is not configured." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, leads: data });
}

