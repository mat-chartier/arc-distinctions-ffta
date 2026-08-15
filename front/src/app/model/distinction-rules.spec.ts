import { distinctionRules } from './distinction-rules';

// Résultat minimal pour tester l'attribution (les champs non utilisés par le
// barème Nature sont laissés neutres).
function res(over: Partial<any>): any {
  return { discipline: 'N', score: 0, distance: 0, blason: '', arme: '', categorie: '', ...over };
}

describe('distinctionRules — Tir Nature (getNatureDistinction via getDistinction "N")', () => {
  it('Marcassin : Arc Nu jeune, seuils 165/275/390', () => {
    // U15, Arc Nu (CL) → groupe Marcassin
    expect(distinctionRules.getDistinction(res({ arme: 'CL', categorie: 'U15', score: 164 }))).toBeNull();
    expect(distinctionRules.getDistinction(res({ arme: 'CL', categorie: 'U15', score: 165 }))!.nom)
      .toBe('Noir sur fond orange');
    expect(distinctionRules.getDistinction(res({ arme: 'CL', categorie: 'U15', score: 275 }))!.nom)
      .toBe('Argent sur fond orange');
    const d = distinctionRules.getDistinction(res({ arme: 'BB', categorie: 'U13', score: 400 }))!;
    expect(d.nom).toBe('Or sur fond orange');
    expect(d.discipline).toBe('NATURE_MARCASSIN');
  });

  it('Sanglier : colonne selon l\'arme', () => {
    // Arc Nu adulte (CL/S2) → Sanglier, seuils 200/315/425/500/575/615
    expect(distinctionRules.getDistinction(res({ arme: 'CL', categorie: 'S2', score: 315 }))!.nom)
      .toBe('Argent sur fond vert');
    // Arc Droit (AD/S3) au plafond → Or sur fond rouge (>= 540)
    expect(distinctionRules.getDistinction(res({ arme: 'AD', categorie: 'S3', score: 540 }))!.nom)
      .toBe('Or sur fond rouge');
    // Arc Libre (TL/S1) juste au 1er seuil (300) → Vert sur fond blanc
    const libre = distinctionRules.getDistinction(res({ arme: 'TL', categorie: 'S1', score: 300 }))!;
    expect(libre.nom).toBe('Vert sur fond blanc');
    expect(libre.discipline).toBe('NATURE_SANGLIER');
    // Arc à Poulies Nu (CO) sous le 1er seuil (250) → null
    expect(distinctionRules.getDistinction(res({ arme: 'CO', categorie: 'U21', score: 249 }))).toBeNull();
  });

  it('U18 Arc Libre → Sanglier (colonne Libre), pas Marcassin', () => {
    const d = distinctionRules.getDistinction(res({ arme: 'TL', categorie: 'U18', score: 415 }))!;
    expect(d.discipline).toBe('NATURE_SANGLIER');
    expect(d.nom).toBe('Argent sur fond vert');
  });

  it('getSameOrBetter renvoie le niveau et les supérieurs', () => {
    expect(distinctionRules.getSameOrBetter('Or sur fond blanc', 'NATURE_SANGLIER', 'AD'))
      .toEqual(['Or sur fond blanc', 'Or sur fond noir', 'Or sur fond bleu', 'Or sur fond rouge']);
    expect(distinctionRules.getSameOrBetter('Argent sur fond orange', 'NATURE_MARCASSIN', 'CL'))
      .toEqual(['Argent sur fond orange', 'Or sur fond orange']);
  });
});

