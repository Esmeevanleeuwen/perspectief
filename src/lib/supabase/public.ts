import "server-only";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_CACHE_SECONDS, PUBLIC_CONTENT_CACHE_TAG } from "@/lib/public-cache";

/** A separate anonymous client: never forwards a visitor's session into a shared cache. */
export function createPublicClient(tags = [PUBLIC_CONTENT_CACHE_TAG]) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch(input, init) {
          // Cache reads only. Authenticated reads and all mutations use server.ts.
          if (init?.method && init.method.toUpperCase() !== "GET") {
            return fetch(input, { ...init, cache: "no-store" });
          }
          return fetch(input, {
            ...init,
            cache: "force-cache",
            next: { revalidate: PUBLIC_CACHE_SECONDS, tags },
          });
        },
      },
    },
  );
}
