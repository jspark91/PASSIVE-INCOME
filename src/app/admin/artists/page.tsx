import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { getAdminTokenFromSearch, isAdminTokenConfigured, isValidAdminToken } from "@/lib/admin";
import { getArtists } from "@/lib/data";

export default async function AdminArtistsPage({
  searchParams
}: {
  searchParams?: { token?: string | string[] };
}) {
  const token = getAdminTokenFromSearch(searchParams);
  const configured = isAdminTokenConfigured();
  const allowed = isValidAdminToken(token);
  const artists = allowed || !configured ? await getArtists() : [];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href={`/admin?token=${token ?? ""}`} className="text-sm font-semibold text-moss-700">
        Admin home
      </Link>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">Artists</h1>
      {configured && !allowed ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Invalid or missing admin token.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </section>
  );
}

