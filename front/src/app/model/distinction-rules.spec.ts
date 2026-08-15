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
