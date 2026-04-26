export function isAdminTokenConfigured() {
  return Boolean(process.env.ADMIN_ACCESS_TOKEN);
}

export function isValidAdminToken(token?: string | null) {
  const expected = process.env.ADMIN_ACCESS_TOKEN;
  return Boolean(expected && token && token === expected);
}

export function getAdminTokenFromSearch(searchParams?: {
  token?: string | string[];
}) {
  const token = searchParams?.token;
  return Array.isArray(token) ? token[0] : token;
}

