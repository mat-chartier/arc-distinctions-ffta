import { armeGroup, buildStockKey, stockTypeLabel } from './stock-key';

describe('stock-key — armeGroup', () => {
  it('distingue CO vs CL/BB uniquement pour Salle et TAEDI', () => {
    expect(armeGroup('Salle', 'CO')).toBe('CO');
    expect(armeGroup('Salle', 'CL')).toBe('CLBB');
    expect(armeGroup('Salle', 'BB')).toBe('CLBB');
    expect(armeGroup('TAEDI', 'CO')).toBe('CO');
  });

  it('renvoie null pour toutes les autres disciplines', () => {
    expect(armeGroup('TAEDN', 'CO')).toBeNull();
    expect(armeGroup('CAMPAGNE_ECUREUIL', 'CO')).toBeNull();
    expect(armeGroup('3D_BROCARD', 'CL')).toBeNull();
    expect(armeGroup('NATURE_SANGLIER', 'CO')).toBeNull();
    expect(armeGroup('BEURSAULT', 'CO')).toBeNull();
  });
});

describe('stock-key — buildStockKey', () => {
  it('Salle : inclut l\'armeGroup', () => {
    expect(buildStockKey({ discipline: 'Salle', nom: 'Bleu', arme: 'CO' })).toBe('Salle|CO|Bleu');
    expect(buildStockKey({ discipline: 'Salle', nom: 'Bleu', arme: 'CL' })).toBe('Salle|CLBB|Bleu');
  });

  it('TAEDI : inclut armeGroup ET distance', () => {
    expect(buildStockKey({ discipline: 'TAEDI', nom: 'Noir', arme: 'CL', distance: 60 })).toBe('TAEDI|CLBB|Noir|60');
  });

  it('Campagne/3D/Nature/Beursault : ni armeGroup ni distance (une clé par niveau)', () => {
    expect(buildStockKey({ discipline: 'CAMPAGNE_ECUREUIL', nom: 'Or sur fond bleu', arme: 'CL', distance: 0 }))
      .toBe('CAMPAGNE_ECUREUIL||Or sur fond bleu');
    expect(buildStockKey({ discipline: '3D_LYNX', nom: 'Or sur fond orange', arme: 'CL' }))
      .toBe('3D_LYNX||Or sur fond orange');
    expect(buildStockKey({ discipline: 'BEURSAULT', nom: '2 marmots', arme: 'CO' }))
      .toBe('BEURSAULT||2 marmots');
  });
});

describe('stock-key — stockTypeLabel', () => {
  it('libellés par discipline', () => {
    expect(stockTypeLabel({ discipline: 'CAMPAGNE_MARCASSIN', nom: 'Vert sur fond blanc' })).toBe('Campagne Marcassin - Vert sur fond blanc');
    expect(stockTypeLabel({ discipline: 'CAMPAGNE_ECUREUIL', nom: 'Or sur fond bleu' })).toBe('Campagne Écureuil - Or sur fond bleu');
    expect(stockTypeLabel({ discipline: '3D_BROCARD', nom: 'Or sur fond noir' })).toBe('3D Brocard - Or sur fond noir');
    expect(stockTypeLabel({ discipline: '3D_LYNX', nom: 'Or sur fond orange' })).toBe('3D Lynx - Or sur fond orange');
    expect(stockTypeLabel({ discipline: 'NATURE_SANGLIER', nom: 'Or sur fond rouge' })).toBe('Nature Sanglier - Or sur fond rouge');
    expect(stockTypeLabel({ discipline: 'NATURE_MARCASSIN', nom: 'Or sur fond orange' })).toBe('Nature Marcassin - Or sur fond orange');
    expect(stockTypeLabel({ discipline: 'BEURSAULT', nom: '2 marmots' })).toBe('Beursault - 2 marmots');
  });

  it('Salle/TAEDI : suffixe d\'arme et distance', () => {
    expect(stockTypeLabel({ discipline: 'Salle', nom: 'Bleu', armeGroup: 'CLBB' })).toBe('Salle - Bleu (CL/BB)');
    expect(stockTypeLabel({ discipline: 'TAEDI', nom: 'Noir', distance: 60, armeGroup: 'CO' })).toBe('TAEDI - Noir - 60m (CO)');
  });
});
