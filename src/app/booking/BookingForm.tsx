"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createBookingRequest, type BookingFormState } from "./actions";

const initialState: BookingFormState = {
  ok: false,
  message: ""
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Submitting..." : "Submit booking request"}
    </button>
  );
}

type BookingFormProps = {
  artists: { id: string; name: string }[];
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  preferred_artist_id?: string;
};

export function BookingForm({
  artists,
  source,
  utm_source,
  utm_medium,
  utm_campaign,
  preferred_artist_id
}: BookingFormProps) {
  const [state, formAction] = useFormState(createBookingRequest, initialState);

  return (
    <form action={formAction} className="grid gap-5 rounded-lg border border-ink-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="source" value={source ?? ""} />
      <input type="hidden" name="utm_source" value={utm_source ?? ""} />
      <input type="hidden" name="utm_medium" value={utm_medium ?? ""} />
      <input type="hidden" name="utm_campaign" value={utm_campaign ?? ""} />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Name
          <input name="name" required className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Nationality
          <input name="nationality" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Language
          <input name="language" placeholder="English" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Email
          <input name="email" type="email" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          WhatsApp
          <input name="whatsapp" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-ink-900">
        Instagram
        <input name="instagram" placeholder="@yourhandle" className="rounded-md border border-ink-100 px-3 py-2" />
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Arrival date
          <input name="travel_start" type="date" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Departure date
          <input name="travel_end" type="date" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Preferred tattoo date
          <input name="preferred_date" type="date" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Preferred time
          <input name="preferred_time" placeholder="Morning / afternoon" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Style
          <select name="style" required className="rounded-md border border-ink-100 px-3 py-2">
            <option value="">Choose style</option>
            <option value="fine-line">Fine-line</option>
            <option value="lettering">Lettering</option>
            <option value="small tattoo">Small tattoo</option>
            <option value="blackwork">Blackwork</option>
            <option value="korean-inspired">Korean-inspired</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Preferred artist
          <select
            name="preferred_artist_id"
            defaultValue={preferred_artist_id ?? ""}
            className="rounded-md border border-ink-100 px-3 py-2"
          >
            <option value="">No preference</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Size
          <input name="size_cm" placeholder="Example: 5 cm" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Placement
          <input name="placement" placeholder="Example: inner arm" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Budget KRW
          <input name="budget_krw" type="number" min="0" step="10000" className="rounded-md border border-ink-100 px-3 py-2" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-ink-900">
        Reference image URL
        <input
          name="reference_image_url"
          type="url"
          placeholder="Instagram, Pinterest, image link, or portfolio reference"
          className="rounded-md border border-ink-100 px-3 py-2"
        />
      </label>

      <label className="flex items-start gap-3 text-sm leading-6 text-ink-700">
        <input name="privacy_agreement" type="checkbox" required className="mt-1" />
        <span>
          I agree that Seoul Ink Booking may use my submitted information to review this booking
          request and share relevant details with a matched artist or partner studio.
        </span>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton />
        {state.message ? (
          <p className={state.ok ? "text-sm font-medium text-moss-700" : "text-sm font-medium text-red-700"}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

