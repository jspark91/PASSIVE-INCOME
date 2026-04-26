import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "ethnic-house-booking",
    supabaseConfigured: isSupabaseConfigured(),
    timestamp: new Date().toISOString()
  });
}
