const faqs = [
  {
    q: "Do you support English?",
    a: "Yes. V1 provides English booking support and English aftercare information."
  },
  {
    q: "Can I book while traveling in Korea?",
    a: "Yes. Send your travel dates and preferred tattoo date so we can check artist availability."
  },
  {
    q: "Where is the first studio?",
    a: "Bookings start at ETHNIC HOUSE in Sillim, Seoul. More partner studios can be added after demand is validated."
  },
  {
    q: "Is a deposit required?",
    a: "Some bookings may require a deposit to secure the appointment. V1 handles deposit instructions manually."
  },
  {
    q: "Can I get a same-day tattoo?",
    a: "Same-day booking depends on artist availability and design complexity."
  },
  {
    q: "Who is responsible for the tattoo procedure?",
    a: "The individual artist or partner studio handles the actual procedure, hygiene, consent, and service delivery."
  }
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">FAQ</p>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">Booking questions</h1>
      <div className="mt-8 grid gap-4">
        {faqs.map((item) => (
          <article key={item.q} className="rounded-lg border border-ink-100 bg-white p-5">
            <h2 className="font-semibold text-ink-900">{item.q}</h2>
            <p className="mt-2 leading-7 text-ink-700">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
