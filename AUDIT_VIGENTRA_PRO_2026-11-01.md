# VIGENTRA PRO — audit initial et corrections
Date: 2026-11-01
Repository: https://github.com/mohamedelalaoui2-star/Planning
Production database: Supabase project pqpoxbsudbydsppqoxon

## Correction applied
- Fixed the client-side agent invitation email validator in `index.html` so it uses JavaScript regex escapes correctly.
- Fixed the invitation confirmation text so line breaks render as actual new lines rather than literal `\n`.
- Commit: `9513d7dffc57e87bce7ad55a72e36d46f238d587`.
- A local smoke test accepted `agent@example.fr` and rejected `agent@@example`.
- The app change is committed to `main`; GitHub Pages deployment was queued when checked. This does not prove the live site has finished deploying.

## Verified inventory
- The `public` schema contains the core tables for agents, sites, planning, pointages, documents, invoicing, notifications, rondes, clients, contracts, quotes and compliance.
- All listed public tables have RLS enabled.
- The query for public/storage policies that explicitly allow `true` or the `anon` role returned no matches.
- Edge Functions `invite-vigentra-agent` (active, JWT verification enabled) and `send-agent-access-code` (active, JWT verification enabled) exist.
- Recent GitHub Pages build before this correction succeeded. A new build for this commit was queued at the time of audit.

## High-priority findings still open
1. **The access-code Edge Function is not called by the current frontend.** The current UI invokes `invite-vigentra-agent` only. The separate `send-agent-access-code` function exists, but there is no `functions.invoke('send-agent-access-code', ...)` in `index.html`. Therefore, an agent code flow cannot be initiated from the current UI.
2. **Supabase security advisor warnings:** five `SECURITY DEFINER` functions are executable by signed-in users. The inspected functions include caller/ownership checks and appear to be used by RLS/workspace logic, so blindly revoking execution could break access. Review exact grants and function dependencies before changing them.
3. **Leaked-password protection is disabled** in Supabase Auth. Enable it in the Auth password-security settings.
4. **Performance advisor:** 41 RLS policy findings indicate repeated evaluation of auth functions. This is a performance optimization, not evidence by itself of data exposure; optimize in a reviewed migration.
5. **Email delivery is not end-to-end verified.** No real invitation or login code was sent during this audit. Supabase Edge Function presence alone does not prove SMTP/provider delivery, redirect configuration, or inbox arrival.
6. **Production end-to-end flows remain unverified:** agent invite/login, role separation, create/edit/delete records, pointage, PDF export and restore need authenticated test accounts and controlled test data.

## Safety decisions
- No production database rows were modified or deleted.
- No RLS policies or database functions were changed during this pass.
- No real emails were sent.
- Keep the Supabase service-role key exclusively in server-side Edge Function secrets; never add it to `index.html`.

## Next recommended order
1. Wire a deliberate, confirmation-protected “Envoyer un code de connexion” action to `send-agent-access-code`, then test with a dedicated test agent and inbox.
2. Run authenticated smoke tests for director and agent roles using test data.
3. Review Edge Function CORS and redirects against the actual production origin(s).
4. Review grants and dependencies for the five security-definer functions, then make the smallest safe security migration.
5. Optimize RLS policy expressions and enable leaked-password protection.
6. Verify the new GitHub Pages deployment and test the live URL on iPhone.
