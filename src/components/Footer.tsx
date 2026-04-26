export function Footer() {
  return (
    <footer className="bg-ink-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="sm:col-span-2">
          <p className="text-xl font-semibold">ETHNIC HOUSE</p>
          <p className="mt-3 max-w-md leading-6 text-ink-100">
            ETHNIC HOUSE SILLIM, 에스닉하우스 신림. English-friendly tattoo booking support
            for travelers visiting Seoul.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Location</h2>
          <p className="mt-3 leading-6 text-ink-100">
            Sillim, Seoul
            <br />
            Exact address shared after booking confirmation.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Hours</h2>
          <p className="mt-3 leading-6 text-ink-100">
            By appointment
            <br />
            Same-day requests depend on artist availability.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Contact</h2>
          <p className="mt-3 leading-6 text-ink-100">
            Booking form first
            <br />
            Instagram and WhatsApp can be added after matching.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs leading-5 text-ink-100 sm:px-6">
          ETHNIC HOUSE provides booking support and artist matching. The actual tattoo procedure,
          hygiene management, consent, and service delivery are handled by the individual artist or
          partner studio.
        </div>
      </div>
    </footer>
  );
}
