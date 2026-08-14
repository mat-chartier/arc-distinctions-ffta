# Barème Tir 3D — extraction pour validation

> **But** : transcrire le barème 3D du règlement FFTA dans un format directement
> exploitable pour coder les règles d'attribution (`distinction-rules.ts`), et le faire
> **valider** avant implémentation.
>
> **Sources** :
> - Règlement : `docs/ffta-reglement-distinctions-2023.pdf`, page imprimée 58 (« Badges 3D »).
> - Données réelles : `docs/ResultatsIndividuels_Global_2026_0138088_14-08-2026_07-50-48.csv`
>   (25 lignes de discipline `3`).
>
> ⚠️ **À valider par mat.** Les points marqués 🔶 sont des hypothèses à confirmer.

---

## 1. Structure

Deux groupes, selon la catégorie d'âge :

- **BROCARD** — adultes (U21, Seniors 1/2/3). 5 types d'arc, 6 niveaux.
- **LYNX** — jeunes (U13/U15/U18), Arc Nu uniquement, 3 niveaux.

Parcours : **1 × 24 cibles** (confirmé : toutes les lignes réelles ont
`FORMULE_TIR = "1 X 24 CIBLES"`).

---

## 2. Barème BROCARD (adultes)

Score minimum à atteindre pour chaque niveau, par type d'arc :

| Niveau (médaille / fond) | Arc Droit | Arc Chasse | Arc Nu | Arc à Poulies Nu | Arc Libre |
|--------------------------|----------:|-----------:|-------:|-----------------:|----------:|
| Vert sur fond blanc      |    70     |     85     |  110   |       140        |    185    |
| Argent sur fond vert     |   125     |    140     |  160   |       210        |    260    |
| Or sur fond blanc        |   185     |    195     |  220   |       280        |    330    |
| Or sur fond noir         |   235     |    260     |  270   |       330        |    380    |
| Or sur fond bleu         |   270     |    300     |  315   |       385        |    435    |
| Or sur fond rouge        |   335     |    360     |  375   |       435        |    460    |

Catégories concernées (d'après le règlement) :
- Arc Droit / Chasse / Nu / Poulies Nu → **U21, S1, S2, S3**.
- Arc Libre → **U18, U21, S1, S2, S3** (le libre inclut les U18).

## 3. Barème LYNX (jeunes)

Arc Nu, catégories **U13 / U15 / U18** :

| Niveau (médaille / fond) | Arc Nu |
|--------------------------|-------:|
| Noir sur fond orange     |  150   |
| Argent sur fond orange   |  175   |
| Or sur fond orange       |  210   |

🔶 **Non vérifiable** sur l'export fourni (aucun jeune en 3D dans les données) : ces
seuils viennent uniquement du PDF.

---

## 4. Mapping code d'arme (export FFTA → colonne de barème) — ✅ validé

Mapping final (validé par mat) : dans l'export, en 3D, le code **`CL` = Arc Nu**. Les
5 colonnes du barème ont chacune un code.

| Code export | Colonne de barème | Note |
|-------------|-------------------|------|
| `AD`        | Arc Droit         | |
| `AC`        | Arc Chasse        | |
| `CL`        | Arc Nu            | en 3D, le code export `CL` = arc nu |
| `BB`        | Arc Nu            | bare bow (absent des données 3D) |
| `CO`        | Arc à Poulies Nu  | absent des données 3D |
| `TL`        | Arc Libre         | tir libre |

---

## 5. Règle d'aiguillage LYNX vs BROCARD — ✅ validé

```
si arme ∈ {CL, BB} (Arc Nu)  ET  catégorie ∈ {U13, U15, U18}  → LYNX
sinon                                                           → BROCARD (colonne selon l'arme)
```

- Un **U18** peut tirer en **Arc Nu** (`CL`/`BB` → LYNX) ou **Arc Libre** (`TL` → BROCARD,
  colonne Libre). Pour tout autre arc, il doit être **surclassé** → traité comme adulte
  dans BROCARD (aucun cas particulier à coder : il tombe naturellement dans la colonne de
  son arme).

---

## 6. Confrontation aux données réelles (25 lignes)

Niveau calculé avec le mapping proposé (§4) et le barème (§2). Sert à repérer une
incohérence de seuils ou de mapping.

| Arme | Colonne | Cat | Score | → Niveau calculé |
|------|---------|-----|------:|------------------|
| AC | Chasse | S2 | 197 | Or sur fond blanc |
| AC | Chasse | S2 | 201 | Or sur fond blanc |
| AC | Chasse | S2 | 205 | Or sur fond blanc |
| AC | Chasse | S2 | 217 | Or sur fond blanc |
| AC | Chasse | S2 | 224 | Or sur fond blanc |
| AC | Chasse | S2 | 237 | Or sur fond blanc |
| AC | Chasse | S2 | 238 | Or sur fond blanc |
| AD | Droit | S3 | 207 | Or sur fond blanc |
| AD | Droit | S3 | 212 | Or sur fond blanc |
| AD | Droit | S3 | 229 | Or sur fond blanc |
| CL | Nu | S3 | 149 | Vert sur fond blanc |
| CL | Nu | S3 | 180 | Argent sur fond vert |
| CL | Nu | S2 | 198 | Argent sur fond vert |
| CL | Nu | S3 | 221 | Or sur fond blanc |
| CL | Nu | S3 | 312 | Or sur fond noir |
| CL | Nu | S3 | 332 | Or sur fond bleu |
| CL | Nu | S3 | 333 | Or sur fond bleu |
| CL | Nu | S2 | 364 | Or sur fond bleu |
| CL | Nu | S2 | 370 | Or sur fond bleu |
| CL | Nu | S2 | 386 | Or sur fond rouge |
| CL | Nu | S2 | 397 | Or sur fond rouge |
| CL | Nu | S2 | 419 | Or sur fond rouge |
| TL | Libre | S1 | 253 | Vert sur fond blanc |
| TL | Libre | S2 | 409 | Or sur fond noir |
| TL | Libre | S2 | 440 | Or sur fond bleu |

---

## 7. Champ `DISTANCE`

Vaut `1` (TL) ou `2` (AC/AD/CL) dans l'export — **ce ne sont pas des mètres** et ce champ
n'entre pas dans le barème 3D. Il sera **forcé à `0`** à l'import pour ne pas polluer la
clé d'unicité des distinctions.

---

## 8. Statut — ✅ validé (mat, 2026-08-14)

- `CL`/`BB` → Arc Nu ; `CO` → Arc à Poulies Nu ; `TL` → Arc Libre ; `AD` → Droit ;
  `AC` → Chasse.
- LYNX = `{CL, BB}` + {U13,U15,U18}, seuils 150/175/210.
- U18 : Arc Nu (Lynx) ou Arc Libre (Brocard) ; autres arcs → surclassé (Brocard adulte).
