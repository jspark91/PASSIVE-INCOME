import Link from "next/link";
import { getAdminAccess } from "@/lib/admin-session";
import { logoutAdmin } from "./login/actions";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ token?: string | string[] }>;
}) {
  const query = await searchParams;
  const { configured, allowed } = await getAdminAccess(query);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">Admin</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink-900">Lead workflow</h1>
        </div>
        {allowed ? (
          <form action={logoutAdmin}>
            <button className="rounded-md border border-ink-100 bg-white px-4 py-2 text-sm font-semibold text-ink-700">
              Logout
            </button>
          </form>
        ) : null}
      </div>
      {!configured ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
          Set `ADMIN_ACCESS_TOKEN` before exposing admin pages in production.
        </div>
      ) : null}
      {!allowed ? (
        <Link
          href="/admin/login"
          className="mt-8 inline-flex rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Login
        </Link>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link href="/admin/leads" className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-ink-900">Leads</h2>
            <p className="mt-2 text-sm text-ink-700">Review requests and update status.</p>
          </Link>
          <Link href="/admin/artists" className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-ink-900">Artists</h2>
            <p className="mt-2 text-sm text-ink-700">Check active artist data.</p>
          </Link>
          <Link href="/admin/designs" className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-ink-900">Designs</h2>
            <p className="mt-2 text-sm text-ink-700">Review flash concepts.</p>
          </Link>
        </div>
      )}
    </section>
  );
}
