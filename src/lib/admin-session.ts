import { cookies } from "next/headers";
import { getAdminTokenFromSearch, isAdminTokenConfigured, isValidAdminToken } from "@/lib/admin";

export const ADMIN_COOKIE_NAME = "seoul_ink_admin";

export async function getAdminSessionToken(searchParams?: { token?: string | string[] }) {
  const searchToken = getAdminTokenFromSearch(searchParams);

  if (searchToken) {
    return searchToken;
  }

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value ?? null;
}

export async function getAdminAccess(searchParams?: { token?: string | string[] }) {
  const configured = isAdminTokenConfigured();
  const token = await getAdminSessionToken(searchParams);

  return {
    configured,
    token,
    allowed: configured ? isValidAdminToken(token) : false
  };
}
