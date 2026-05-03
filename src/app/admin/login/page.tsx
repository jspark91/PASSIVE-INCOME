import { loginAdmin } from "./actions";

function getErrorMessage(error?: string | string[]) {
  const value = Array.isArray(error) ? error[0] : error;

  if (value === "not_configured") {
    return "ADMIN_ACCESS_TOKEN is not configured yet.";
  }

  if (value === "invalid") {
    return "Invalid admin token.";
  }

  return null;
}

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string | string[]; next?: string | string[] }>;
}) {
  const query = await searchParams;
  const error = getErrorMessage(query?.error);
  const nextPath = getSafeNextPath(query?.next);

  return (
    <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss-700">Admin</p>
      <h1 className="mt-3 text-4xl font-semibold text-ink-900">Admin login</h1>
      <form action={loginAdmin} className="mt-8 grid gap-4 rounded-lg border border-ink-100 bg-white p-6 shadow-sm">
        <input type="hidden" name="next" value={nextPath} />
        <label className="grid gap-2 text-sm font-medium text-ink-900">
          Access token
          <input
            name="token"
            type="password"
            required
            className="rounded-md border border-ink-100 px-3 py-2"
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        <button className="rounded-md bg-ink-900 px-5 py-3 text-sm font-semibold text-white">
          Open admin
        </button>
      </form>
    </section>
  );
}

function getSafeNextPath(value?: string | string[]) {
  const nextPath = Array.isArray(value) ? value[0] : value;

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/admin";
  }

  if (!nextPath.startsWith("/admin")) {
    return "/admin";
  }

  return nextPath;
}
