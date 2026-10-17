import Link from "next/link";
import { instagramDmUrl } from "@/lib/site";

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss-700">ETHNIC HOUSE · Seoul</p>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">Privacy notice</h1>
      <p className="mt-4 max-w-2xl leading-7 text-ink-700">How we use the information you share when asking for tattoo booking support.</p>
      <div className="mt-7 space-y-7 border border-ink-100 bg-white p-6 text-sm leading-7 text-ink-700 sm:p-8">
        <div>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">What you submit</h2>
          <p>Our inquiry form collects your name and email address, and any phone number, Instagram handle or WhatsApp number you choose to provide. It also collects your visit status, travel dates or flexible-date preference, preferred appointment, tattoo idea, style, placement, approximate size, budget and artist or work preferences.</p>
          <p className="mt-2">You may optionally include reference links and upload up to three reference images. Please avoid uploading passports, payment details, medical records, or other sensitive information that is not needed to explain your tattoo idea.</p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Why we use it</h2>
          <p>ETHNIC HOUSE uses your details to review your inquiry, suggest a suitable artist, check availability and a quote, contact you, and coordinate booking details. An inquiry is not a confirmed appointment.</p>
          <p className="mt-2">When present in the link you used, the form also records a source label and campaign parameters such as UTM source, medium and campaign. These help us understand which pages or campaigns lead to inquiries. Your contact information and reference images are not included in the inquiry-success analytics event.</p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Storage and artist coordination</h2>
          <p>Submitted inquiries are saved for ETHNIC HOUSE to manage and follow up on. Uploaded reference images are stored privately with the inquiry; submitting the form does not publish them in our website gallery.</p>
          <p className="mt-2">We may share relevant details, such as your idea, references, placement, size, budget and dates, with a suitable artist or partner studio to check whether they can take your request and to coordinate a booking. Contact details may be shared where needed for that coordination. The artist or studio handles the tattoo procedure and its own consent process.</p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Instagram and other contact channels</h2>
          <p>If you choose to continue through Instagram, WhatsApp, Kakao or another external service, information sent there is also handled under that service&apos;s privacy terms. Our form does not automatically open a DM or send your inquiry through those services.</p>
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold text-ink-900">Questions or changes to your information</h2>
          <p>To ask about the information you submitted, correct your details or request its deletion, contact ETHNIC HOUSE through our <a href={instagramDmUrl} target="_blank" rel="noreferrer" className="font-medium text-moss-700 underline underline-offset-2">Instagram</a> and include your inquiry number if you have one. Please do not post your personal information publicly.</p>
        </div>
        <Link href="/booking" className="inline-flex min-h-11 items-center font-semibold text-moss-700 underline underline-offset-4">Back to the tattoo inquiry form</Link>
      </div>
    </section>
  );
}