describe('distinctionRules — Beursault (getBeursaultDistinction via getDistinction "B")', () => {
  // Pour Beursault, le champ `score` porte le nombre d'honneurs (SCORE_DIST1).
  function bres(honneurs: number, arme = 'CL'): any {
    return { discipline: 'B', score: honneurs, distance: 0, blason: '', arme, categorie: 'S1' };
  }

  it('attribue les marmots selon les honneurs (32/35/38/40), sans logique d\'arme', () => {
    expect(distinctionRules.getDistinction(bres(31))).toBeNull();
    expect(distinctionRules.getDistinction(bres(32))!.nom).toBe('1 marmot');
    expect(distinctionRules.getDistinction(bres(34))!.nom).toBe('1 marmot');
    expect(distinctionRules.getDistinction(bres(35))!.nom).toBe('2 marmots');
    expect(distinctionRules.getDistinction(bres(39))!.nom).toBe('3 marmots');
    expect(distinctionRules.getDistinction(bres(40))!.nom).toBe('4 marmots');
    expect(distinctionRules.getDistinction(bres(45))!.nom).toBe('4 marmots');
    // Même résultat quelle que soit l'arme (poulies).
    const d = distinctionRules.getDistinction(bres(36, 'CO'))!;
    expect(d.nom).toBe('2 marmots');
    expect(d.discipline).toBe('BEURSAULT');
  });

  it('getSameOrBetter couvre les marmots', () => {
    expect(distinctionRules.getSameOrBetter('2 marmots', 'BEURSAULT', 'CL'))
      .toEqual(['2 marmots', '3 marmots', '4 marmots']);
  });
});

// Constructeur de résultat générique pour les disciplines historiques.
function r(over: Partial<any>): any {
  return { discipline: '', score: 0, distance: 0, blason: '', arme: '', categorie: 'S1', ...over };
}

describe('distinctionRules — Salle (S)', () => {
  it('Arc classique/nu : paliers de couleur selon le score', () => {
    expect(distinctionRules.getDistinction(r({ discipline: 'S', arme: 'CL', score: 454 }))).toBeNull();
    expect(distinctionRules.getDistinction(r({ discipline: 'S', arme: 'CL', score: 455 }))!.nom).toBe('Vert (Promo)');
    expect(distinctionRules.getDistinction(r({ discipline: 'S', arme: 'CL', score: 515 }))!.nom).toBe('Bleu');
    expect(distinctionRules.getDistinction(r({ discipline: 'S', arme: 'CL', score: 545 }))!.nom).toBe('Jaune');
    const d = distinctionRules.getDistinction(r({ discipline: 'S', arme: 'CL', score: 575, blason: '40' }))!;
    expect(d.nom).toBe('3 étoiles');
    expect(d.discipline).toBe('Salle');
  });

  it('étoiles réservées au blason 40', () => {
    // Sur blason 60, un score d\'étoile ne donne aucune distinction (dernier palier = Jaune).
    expect(distinctionRules.getDistinction(r({ discipline: 'S', arme: 'CL', score: 575, blason: '60' }))).toBeNull();
  });

  it('Arc à poulies (CO) : barème dédié', () => {
    expect(distinctionRules.getDistinction(r({ discipline: 'S', arme: 'CO', score: 540 }))!.nom).toBe('Vert (Promo)');
    expect(distinctionRules.getDistinction(r({ discipline: 'S', arme: 'CO', score: 570 }))!.nom).toBe('Jaune');
  });
});

describe('distinctionRules — TAE (T) : aiguillage DI/DN + barèmes', () => {
  it('TAE DI classique (distance 70)', () => {
    const d = distinctionRules.getDistinction(r({ discipline: 'T', arme: 'CL', distance: 70, score: 480 }))!;
    expect(d.discipline).toBe('TAEDI');
    expect(d.nom).toBe('Vert (Promo)');
    expect(distinctionRules.getDistinction(r({ discipline: 'T', arme: 'CL', distance: 70, score: 660 }))!.nom).toBe('3 étoiles');
  });

  it('TAE DI poulies (distance 60)', () => {
    expect(distinctionRules.getDistinction(r({ discipline: 'T', arme: 'CO', distance: 60, score: 620 }))!.nom).toBe('Vert (Promo)');
    expect(distinctionRules.getDistinction(r({ discipline: 'T', arme: 'CO', distance: 60, score: 700 }))!.nom).toBe('3 étoiles');
  });

  it('TAE DN classique « or » (distance 50, blason ≠ 80)', () => {
    const d = distinctionRules.getDistinction(r({ discipline: 'T', arme: 'CL', distance: 50, blason: '122', score: 500 }))!;
    expect(d.discipline).toBe('TAEDN');
    expect(d.nom).toBe('1 Archer (or)');
    expect(distinctionRules.getDistinction(r({ discipline: 'T', arme: 'CL', distance: 50, blason: '122', score: 670 }))!.nom).toBe("Archer d'or (or)");
  });

  it('TAE DN poulies « argent »', () => {
    expect(distinctionRules.getDistinction(r({ discipline: 'T', arme: 'CO', distance: 50, blason: '122', score: 690 }))!.nom).toBe("Archer d'or (argent)");
  });
});

