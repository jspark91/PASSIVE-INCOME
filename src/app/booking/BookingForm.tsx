"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Copy, ImagePlus, Instagram, LoaderCircle, X } from "lucide-react";
import { instagramDmUrl } from "@/lib/site";

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
type FieldErrors = Record<string, string>;
type ReferenceImage = { id: string; file: File; preview: string };
type VisitorStatus = "planning_trip" | "visiting" | "resident";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const STYLES = ["Not sure", "Fine line", "Blackwork", "Black and grey", "Realism", "Lettering", "Ornamental", "Illustrative", "Watercolor", "Irezumi / Japanese traditional", "Other"];
const HINTED_FIELDS = new Set(["email", "placement", "preferred_time", "budget_krw", "description", "reference_image_url"]);
const inputClass = "min-h-11 w-full min-w-0 rounded-none border border-ink-100 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-700/60 focus:border-moss-700 focus:ring-1 focus:ring-moss-700 disabled:bg-ink-50 disabled:text-ink-700/60";

function formText(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}

function Field({ name, label, required, hint, error, children }: {
  name: string; label: string; required?: boolean; hint?: string; error?: string; children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={`booking-${name}`} className="mb-1.5 block text-sm font-medium text-ink-900">
        {label}{required ? <span aria-hidden="true" className="ml-1 text-moss-700">*</span> : <span className="ml-1 font-normal text-ink-700/75">(optional)</span>}
      </label>
      {children}
      {hint ? <p id={`booking-${name}-hint`} className="mt-1.5 text-xs leading-5 text-ink-700">{hint}</p> : null}
      {error ? <p id={`booking-${name}-error`} className="mt-1.5 text-sm text-red-800">{error}</p> : null}
    </div>
  );
}

function FormSection({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 border-b border-ink-100 pb-7">
      <legend className="mb-5 flex w-full items-center gap-3 text-xl font-semibold text-ink-900">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-moss-700/25 text-xs font-medium text-moss-700">{number}</span>{title}
      </legend>
      <div className="grid gap-4">{children}</div>
    </fieldset>
  );
}

function normalizeErrors(value: unknown): FieldErrors {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(Object.entries(value).flatMap(([key, message]) => {
    const text = Array.isArray(message) ? message.filter((item) => typeof item === "string").join(" ") : message;
    return typeof text === "string" && text ? [[key, text]] : [];
  }));
}

function validateRequest(data: FormData): FieldErrors {
  const errors: FieldErrors = {};
  if (formText(data, "name").length < 2 || formText(data, "name").length > 100) errors.name = "Please enter your name in 2 to 100 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formText(data, "email"))) errors.email = "Please enter a valid email address.";
  for (const key of ["phone", "whatsapp"]) {
    const value = formText(data, key);
    if (value && (value.length > 40 || !/^[+\d().\s-]+$/.test(value) || value.replace(/\D/g, "").length < 6)) errors[key] = "Please enter a phone number with a country code.";
  }
  const visitor = formText(data, "visitor_status");
  if (!["planning_trip", "visiting", "resident"].includes(visitor)) errors.visitor_status = "Please choose your visit status.";
  if (visitor !== "resident" && data.get("dates_flexible") !== "true") {
    if (!formText(data, "travel_start")) errors.travel_start = "Please add your arrival date or choose flexible dates.";
    if (!formText(data, "travel_end")) errors.travel_end = "Please add your departure date or choose flexible dates.";
    if (formText(data, "travel_start") && formText(data, "travel_end") && formText(data, "travel_end") < formText(data, "travel_start")) errors.travel_end = "Departure must be on or after your arrival date.";
  }
  const preferredDate = formText(data, "preferred_date");
  if (preferredDate && ((formText(data, "travel_start") && preferredDate < formText(data, "travel_start")) || (formText(data, "travel_end") && preferredDate > formText(data, "travel_end")))) errors.preferred_date = "Please choose a tattoo date within your stay in Korea.";
  if (!formText(data, "style")) errors.style = "Please choose a style. Not sure is welcome, too.";
  if (!formText(data, "placement")) errors.placement = "Please tell us where you would like the tattoo.";
  if (data.get("size_unsure") !== "true") {
    for (const key of ["size_width_cm", "size_height_cm"]) {
      const value = Number(formText(data, key));
      if (!/^\d+(?:\.\d+)?$/.test(formText(data, key)) || !Number.isFinite(value) || value <= 0 || value > 200) errors[key] = "Enter a size greater than 0 and up to 200 cm, or choose not sure.";
    }
  }
  const budget = Number(formText(data, "budget_krw"));
  if (formText(data, "budget_krw") && (!/^\d+(?:\.\d+)?$/.test(formText(data, "budget_krw")) || !Number.isInteger(budget) || budget < 1 || budget > 2147483647)) errors.budget_krw = "Please enter a whole KRW amount from 1 to 2,147,483,647, or leave this blank.";
  const description = formText(data, "description");
  if (description.length < 10 || description.length > 4000) errors.description = "Please describe your idea in 10 to 4,000 characters.";
  const referenceUrl = formText(data, "reference_image_url");
  if (referenceUrl) {
    try {
      if (!["http:", "https:"].includes(new URL(referenceUrl).protocol)) throw new Error("Invalid protocol");
    } catch { errors.reference_image_url = "Please use a complete http:// or https:// link."; }
  }
  if (data.get("age_confirmation") !== "true") errors.age_confirmation = "Please confirm that you are at least 18 years old.";
  if (data.get("privacy_agreement") !== "true") errors.privacy_agreement = "Please agree to the use of your details for this inquiry.";
  return errors;
}

