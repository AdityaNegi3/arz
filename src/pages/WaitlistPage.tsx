// src/pages/WaitlistPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ORANGE = "#FF785A";
const GRAD = `linear-gradient(90deg, ${ORANGE}, #ff5a3f)`;
const STORAGE_KEY = "arz_waitlist_vflow";
const PUBLIC_START = 257;

function safeParse(v: string | null) {
  try {
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

/**
 * ENV notes:
 * - Put these in your .env (Vite)
 *   VITE_XANO_BASE_URL=https://x8ki-letl-twmt.n7.xano.io/api:_bEaWbDz
 *   VITE_XANO_KEY=<your-xano-key-or-jwt>
 *   (optional) VITE_XANO_WAITLIST_PATH=questions   <-- endpoint path (defaults to "questions")
 *
 * Example final POST URL will be:
 *   https://x8ki-letl-twmt.n7.xano.io/api:_bEaWbDz/questions
 *
 * Make sure your Xano endpoint path (questions/waitlist/save etc.) matches VITE_XANO_WAITLIST_PATH.
 */

// env reader (works with Vite / Node)
function readEnv(viteKey: string, nodeKey: string): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (typeof import.meta !== "undefined" ? (import.meta as any).env : undefined);
    if (meta && meta[viteKey]) return String(meta[viteKey]);
  } catch (_) {
    // ignore
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof process !== "undefined" && (process as any).env && (process as any).env[nodeKey])
      return String((process as any).env[nodeKey]);
  } catch (_) {
    // ignore
  }
  return undefined;
}

const XANO_BASE = (readEnv("VITE_XANO_BASE_URL", "REACT_APP_XANO_BASE_URL") || "").toString();
const XANO_KEY = (readEnv("VITE_XANO_KEY", "REACT_APP_XANO_KEY") || "").toString();
const WAITLIST_PATHNAME = (readEnv("VITE_XANO_WAITLIST_PATH", "REACT_APP_XANO_WAITLIST_PATH") || "questions").toString();

// build safe insert path (no duplicate slashes)
const WAITLIST_INSERT_PATH =
  XANO_BASE && WAITLIST_PATHNAME
    ? `${String(XANO_BASE).replace(/\/+$/, "")}/${String(WAITLIST_PATHNAME).replace(/^\/+/, "")}`
    : "";

// default headers
const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};
if (XANO_KEY) {
  // include both common header shapes to maximize compatibility with different Xano configs
  defaultHeaders["Authorization"] = `Bearer ${XANO_KEY}`;
  defaultHeaders["x-api-key"] = XANO_KEY;
}

