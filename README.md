# Arc Distinctions FFTA

Application de gestion des distinctions de tir à l'arc pour un club affilié à la FFTA (Fédération Française de Tir à l'Arc).

## Fonctionnalités

- **Import de résultats** : import de fichiers CSV au format FFTA (export officiel), avec prévisualisation avant confirmation
- **Calcul automatique des distinctions** : détection des distinctions obtenues selon les barèmes officiels (Salle, TAE DI / DN, Tir Campagne)
- **Liste des distinctions** : suivi du statut de chaque distinction (à commander, à remettre, donnée…)
- **Distinctions à commander** : vue regroupée par type pour faciliter les commandes
- **Fiche archer** : historique des résultats et distinctions par archer

## Architecture technique

**SPA Angular 19** hébergée sur **Firebase Hosting**, avec **Cloud Firestore** comme base de données.

```
┌─────────────────────────────────────────┐
│           Firebase Hosting              │
│         (arc-distinctions.web.app)      │
│                                         │
│  Angular 19 SPA                         │
│  ├── PrimeNG 19 (composants UI)         │
│  ├── Bootstrap 5 (mise en page)         │
│  └── AppStore (cache en mémoire/localStorage) │
└────────────────────┬────────────────────┘
                     │
              Firebase SDK
                     │
┌────────────────────▼────────────────────┐
│           Cloud Firestore               │
│  ├── archers                            │
│  ├── resultats                          │
│  └── distinctions                       │
└─────────────────────────────────────────┘
```

L'application utilise un cache en mémoire (Angular Signals) avec persistance `localStorage` et invalidation temps réel via un listener Firestore sur un document de version partagé (`meta/cacheVersion`).

## Développement

```bash
cd front
npm install
npm start          # serveur de dev sur http://localhost:4200
```

## Déploiement

```bash
cd front
npm run deploy     # build + firebase deploy --only hosting
```
