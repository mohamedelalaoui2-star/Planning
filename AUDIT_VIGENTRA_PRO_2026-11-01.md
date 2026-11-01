# VIGENTRA PRO — amélioration du planning intelligent
Date : 2026-11-01
Branche : feat/planning-intelligent-affectation
Base : main
Objectif : fiabiliser la recommandation et l'affectation sans abonnement ni API payante.

## Examen préalable
Le dépôt utilise une application HTML/JavaScript unique (`index.html`), Supabase JS v2, et des données chargées depuis les tables `agents`, `Site`, `planning`, `qualifications` et `indisponibilites`. Les fonctions de planning, calendrier, export PDF, filtres et pointage ont été conservées.

## Modifications sur cette branche
- La recommandation et la validation avant insertion partagent désormais le même contrôle de qualification.
- Le contrôle lit la qualification principale et les autres qualifications de la fiche agent.
- Il prend aussi en compte les qualifications présentes dans la table `qualifications`.
- Une qualification enregistrée avec une date d'expiration antérieure à la date de vacation n'est pas admissible.
- Une carte professionnelle dont la date d'expiration précède la date de vacation bloque la recommandation et l'enregistrement.
- Les erreurs d'affectation donnent une raison explicite.
- La création reste manuelle et protégée par confirmation : la recommandation ne crée pas de vacation à elle seule.

## Vérifications
- Vérifications statiques des blocs modifiés : ancres trouvées une fois, anciennes validations remplacées.
- À vérifier ensuite dans l'application avec un compte de test : qualification principale, qualification secondaire, qualification dans la table dédiée, carte pro expirée, qualification expirée et refus d'un agent non qualifié.
- Aucun enregistrement Supabase n'a été modifié, aucune donnée n'a été supprimée, aucun e-mail n'a été envoyé.
- Aucun coût ou service payant ajouté.

## Limites
Le contrôle côté navigateur améliore l'expérience et réduit les erreurs, mais ne remplace pas une validation côté base de données/RPC si plusieurs directeurs peuvent modifier le planning simultanément. Les seuils légaux et dérogations doivent être vérifiés selon la situation de travail réelle.