export const WaitlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [count, setCount] = useState<number>(PUBLIC_START);
  const [responseId, setResponseId] = useState<string | null>(null);

  const summaryAnswer = sessionStorage.getItem("arz_answer") as "yes" | "no" | null;

  useEffect(() => {
    // compute count from local storage
    const list = safeParse(localStorage.getItem(STORAGE_KEY));
    const storedCount = Array.isArray(list) ? list.length : 0;
    setCount(PUBLIC_START + storedCount);

    const id = localStorage.getItem("responseId");
    if (id) setResponseId(id);

    // Debug: show presence of Xano config (no secrets printed)
    try {
      // eslint-disable-next-line no-console
      console.log("XANO DEBUG:", {
        hasBase: Boolean(XANO_BASE),
        basePreview: XANO_BASE ? String(XANO_BASE).slice(0, 60) + (XANO_BASE.length > 60 ? "…" : "") : null,
        hasKey: Boolean(XANO_KEY),
        waitlistPath: WAITLIST_PATHNAME,
        fullInsertPath: WAITLIST_INSERT_PATH,
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const validate = (v: string) => /^\s*[^@\s]+@[^@\s]+\.[^@\s]{2,}\s*$/.test(v.trim());

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMsg("");
    if (!validate(email)) {
      setMsg("Enter a valid email.");
      setState("error");
      return;
    }
    setState("loading");

    // small UX delay
    await new Promise((r) => setTimeout(r, 600));

    // Save locally (fallback)
    try {
      const existing = safeParse(localStorage.getItem(STORAGE_KEY)) ?? [];
      const dedup = Array.isArray(existing)
        ? existing.filter((x: any) => String(x.email).toLowerCase() !== email.toLowerCase())
        : [];
      const next = [
        ...dedup,
        {
          email: email.trim().toLowerCase(),
          ts: Date.now(),
          answer: summaryAnswer ?? "unknown",
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setCount(PUBLIC_START + next.length);
    } catch (err) {
      console.error("Local save failed:", err);
    }

    // --------- NORMALIZE answers TO ARRAY OF STRINGS (fix Xano text[] error) ----------
    const answersJson = sessionStorage.getItem("arz_answers");
    let rawAnswers: any = answersJson ? safeParse(answersJson) : [];

    // make sure it's an array
    if (!Array.isArray(rawAnswers)) rawAnswers = rawAnswers == null ? [] : [rawAnswers];

    // convert each entry into a string that Xano will accept
    const answers: string[] = rawAnswers.map((it: any) => {
      if (typeof it === "string") return it;
      if (typeof it === "number" || typeof it === "boolean") return String(it);
      if (it && typeof it === "object") {
        // common shapes: { answer: "yes" } or { value: "x" }
        if (typeof it.answer === "string") return it.answer;
        if (typeof it.value === "string") return it.value;
        // fallback: stringify the object
        try {
          return JSON.stringify(it);
        } catch {
          return String(it);
        }
      }
      return String(it);
    });
    // -------------------------------------------------------------------------------

    const insertPayload: Record<string, any> = {
      answers: answers, // guaranteed string[]
      // NOTE: use email_id to match Xano input name
      email_id: email.trim().toLowerCase(),
      joined_at: new Date().toISOString(),
    };

    // Debug: show payload summary (no secrets)
    // eslint-disable-next-line no-console
    console.log("Xano attempt payload:", insertPayload, { responseId, hasXano: Boolean(WAITLIST_INSERT_PATH) });

    try {
      // If user hasn't configured Xano, skip remote call and show fallback success
      if (!WAITLIST_INSERT_PATH) {
        setState("success");
        setMsg("Added locally (configure VITE_XANO_BASE_URL & VITE_XANO_WAITLIST_PATH to send to server).");
        setEmail("");
        // mimic existing behavior: short pause then return to home
        setTimeout(() => {
          setState("idle");
          setMsg("");
          navigate("/home");
        }, 900);
        return;
      }

      // Helper for parsing text/json responses
      const parseResponse = async (resp: Response) => {
        const text = await resp.text();
        try {
          return { status: resp.status, body: text ? JSON.parse(text) : null, raw: text };
        } catch {
          return { status: resp.status, body: null, raw: text };
        }
      };

      // If responseId exists, do update via PATCH
      if (responseId) {
        const updateUrl = `${WAITLIST_INSERT_PATH}/${encodeURIComponent(responseId)}`;
        // eslint-disable-next-line no-console
        console.log("Xano update URL:", updateUrl, "headers:", defaultHeaders);

        const resp = await fetch(updateUrl, {
          method: "PATCH",
          headers: defaultHeaders,
          body: JSON.stringify({
            email_id: insertPayload.email_id,
            answers: insertPayload.answers,
            updated_at: new Date().toISOString(),
          }),
        });

        const parsed = await parseResponse(resp);
        // eslint-disable-next-line no-console
        console.log("Xano update response:", parsed.status, parsed.body ?? parsed.raw);

        if (parsed.status < 200 || parsed.status >= 300) {
          const human = `Server ${parsed.status} — ${typeof parsed.body === "string" ? parsed.body : JSON.stringify(parsed.body ?? parsed.raw)}`;
          setState("error");
          setMsg("Could not save to server. " + human);
          return;
        } else {
          // success; remove local responseId (optional)
          try {
            localStorage.removeItem("responseId");
            setResponseId(null);
          } catch (e) {
            // ignore storage errors
          }
        }
      } else {
        // Insert case
        // eslint-disable-next-line no-console
        console.log("Xano insert URL:", WAITLIST_INSERT_PATH, "headers:", defaultHeaders);

        const resp = await fetch(WAITLIST_INSERT_PATH, {
          method: "POST",
          headers: defaultHeaders,
          body: JSON.stringify(insertPayload),
        });

        const parsed = await parseResponse(resp);
        // eslint-disable-next-line no-console
        console.log("Xano insert response:", parsed.status, parsed.body ?? parsed.raw);

        if (parsed.status < 200 || parsed.status >= 300) {
          const human = `Server ${parsed.status} — ${typeof parsed.body === "string" ? parsed.body : JSON.stringify(parsed.body ?? parsed.raw)}`;
          setState("error");
          setMsg("Could not save to server. " + human);
          return;
        } else {
          // store returned id (if present) so we can update later
          let returnedId: string | null = null;
          const body = parsed.body;
          if (body) {
            if (Array.isArray(body) && body.length > 0 && body[0]?.id) returnedId = String(body[0].id);
            else if (body.id) returnedId = String(body.id);
            else if (body.insertedId) returnedId = String(body.insertedId);
          }
          if (returnedId) {
            try {
              localStorage.setItem("responseId", returnedId);
              setResponseId(returnedId);
            } catch (e) {
              // ignore storage errors
            }
          }
        }
      }

      // success path
      setState("success");
      setMsg("You’re in! Redirecting…");
      setEmail("");
      setTimeout(() => {
        setState("idle");
        setMsg("");
        navigate("/home");
      }, 900);
    } catch (err: any) {
      // network or unexpected error
      // eslint-disable-next-line no-console
      console.error("Unexpected failure saving to Xano:", err);
      setState("error");
      setMsg("Could not save — " + String(err?.message ?? err));
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased flex flex-col relative arz-font">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700;900&display=swap');
        .arz-font {
          font-family: "Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco,
                       "Segoe UI Mono", "Roboto Mono", "Courier New", monospace;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .big-head { font-weight: 900; letter-spacing: -0.5px; }
        .highlight-orange { color: ${ORANGE}; }
        input:disabled, button:disabled { opacity: 0.7; cursor: not-allowed; }
        .arz-logo { height: 5rem; }
        @media (min-width: 768px) { .arz-logo { height: 7rem; } }
        @media (min-width: 1024px) { .arz-logo { height: 8rem; } }
      `}</style>

      <div className="absolute top-4 left-4 md:top-6 md:left-10">
        <img src="/logo.png" alt="ARZ Logo" className="arz-logo object-contain drop-shadow-lg" />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 lg:px-16 pt-28 md:pt-32 pb-12">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl border border-slate-100 p-6 sm:p-8 md:p-10 shadow-sm">
            <div className="mb-2 text-xs text-slate-500">Secure your spot</div>

            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight mb-2 big-head">
              Add your email
            </h1>

            <p className="text-sm text-slate-600 mb-4">
              To save the responses <span className="highlight-orange"></span>
            </p>

            <form onSubmit={submit} className="flex flex-col md:flex-row gap-3">
              <label htmlFor="waitlist-email" className="sr-only">Email</label>
              <input
                id="waitlist-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourmail.com"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm sm:text-base"
                disabled={state === "loading"}
                required
                aria-label="Email"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full md:w-auto px-5 py-3 sm:py-4 rounded-lg text-white font-semibold text-sm sm:text-base"
                style={{ background: GRAD, boxShadow: `0 12px 36px ${ORANGE}22` }}
              >
                {state === "loading" ? "Joining…" : "Join"}
              </button>
            </form>

            <div className="mt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <p
                className={`text-sm ${
                  state === "error"
                    ? "text-red-500"
                    : state === "success"
                    ? "text-green-600"
                    : "text-slate-500"
                }`}
                aria-live="polite"
              >
                {msg || "We won’t share your email."}
              </p>

              <div className="text-xs text-slate-400 mt-1 md:mt-0">
                <strong className="text-slate-900">{count}</strong> signed
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-400">{/* extra notes */}</div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-slate-500">
        <strong className="text-black">ARZ</strong>
      </footer>
    </div>
  );
};

export default WaitlistPage;
