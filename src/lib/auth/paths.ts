export function safeNext(value: unknown, fallback = "/account") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020]/.test(value)
  )
    return fallback;
  try {
    const url = new URL(value, "https://meridian.invalid");
    if (
      url.origin !== "https://meridian.invalid" ||
      url.pathname.startsWith("/auth/") ||
      ["/login", "/registreren"].includes(url.pathname)
    )
      return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

export function authOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(configured).origin;
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`;
  return "https://meridiancollective.nl";
}

export type FormState = {
  error?: string;
  success?: string;
  fields?: Record<string, string>;
};
