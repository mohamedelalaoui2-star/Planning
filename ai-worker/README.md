# VIGENTRA PRO — AI prototype (isolated)

This directory contains an **experimental backend only**. It does not change the existing VIGENTRA PRO interface or database. It must not be treated as production-ready.

## What it does

- Exposes `POST /api/ai` for a short French-language assistant prompt.
- Calls Gemini API from the server-side Worker.
- Reads `GEMINI_API_KEY` from a Cloudflare secret, never from browser code.
- Restricts browser origins, validates JSON and prompt length, limits output tokens, avoids caching responses, and returns generic upstream errors.

## Important security limits

**CORS/origin checks are not authentication and do not stop scripts or direct HTTP clients.** Before enabling this endpoint for real users, add a real access-control mechanism and per-user/per-IP rate limiting (for example Cloudflare Turnstile plus server-side verification and a suitable rate limiter). Monitor quota and set provider-side usage alerts/limits where available. Do not use this prototype with personal data, employee records, client documents, identity documents, access codes, or confidential company information.

The API key must never be put in `index.html`, client-side JavaScript, GitHub Pages settings exposed to the browser, or committed to Git.

## Deploy only as a separate Worker

1. Create a Cloudflare account and a Worker project for this prototype. Do not replace the existing Pages/GitHub Pages deployment.
2. From a trusted computer or a suitable Cloudflare dashboard workflow, set the secret `GEMINI_API_KEY`. With Wrangler: `npx wrangler secret put GEMINI_API_KEY`.
3. Deploy this directory as its own Worker. The Worker URL is separate from the existing site.
4. Before the frontend can call it, update `ALLOWED_ORIGINS` in `src/index.js` with the exact production origin and verify it. Do not use wildcard CORS.
5. Test malformed JSON, empty prompts, oversized prompts, disallowed origins, missing secrets, provider quota errors, and normal responses.
6. Add authentication and rate limiting **before** allowing general public access.

## Current status

Prototype committed on a feature branch. Not deployed, not connected to Supabase, and not integrated into the live UI. No production data or secrets are included.