describe('distinctionRules — Campagne (C)', () => {
  it('Marcassin (CL, jeune) reporte le piquet', () => {
    const d = distinctionRules.getDistinction(r({ discipline: 'C', arme: 'CL', categorie: 'U15', score: 210, piquet: 'blanc' }))!;
    expect(d.discipline).toBe('CAMPAGNE_MARCASSIN');
    expect(d.nom).toBe('Argent sur fond vert');
    expect(d.piquet).toBe('blanc');
  });

  it('Écureuil selon l\'arme (CL/CO/BB) avec seuils distincts', () => {
    expect(distinctionRules.getDistinction(r({ discipline: 'C', arme: 'CL', categorie: 'S1', score: 200 }))!.nom).toBe('Vert sur fond blanc');
    expect(distinctionRules.getDistinction(r({ discipline: 'C', arme: 'CO', categorie: 'U18', score: 220 }))!.nom).toBe('Vert sur fond blanc');
    const bb = distinctionRules.getDistinction(r({ discipline: 'C', arme: 'BB', categorie: 'U18', score: 160 }))!;
    expect(bb.discipline).toBe('CAMPAGNE_ECUREUIL');
    expect(bb.nom).toBe('Vert sur fond blanc');
  });
});

describe('distinctionRules — 3D (3) : piège CL = Arc Nu', () => {
  it('Brocard : colonne selon l\'arme (CL = Arc Nu chez les adultes)', () => {
    const d = distinctionRules.getDistinction(r({ discipline: '3', arme: 'CL', categorie: 'S2', score: 220 }))!;
    expect(d.discipline).toBe('3D_BROCARD');
    expect(d.nom).toBe('Or sur fond blanc');
  });

  it('Lynx : Arc Nu chez les jeunes', () => {
    const d = distinctionRules.getDistinction(r({ discipline: '3', arme: 'CL', categorie: 'U15', score: 175 }))!;
    expect(d.discipline).toBe('3D_LYNX');
    expect(d.nom).toBe('Argent sur fond orange');
  });
});

describe('distinctionRules — routage getDistinction & getSameOrBetter', () => {
  it('un code discipline inconnu renvoie null', () => {
    expect(distinctionRules.getDistinction(r({ discipline: 'Z', score: 999 }))).toBeNull();
  });

  it('getSameOrBetter — familles historiques', () => {
    expect(distinctionRules.getSameOrBetter('Bleu', 'Salle', 'CL'))
      .toEqual(['Bleu', 'Rouge', 'Jaune', '1 étoile', '2 étoiles', '3 étoiles']);
    expect(distinctionRules.getSameOrBetter('4 Archers (or)', 'TAEDN', 'CL'))
      .toEqual(['4 Archers (or)', "Archer d'or (or)"]);
    expect(distinctionRules.getSameOrBetter('3 Archers (argent)', 'TAEDN', 'CO'))
      .toEqual(['3 Archers (argent)', '4 Archers (argent)', "Archer d'or (argent)"]);
    expect(distinctionRules.getSameOrBetter('Or sur fond bleu', 'CAMPAGNE_ECUREUIL', 'CL'))
      .toEqual(['Or sur fond bleu', 'Or sur fond rouge']);
    expect(distinctionRules.getSameOrBetter('Or sur fond noir', '3D_BROCARD', 'CL'))
      .toEqual(['Or sur fond noir', 'Or sur fond bleu', 'Or sur fond rouge']);
  });
});
