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


# VIGENTRA PRO — pointage et main courante
Date : 2026-11-01
Branche : feat/pointage-main-courante
Base : main

## Examen préalable
Le dépôt existant contient déjà les modules Pointage et Main courante numérique dans \`index.html\`, avec Supabase, l'espace agent, le calcul des sessions, la clôture d'incidents et l'export CSV. Les changements sont ciblés et n'ajoutent aucune table.

## Modifications sur cette branche
- Pointage directeur : refuse une nouvelle prise si l'agent a une session ouverte, y compris sur un autre site.
- Pointage directeur : vérifie que la vacation sélectionnée correspond bien à l'agent et au site.
- Pointage directeur : la fin de poste reprend l'identifiant de vacation de la prise de poste ouverte, même si la liste facultative est laissée vide, pour éviter de casser le calcul de durée.
- Pointage directeur : évite les doubles clics simultanés et réactive le bouton après la réponse.
- Espace agent : empêche de démarrer une deuxième session ouverte et de clôturer une vacation qui ne correspond pas à la prise de poste ouverte.
- Main courante : ajout de filtres de dates « Du » et « Au », inclus dans l'export CSV et l'effacement des filtres.
- Aucune nouvelle donnée n'a été écrite dans Supabase ; aucun enregistrement existant n'a été supprimé.

## Vérifications statiques
- Les anciennes fonctions ciblées ont été remplacées une seule fois.
- Les fonctions principales existantes de planning, PDF, rondes, facturation, sauvegarde et main courante sont toujours présentes.
- Les tests en production et le comportement avec la politique RLS réelle restent à vérifier avec un compte de test avant fusion.

## Précautions
Le pointage web et l'horodatage ne prouvent pas à eux seuls la présence physique. Aucun GPS permanent, aucune photo et aucune biométrie n'ont été ajoutés. Les agents doivent être informés des finalités, des données collectées, des accès et des durées de conservation conformément aux recommandations CNIL.


# VIGENTRA PRO — gestion commerciale initiale
Date : 2026-11-01
Branche : feat/gestion-commerciale

## Examen avant modification
- L'application existante utilise un seul fichier index.html et le client Supabase JS v2.
- Le module Factures existait déjà : création de brouillon, calcul HT/TVA/TTC, impression/PDF et suivi de statut.
- Le schéma Supabase contient déjà les tables clients, devis et contrats. Les tables ont RLS activé et des politiques d'accès propriétaire.
- Aucune nouvelle table ni colonne n'a été ajoutée à la base ; aucune donnée existante n'a été modifiée ou supprimée.

## Changements de code sur cette branche
- Ajout d'un module « Clients, devis et contrats » accessible par le menu « Plus ».
- Création et liste des clients avec raison sociale, SIRET contrôlé à 14 chiffres, adresse, contact, e-mail, téléphone et notes.
- Création des devis liés à un client enregistré, calcul des totaux HT/TVA/TTC, validité, rendu PDF imprimable et suivi brouillon/envoyé/accepté/refusé.
- Conversion d'un devis accepté en brouillon de facture ; le devis est ensuite marqué « converti ». Si la mise à jour du devis échoue après la création de la facture, l'application affiche un avertissement et demande une vérification avant toute nouvelle conversion.
- Création et suivi de contrats avec référence, client, dates, taux horaire HT, volume mensuel, notes et statuts brouillon/actif/terminé/résilié.
- Factures : ajout d'une action confirmée pour marquer une facture brouillon comme envoyée, puis possibilité de la marquer payée.
- Le bouton « Préparer une facture » d'une fiche client préremplit le nom du client dans le formulaire de facturation existant.
- Les tables clients, devis et contrats sont incluses dans la sauvegarde/restauration JSON de l'application.
- Le format de sauvegarde est passé à la version 3 ; les anciennes sauvegardes v1/v2 qui ne contiennent pas encore les tables commerciales restent acceptées, avec ces nouvelles tables initialisées comme vides.

## Vérifications et limites
- Chaque modification ciblée du code a été appliquée sur une branche dédiée et vérifiée par nombre d'occurrences avant remplacement.
- La vérification syntaxique JavaScript et le test fonctionnel navigateur/Supabase restent à confirmer avant fusion.
- Le module utilise les tables et colonnes déjà existantes ; aucune migration de schéma n'a été appliquée.
- Les politiques RLS actuelles de clients, devis et contrats autorisent le propriétaire (user_id = auth.uid()). Les comptes membres d'un espace partagé peuvent nécessiter des politiques dédiées alignées sur vigentra_workspace_owner_id() ; ne pas élargir les accès sans revue et test.
- Les PDF sont des documents de travail : l'identité légale complète de TEA, les mentions obligatoires, les modalités de paiement et les conditions doivent être complétées et validées avant émission officielle.
- Aucun e-mail, aucune facture réelle et aucun contrat réel n'ont été envoyés ou émis durant cette modification.
