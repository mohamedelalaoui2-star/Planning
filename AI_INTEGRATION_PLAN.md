# VIGENTRA PRO — staged AI integration plan

## Safety boundary

- Work on `feature/ai-assistant-prototype`; do not commit directly to `main`.
- Existing app entry point (`index.html`), service worker, manifest, Supabase tables, and production deployment are unchanged.
- AI calls must go through a server-side endpoint. Never expose provider keys in browser code.
- No production rollout until reviewed and tested; use a pull request for review.

## Phase 1 — isolated proof of concept

- Add `ai-worker/` with a minimal Gemini API Worker.
- Keep API credentials in Cloudflare Worker secrets.
- Restrict allowed browser origins, cap prompt size and generated output, and avoid logging prompts.
- Treat CORS as a browser safeguard, not authentication.
- Do not send personal, HR, client, identity, access-control, or other confidential data.

## Phase 2 — secure access and quota control

Before public use, add authentication/access control and server-side rate limiting, abuse protection, request and output budgets, and a quota/error dashboard. Verify the free-tier terms and current model quota before selecting a model.

## Phase 3 — user interface

Add an AI assistant screen only after the backend passes review. It should explain what data may be submitted, show quota/errors clearly, and make no claims that it can edit schedules or send messages unless those integrations are separately authorized and tested.

## Phase 4 — test and release

1. Test in a separate Worker and test environment.
2. Confirm normal response, malformed input, oversized prompt, disallowed origin, missing API secret, provider quota/rate-limit errors, and network failures.
3. Review data handling and security.
4. Open a pull request; review the diff before merging.
5. Deploy separately and roll back by disabling the Worker if issues occur.

## Current status

Phase 1 starter files only. No deployment, no frontend changes, no Supabase changes, no API key, and no production modification.
