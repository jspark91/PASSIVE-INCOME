"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminTokenConfigured, isValidAdminToken } from "@/lib/admin";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-session";

export async function loginAdmin(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const nextPath = getSafeAdminRedirect(formData.get("next"));

  if (!isAdminTokenConfigured()) {
    redirect(getLoginErrorPath("not_configured", nextPath));
  }

  if (!isValidAdminToken(token)) {
    redirect(getLoginErrorPath("invalid", nextPath));
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  redirect(nextPath);
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0
  });
  redirect("/admin/login");
}

function getSafeAdminRedirect(value: FormDataEntryValue | null) {
  const nextPath = String(value ?? "");

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/admin";
  }

  if (!nextPath.startsWith("/admin")) {
    return "/admin";
  }

  return nextPath;
}

function getLoginErrorPath(error: string, nextPath: string) {
  const params = new URLSearchParams({ error });

  if (nextPath !== "/admin") {
    params.set("next", nextPath);
  }

  return `/admin/login?${params.toString()}`;
}
