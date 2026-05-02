import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/artists", label: "Artists" },
  { href: "/faq", label: "FAQ" },
  { href: "/aftercare", label: "Aftercare" }
];

export function Header() {
  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link href="/" className="shrink-0 text-base font-semibold text-ink-900 sm:text-lg">
          ETHNIC HOUSE
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
          Make an appointment
        </Link>
      </div>
    </header>
  );
}
