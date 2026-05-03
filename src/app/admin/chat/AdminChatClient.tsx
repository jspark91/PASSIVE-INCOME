"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import type { ChatSession } from "@/types/chat";

type ChatListResponse = {
  ok: boolean;
  message?: string;
  sessions?: ChatSession[];
};

type ChatSingleResponse = {
  ok: boolean;
  message?: string;
  session?: ChatSession;
};

function formatChatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

type AdminChatClientProps = {
  initialSessionId?: string | null;
};

export function AdminChatClient({ initialSessionId = null }: AdminChatClientProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSessionId);
  const [reply, setReply] = useState("");
  const [statusText, setStatusText] = useState("");
  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? sessions[0] ?? null,
    [selectedSessionId, sessions]
  );

  useEffect(() => {
    let active = true;

    async function loadSessions() {
      try {
        const response = await fetch("/api/admin/chat", {
          cache: "no-store",
          credentials: "same-origin"
        });
        const data = (await response.json()) as ChatListResponse;

        if (!active) {
          return;
        }

        if (!response.ok || !data.sessions) {
          setStatusText(data.message ?? "Could not load chat sessions.");
          return;
        }

        setSessions(data.sessions);
        setSelectedSessionId((current) => {
          if (current && data.sessions?.some((session) => session.id === current)) {
            return current;
          }

          if (initialSessionId && data.sessions?.some((session) => session.id === initialSessionId)) {
            return initialSessionId;
          }

          return data.sessions?.[0]?.id ?? null;
        });
        setStatusText("");
      } catch {
        if (active) {
          setStatusText("Chat inbox is reconnecting.");
        }
      }
    }

    const initialTimer = window.setTimeout(loadSessions, 0);
    const timer = window.setInterval(loadSessions, 2500);

    return () => {
      active = false;
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [initialSessionId]);

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSession || !reply.trim()) {
      return;
    }

    const response = await fetch("/api/admin/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ sessionId: selectedSession.id, message: reply })
    });
    const data = (await response.json()) as ChatSingleResponse;

    if (!response.ok || !data.session) {
      setStatusText(data.message ?? "Reply failed.");
      return;
    }

    const updatedSession = data.session;
    setReply("");
    setSessions((current) =>
      current.map((session) => (session.id === updatedSession.id ? updatedSession : session))
    );
    setStatusText("Reply sent.");
  }

  async function updateStatus(status: "open" | "closed") {
    if (!selectedSession) {
      return;
    }

    const response = await fetch("/api/admin/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ sessionId: selectedSession.id, status })
    });
    const data = (await response.json()) as ChatSingleResponse;

    if (response.ok && data.session) {
      const updatedSession = data.session;
      setSessions((current) =>
        current.map((session) => (session.id === updatedSession.id ? updatedSession : session))
      );
    }
  }

  return (
    <div className="mt-8 grid overflow-hidden rounded-lg border border-ink-100 bg-white lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-ink-100 lg:border-b-0 lg:border-r">
        <div className="border-b border-ink-100 p-4">
          <p className="text-sm font-semibold text-ink-900">Live chats</p>
          <p className="mt-1 text-xs text-ink-700">
            Keep this page open while consultation is active.
          </p>
        </div>
        <div className="max-h-[620px] overflow-y-auto">
          {sessions.length ? (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelectedSessionId(session.id)}
                className={`block w-full border-b border-ink-100 p-4 text-left ${
                  selectedSession?.id === session.id ? "bg-ink-50" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-ink-900">{session.name}</p>
                  {session.unread_by_operator ? (
                    <span className="rounded-full bg-ink-900 px-2 py-0.5 text-xs font-semibold text-white">
                      {session.unread_by_operator}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs text-ink-700">
                  {session.contact || "No contact"}
                </p>
                <p className="mt-2 truncate text-xs text-ink-700">
                  {session.messages.at(-1)?.body ?? "No messages"}
                </p>
              </button>
            ))
          ) : (
            <p className="p-4 text-sm text-ink-700">No chat sessions yet.</p>
          )}
        </div>
      </aside>

      <section className="grid min-h-[620px] grid-rows-[auto_1fr_auto]">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-ink-900">
              {selectedSession?.name ?? "Select a chat"}
            </p>
            <p className="mt-1 text-sm text-ink-700">
              {selectedSession
                ? `${selectedSession.contact || "No contact"} / ${selectedSession.status}`
                : "Visitor messages appear here."}
            </p>
          </div>
          {selectedSession ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateStatus("open")}
                className="rounded-md border border-ink-100 px-3 py-2 text-xs font-semibold text-ink-900"
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => updateStatus("closed")}
                className="rounded-md bg-ink-900 px-3 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          ) : null}
        </div>

        <div className="overflow-y-auto bg-ink-50 p-4">
          {selectedSession ? (
            <div className="grid gap-3">
              {selectedSession.messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[75%] rounded-md px-4 py-3 text-sm leading-6 ${
                    message.sender === "operator"
                      ? "ml-auto bg-ink-900 text-white"
                      : "bg-white text-ink-900"
                  }`}
                >
                  <p>{message.body}</p>
                  <p
                    className={`mt-2 text-[11px] ${
                      message.sender === "operator" ? "text-ink-100" : "text-ink-700"
                    }`}
                  >
                    {formatChatTime(message.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <form onSubmit={sendReply} className="border-t border-ink-100 p-4">
          {statusText ? <p className="mb-3 text-sm font-medium text-moss-700">{statusText}</p> : null}
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={3}
              disabled={!selectedSession}
              placeholder="Type reply"
              className="min-w-0 resize-none rounded-md border border-ink-100 px-3 py-2 text-sm leading-6"
            />
            <button
              type="submit"
              disabled={!selectedSession || !reply.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Reply
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
