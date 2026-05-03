import { Instagram } from "lucide-react";
import { instagramDmUrl, telegramContactUrl, whatsappContactUrl } from "@/lib/site";

function WhatsAppLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M16.03 4.5A11.32 11.32 0 0 0 6.3 21.6L5 27.5l6.02-1.46A11.32 11.32 0 1 0 16.03 4.5Zm0 2.17a9.15 9.15 0 0 1 7.8 13.95 9.15 9.15 0 0 1-11.98 3.12l-.45-.24-3.42.83.74-3.34-.27-.46A9.15 9.15 0 0 1 16.03 6.67Zm-4.18 4.96c-.2 0-.52.07-.8.38-.27.3-1.05 1.02-1.05 2.48s1.08 2.88 1.23 3.08c.15.2 2.1 3.33 5.16 4.54 2.55 1.01 3.07.81 3.63.76.55-.05 1.79-.73 2.04-1.43.25-.7.25-1.31.18-1.43-.08-.13-.28-.2-.58-.35-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.66.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.47.13-.62.14-.13.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.24-.25-.58-.5-.5-.68-.5h-.6Z"
      />
    </svg>
  );
}

function TelegramLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M27.5 6.3 23.67 25c-.29 1.32-1.06 1.64-2.14 1.02l-5.9-4.35-2.84 2.74c-.32.31-.58.58-1.18.58l.42-6.02L23 9.06c.48-.42-.1-.65-.74-.23L8.7 17.37l-5.84-1.82c-1.27-.4-1.29-1.27.26-1.88L25.95 4.86c1.06-.39 1.99.25 1.55 1.44Z"
      />
    </svg>
  );
}

const socialLinks = [
  { label: "Instagram", href: instagramDmUrl, Icon: Instagram },
  { label: "WhatsApp", href: whatsappContactUrl, Icon: WhatsAppLogo },
  { label: "Telegram", href: telegramContactUrl, Icon: TelegramLogo }
];

export function SocialContactRail() {
  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-50 flex flex-col gap-3 sm:bottom-8 sm:right-6">
      {socialLinks.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          aria-label={label}
          title={label}
          className="pointer-events-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-ink-900 shadow-2xl ring-1 ring-ink-900/15 transition hover:-translate-y-0.5 hover:bg-ink-900 hover:text-white"
        >
          <Icon className="h-8 w-8" />
        </a>
      ))}
    </div>
  );
}
