# Arc Distinctions FFTA

Application de gestion des distinctions de tir à l'arc pour un club affilié à la FFTA (Fédération Française de Tir à l'Arc).

## Fonctionnalités

- **Import de résultats** : import de fichiers CSV au format FFTA (export officiel), avec prévisualisation avant confirmation
- **Calcul automatique des distinctions** : détection des distinctions obtenues selon les barèmes officiels de **toutes les disciplines du référentiel** :
  - Salle (18 m)
  - TAE extérieur — Distances Internationales (DI) et Distances Nationales (DN)
  - Tir Campagne (Marcassin / Écureuil)
  - Tir 3D (Brocard / Lynx)
  - Tir Nature (Sanglier / Marcassin)
  - Beursault (Marmots 1 à 4, sur le nombre d'« honneurs »)
- **Accueil public** : référentiel des distinctions et de leurs barèmes/paliers par discipline, avec les visuels des écussons
- **Liste des distinctions** : suivi du statut de chaque distinction (à commander, à remettre, donnée…), avec filtre par discipline et recherche
- **Distinctions à commander** : vue regroupée par type, tenant compte du **stock physique** disponible
- **Gestion du stock** : inventaire des écussons par type (clé de stock), décompté par les distinctions à remettre
- **Liste des archers** : recherche par nom, prénom ou numéro de licence
- **Fiche archer** : historique des résultats et distinctions par archer
- **Gestion des comptes** (admin) : création d'un accès pour un archer importé (invitation par email), attribution du rôle et renvoi d'invitation

## Architecture technique

**SPA Angular 19** hébergée sur **Firebase Hosting**, avec **Cloud Firestore** comme base de données et **Firebase Authentication** pour l'accès.

```
┌─────────────────────────────────────────────────┐
│                Firebase Hosting                 │
│            (arc-distinctions.web.app)           │
│                                                 │
│  Angular 19 SPA                                 │
│  ├── PrimeNG 19 (composants UI)                 │
│  ├── Thème maison (charte club)                 │
│  └── AppStore (cache Signals + localStorage)    │
└───────────────┬─────────────────────┬───────────┘
                │                     │
        Firebase Auth          Firebase SDK
        (rôles / accès)              │
                          ┌──────────▼──────────────┐
                          │      Cloud Firestore    │
                          │  ├── archers            │
                          │  ├── resultats          │
                          │  ├── distinctions       │
                          │  ├── stocks             │
                          │  ├── users (comptes)    │
                          │  └── meta/cacheVersion   │
                          └─────────────────────────┘
```

- **Authentification & rôles** : l'accueil (référentiel des barèmes) est **public**. Les pages de consultation (listes, fiche archer) sont protégées par `AuthGuardService` (tout utilisateur connecté). Les pages d'écriture (import de résultats, stock, `admin/users`) et les bascules d'édition des distinctions sont réservées aux **administrateurs** via `AdminGuardService` (rôle `admin`).
- **Comptes** : un document `users/{uid}` (clé = uid Firebase Auth) porte le rôle et pointe vers l'archer via `archerId`, ce qui garde l'identifiant de l'archer stable. La création d'un accès et l'invitation par email se font depuis l'écran de gestion des comptes (`AdminService`, sans backend). Un seed unique (`seed_admin_user.js`) provisionne le premier admin.
- **Règles Firestore** : versionnées dans `front/firestore.rules` (source de vérité = console Firebase ; le déploiement `--only hosting` ne les touche pas — publier les règles reste une action délibérée).
- **Cache** : cache en mémoire (Angular Signals) avec persistance `localStorage`, invalidé en temps réel via un listener Firestore sur un document de version partagé (`meta/cacheVersion`) — conçu pour rester sobre en lectures (plan Firebase gratuit).

## Développement

```bash
cd front
npm install
npm start          # serveur de dev sur http://localhost:4200
```

> ⚠️ La configuration de dév pointe sur le **même projet Firebase que la production**.
> Ne jamais créer/supprimer de données depuis la dév (lecture seule).

## Tests

Tests unitaires de **logique pure** (barèmes, clés de stock, parsing CSV), sans dépendance Firebase :

```bash
cd front
npm test           # ng test (Karma + Jasmine)
```

## Déploiement

```bash
cd front
npm run deploy     # build + firebase deploy --only hosting
```
