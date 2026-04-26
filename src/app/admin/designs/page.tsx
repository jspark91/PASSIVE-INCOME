import Link from "next/link";
import { DesignCard } from "@/components/DesignCard";
import { getAdminAccess } from "@/lib/admin-session";
import { getFlashDesigns } from "@/lib/data";

export default async function AdminDesignsPage({
  searchParams
}: {
  searchParams?: Promise<{ token?: string | string[] }>;
}) {
  const query = await searchParams;
  const { configured, allowed } = await getAdminAccess(query);
  const designs = allowed ? await getFlashDesigns() : [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href="/admin" className="text-sm font-semibold text-moss-700">
        Admin home
      </Link>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">Flash designs</h1>
      {!configured ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          ADMIN_ACCESS_TOKEN is not configured.
        </div>
      ) : null}
      {configured && !allowed ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Invalid or missing admin token.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {designs.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>
      )}
    </section>
  );
}
