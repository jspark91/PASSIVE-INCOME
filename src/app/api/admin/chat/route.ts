import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidAdminToken } from "@/lib/admin";
import { getAdminAccess } from "@/lib/admin-session";
import {
  appendOperatorChatMessage,
  listChatSessions,
  updateChatSessionStatus
} from "@/lib/chat-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const operatorMessageSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(1200)
});

const sessionStatusSchema = z.object({
  sessionId: z.string().min(1),
  status: z.enum(["open", "closed"])
});

async function hasAdminAccess(request: Request) {
  const headerToken = request.headers.get("x-admin-token");

  if (isValidAdminToken(headerToken)) {
    return true;
  }

  const access = await getAdminAccess();
  return access.allowed;
}

export async function GET(request: Request) {
  if (!(await hasAdminAccess(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const sessions = await listChatSessions();

  return NextResponse.json({ ok: true, sessions });
}

export async function POST(request: Request) {
  if (!(await hasAdminAccess(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = operatorMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid chat message." },
      { status: 400 }
    );
  }

  const session = await appendOperatorChatMessage(parsed.data);

  if (!session) {
    return NextResponse.json({ ok: false, message: "Chat session not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, session }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await hasAdminAccess(request))) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = sessionStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid chat session." },
      { status: 400 }
    );
  }

  const session = await updateChatSessionStatus(parsed.data.sessionId, parsed.data.status);

  if (!session) {
    return NextResponse.json({ ok: false, message: "Chat session not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, session });
}
