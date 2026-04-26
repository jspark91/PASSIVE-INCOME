import Link from "next/link";

const nav = [
  { href: "/artists", label: "Artists" },
  { href: "/booking", label: "Book" },
  { href: "/faq", label: "FAQ" },
  { href: "/aftercare", label: "Aftercare" }
];

export function Header() {
  return (
    <header className="border-b border-ink-100 bg-ink-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-wide text-ink-900">
          Seoul Ink Booking
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-700">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink-900">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

