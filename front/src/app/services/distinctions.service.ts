import { Injectable, inject } from '@angular/core';
import { AppStore } from './app.store';
import { distinctionRules } from '../model/distinction-rules';

/**
 * Service pour calculer et enregistrer les distinctions
 * basé sur les résultats importés
 */
@Injectable({
  providedIn: 'root'
})
export class DistinctionsService {
  private firestoreService = inject(AppStore);

  /**
   * Calcule et enregistre les distinctions pour un résultat donné
   */
  async recordDistinctions(resultat: any): Promise<void> {
    const distinction = distinctionRules.getDistinction(resultat);
    
    if (distinction) {
      // Vérifier si la distinction existe déjà
      const existingDistinctions = await this.firestoreService.getDistinctions(
        resultat.archerId
      );
      
      const exists = existingDistinctions.some((d: any) =>
        d.archerId === resultat.archerId &&
        d.nom === distinction.nom &&
        d.resultatId === resultat.id &&
        d.discipline === distinction.discipline &&
        d.distance === distinction.distance
      );
      
      if (!exists) {
        await this.firestoreService.addDistinction(distinction);
        console.log('Distinction créée:', distinction.nom);
      }
    }
  }
}