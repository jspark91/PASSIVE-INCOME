"use client";

import { FormEvent, useState } from "react";
import { Copy, Instagram, MessageCircle } from "lucide-react";
import { instagramDmUrl, instagramProfileUrl } from "@/lib/site";

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
    "Hi ETHNIC HOUSE, I would like to book a tattoo in Seoul.",
    "",
    `Name: ${formText(formData, "name")}`,
    `Instagram: ${formText(formData, "instagram")}`,
    `Date in Seoul: ${formText(formData, "visit_date") || "-"}`,
    `Preferred artist: ${preferredArtistId ? artistName(artists, preferredArtistId) : "No preference"}`,
    `Selected work: ${preferredDesignTitle || formText(formData, "preferred_design_id") || "-"}`,
    "",
    "Tattoo idea:",
    formText(formData, "idea") || "-"
  ];

  return lines.join("\n");
}

function buildInstagramDmUrl(message: string) {
  try {
    const url = new URL(instagramDmUrl);
    url.searchParams.set("text", message);

    return url.toString();
  } catch {
    return instagramDmUrl;
  }
}

export function BookingForm({
  artists,
  preferred_artist_id,
  preferred_design_id,
  preferred_design_title,
  initial_style,
  kakaoChannelUrl
}: BookingFormProps) {
  const [dmMessage, setDmMessage] = useState("");
  const [dmHref, setDmHref] = useState(instagramDmUrl);
  const [copyState, setCopyState] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = buildDmMessage(new FormData(event.currentTarget), artists, preferred_design_title);
    const nextDmHref = buildInstagramDmUrl(message);
    const copyPromise = navigator.clipboard?.writeText
      ? navigator.clipboard.writeText(message)
      : Promise.reject(new Error("Clipboard API is unavailable."));
    const dmWindow = window.open(nextDmHref, "_blank", "noopener,noreferrer");

    setDmMessage(message);
    setDmHref(nextDmHref);
    setCopyState("");

    try {
      await copyPromise;
      setCopyState(
        dmWindow
          ? "Request copied and DM opened. If Instagram does not paste automatically, paste the copied request."
          : "Request copied. Open Instagram DM below and paste it."
      );
    } catch {
      setCopyState("Instagram DM opened. If the text is missing, copy the request below and paste it.");
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
      setCopyState("Copy failed. Select the message manually.");
    }
  }

  return (
    <div className="grid gap-5">
      <form
        onSubmit={handleSubmit}
        className="grid min-w-0 max-w-full gap-5 overflow-hidden border border-ink-100 bg-white p-5 shadow-sm sm:p-6"
      >
        <input type="hidden" name="preferred_design_id" value={preferred_design_id ?? ""} />

        {preferred_design_title ? (
          <div className="border border-ink-100 bg-ink-50 p-3 text-sm text-ink-700">
            Selected work: <span className="font-semibold text-ink-900">{preferred_design_title}</span>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid min-w-0 gap-2 text-sm font-medium text-ink-900">
            Name
            <input name="name" required className="min-w-0 border border-ink-100 px-3 py-2" />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-medium text-ink-900">
            Instagram
            <input name="instagram" required placeholder="@yourhandle" className="min-w-0 border border-ink-100 px-3 py-2" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid min-w-0 gap-2 text-sm font-medium text-ink-900">
            Date in Seoul
            <input name="visit_date" placeholder="May 12 / flexible" className="min-w-0 border border-ink-100 px-3 py-2" />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-medium text-ink-900">
            Artist
            <select
              name="preferred_artist_id"
              defaultValue={preferred_artist_id ?? ""}
              className="min-w-0 border border-ink-100 px-3 py-2"
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

        <label className="grid min-w-0 gap-2 text-sm font-medium text-ink-900">
          Tattoo idea
          <textarea
            name="idea"
            required
            rows={5}
            defaultValue={initial_style ? `Style: ${initial_style}\n` : ""}
            placeholder="Style, size, placement, and reference link."
            className="min-w-0 border border-ink-100 px-3 py-2 leading-6"
          />
        </label>

        <label className="flex items-start gap-3 text-sm leading-6 text-ink-700">
          <input name="privacy_agreement" type="checkbox" required className="mt-1" />
          <span>I agree to send this request to ETHNIC HOUSE by DM.</span>
        </label>

        <button type="submit" className="bg-ink-900 px-5 py-3 text-sm font-semibold text-white">
          Open Instagram DM with request
        </button>
      </form>

      {dmMessage ? (
        <section className="border border-ink-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-ink-900">Message ready</h2>
          <textarea
            readOnly
            value={dmMessage}
            rows={9}
            className="mt-4 w-full border border-ink-100 px-3 py-2 text-sm leading-6 text-ink-900"
          />
          {copyState ? <p className="mt-3 text-sm font-medium text-moss-700">{copyState}</p> : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={copyMessage}
              className="inline-flex items-center justify-center gap-2 border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-900"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
            <a
              href={dmHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-ink-900 px-4 py-3 text-sm font-semibold text-white"
            >
              <Instagram className="h-4 w-4" />
              Open DM
            </a>
            {kakaoChannelUrl ? (
              <a
                href={kakaoChannelUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-900"
              >
                <MessageCircle className="h-4 w-4" />
                Kakao
              </a>
            ) : (
              <a
                href={instagramProfileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-900"
              >
                Profile
              </a>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