function buildSummary(data: FormData, artists: BookingFormProps["artists"], id: string) {
  const artist = artists.find((item) => item.id === formText(data, "preferred_artist_id"))?.name;
  return [
    `ETHNIC HOUSE inquiry ${id}`,
    `Name: ${formText(data, "name")}`,
    `Email: ${formText(data, "email")}`,
    `Visit: ${formText(data, "visitor_status").replaceAll("_", " ")}`,
    `Travel dates: ${data.get("dates_flexible") === "true" ? "Flexible / not decided" : [formText(data, "travel_start"), formText(data, "travel_end")].filter(Boolean).join(" to ") || "Korea resident"}`,
    `Preferred appointment: ${[formText(data, "preferred_date"), formText(data, "preferred_time")].filter(Boolean).join(" ") || "Flexible"}`,
    `Style: ${formText(data, "style")}`,
    `Placement: ${formText(data, "placement")}`,
    `Size: ${data.get("size_unsure") === "true" ? "Not sure" : `${formText(data, "size_width_cm")} × ${formText(data, "size_height_cm")} cm`}`,
    `Budget: ${formText(data, "budget_krw") ? `${formText(data, "budget_krw")} KRW` : "Not decided"}`,
    `Artist: ${artist || "Please recommend an artist"}`,
    ...(formText(data, "preferred_design_title") ? [`Selected work: ${formText(data, "preferred_design_title")}`] : []),
    "", formText(data, "description")
  ].join("\n");
}

