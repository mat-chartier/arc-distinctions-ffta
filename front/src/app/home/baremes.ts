// Données de présentation des distinctions et de leurs paliers (écran d'accueil).
//
// SOURCE DE VÉRITÉ : front/src/app/model/distinction-rules.ts (barèmes codés en dur)
// + règlement FFTA (docs/distinctions_0.pdf). Ce fichier en est une transcription pour
// l'affichage. Duplication assumée (barèmes FFTA stables) : en cas de modification des
// seuils dans distinction-rules.ts, penser à répercuter ici.
//
// Chaque badge porte un `image` = slug de fichier attendu dans
// public/images/distinctions/<slug>.png. Si le fichier est absent, l'accueil retombe sur
// une pastille colorée (couleur de cible) — sauf badges de colonne (DN) qui n'affichent
// alors que le score.

// Barème présenté en un seul tableau à plusieurs colonnes de score (Salle, TAE DI, TAE DN).
export interface ColonneScore {
  plage: string; // score formaté (« 455–479 » ou « 660 et + »)
  image?: string; // badge propre à la colonne (ex. TAE DN bordure or / argent)
}

export interface PalierMulti {
  nom: string;
  image?: string; // badge commun à toutes les colonnes (Salle, TAE DI)
  colonnes: ColonneScore[];
}

export interface BaremeMulti {
  titre: string;
  colonnes: string[]; // en-têtes des colonnes de score
  note?: string;
  paliers: PalierMulti[];
}

// Campagne : médaille sur fond → rendu deux tons, tableau multi-colonnes.
export interface PalierCampagneMulti {
  medaille: 'Or' | 'Argent' | 'Vert' | 'Noir';
  fond: 'blanc' | 'vert' | 'noir' | 'bleu' | 'rouge' | 'orange';
  image: string;
  plages: string[]; // une plage de score par colonne
}

export interface BaremeCampagneMulti {
  titre: string;
  colonnes: string[];
  note?: string;
  paliers: PalierCampagneMulti[];
}

/** Plage de score formatée pour la borne i d'une liste de bornes inférieures. */
function plageStr(bornes: number[], i: number): string {
  const min = bornes[i];
  const max = i < bornes.length - 1 ? bornes[i + 1] - 1 : undefined;
  return max != null ? `${min}–${max}` : `${min} et +`;
}

// ── SALLE / TAE DI : 9 paliers de couleur, badge commun aux deux armes ───────
const NOMS_S_TAE = ['Vert (Promo)', 'Blanc', 'Noir', 'Bleu', 'Rouge', 'Jaune', '1 étoile', '2 étoiles', '3 étoiles'];
const CLES_S_TAE = ['vert', 'blanc', 'noir', 'bleu', 'rouge', 'jaune', '1-etoile', '2-etoiles', '3-etoiles'];

/** Paliers d'un barème Salle/TAE-DI fusionné : badge commun + 2 colonnes (classique, poulies). */
function paliersMultiSTae(prefix: string, bornesCL: number[], bornesCO: number[]): PalierMulti[] {
  return NOMS_S_TAE.map((nom, i) => ({
    nom,
    image: `${prefix}-${CLES_S_TAE[i]}`,
    colonnes: [{ plage: plageStr(bornesCL, i) }, { plage: plageStr(bornesCO, i) }],
  }));
}

// ── SALLE (18 m) ────────────────────────────────────────────────────────────
const NOTE_ETOILES = 'Étoiles : blason 40 uniquement';

export const SALLE: BaremeMulti = {
  titre: 'Salle — 18 m',
  colonnes: ['Arc classique / Arc nu', 'Arc à Poulies'],
  note: NOTE_ETOILES,
  paliers: paliersMultiSTae(
    'salle',
    [455, 480, 500, 515, 530, 545, 555, 565, 575],
    [540, 550, 555, 560, 565, 570, 575, 580, 585],
  ),
};

// ── TAE DI (Distances Internationales) ──────────────────────────────────────
export const TAE_DI: BaremeMulti = {
  titre: 'TAE DI — Distances Internationales',
  colonnes: ['Arc classique', 'Arc à Poulies'],
  paliers: paliersMultiSTae(
    'taedi',
    [480, 510, 535, 560, 585, 605, 625, 645, 660],
    [620, 635, 645, 655, 665, 675, 685, 695, 700],
  ),
};

// ── TAE DN (Distances Nationales) : écussons « Archers », bordure or / argent ─
const NOMS_DN = ['1 Archer', '2 Archers', '3 Archers', '4 Archers', "Archer d'Or"];
const CLES_DN = ['1-archer', '2-archers', '3-archers', '4-archers', 'archer-or'];
const DN_CL = [500, 550, 600, 640, 670];
const DN_CO = [550, 600, 640, 670, 690];

