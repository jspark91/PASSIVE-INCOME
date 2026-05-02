"use client";

import { FormEvent, useState } from "react";
import { Copy, Instagram, MessageCircle } from "lucide-react";

const INSTAGRAM_DM_URL = "https://ig.me/m/ETHNIC_HOUSE_SILLIM";
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/ETHNIC_HOUSE_SILLIM/";

type BookingFormProps = {
  artists: { id: string; name: string }[];
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  preferred_artist_id?: string;
  preferred_design_id?: string;
  preferred_design_title?: string;
  initial_style?: string;
  kakaoChannelUrl?: string;
};

function formText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function artistName(artists: BookingFormProps["artists"], artistId: string) {
  return artists.find((artist) => artist.id === artistId)?.name ?? artistId;
}

function buildDmMessage(
  formData: FormData,
  artists: BookingFormProps["artists"],
  preferredDesignTitle?: string
) {
  const preferredArtistId = formText(formData, "preferred_artist_id");
  const lines = [
    "Hi ETHNIC HOUSE, I would like to request a tattoo booking.",
    "",
    `Name: ${formText(formData, "name")}`,
    `Nationality: ${formText(formData, "nationality") || "-"}`,
    `Language: ${formText(formData, "language") || "English"}`,
    `Instagram: ${formText(formData, "instagram") || "-"}`,
    `Email: ${formText(formData, "email") || "-"}`,
    `WhatsApp: ${formText(formData, "whatsapp") || "-"}`,
    "",
    `Travel dates: ${formText(formData, "travel_start") || "-"} to ${formText(formData, "travel_end") || "-"}`,
    `Preferred tattoo date: ${formText(formData, "preferred_date") || "-"}`,
    `Preferred time: ${formText(formData, "preferred_time") || "-"}`,
    "",
    `Selected flash: ${preferredDesignTitle || formText(formData, "preferred_design_id") || "-"}`,
    `Style: ${formText(formData, "style") || "-"}`,
    `Preferred artist: ${preferredArtistId ? artistName(artists, preferredArtistId) : "No preference"}`,
    `Size: ${formText(formData, "size_cm") || "-"}`,
    `Placement: ${formText(formData, "placement") || "-"}`,
    `Budget USD: ${formText(formData, "budget_usd") ? `$${formText(formData, "budget_usd")}` : "-"}`,
    `Reference URL: ${formText(formData, "reference_image_url") || "-"}`,
    "",
    `Source: ${formText(formData, "source") || "-"}`,
    `UTM: ${formText(formData, "utm_source") || "-"} / ${formText(formData, "utm_medium") || "-"} / ${formText(formData, "utm_campaign") || "-"}`
  ];

  return lines.join("\n");
}

export function BookingForm({
  artists,
  source,
  utm_source,
  utm_medium,
  utm_campaign,
  preferred_artist_id,
  preferred_design_id,
  preferred_design_title,
  initial_style,
  kakaoChannelUrl
}: BookingFormProps) {
  const [dmMessage, setDmMessage] = useState("");
  const [copyState, setCopyState] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const message = buildDmMessage(formData, artists, preferred_design_title);
    const dmWindow = window.open(INSTAGRAM_DM_URL, "_blank", "noopener,noreferrer");

    setDmMessage(message);
    setCopyState("");

    try {
      await navigator.clipboard.writeText(message);
      setCopyState(
        dmWindow
          ? "Message copied. Instagram DM opened; paste the message there."
          : "Message copied. If Instagram DM did not open, use the button below."
      );
    } catch {
      setCopyState(
        dmWindow
          ? "Instagram DM opened. Copy the message below, then paste it there."
          : "Copy the message below, then paste it into Instagram DM."
      );
    }
  }

  async function copyMessage() {
    if (!dmMessage) {
      return;
    }

    try {
      await navigator.clipboard.writeText(dmMessage);
      setCopyState("Message copied.");
    } catch {
      setCopyState("Copy failed. Please select the message manually.");
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="grid gap-5 rounded-lg border border-ink-100 bg-white p-6 shadow-sm">
        <input type="hidden" name="source" value={source ?? ""} />
        <input type="hidden" name="utm_source" value={utm_source ?? ""} />
        <input type="hidden" name="utm_medium" value={utm_medium ?? ""} />
        <input type="hidden" name="utm_campaign" value={utm_campaign ?? ""} />
        <input type="hidden" name="preferred_design_id" value={preferred_design_id ?? ""} />

        {preferred_design_title ? (
          <div className="rounded-md bg-ink-50 p-4 text-sm text-ink-700">
            Selected flash concept: <span className="font-semibold text-ink-900">{preferred_design_title}</span>
          </div>
        ) : null}

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
            <select
              name="style"
              required
              defaultValue={initial_style ?? ""}
              className="rounded-md border border-ink-100 px-3 py-2"
            >
              <option value="">Choose style</option>
              <option value="fine-line">Fine-line</option>
              <option value="lettering">Lettering</option>
              <option value="small tattoo">Small tattoo</option>
              <option value="blackwork">Blackwork</option>
              <option value="abstract brushwork">Abstract brushwork</option>
              <option value="moon">Moon</option>
              <option value="butterfly">Butterfly</option>
              <option value="realism">Realism</option>
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
            Budget USD
            <input
              name="budget_usd"
              type="number"
              min="0"
              step="10"
              placeholder="Example: 100"
              className="rounded-md border border-ink-100 px-3 py-2"
            />
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
            I agree to send this booking request to ETHNIC HOUSE through Instagram DM or Kakao.
          </span>
        </label>

        <button type="submit" className="rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white">
          Copy request and open Instagram DM
        </button>
      </form>

      {dmMessage ? (
        <section className="rounded-lg border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink-900">Send this request by DM</h2>
          <p className="mt-2 text-sm leading-6 text-ink-700">
            Instagram does not reliably support pre-filled DM text, so this page copies the request
            first and opens ETHNIC HOUSE DM for you.
          </p>
          <textarea
            readOnly
            value={dmMessage}
            rows={14}
            className="mt-4 w-full rounded-md border border-ink-100 px-3 py-2 text-sm leading-6 text-ink-900"
          />
          {copyState ? <p className="mt-3 text-sm font-medium text-moss-700">{copyState}</p> : null}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={copyMessage}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-900"
            >
              <Copy className="h-4 w-4" />
              Copy message
            </button>
            <a
              href={INSTAGRAM_DM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
            >
              <Instagram className="h-4 w-4" />
              Open Instagram DM
            </a>
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-900"
            >
              Open profile
            </a>
            {kakaoChannelUrl ? (
              <a
                href={kakaoChannelUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-900"
              >
                <MessageCircle className="h-4 w-4" />
                Open Kakao
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
