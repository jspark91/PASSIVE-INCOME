import Link from "next/link";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { getAdminAccess } from "@/lib/admin-session";
import { getBookingRequests } from "@/lib/data";
import { formatDate, formatKrw } from "@/lib/format";

export default async function AdminLeadsPage({
  searchParams
}: {
  searchParams?: { token?: string | string[] };
}) {
  const { configured, allowed } = await getAdminAccess(searchParams);
  const leads = allowed ? await getBookingRequests() : [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink-900">Booking leads</h1>
        </div>
        <Link href="/admin" className="text-sm font-semibold text-moss-700">
          Admin home
        </Link>
      </div>
      {!configured ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Admin token is not configured. Showing sample/offline data only.
        </div>
      ) : null}
      {configured && !allowed ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Invalid or missing admin token.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-lg border border-ink-100 bg-white">
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead className="bg-ink-50 text-ink-700">
              <tr>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Style</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Preferred date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-ink-100">
                  <td className="px-4 py-3">{formatDate(lead.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-semibold text-moss-700"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{lead.nationality ?? "-"}</td>
                  <td className="px-4 py-3">{lead.style ?? "-"}</td>
                  <td className="px-4 py-3">{formatKrw(lead.budget_krw)}</td>
                  <td className="px-4 py-3">{formatDate(lead.preferred_date)}</td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3">{lead.utm_source ?? lead.source ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
