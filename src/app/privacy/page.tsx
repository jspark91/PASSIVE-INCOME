export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">
        Privacy
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">Privacy notice</h1>
      <div className="mt-8 space-y-6 rounded-lg border border-ink-100 bg-white p-6 leading-7 text-ink-700">
        <p>
          The current booking page creates a message for the visitor to send through Instagram DM
          or Kakao. ETHNIC HOUSE reviews that message to understand tattoo ideas, check artist
          availability, and coordinate booking support.
        </p>
        <p>
          Submitted information may include name, nationality, language, email, Instagram,
          WhatsApp, travel dates, preferred date, tattoo style, size, placement, budget, reference
          image URL, and campaign source data.
        </p>
        <p>
          Relevant booking details may be shared with a matched artist or partner studio only for
          booking coordination. The actual procedure and customer consent process are handled by
          the individual artist or partner studio.
        </p>
        <p>
          If database storage is enabled later, this notice should be updated before running paid
          ads or collecting production traffic through the database workflow.
        </p>
      </div>
    </section>
  );
}
