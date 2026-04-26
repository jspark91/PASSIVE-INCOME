"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminTokenConfigured, isValidAdminToken } from "@/lib/admin";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-session";

export async function loginAdmin(formData: FormData) {
  const token = String(formData.get("token") ?? "");

  if (!isAdminTokenConfigured()) {
    redirect("/admin/login?error=not_configured");
  }

  if (!isValidAdminToken(token)) {
    redirect("/admin/login?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 7
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
