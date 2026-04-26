import Link from "next/link";
import { getAdminTokenFromSearch, isAdminTokenConfigured, isValidAdminToken } from "@/lib/admin";

export default function AdminPage({
  searchParams
}: {
  searchParams?: { token?: string | string[] };
}) {
  const token = getAdminTokenFromSearch(searchParams);
  const configured = isAdminTokenConfigured();
  const allowed = isValidAdminToken(token);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">Admin</p>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">Lead workflow</h1>
      {!configured ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
          Set `ADMIN_ACCESS_TOKEN` before exposing admin pages in production.
        </div>
      ) : null}
      {!allowed ? (
        <form className="mt-8 flex max-w-xl gap-3 rounded-lg border border-ink-100 bg-white p-5">
          <input
            name="token"
            type="password"
            placeholder="Admin access token"
            className="min-w-0 flex-1 rounded-md border border-ink-100 px-3 py-2"
          />
          <button className="rounded-md bg-ink-900 px-5 py-2 text-sm font-semibold text-white">
            Open
          </button>
        </form>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link href={`/admin/leads?token=${token}`} className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-ink-900">Leads</h2>
            <p className="mt-2 text-sm text-ink-700">Review requests and update status.</p>
          </Link>
          <Link href={`/admin/artists?token=${token}`} className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-ink-900">Artists</h2>
            <p className="mt-2 text-sm text-ink-700">Check active artist data.</p>
          </Link>
          <Link href={`/admin/designs?token=${token}`} className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-ink-900">Designs</h2>
            <p className="mt-2 text-sm text-ink-700">Review flash concepts.</p>
          </Link>
        </div>
      )}
    </section>
  );
}

