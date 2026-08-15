# Barème Tir Nature — extraction pour validation

> **But** : transcrire le barème Tir Nature du règlement FFTA dans un format directement
> exploitable pour coder les règles d'attribution (`distinction-rules.ts`).
>
> **Sources** :
> - Règlement : `docs/ffta-reglement-distinctions-2023.pdf`, page imprimée 57
>   (« Écussons Tir Nature »).
> - Données réelles : `docs/ResultatsIndividuels_Global_2026_0138088_14-08-2026_07-50-48.csv`.

---

## 1. Structure

Deux groupes, selon la catégorie d'âge (calqué sur le Tir 3D Brocard/Lynx) :

- **SANGLIER** — adultes (U21, Seniors 1/2/3). 5 types d'arc, 6 niveaux.
- **MARCASSIN** — jeunes (U13/U15/U18), Arc Nu uniquement, 3 niveaux.

Parcours : **1 parcours de 21 cibles tirées 1 fois** (le 3D = 24 cibles).

---

## 2. Barème SANGLIER (adultes)

Score minimum à atteindre pour chaque niveau, par type d'arc :

| Niveau (médaille / fond) | Arc Droit | Arc Chasse | Arc Nu | Arc à Poulies Nu | Arc Libre |
|--------------------------|----------:|-----------:|-------:|-----------------:|----------:|
| Vert sur fond blanc      |    125    |    175     |  200   |       250        |    300    |
| Argent sur fond vert     |    240    |    290     |  315   |       340        |    415    |
| Or sur fond blanc        |    350    |    400     |  425   |       450        |    525    |
| Or sur fond noir         |    425    |    475     |  500   |       525        |    600    |
| Or sur fond bleu         |    500    |    550     |  575   |       600        |    675    |
| Or sur fond rouge        |    540    |    590     |  615   |       640        |    715    |

Catégories concernées (d'après le règlement) :
- Arc Droit / Chasse / Nu / Poulies Nu → **U21, S1, S2, S3**.
- Arc Libre → **U18, U21, S1, S2, S3** (le libre inclut les U18).

## 3. Barème MARCASSIN (jeunes)

Arc Nu, catégories **U13 / U15 / U18** :

| Niveau (médaille / fond) | Arc Nu |
|--------------------------|-------:|
| Noir sur fond orange     |  165   |
| Argent sur fond orange   |  275   |
| Or sur fond orange       |  390   |

---

## 4. Mapping code d'arme (export FFTA → colonne de barème) — ✅ validé

Identique au Tir 3D. Dans l'export, en Nature, le code **`CL` = Arc Nu** (pas classique).

| Code export | Colonne de barème | Note |
|-------------|-------------------|------|
| `AD`        | Arc Droit         | |
| `AC`        | Arc Chasse        | |
| `CL`        | Arc Nu            | en Nature, le code export `CL` = arc nu |
| `BB`        | Arc Nu            | bare bow |
| `CO`        | Arc à Poulies Nu  | |
| `TL`        | Arc Libre         | tir libre |

---

## 5. Règle d'aiguillage MARCASSIN vs SANGLIER — ✅ validé

```
si arme ∈ {CL, BB} (Arc Nu)  ET  catégorie ∈ {U13, U15, U18}  → MARCASSIN
sinon                                                           → SANGLIER (colonne selon l'arme)
```

- Un **U18** peut tirer en **Arc Nu** (`CL`/`BB` → MARCASSIN) ou **Arc Libre**
  (`TL` → SANGLIER, colonne Libre). Pour tout autre arc, il est **surclassé** →
  traité comme adulte dans SANGLIER (colonne de son arme).

---

## 6. Code discipline export

⚠️ Le code discipline utilisé à l'import est **`N`** (déjà supposé par le stub
`getDistinction()`). **L'export réel fourni ne contient aucune ligne Nature**
(disciplines présentes : `S`, `T`, `C`, `3`, `B`=Beursault) → non validable sur
données réelles, comme le Lynx 3D en son temps. Retenu tel quel.

---

## 7. Champ `DISTANCE`

N'entre pas dans le barème Nature. **Forcé à `0`** à l'import (comme 3D) pour ne pas
polluer la clé d'unicité des distinctions.

---

## 8. Statut — ✅ validé (mat, 2026-08-15)

- `CL`/`BB` → Arc Nu ; `CO` → Arc à Poulies Nu ; `TL` → Arc Libre ; `AD` → Droit ;
  `AC` → Chasse.
- MARCASSIN = `{CL, BB}` + {U13,U15,U18}, seuils 165/275/390.
- SANGLIER : 6 niveaux, colonnes AD/AC/Arc Nu/Poulies Nu/Libre (§2).
- Code discipline export = `N` (non vérifiable sur les données fournies).
