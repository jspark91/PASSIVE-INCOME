"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Instagram, MessageCircle, MessageSquare, X } from "lucide-react";
import { instagramDmUrl } from "@/lib/site";

const kakaoChannelUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL;

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/booking")) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-24 right-24 z-[60] sm:bottom-6 sm:right-6">
      <div className="pointer-events-auto relative max-w-[calc(100vw-2rem)]">
        {isOpen ? (
          <div className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-sm border border-ink-100 bg-white p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink-900">Chat with ETHNIC HOUSE</p>
              <p className="mt-1 text-xs text-ink-700">Fastest reply: Instagram DM</p>
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

          <div className="mt-4 grid gap-2">
            <a
              href={instagramDmUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-ink-900 px-4 py-3 text-sm font-semibold text-white"
            >
              <Instagram className="h-4 w-4" />
              Instagram DM
            </a>
            <Link
              href="/booking"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-2 border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-900"
            >
              <CalendarDays className="h-4 w-4" />
              Booking form
            </Link>
            {kakaoChannelUrl ? (
              <a
                href={kakaoChannelUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-900"
              >
                <MessageSquare className="h-4 w-4" />
                Kakao Channel
              </a>
            ) : null}
          </div>
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
