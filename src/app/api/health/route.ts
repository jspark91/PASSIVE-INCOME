import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "seoul-ink-booking",
    supabaseConfigured: isSupabaseConfigured(),
    timestamp: new Date().toISOString()
  });
}
