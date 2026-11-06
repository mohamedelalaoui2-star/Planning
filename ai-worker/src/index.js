const ALLOWED_ORIGINS = new Set([
  "https://mohamedelalaoui2-star.github.io",
  "http://localhost:8788",
  "http://127.0.0.1:8788",
]);

const MAX_PROMPT_CHARS = 4000;
const MAX_OUTPUT_TOKENS = 700;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "";

    if (request.method === "OPTIONS") {
      if (!allowedOrigin) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin",
        },
      });
    }

    if (!allowedOrigin) return json({ error: "Origin not allowed." }, 403);
    if (new URL(request.url).pathname !== "/api/ai") return json({ error: "Not found." }, 404);
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, {
      "Allow": "POST, OPTIONS",
    });
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return json({ error: "Content-Type must be application/json." }, 415, {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Vary": "Origin",
      });
    }
    if (!env.GEMINI_API_KEY) return json({ error: "AI service is not configured." }, 503, {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Vary": "Origin",
    });

    const length = Number(request.headers.get("content-length") || "0");
    if (length > 12000) return json({ error: "Request too large." }, 413, {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Vary": "Origin",
    });

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON." }, 400, {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Vary": "Origin",
      });
    }

    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) return json({ error: "Enter a question." }, 400, {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Vary": "Origin",
    });
    if (prompt.length > MAX_PROMPT_CHARS) return json({ error: `Question limit: ${MAX_PROMPT_CHARS} characters.` }, 413, {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Vary": "Origin",
    });

    const systemInstruction = [
      "Tu es l'assistant de travail de TEA SÉCURITÉ PRIVÉE et VIGENTRA PRO.",
      "Réponds en français, clairement et de manière opérationnelle.",
      "Pour les sujets juridiques, RH, sécurité privée ou conformité, distingue les informations certaines des points à vérifier auprès d'une source officielle.",
      "N'invente jamais une règle, une qualification, un tarif ou une obligation légale.",
      "Ne demande pas de données personnelles ou confidentielles. L'utilisateur ne doit pas envoyer de dossiers clients, pièces d'identité, codes d'accès ou informations sensibles.",
      "Tu ne peux pas modifier le planning, envoyer de messages ou exécuter d'actions dans VIGENTRA PRO depuis ce prototype."
    ].join("\n");

    try {
      const upstream = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: MAX_OUTPUT_TOKENS,
              temperature: 0.3,
            },
          }),
        },
      );

      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        // Do not expose provider response details or credentials to the browser.
        const status = upstream.status === 429 ? 429 : 502;
        return json({
          error: status === 429
            ? "Quota IA atteint. Réessaie plus tard."
            : "Le service IA est temporairement indisponible.",
        }, status, { "Access-Control-Allow-Origin": allowedOrigin, "Vary": "Origin" });
      }

      const answer = data?.candidates?.[0]?.content?.parts
        ?.map((part) => typeof part.text === "string" ? part.text : "")
        .join("\n")
        .trim();

      if (!answer) return json({ error: "Aucune réponse exploitable reçue." }, 502, {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Vary": "Origin",
      });

      return json({ answer }, 200, {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Vary": "Origin",
      });
    } catch {
      return json({ error: "Impossible de joindre le service IA." }, 502, {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Vary": "Origin",
      });
    }
  },
};
