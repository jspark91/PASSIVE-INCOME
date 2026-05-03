"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Instagram, MessageCircle, Send, X } from "lucide-react";
import { instagramDmUrl } from "@/lib/site";
import type { ChatMessage, ChatSession } from "@/types/chat";

const chatSessionKey = "ethnic-house-chat-session";
const chatNameKey = "ethnic-house-chat-name";
const chatContactKey = "ethnic-house-chat-contact";

type ChatResponse = {
  ok: boolean;
  message?: string;
  session?: ChatSession;
};

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem(chatSessionKey)
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(chatNameKey) ?? ""
  );
  const [contact, setContact] = useState(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(chatContactKey) ?? ""
  );
  const [message, setMessage] = useState("");
  const [statusText, setStatusText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isOpen || !sessionId) {
      return;
    }

    let active = true;

    async function loadSession() {
      try {
        const response = await fetch(`/api/chat?sessionId=${encodeURIComponent(sessionId ?? "")}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ChatResponse;

        if (active && data.session) {
          setMessages(data.session.messages);
        }
      } catch {
        if (active) {
          setStatusText("Chat is reconnecting.");
        }
      }
    }

    loadSession();
    const timer = window.setInterval(loadSession, 2500);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isOpen, sessionId]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    setIsSending(true);
    setStatusText("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name,
          contact,
          message
        })
      });
      const data = (await response.json()) as ChatResponse;

      if (!response.ok || !data.session) {
        setStatusText(data.message ?? "Message failed.");
        return;
      }

      window.localStorage.setItem(chatSessionKey, data.session.id);
      window.localStorage.setItem(chatNameKey, name);
      window.localStorage.setItem(chatContactKey, contact);
      setSessionId(data.session.id);
      setMessages(data.session.messages);
      setMessage("");
      setStatusText("Sent. Keep this window open for replies.");
    } catch {
      setStatusText("Message failed. Use Instagram DM if urgent.");
    } finally {
      setIsSending(false);
    }
  }

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[60] sm:bottom-6 sm:right-6">
      <div className="pointer-events-auto relative max-w-[calc(100vw-2rem)]">
        {isOpen ? (
          <div className="absolute bottom-14 right-0 w-[calc(100vw-2rem)] max-w-sm overflow-hidden border border-ink-100 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-ink-100 p-4">
              <div>
                <p className="text-sm font-semibold text-ink-900">ETHNIC HOUSE Chat</p>
                <p className="mt-1 text-xs text-ink-700">Usually replies here or by Instagram.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center border border-ink-100 text-ink-900"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto bg-ink-50 p-4">
              {messages.length ? (
                <div className="grid gap-2">
                  {messages.map((item) => (
                    <div
                      key={item.id}
                      className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-5 ${
                        item.sender === "visitor"
                          ? "ml-auto bg-ink-900 text-white"
                          : "bg-white text-ink-900"
                      }`}
                    >
                      {item.body}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-ink-700">
                  Ask about artist, price, date, placement, or reference images.
                </p>
              )}
            </div>

            <form onSubmit={sendMessage} className="grid gap-3 p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name"
                  className="min-w-0 border border-ink-100 px-3 py-2 text-sm"
                />
                <input
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="@instagram / email"
                  className="min-w-0 border border-ink-100 px-3 py-2 text-sm"
                />
              </div>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                required
                placeholder="Type your message"
                className="min-w-0 resize-none border border-ink-100 px-3 py-2 text-sm leading-5"
              />
              {statusText ? <p className="text-xs font-medium text-moss-700">{statusText}</p> : null}
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center justify-center gap-2 bg-ink-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? "Sending" : "Send"}
                </button>
                <a
                  href={instagramDmUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-900"
                >
                  <Instagram className="h-4 w-4" />
                  DM
                </a>
              </div>
            </form>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center bg-white text-sm font-semibold text-ink-900 shadow-2xl ring-1 ring-ink-900/20 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-3"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close chat" : "Open chat"}
          title={isOpen ? "Close chat" : "Open chat"}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Chat</span>
        </button>
      </div>
    </div>
  );
}
