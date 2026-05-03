import Link from "next/link";
import { getAdminAccess } from "@/lib/admin-session";
import { AdminChatClient } from "./AdminChatClient";

export default async function AdminChatPage({
  searchParams
}: {
  searchParams?: Promise<{ token?: string | string[] }>;
}) {
  const query = await searchParams;
  const { configured, allowed } = await getAdminAccess(query);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">
            Admin
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-ink-900">Live chat</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-700">
            Open this page on your computer to answer website chat messages.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-semibold text-moss-700">
          Admin home
        </Link>
      </div>

      {!configured ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Set ADMIN_ACCESS_TOKEN before using live chat in production.
        </div>
      ) : null}

      {!configured ? null : !allowed ? (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
          Login is required.{" "}
          <Link href="/admin/login" className="font-semibold underline">
            Open admin login
          </Link>
        </div>
      ) : (
        <AdminChatClient />
      )}
    </section>
  );
}
