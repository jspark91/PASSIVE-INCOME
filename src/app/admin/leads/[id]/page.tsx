import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { getAdminAccess } from "@/lib/admin-session";
import { getArtists, getBookingRequest, getFlashDesigns, getLeadEvents } from "@/lib/data";
import { formatDate, formatKrw } from "@/lib/format";
import { getStatusLabel, leadStatuses } from "@/lib/status";
import { updateLeadStatus } from "../actions";

export default async function LeadDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ token?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { configured, allowed } = await getAdminAccess(query);

  if (!allowed) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Invalid or missing admin token.
        </div>
      </section>
    );
  }

  const lead = await getBookingRequest(id);

  if (!lead) {
    notFound();
  }

  const [artists, designs, events] = await Promise.all([
    getArtists(),
    getFlashDesigns(),
    getLeadEvents(lead.id)
  ]);
  const preferredDesign = designs.find((design) => design.id === lead.preferred_design_id);
  const preferredArtist = artists.find((artist) => artist.id === lead.preferred_artist_id);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link href="/admin/leads" className="text-sm font-semibold text-moss-700">
        Back to leads
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-ink-100 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-ink-700">{formatDate(lead.created_at)}</p>
              <h1 className="mt-2 text-3xl font-semibold text-ink-900">{lead.name}</h1>
            </div>
            <LeadStatusBadge status={lead.status} />
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-ink-900">Nationality</dt>
              <dd className="mt-1 text-ink-700">{lead.nationality ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Language</dt>
              <dd className="mt-1 text-ink-700">{lead.language ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Email</dt>
              <dd className="mt-1 text-ink-700">{lead.email ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Instagram</dt>
              <dd className="mt-1 text-ink-700">{lead.instagram ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">WhatsApp</dt>
              <dd className="mt-1 text-ink-700">{lead.whatsapp ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Budget</dt>
              <dd className="mt-1 text-ink-700">{formatKrw(lead.budget_krw)}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Travel dates</dt>
              <dd className="mt-1 text-ink-700">
                {formatDate(lead.travel_start)} - {formatDate(lead.travel_end)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Preferred date</dt>
              <dd className="mt-1 text-ink-700">{formatDate(lead.preferred_date)}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Style</dt>
              <dd className="mt-1 text-ink-700">{lead.style ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Placement</dt>
              <dd className="mt-1 text-ink-700">{lead.placement ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Preferred artist</dt>
              <dd className="mt-1 text-ink-700">{preferredArtist?.name ?? lead.preferred_artist_id ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Preferred design</dt>
              <dd className="mt-1 text-ink-700">{preferredDesign?.title ?? lead.preferred_design_id ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Reference</dt>
              <dd className="mt-1 text-ink-700">
                {lead.reference_image_url ? (
                  <a
                    href={lead.reference_image_url}
                    className="text-moss-700"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open reference
                  </a>
                ) : (
                  "-"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Quoted price</dt>
              <dd className="mt-1 text-ink-700">{formatKrw(lead.quoted_price_krw)}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink-900">Lost reason</dt>
              <dd className="mt-1 text-ink-700">{lead.lost_reason ?? "-"}</dd>
            </div>
          </dl>
          <div className="mt-6 rounded-lg bg-ink-50 p-4">
            <h2 className="font-semibold text-ink-900">Tracking</h2>
            <p className="mt-2 text-sm text-ink-700">
              source={lead.source ?? "-"} · utm_source={lead.utm_source ?? "-"} ·
              utm_medium={lead.utm_medium ?? "-"} · utm_campaign={lead.utm_campaign ?? "-"}
            </p>
          </div>
        </div>

        <aside className="rounded-lg border border-ink-100 bg-white p-6">
          <h2 className="text-xl font-semibold text-ink-900">Update lead</h2>
          {!configured ? (
            <p className="mt-4 text-sm leading-6 text-ink-700">
              Set Supabase and `ADMIN_ACCESS_TOKEN` before saving live status changes.
            </p>
          ) : (
            <form action={updateLeadStatus} className="mt-5 grid gap-4">
              <input type="hidden" name="lead_id" value={lead.id} />
              <label className="grid gap-2 text-sm font-medium text-ink-900">
                Status
                <select
                  name="status"
                  defaultValue={lead.status}
                  className="rounded-md border border-ink-100 px-3 py-2"
                >
                  {leadStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink-900">
                Matched artist
                <select
                  name="matched_artist_id"
                  defaultValue={lead.matched_artist_id ?? ""}
                  className="rounded-md border border-ink-100 px-3 py-2"
                >
                  <option value="">Not matched yet</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink-900">
                Quoted price KRW
                <input
                  name="quoted_price_krw"
                  type="number"
                  min="0"
                  step="10000"
                  defaultValue={lead.quoted_price_krw ?? ""}
                  className="rounded-md border border-ink-100 px-3 py-2"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink-900">
                Lost reason
                <select
                  name="lost_reason"
                  defaultValue={lead.lost_reason ?? ""}
                  className="rounded-md border border-ink-100 px-3 py-2"
                >
                  <option value="">None</option>
                  <option value="too_expensive">Too expensive</option>
                  <option value="date_unavailable">Date unavailable</option>
                  <option value="location_issue">Location issue</option>
                  <option value="no_response">No response</option>
                  <option value="artist_unavailable">Artist unavailable</option>
                  <option value="changed_mind">Changed mind</option>
                  <option value="legal_or_age_issue">Legal or age issue</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink-900">
                Note
                <textarea
                  name="note"
                  rows={5}
                  defaultValue={lead.memo ?? ""}
                  className="rounded-md border border-ink-100 px-3 py-2"
                />
              </label>
              <button className="rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white">
                Save status
              </button>
            </form>
          )}
        </aside>
      </div>

      <section className="mt-8 rounded-lg border border-ink-100 bg-white p-6">
        <h2 className="text-xl font-semibold text-ink-900">Lead timeline</h2>
        {events.length ? (
          <div className="mt-5 grid gap-4">
            {events.map((event) => (
              <article key={event.id} className="border-l-2 border-ink-100 pl-4">
                <p className="text-sm font-semibold text-ink-900">{event.event_type}</p>
                <p className="mt-1 text-sm text-ink-700">{event.note ?? "-"}</p>
                <p className="mt-1 text-xs text-ink-700">
                  {formatDate(event.created_at)} / {event.created_by ?? "system"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-700">No events recorded yet.</p>
        )}
      </section>
    </section>
  );
}
