import Link from "next/link";

const nav = [
  { href: "/#work", label: "Work" },
  { href: "/artists", label: "Artists" },
  { href: "/#prices", label: "Prices" },
  { href: "/faq", label: "FAQ" }
];

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link href="/" className="shrink-0 text-base font-semibold text-ink-900 sm:text-lg">
            ETHNIC HOUSE SEOUL
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-700 sm:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-ink-900">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/booking"
            className="hidden shrink-0 rounded-md border border-ink-900 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-ink-900 hover:text-white sm:inline-flex"
          >
            Book
          </Link>
        </div>
      </header>
      <Link
        href="/booking"
        className="fixed bottom-4 left-4 right-4 z-50 inline-flex items-center justify-center rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft sm:hidden"
      >
        Book a Tattoo
      </Link>
    </>
  );
}