export function BookingForm(props: BookingFormProps) {
  const { artists, preferred_artist_id, preferred_design_id, preferred_design_title, initial_style, kakaoChannelUrl } = props;
  const [visitorStatus, setVisitorStatus] = useState<VisitorStatus>("planning_trip");
  const [datesFlexible, setDatesFlexible] = useState(false);
  const [sizeUnsure, setSizeUnsure] = useState(false);
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<{ id: string; message: string; summary: string } | null>(null);
  const [copyState, setCopyState] = useState("");
  const submitLock = useRef(false);
  const previewUrls = useRef(new Set<string>());
  const successRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const urls = previewUrls.current;
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);
  useEffect(() => { if (success) successRef.current?.focus(); }, [success]);

  function clearError(name: string) {
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }
  function fieldProps(name: string) {
    const describedBy = [fieldErrors[name] ? `booking-${name}-error` : "", HINTED_FIELDS.has(name) ? `booking-${name}-hint` : ""].filter(Boolean).join(" ");
    return {
      id: `booking-${name}`, name,
      className: `${inputClass}${fieldErrors[name] ? " border-red-700" : ""}`,
      "aria-invalid": fieldErrors[name] ? true : undefined,
      "aria-describedby": describedBy || undefined,
      onChange: () => clearError(name)
    };
  }
  function addReferences(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files);
    let error = "";
    if (references.length + selected.length > 3) error = "You can attach up to 3 images. Remove one before adding another.";
    else if (selected.some((file) => !IMAGE_TYPES.includes(file.type))) error = "Please choose JPEG, PNG or WebP images.";
    else if (selected.some((file) => file.size > MAX_IMAGE_BYTES)) error = "Each image must be 2 MB or smaller.";
    else if (selected.some((file) => file.size === 0)) error = "An image appears to be empty. Please choose another file.";
    if (error) { setFieldErrors((current) => ({ ...current, references: error })); return; }
    const additions = selected.map((file) => {
      const preview = URL.createObjectURL(file);
      previewUrls.current.add(preview);
      return { file, preview, id: preview };
    });
    setReferences((current) => [...current, ...additions]);
    clearError("references");
  }
  function removeReference(id: string) {
    URL.revokeObjectURL(id);
    previewUrls.current.delete(id);
    setReferences((current) => current.filter((item) => item.id !== id));
    clearError("references");
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;
    const data = new FormData(event.currentTarget);
    references.forEach((item) => data.append("references", item.file));
    const errors = validateRequest(data);
    setFieldErrors(errors);
    setGlobalError("");
    if (Object.keys(errors).length) {
      setGlobalError("Please check the highlighted details below.");
      document.getElementById(`booking-${Object.keys(errors)[0]}`)?.focus();
      return;
    }
    submitLock.current = true;
    setSending(true);
    try {
      const response = await fetch("/api/booking-inquiries", { method: "POST", body: data });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true || typeof result.id !== "string") {
        const serverErrors = normalizeErrors(result?.fieldErrors);
        setFieldErrors(serverErrors);
        setGlobalError(typeof result?.message === "string" ? result.message : "Your inquiry could not be sent. Please try again. Your details are still here.");
        if (Object.keys(serverErrors).length) document.getElementById(`booking-${Object.keys(serverErrors)[0]}`)?.focus();
        return;
      }
      setSuccess({ id: result.id, message: typeof result.message === "string" ? result.message : "Your inquiry has been received.", summary: buildSummary(data, artists, result.id) });
      try {
        const analytics = window as Window & { gtag?: (...args: unknown[]) => void };
        analytics.gtag?.("event", "generate_lead", { form_id: "tattoo_inquiry" });
      } catch { /* Analytics must never interrupt a saved inquiry. */ }
    } catch {
      setGlobalError("We could not confirm your submission. Please check your connection and try again. Your details are still here.");
    } finally {
      submitLock.current = false;
      setSending(false);
    }
  }
  async function copySummary() {
    if (!success) return;
    try { await navigator.clipboard.writeText(success.summary); setCopyState("Inquiry summary copied."); }
    catch { setCopyState("Copy is unavailable. You can select your summary below."); }
  }

  const styles = initial_style && !STYLES.includes(initial_style) ? [initial_style, ...STYLES] : STYLES;
  const hasTravelDates = visitorStatus !== "resident";
  if (success) {
    return (
      <section ref={successRef} tabIndex={-1} className="min-w-0 border border-ink-100 bg-white p-6 outline-none sm:p-8" aria-labelledby="inquiry-success-heading">
        <CheckCircle2 className="h-9 w-9 text-moss-700" aria-hidden="true" />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-moss-700">Inquiry received</p>
        <h2 id="inquiry-success-heading" className="mt-2 text-3xl font-semibold text-ink-900">Your tattoo plans start here.</h2>
        <p className="mt-4 leading-7 text-ink-700">{success.message}</p>
        <div className="my-6 border-y border-ink-100 py-4"><p className="text-xs uppercase tracking-wider text-ink-700">Your inquiry number</p><p className="mt-1 break-all font-mono text-sm font-semibold text-ink-900">{success.id}</p></div>
        <h3 className="font-semibold text-ink-900">What happens next</h3>
        <p className="mt-2 text-sm leading-6 text-ink-700">We will review your idea, check with a suitable artist, and contact you using the details you provided. You can review the artist, quote, date and studio location before confirming an appointment.</p>
        <p className="mt-3 text-sm leading-6 text-ink-700">This is an inquiry, not a confirmed booking. Keep your inquiry number if you contact us about your request.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={copySummary} className="inline-flex min-h-11 items-center justify-center gap-2 bg-ink-900 px-4 py-3 text-sm font-semibold text-white"><Copy className="h-4 w-4" aria-hidden="true" />Copy summary</button>
          <a href={instagramDmUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 border border-ink-100 px-4 py-3 text-sm font-semibold text-ink-900"><Instagram className="h-4 w-4" aria-hidden="true" />Follow up on Instagram</a>
          {kakaoChannelUrl ? <a href={kakaoChannelUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center border border-ink-100 px-4 py-3 text-sm font-semibold text-ink-900">Kakao</a> : null}
        </div>
        <p role="status" className="mt-3 text-sm text-moss-700">{copyState}</p>
        <details className="mt-5 border-t border-ink-100 pt-4" open={copyState.startsWith("Copy is unavailable") || undefined}>
          <summary className="cursor-pointer text-sm font-medium text-ink-900">View your inquiry summary</summary>
          <textarea aria-label="Your saved inquiry summary" readOnly value={success.summary} rows={11} className={`${inputClass} mt-3 resize-y leading-6`} onFocus={(event) => event.currentTarget.select()} />
        </details>
      </section>
    );
  }
  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={sending} className="min-w-0 border border-ink-100 bg-white p-5 sm:p-8">
      <input type="hidden" name="preferred_design_id" value={preferred_design_id ?? ""} />
      <input type="hidden" name="preferred_design_title" value={preferred_design_title ?? ""} />
      <input type="hidden" name="source" value={props.source ?? ""} />
      <input type="hidden" name="utm_source" value={props.utm_source ?? ""} />
      <input type="hidden" name="utm_medium" value={props.utm_medium ?? ""} />
      <input type="hidden" name="utm_campaign" value={props.utm_campaign ?? ""} />
      <div className="hidden" aria-hidden="true"><label htmlFor="booking-website">Leave this field empty</label><input id="booking-website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-ink-100 pb-5"><h2 className="text-2xl font-semibold text-ink-900">Tell us what you have in mind</h2><p className="text-xs text-ink-700">* Required</p></div>
      {preferred_design_title ? <div className="mb-6 border-l-2 border-moss-700 bg-ink-50 px-4 py-3 text-sm leading-6 text-ink-700">Inspired by <span className="font-semibold text-ink-900">{preferred_design_title}</span><span className="block text-xs">We will include this work with your inquiry.</span></div> : null}
      {globalError ? <div role="alert" className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">{globalError}</div> : null}
      <fieldset disabled={sending} className="grid min-w-0 gap-7 disabled:opacity-70">
        <legend className="sr-only">Tattoo inquiry details</legend>
        <FormSection number="01" title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Your name" required error={fieldErrors.name}><input {...fieldProps("name")} required autoComplete="name" minLength={2} maxLength={100} /></Field>
            <Field name="email" label="Email address" required hint="We can use this to follow up on your inquiry." error={fieldErrors.email}><input {...fieldProps("email")} type="email" required autoComplete="email" maxLength={254} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="phone" label="Phone" error={fieldErrors.phone}><input {...fieldProps("phone")} type="tel" autoComplete="tel" placeholder="Include country code" maxLength={40} /></Field>
            <Field name="instagram" label="Instagram" error={fieldErrors.instagram}><input {...fieldProps("instagram")} autoComplete="off" placeholder="@yourhandle" maxLength={100} /></Field>
            <Field name="whatsapp" label="WhatsApp" error={fieldErrors.whatsapp}><input {...fieldProps("whatsapp")} type="tel" placeholder="Include country code" maxLength={40} /></Field>
          </div>
        </FormSection>
        <FormSection number="02" title="Your visit">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink-900">Which best describes your plans? <span aria-hidden="true" className="text-moss-700">*</span></legend>
            <div id="booking-visitor_status" className="grid gap-2 sm:grid-cols-3" tabIndex={-1}>
              {([["planning_trip", "Planning a trip"], ["visiting", "Already in Korea"], ["resident", "Living in Korea"]] as const).map(([value, label]) => <label key={value} className={`flex min-h-12 cursor-pointer items-center gap-2 border px-3 py-3 text-sm ${visitorStatus === value ? "border-moss-700 bg-moss-700/5 text-moss-700" : "border-ink-100 text-ink-700"}`}><input type="radio" name="visitor_status" value={value} checked={visitorStatus === value} onChange={() => { setVisitorStatus(value); clearError("visitor_status"); }} required className="h-4 w-4 shrink-0 accent-moss-700" />{label}</label>)}
            </div>
            {fieldErrors.visitor_status ? <p className="mt-1.5 text-sm text-red-800">{fieldErrors.visitor_status}</p> : null}
          </fieldset>
          {hasTravelDates ? <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="travel_start" label="Arrival in Korea" required={!datesFlexible} error={fieldErrors.travel_start}><input {...fieldProps("travel_start")} type="date" required={!datesFlexible} disabled={datesFlexible} /></Field>
              <Field name="travel_end" label="Departure from Korea" required={!datesFlexible} error={fieldErrors.travel_end}><input {...fieldProps("travel_end")} type="date" required={!datesFlexible} disabled={datesFlexible} /></Field>
            </div>
            <label className="flex items-start gap-2.5 text-sm leading-6 text-ink-700"><input type="checkbox" name="dates_flexible" value="true" checked={datesFlexible} onChange={(event) => { setDatesFlexible(event.target.checked); clearError("travel_start"); clearError("travel_end"); }} className="mt-1 h-4 w-4 shrink-0 accent-moss-700" /><span>My travel dates are flexible or not decided yet.</span></label>
          </> : <p className="text-sm leading-6 text-ink-700">Let us know your preferred appointment below. Our current booking support is for Seoul.</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="preferred_date" label="Preferred tattoo date" error={fieldErrors.preferred_date}><input {...fieldProps("preferred_date")} type="date" /></Field>
            <Field name="preferred_time" label="Preferred time" hint="Seoul local time. Availability will be checked." error={fieldErrors.preferred_time}><input {...fieldProps("preferred_time")} type="time" /></Field>
          </div>
        </FormSection>
        <FormSection number="03" title="Your tattoo">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="style" label="Style" required error={fieldErrors.style}><select {...fieldProps("style")} required defaultValue={initial_style || "Not sure"}>{styles.map((style) => <option key={style} value={style}>{style}</option>)}</select></Field>
            <Field name="placement" label="Placement" required hint="For example: inner forearm, ankle or upper back." error={fieldErrors.placement}><input {...fieldProps("placement")} required maxLength={200} placeholder="Where on your body?" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="size_width_cm" label="Approx. width (cm)" required={!sizeUnsure} error={fieldErrors.size_width_cm}><input {...fieldProps("size_width_cm")} type="number" min="0.01" max="200" step="any" inputMode="decimal" placeholder="e.g. 5" required={!sizeUnsure} disabled={sizeUnsure} /></Field>
            <Field name="size_height_cm" label="Approx. height (cm)" required={!sizeUnsure} error={fieldErrors.size_height_cm}><input {...fieldProps("size_height_cm")} type="number" min="0.01" max="200" step="any" inputMode="decimal" placeholder="e.g. 8" required={!sizeUnsure} disabled={sizeUnsure} /></Field>
          </div>
          <label className="flex items-start gap-2.5 text-sm leading-6 text-ink-700"><input name="size_unsure" type="checkbox" value="true" checked={sizeUnsure} onChange={(event) => { setSizeUnsure(event.target.checked); clearError("size_width_cm"); clearError("size_height_cm"); }} className="mt-1 h-4 w-4 shrink-0 accent-moss-700" /><span>I am not sure about the size. Please help me choose.</span></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="budget_krw" label="Approx. budget (KRW)" hint="Leave blank if you would like guidance. This is not a quote." error={fieldErrors.budget_krw}><input {...fieldProps("budget_krw")} type="number" min="1" max="2147483647" step="1" inputMode="numeric" placeholder="e.g. 300000" /></Field>
            <Field name="preferred_artist_id" label="Artist preference" error={fieldErrors.preferred_artist_id}><select {...fieldProps("preferred_artist_id")} defaultValue={artists.some((artist) => artist.id === preferred_artist_id) ? preferred_artist_id : ""}><option value="">Please recommend an artist</option>{artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.name}</option>)}</select></Field>
          </div>
          <Field name="description" label="Tell us about your idea" required hint="Include the subject, details that matter to you, and any questions. 10–4,000 characters." error={fieldErrors.description}><textarea {...fieldProps("description")} required minLength={10} maxLength={4000} rows={4} placeholder="What would you like to get? Tell us what you love about the idea or reference images." className={`${inputClass} resize-y leading-6${fieldErrors.description ? " border-red-700" : ""}`} /></Field>
        </FormSection>
        <FormSection number="04" title="References">
          <p className="-mt-2 text-sm leading-6 text-ink-700">A few images can help us understand your direction. References are optional and are used to discuss your own tattoo.</p>
          <div>
            <label htmlFor="booking-references" className="relative flex min-h-24 cursor-pointer items-center justify-center gap-3 border border-dashed border-ink-300 bg-ink-50/50 px-4 py-5 text-center focus-within:border-moss-700 focus-within:ring-1 focus-within:ring-moss-700">
              <ImagePlus className="h-5 w-5 shrink-0 text-moss-700" aria-hidden="true" /><span><span className="block text-sm font-medium text-ink-900">Add reference images</span><span id="booking-references-hint" className="mt-1 block text-xs leading-5 text-ink-700">Up to 3 images · JPEG, PNG or WebP · 2 MB each</span></span>
              <input id="booking-references" type="file" multiple accept="image/jpeg,image/png,image/webp" aria-invalid={fieldErrors.references ? true : undefined} aria-describedby={`booking-references-hint${fieldErrors.references ? " booking-references-error" : ""}`} className="absolute inset-0 cursor-pointer opacity-0" onChange={(event) => { addReferences(event.target.files); event.currentTarget.value = ""; }} />
            </label>
            {fieldErrors.references ? <p id="booking-references-error" role="alert" className="mt-1.5 text-sm text-red-800">{fieldErrors.references}</p> : null}
            {references.length ? <ul className="mt-3 grid grid-cols-3 gap-3">{references.map((item) => <li key={item.id} className="relative min-w-0 border border-ink-100 p-1.5">
              {/* The visitor's local reference preview never leaves the browser until submission. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.preview} alt={`Reference preview: ${item.file.name}`} className="aspect-square w-full bg-ink-50 object-cover" />
              <p className="mt-1 truncate text-xs text-ink-700" title={item.file.name}>{item.file.name}</p><button type="button" aria-label={`Remove ${item.file.name}`} onClick={() => removeReference(item.id)} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center border border-ink-100 bg-white text-ink-900 shadow-sm"><X className="h-4 w-4" aria-hidden="true" /></button>
            </li>)}</ul> : null}
          </div>
          <Field name="reference_image_url" label="Reference link" hint="You can also share an Instagram post, moodboard or other image link." error={fieldErrors.reference_image_url}><input {...fieldProps("reference_image_url")} type="url" placeholder="https://" maxLength={2048} /></Field>
        </FormSection>
        <fieldset className="grid gap-3">
          <legend className="mb-4 text-lg font-semibold text-ink-900">Before you send</legend>
          <div>
            <label className="flex items-start gap-3 text-sm leading-6 text-ink-700"><input id="booking-age_confirmation" name="age_confirmation" type="checkbox" value="true" required onChange={() => clearError("age_confirmation")} aria-invalid={fieldErrors.age_confirmation ? true : undefined} aria-describedby={fieldErrors.age_confirmation ? "booking-age_confirmation-error" : undefined} className="mt-1 h-4 w-4 shrink-0 accent-moss-700" /><span>I confirm that I am at least 18 years old. <span aria-hidden="true">*</span></span></label>
            {fieldErrors.age_confirmation ? <p id="booking-age_confirmation-error" className="ml-7 mt-1 text-sm text-red-800">{fieldErrors.age_confirmation}</p> : null}
          </div>
          <div>
            <label className="flex items-start gap-3 text-sm leading-6 text-ink-700"><input id="booking-privacy_agreement" name="privacy_agreement" type="checkbox" value="true" required onChange={() => clearError("privacy_agreement")} aria-invalid={fieldErrors.privacy_agreement ? true : undefined} aria-describedby={fieldErrors.privacy_agreement ? "booking-privacy_agreement-error" : undefined} className="mt-1 h-4 w-4 shrink-0 accent-moss-700" /><span>I agree to ETHNIC HOUSE storing and using my contact details, inquiry and reference images to handle this request, and sharing relevant details with an artist or partner studio for booking coordination, as described in the <Link href="/privacy" target="_blank" className="font-medium text-moss-700 underline underline-offset-2">privacy notice</Link>. <span aria-hidden="true">*</span></span></label>
            {fieldErrors.privacy_agreement ? <p id="booking-privacy_agreement-error" className="ml-7 mt-1 text-sm text-red-800">{fieldErrors.privacy_agreement}</p> : null}
          </div>
        </fieldset>
        <div>
          <button type="submit" disabled={sending} className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-ink-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-moss-700 disabled:cursor-wait disabled:opacity-70">{sending ? <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />Sending your inquiry…</> : <>Send tattoo inquiry<ArrowRight className="h-4 w-4" aria-hidden="true" /></>}</button>
          <p className="mt-3 text-center text-xs leading-5 text-ink-700">Sending this form does not confirm an appointment or require a payment.</p>
        </div>
      </fieldset>
    </form>
  );
}
