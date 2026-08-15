import { ResultRaw } from './result-raw';

// Construit une ligne CSV (46 colonnes) avec des surcharges par index.
function row(overrides: Record<number, string>): string[] {
  const r = new Array(46).fill('');
  for (const [i, v] of Object.entries(overrides)) r[Number(i)] = v;
  return r;
}

describe('ResultRaw — mapping des colonnes CSV', () => {
  it('mappe les champs clés et convertit les numériques', () => {
    const raw = new ResultRaw(row({
      0: '2026',        // saison
      1: 'S',           // discipline
      3: 'DUPONT',      // nom
      4: 'Jean',        // prenom
      7: 'S1',          // categorie
      11: 'CL',         // arme
      13: '560',        // score
      17: '18',         // distance
      24: '2X18M',      // formuleTir
      41: '3',          // numDepart
      42: 'CHPT SALLE', // eprvNom
    }));

    expect(raw.saison).toBe(2026);
    expect(raw.discipline).toBe('S');
    expect(raw.nom).toBe('DUPONT');
    expect(raw.prenom).toBe('Jean');
    expect(raw.categorie).toBe('S1');
    expect(raw.arme).toBe('CL');
    expect(raw.score).toBe(560);
    expect(raw.distance).toBe(18);
    expect(raw.formuleTir).toBe('2X18M');
    expect(raw.numDepart).toBe(3);
    expect(raw.eprvNom).toBe('CHPT SALLE'); // passthrough (chaîne)
  });

  it('Beursault : SCORE et SCORE_DIST1 (honneurs) sont bien lus', () => {
    const raw = new ResultRaw(row({
      1: 'B',      // discipline
      11: 'CL',    // arme
      13: '36077', // SCORE = SCORE_DIST1×1000 + points
      29: '36',    // SCORE_DIST1 = honneurs
      30: '77',    // SCORE_DIST2 = points
    }));

    expect(raw.discipline).toBe('B');
    expect(raw.score).toBe(36077);
    expect(raw.scoreDist1).toBe(36); // honneurs, base du calcul des marmots
    expect(raw.scoreDist2).toBe(77);
  });
});
