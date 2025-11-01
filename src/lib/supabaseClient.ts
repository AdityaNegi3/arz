// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// export type Profile = {
//   id: string;
//   email: string;
//   full_name: string;
//   avatar_url?: string;
//   created_at: string;
// };

// export type Event = {
//   id: string;
//   title: string;
//   description: string;
//   artist_lineup: string[];
//   venue: string;
//   event_date: string;
//   banner_image: string;
//   thumbnail_image: string;
//   price: number;
//   category: string;
//   created_at: string;
// };

// export type Ticket = {
//   id: string;
//   user_id: string;
//   event_id: string;
//   purchase_date: string;
//   ticket_number: string;
//   status: 'active' | 'used' | 'cancelled';
// };

// export type EventGroup = {
//   id: string;
//   event_id: string;
//   created_at: string;
// };

// export type Message = {
//   id: string;
//   group_id: string;
//   user_id: string;
//   content: string;
//   created_at: string;
//   profiles?: Profile;
// };
// src/lib/supabaseClient.ts

// src/lib/supabaseClient.ts
// src/lib/supabaseClient.ts
// src/lib/supabaseClient.ts
// src/lib/supabaseClient.ts  (debug build — remove these debug lines after fixing)
// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Read env values from Vite (import.meta.env) or Node (process.env).
 * Defensive but simple.
 */
function readEnv(viteKey: string, nodeKey: string): string | undefined {
  try {
    // Vite / modern bundlers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;
    if (meta && typeof meta[viteKey] === "string" && meta[viteKey].length) return meta[viteKey];
  } catch (e) {
    // ignore
  }

  try {
    // Node / CRA fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof process !== "undefined" && (process as any).env && typeof (process as any).env[nodeKey] === "string") {
      return (process as any).env[nodeKey];
    }
  } catch (e) {
    // ignore
  }

  return undefined;
}

const SUPABASE_URL = readEnv("VITE_SUPABASE_URL", "REACT_APP_SUPABASE_URL");
const SUPABASE_ANON_KEY = readEnv("VITE_SUPABASE_ANON_KEY", "REACT_APP_SUPABASE_ANON_KEY");

// Expose minimal debug info in browser for development (safe: no full keys).
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__SUPABASE_DEBUG = {
    urlPresent: Boolean(SUPABASE_URL),
    urlPreview: SUPABASE_URL ? String(SUPABASE_URL).slice(0, 80) + "…" : null,
    anonKeyPresent: Boolean(SUPABASE_ANON_KEY),
    anonKeyPreview: SUPABASE_ANON_KEY ? String(SUPABASE_ANON_KEY).slice(0, 12) + "…" : null,
  };
} catch (e) {
  // non-browser contexts ignore
}

// Helpful debug logs inside app (safe — only preview the anon).
// Remove or reduce these logs before production if you prefer cleaner console.
if (typeof console !== "undefined") {
  // eslint-disable-next-line no-console
  console.info("[supabase] env:", {
    hasUrl: Boolean(SUPABASE_URL),
    url: SUPABASE_URL ? String(SUPABASE_URL).slice(0, 80) + "…" : null,
    hasAnon: Boolean(SUPABASE_ANON_KEY),
    anonPreview: SUPABASE_ANON_KEY ? String(SUPABASE_ANON_KEY).slice(0, 12) + "…" : null,
  });
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Missing environment variables. Expected VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.",
    { hasUrl: Boolean(SUPABASE_URL), hasAnonKey: Boolean(SUPABASE_ANON_KEY) }
  );
}

/**
 * Export a real Supabase client when envs are present.
 * Otherwise export a safe stub that returns friendly errors so the app doesn't crash.
 */
let supabaseClient: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = createClient(String(SUPABASE_URL), String(SUPABASE_ANON_KEY), {
    // optional: small header to help debug which environment is calling
    global: { headers: { "x-client-platform": "web" } },
  });
  // eslint-disable-next-line no-console
  console.info("[supabase] client initialized");
} else {
  // Stubbed client so callers don't blow up in dev if envs are missing.
  const stubError = {
    message: "Supabase not configured (missing env).",
    details: "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env and restart dev server.",
    code: "SUPABASE_NOT_CONFIGURED",
  };

  // Minimal chainable stub that resolves to { data: null, error: stubError }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient = {
    from: (_table: string) => ({
      insert: async (_payload: any) => ({ data: null, error: stubError }),
      select: async (_sel?: any) => ({ data: null, error: stubError }),
      update: async (_payload: any) => ({ data: null, error: stubError }),
      delete: async () => ({ data: null, error: stubError }),
      eq() { return this; },
      limit() { return this; },
      order() { return this; },
    }),
  } as unknown as SupabaseClient;
}

export const supabase = supabaseClient!;
export type { SupabaseClient };