export const TAE_DN: BaremeMulti = {
  titre: 'TAE DN — Distances Nationales',
  colonnes: ['Arc classique (bordure or)', 'Arc à Poulies (bordure argent)'],
  paliers: NOMS_DN.map((nom, i) => ({
    nom,
    // Pas de badge commun : le visuel diffère par arme (bordure or vs argent).
    colonnes: [
      { plage: plageStr(DN_CL, i), image: `taedn-classique-${CLES_DN[i]}` },
      { plage: plageStr(DN_CO, i), image: `taedn-poulies-${CLES_DN[i]}` },
    ],
  })),
};

// ── CAMPAGNE ────────────────────────────────────────────────────────────────
// Médaille / fond des paliers Écureuil (6) et Marcassin (4 premiers).
const CAMP_DEF: { medaille: PalierCampagneMulti['medaille']; fond: PalierCampagneMulti['fond']; image: string }[] = [
  { medaille: 'Vert', fond: 'blanc', image: 'vert-blanc' },
  { medaille: 'Argent', fond: 'vert', image: 'argent-vert' },
  { medaille: 'Or', fond: 'blanc', image: 'or-blanc' },
  { medaille: 'Or', fond: 'noir', image: 'or-noir' },
  { medaille: 'Or', fond: 'bleu', image: 'or-bleu' },
  { medaille: 'Or', fond: 'rouge', image: 'or-rouge' },
];

/** Paliers d'un barème campagne fusionné : badge médaille/fond commun + N colonnes de score. */
function paliersCampMulti(prefix: string, bornesParColonne: number[][]): PalierCampagneMulti[] {
  const nbPaliers = bornesParColonne[0].length;
  return Array.from({ length: nbPaliers }, (_, i) => ({
    medaille: CAMP_DEF[i].medaille,
    fond: CAMP_DEF[i].fond,
    image: `${prefix}-${CAMP_DEF[i].image}`,
    plages: bornesParColonne.map((bornes) => plageStr(bornes, i)),
  }));
}

export const CAMPAGNE_MARCASSIN: BaremeCampagneMulti = {
  titre: 'Marcassins — Arc classique',
  colonnes: ['Score'],
  note: 'U13 / U15 : piquet blanc — U18 : piquet bleu',
  paliers: paliersCampMulti('campagne-marcassin', [[160, 210, 270, 320]]),
};

export const CAMPAGNE_ECUREUIL: BaremeCampagneMulti = {
  titre: 'Écureuils',
  colonnes: ['Arc classique (U21+)', 'Arc à Poulies (U18+)', 'Arc nu — U18 (piquet blanc)', 'Arc nu — U21+ (piquet bleu)'],
  paliers: paliersCampMulti('campagne-ecureuil', [
    [200, 240, 260, 300, 340, 380],
    [220, 260, 280, 320, 360, 400],
    [160, 200, 220, 260, 300, 340],
    [180, 220, 240, 280, 320, 360],
  ]),
};

// ── TIR 3D ──────────────────────────────────────────────────────────────────
// Parcours 1×24 cibles. Brocard (adultes) : mêmes médailles/fonds que l'Écureuil
// campagne (6 paliers), 5 colonnes d'arc. Lynx (jeunes) : 3 paliers sur fond orange.
// En 3D, classiques (CL) et poulies (CO) sont classés « Arc Libre ».
export const BROCARD_3D: BaremeCampagneMulti = {
  titre: 'Tir 3D — Brocard (adultes)',
  colonnes: ['Arc Droit', 'Arc Chasse', 'Arc Nu', 'Arc à Poulies Nu', 'Arc Libre'],
  note: 'Arc Droit / Chasse / Nu / Poulies Nu : U21+ — Arc Libre : U18+ (classique + poulies)',
  paliers: paliersCampMulti('3d-brocard', [
    [70, 125, 185, 235, 270, 335],
    [85, 140, 195, 260, 300, 360],
    [110, 160, 220, 270, 315, 375],
    [140, 210, 280, 330, 385, 435],
    [185, 260, 330, 380, 435, 460],
  ]),
};

// Paliers Lynx : médaille/fond spécifiques (fond orange), non couverts par CAMP_DEF.
const LYNX_DEF: { medaille: PalierCampagneMulti['medaille']; fond: PalierCampagneMulti['fond']; image: string }[] = [
  { medaille: 'Noir', fond: 'orange', image: 'noir-orange' },
  { medaille: 'Argent', fond: 'orange', image: 'argent-orange' },
  { medaille: 'Or', fond: 'orange', image: 'or-orange' },
];

const LYNX_BORNES = [150, 175, 210];

export const LYNX_3D: BaremeCampagneMulti = {
  titre: 'Tir 3D — Lynx (U13 / U15 / U18)',
  colonnes: ['Arc Nu'],
  note: 'Arc Nu uniquement',
  paliers: LYNX_DEF.map((def, i) => ({
    medaille: def.medaille,
    fond: def.fond,
    image: `3d-lynx-${def.image}`,
    plages: [plageStr(LYNX_BORNES, i)],
  })),
};
