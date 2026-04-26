import Link from "next/link";
import { DesignCard } from "@/components/DesignCard";
import { getAdminTokenFromSearch, isAdminTokenConfigured, isValidAdminToken } from "@/lib/admin";
import { getFlashDesigns } from "@/lib/data";

export default async function AdminDesignsPage({
  searchParams
}: {
  searchParams?: { token?: string | string[] };
}) {
  const token = getAdminTokenFromSearch(searchParams);
  const configured = isAdminTokenConfigured();
  const allowed = isValidAdminToken(token);
  const designs = allowed || !configured ? await getFlashDesigns() : [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href={`/admin?token=${token ?? ""}`} className="text-sm font-semibold text-moss-700">
        Admin home
      </Link>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">Flash designs</h1>
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

