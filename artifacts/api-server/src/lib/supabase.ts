import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(rawUrl: string): string {
  const parsedUrl = new URL(rawUrl);
  const dashboardMatch = parsedUrl.pathname.match(
    /^\/dashboard\/project\/([^/]+)\/?/,
  );

  if (parsedUrl.hostname === "supabase.com" && dashboardMatch) {
    parsedUrl.hostname = `${dashboardMatch[1]}.supabase.co`;
    parsedUrl.pathname = "";
    parsedUrl.search = "";
    parsedUrl.hash = "";
  } else {
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/rest\/v1\/?$/, "");
  }

  return parsedUrl.toString().replace(/\/$/, "");
}

export function getSupabaseClient(): SupabaseClient {
  const rawUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]
    ?.trim()
    .replace(/^(['"])(.*)\1$/, "$2");
  const anonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]?.trim();

  if (!rawUrl || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  try {
    const parsedUrl = new URL(rawUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new Error("Unsupported protocol");
    }
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL.",
    );
  }

  const url = normalizeSupabaseUrl(rawUrl);

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}