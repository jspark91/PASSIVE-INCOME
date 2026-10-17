import { isValidAdminToken } from "@/lib/admin";

// Browser downloads use the same HttpOnly login cookie; automation can use the existing header.
export function isAuthorizedAdminRequest(request: Request) {
  const header = request.headers.get("x-admin-token");
  if (header) return isValidAdminToken(header);
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith("ethnic_house_admin="));
  if (!cookie) return false;
  try { return isValidAdminToken(decodeURIComponent(cookie.slice("ethnic_house_admin=".length))); }
  catch { return false; }
}
