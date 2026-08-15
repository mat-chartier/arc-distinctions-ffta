# Barème Beursault — extraction pour validation

> **But** : transcrire les règles d'attribution des badges Marmot du Beursault dans
> un format exploitable pour coder `distinction-rules.ts`.
>
> **Sources** :
> - Règlement : `docs/ffta-reglement-distinctions-2023.pdf`, page imprimée 59
>   (« Badges Beursault (arcs classiques et arcs à poulies) »).
> - Données réelles : `docs/ResultatsIndividuels_Global_2026_0138088_14-08-2026_07-50-48.csv`
>   (5 lignes de discipline `B`).

---

## 1. Structure — ✅ validé (mat)

Le Beursault ne repose **pas** sur un seuil de score mais sur le **nombre
d'« honneurs »**. Le badge Marmot dépend **uniquement** du nombre d'honneurs :
**ni l'arme, ni la catégorie d'âge, ni le sexe** n'interviennent. Une seule
discipline `BEURSAULT`, 4 niveaux.

| Niveau      | Honneurs requis |
|-------------|----------------:|
| 1 marmot    | 32 |
| 2 marmots   | 35 |
| 3 marmots   | 38 |
| 4 marmots   | 40 |

Seuils codés : `[32, 35, 38, 40]`.

---

## 2. Code discipline & format des honneurs — ✅ décodé sur données réelles

- Code discipline export : **`B`**.
- Dans l'export, `SCORE = SCORE_DIST1 × 1000 + SCORE_DIST2`.
- **Honneurs = `SCORE_DIST1`** (métrique du badge). `SCORE_DIST2` = score en points
  (non utilisé pour l'attribution).

Confrontation aux 5 lignes réelles (toutes Arc Classique `CL`, adultes) :

| SCORE brut | SCORE_DIST1 (honneurs) | → Niveau calculé |
|-----------:|-----------------------:|------------------|
| 19030 | 19 | (aucun) |
| 26043 | 26 | (aucun) |
| 24043 | 24 | (aucun) |
| 36077 | 36 | 2 marmots |
| 34066 | 34 | 1 marmot |

---

## 3. Intégration — ✅ implémenté

- **Import** (`results-upload.component.ts`) : branche `discipline === 'B'` →
  `score = resultRaw.scoreDist1` (les honneurs deviennent le `score`), `distance = 0`.
  Pas d'extension de `ResultatDoc`.
- **Règles** (`distinction-rules.ts`) : `getBeursaultDistinction()` réutilise
  `getCampagneDistinctionByThresholds(score, DISTINCTIONS_BEURSAULT, [32,35,38,40],
  { discipline:'BEURSAULT', distance:0 })`. Aucune logique d'arme/catégorie.
- **Stock** (`stock-key.ts`) : `armeGroup` reste `null` pour Beursault → une seule
  entrée de stock par niveau de marmot. Libellé `Beursault - n marmot(s)`.

---

## 4. Statut — ✅ validé (mat, 2026-08-15)

- Attribution sur les honneurs seuls (32/35/38/40), toutes armes et catégories.
- Honneurs lus dans `SCORE_DIST1` de l'export.
