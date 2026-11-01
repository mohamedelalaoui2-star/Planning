# VIGENTRA PRO — audit initial et corrections
Date: 2026-11-01
Repository: https://github.com/mohamedelalaoui2-star/Planning
Production database: Supabase project pqpoxbsudbydsppqoxon

## Correction applied
- Fixed the client-side agent invitation email validator in `index.html` so it uses JavaScript regex escapes correctly.
- Fixed the invitation confirmation text so line breaks render as actual new lines rather than literal `\n`.
- Frontend validation/confirmation commit: `9513d7dffc57e87bce7ad55a72e36d46f238d587`.
- Access-code UI wiring commit: `ec5f379fb113804c268d1d166d24d52cf027b756`.
- Separate agent selector (including agents with an already-linked account) for code requests: `21c437cfc1a463aea9a36ada88c29a6420d99d7b`.
- A local smoke test accepted `agent@example.fr` and rejected `agent@@example`.
- The app changes are committed to `main`; GitHub Pages deployment status must be checked after the latest commit. A queued build does not prove the live site has finished deploying.

## Verified inventory
- The `public` schema contains the core tables for agents, sites, planning, pointages, documents, invoicing, notifications, rondes, clients, contracts, quotes and compliance.
- All listed public tables have RLS enabled.
- The query for public/storage policies that explicitly allow `true` or the `anon` role returned no matches.
- Edge Functions `invite-vigentra-agent` (active, JWT verification enabled) and `send-agent-access-code` (active, JWT verification enabled) exist.
- Recent GitHub Pages build before this correction succeeded. A new build for this commit was queued at the time of audit.

## High-priority findings still open
1. **Access-code UI wired during this audit; end-to-end delivery still unverified.** Added a confirmation-protected “Envoyer un code de connexion” action connected to `send-agent-access-code`, with its own selector that includes already-linked agents and a separate email field. It displays errors. No real email was sent during testing, so provider delivery and inbox arrival remain to be verified.
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


---

# Addendum — planning intelligent et affectation
Date : 2026-11-01
Branche : feat/planning-intelligent-affectation
Base : main

## Examen préalable
Le dépôt utilise une application HTML/JavaScript unique (`index.html`), Supabase JS v2, et les tables `agents`, `Site`, `planning`, `qualifications` et `indisponibilites`. Les fonctions de calendrier, filtres, export PDF, pointage et gestion des vacations ont été conservées.

## Modifications sur cette branche
- La recommandation et la validation avant insertion partagent désormais le même contrôle de qualification.
- Le contrôle lit la qualification principale et les autres qualifications de la fiche agent.
- Il prend aussi en compte les qualifications présentes dans la table `qualifications`.
- Une qualification enregistrée avec une date d'expiration antérieure à la date de vacation n'est pas admissible.
- Une carte professionnelle dont la date d'expiration précède la date de vacation bloque la recommandation et l'enregistrement.
- Les erreurs d'affectation donnent une raison explicite.
- La création reste manuelle et protégée par confirmation : la recommandation ne crée pas de vacation à elle seule.

## Vérifications et limites
- Contrôles statiques des modifications : fonctions auxiliaires présentes une seule fois, anciennes validations remplacées, fonctions opérationnelles majeures toujours présentes.
- Tests manuels restant à effectuer dans l'application avec un compte de test : qualification principale, qualification secondaire, qualification dans la table dédiée, carte pro expirée, qualification expirée et refus d'un agent non qualifié.
- Aucun enregistrement Supabase n'a été modifié, aucune donnée n'a été supprimée, aucun e-mail n'a été envoyé.
- Aucun coût ou service payant ajouté.
- Le contrôle côté navigateur améliore l'expérience mais ne remplace pas une validation côté base/RPC si plusieurs directeurs peuvent modifier le planning simultanément.
