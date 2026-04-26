const items = [
  "Keep the tattoo clean and dry according to your artist's instructions.",
  "Avoid swimming, sauna, jjimjilbang, and soaking until the tattoo has healed.",
  "Avoid direct sunlight and heavy friction on the tattooed area.",
  "Do not scratch or peel healing skin.",
  "Contact your artist or a medical professional if you notice unusual swelling, pain, fever, or discharge.",
  "Ask about touch-up policy before booking if you will leave Korea soon."
];

export default function AftercarePage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">
        Aftercare
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">Tattoo aftercare while traveling</h1>
      <p className="mt-4 leading-7 text-ink-700">
        This page is a simple traveler-facing guide. The matched artist should provide final
        aftercare instructions based on the actual procedure and product used.
      </p>
      <ul className="mt-8 grid gap-4">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-ink-100 bg-white p-5 text-ink-700">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

