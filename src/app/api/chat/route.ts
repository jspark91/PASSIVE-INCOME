import { NextResponse } from "next/server";
import { z } from "zod";
import { appendVisitorChatMessage, getChatSession } from "@/lib/chat-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const visitorChatSchema = z.object({
  sessionId: z.string().optional().nullable(),
  name: z.string().max(80).optional().nullable(),
  contact: z.string().max(120).optional().nullable(),
  message: z.string().min(1).max(1200)
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ ok: false, message: "Missing sessionId." }, { status: 400 });
  }

  const session = await getChatSession(sessionId);

  if (!session) {
    return NextResponse.json({ ok: false, message: "Chat session not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, session });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = visitorChatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid chat message." },
      { status: 400 }
    );
  }

  const session = await appendVisitorChatMessage(parsed.data);

  return NextResponse.json({ ok: true, session }, { status: 201 });
}
