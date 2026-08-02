// Modèle et helpers pour la gestion des stocks de distinctions (#27).
//
// Une entrée de stock représente un « type » de distinction physique en réserve.
// Deux distinctions sont interchangeables (partagent la même clé) si elles ont :
//   discipline + nom (niveau) + armeGroup
// où armeGroup ne distingue CO vs CL/BB QUE pour Salle et TAEDI (petit symbole sur
// les CO). Pour toutes les autres disciplines la distinction physique est identique
// quels que soient l'arme, la distance et le piquet (ce ne sont que des critères
// d'attribution) : ils n'entrent donc pas dans la clé.

export type ArmeGroup = 'CO' | 'CLBB';

export interface StockDoc {
  id: string;
  discipline: string;
  armeGroup?: ArmeGroup; // uniquement Salle/TAEDI ; absent sinon
  nom: string;
  quantite: number;
  key: string;
  updatedAt?: any;
}

/** Groupe d'arme pertinent pour la clé : CO vs CL/BB, uniquement Salle et TAEDI. */
export function armeGroup(discipline: string, arme?: string): ArmeGroup | null {
  if (discipline === 'Salle' || discipline === 'TAEDI') {
    return arme === 'CO' ? 'CO' : 'CLBB';
  }
  return null;
}

/** Clé canonique d'un type de distinction, à partir d'une distinction + son arme. */
export function buildStockKey(t: { discipline: string; nom: string; arme?: string }): string {
  const ag = armeGroup(t.discipline, t.arme);
  return [t.discipline, ag ?? '', (t.nom ?? '').trim()].join('|');
}

/** Libellé lisible d'un type de distinction. */
export function stockTypeLabel(t: {
  discipline: string;
  nom: string;
  armeGroup?: ArmeGroup | null;
}): string {
  const nom = (t.nom ?? '').trim();

  if (t.discipline === 'CAMPAGNE_MARCASSIN') return `Campagne Marcassin - ${nom}`;
  if (t.discipline === 'CAMPAGNE_ECUREUIL') return `Campagne Écureuil - ${nom}`;

  let label = `${t.discipline} - ${nom}`;
  if (t.armeGroup === 'CO') label += ' (CO)';
  else if (t.armeGroup === 'CLBB') label += ' (CL/BB)';
  return label;
}
