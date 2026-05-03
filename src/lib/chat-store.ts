import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { ChatMessage, ChatSession, ChatSessionStatus } from "@/types/chat";

type ChatStore = {
  sessions: ChatSession[];
};

const maxStoredSessions = 200;

function getChatStorePath() {
  const dataDir = process.env.CHAT_DATA_DIR ?? path.join(process.cwd(), ".data", "chat");
  return path.join(dataDir, "sessions.json");
}

function cleanText(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

async function readStore(): Promise<ChatStore> {
  const storePath = getChatStorePath();

  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<ChatStore>;

    if (!Array.isArray(parsed.sessions)) {
      return { sessions: [] };
    }

    return { sessions: parsed.sessions };
  } catch {
    return { sessions: [] };
  }
}

async function writeStore(store: ChatStore) {
  const storePath = getChatStorePath();
  const dir = path.dirname(storePath);
  const trimmedStore = {
    sessions: store.sessions
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, maxStoredSessions)
  };

  await mkdir(dir, { recursive: true });
  const tempPath = `${storePath}.${process.pid}.tmp`;
  await writeFile(tempPath, JSON.stringify(trimmedStore, null, 2), "utf8");
  await rename(tempPath, storePath);
}

export async function listChatSessions() {
  const store = await readStore();
  return store.sessions.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function getChatSession(sessionId: string) {
  const store = await readStore();
  return store.sessions.find((session) => session.id === sessionId) ?? null;
}

export async function appendVisitorChatMessage(input: {
  sessionId?: string | null;
  name?: string | null;
  contact?: string | null;
  message: string;
}) {
  const store = await readStore();
  const now = new Date().toISOString();
  const body = cleanText(input.message, 1200);
  const name = cleanText(input.name || "Visitor", 80) || "Visitor";
  const contact = cleanText(input.contact || "", 120);
  let session = input.sessionId
    ? store.sessions.find((item) => item.id === input.sessionId)
    : undefined;

  if (!session) {
    session = {
      id: randomUUID(),
      name,
      contact: contact || null,
      status: "open",
      unread_by_operator: 0,
      created_at: now,
      updated_at: now,
      last_message_at: now,
      messages: []
    };
    store.sessions.push(session);
  }

  session.name = name || session.name;
  session.contact = contact || session.contact || null;
  session.status = "open";
  session.unread_by_operator += 1;
  session.updated_at = now;
  session.last_message_at = now;
  session.messages.push(createChatMessage(session.id, "visitor", body, now));

  await writeStore(store);

  return session;
}

export async function appendOperatorChatMessage(input: { sessionId: string; message: string }) {
  const store = await readStore();
  const now = new Date().toISOString();
  const body = cleanText(input.message, 1200);
  const session = store.sessions.find((item) => item.id === input.sessionId);

  if (!session) {
    return null;
  }

  session.status = "open";
  session.unread_by_operator = 0;
  session.updated_at = now;
  session.last_message_at = now;
  session.messages.push(createChatMessage(session.id, "operator", body, now));

  await writeStore(store);

  return session;
}

export async function updateChatSessionStatus(sessionId: string, status: ChatSessionStatus) {
  const store = await readStore();
  const now = new Date().toISOString();
  const session = store.sessions.find((item) => item.id === sessionId);

  if (!session) {
    return null;
  }

  session.status = status;
  session.unread_by_operator = 0;
  session.updated_at = now;

  await writeStore(store);

  return session;
}

function createChatMessage(
  sessionId: string,
  sender: ChatMessage["sender"],
  body: string,
  createdAt: string
): ChatMessage {
  return {
    id: randomUUID(),
    session_id: sessionId,
    sender,
    body,
    created_at: createdAt
  };
}
