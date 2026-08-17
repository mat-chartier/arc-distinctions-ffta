import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { AppStore, parseFirestoreDate } from '../services/app.store';
import { AuthenticationService } from '../services/auth_service_firebase';
import { ArcherDoc, ResultatDoc } from '../model/firestore-types';
import { buildStockKey } from '../model/stock-key';

interface DistinctionWithArcherAndResultat {
  id: string;
  archerId: string;
  nom: string;
  resultatId: string;
  statut: string;
  distance: number;
  discipline: string;
  // Regroupement pour le filtre « Distinctions » : les sous-disciplines
  // (Campagne Marcassin/Écureuil, 3D Brocard/Lynx, Nature Sanglier/Marcassin)
  // sont réunies sous une entrée unique.
  disciplineGroupe: string;
  Archer: ArcherDoc;
  Resultat: ResultatDoc & { dateDebutConcours: Date };
}

@Component({
  selector: 'app-distinctions-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    SelectModule,
    MultiSelectModule,
    ToggleSwitch,
    ButtonModule,
  ],
  templateUrl: './distinctions-list.component.html',
  styleUrl: './distinctions-list.component.scss',
})
export class DistinctionsListComponent implements OnInit {
  editMode = false;
  deleteMode = false;

  // Vue « cartes empilées » sur mobile (désactive scroll/colonne figée du tableau)
  isMobile = window.matchMedia('(max-width: 576px)').matches;
  distinctionsWithArcher: DistinctionWithArcherAndResultat[] = [];
  firestoreService = inject(AppStore);
  private authService = inject(AuthenticationService);

  /** Réserve les bascules d'édition/suppression aux administrateurs. */
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loading = true;
  error: string = '';

  // Stock disponible par clé de type de distinction (#27)
  stockByKey = new Map<string, { id: string; quantite: number }>();

  // Stock virtuel décompté ligne à ligne (id de distinction → valeur virtuelle)
  virtualById = new Map<string, number>();

  // Tri par défaut : nom de l'archer croissant (order 1 = ascendant)
  defaultSort = [{ field: 'Archer.nom', order: 1 }];

  statuts = ['A donner', 'Donnée', 'N/A', 'NVP'];
  saisons: string[] = [];
  // Options du filtre « Distinctions » : sous-disciplines regroupées (voir disciplineGroupe()).
  disciplines: string[] = ['Salle', 'TAEDI', 'TAEDN', 'Campagne', '3D', 'Nature', 'Beursault'];

  @ViewChild('distinctionsTable') distinctionsTable!: Table;

  async ngOnInit() {
    // Suit le passage desktop <-> mobile pour basculer tableau / cartes
    window
      .matchMedia('(max-width: 576px)')
      .addEventListener('change', (e) => (this.isMobile = e.matches));
    await this.fetchData();
  }

  async fetchData() {
    try {
      this.loading = true;
      this.error = '';
      
      // Récupérer toutes les distinctions
      const distinctions = await this.firestoreService.getDistinctions();
      
      // Récupérer tous les archers et résultats pour faire les jointures
      const archers = await this.firestoreService.getArchers();
      const resultats = await this.firestoreService.getResultats();

      // Récupérer les stocks et indexer par clé de type (#27)
      const stocks = await this.firestoreService.getStocks();
      this.stockByKey = new Map(stocks.map(s => [s.key, { id: s.id, quantite: s.quantite }]));

      // Créer des maps pour accès rapide
      const archersMap = new Map(archers.map(a => [a.id, a]));
      const resultatsMap = new Map(resultats.map(r => [r.id, r]));
      
      // Joindre les données et extraire les saisons
      this.saisons = [];
      this.distinctionsWithArcher = distinctions
        .map((d: any) => {
          const archer = archersMap.get(d.archerId);
          const resultat = resultatsMap.get(d.resultatId);
          
          if (!archer || !resultat) {
            return null;
          }
          
          // Convertir le timestamp en Date
          const rawDate = parseFirestoreDate(resultat.dateDebutConcours);
          const dateDebutConcours = rawDate ? new Date(rawDate.getTime() + 12 * 3600 * 1000) : null;
          
          // Collecter les saisons uniques
          if (!this.saisons.includes(resultat.saison.toString())) {
            this.saisons.push(resultat.saison.toString());
          }
          
          return {
            ...d,
            disciplineGroupe: this.disciplineGroupe(d.discipline),
            Archer: archer,
            Resultat: {
              ...resultat,
              dateDebutConcours
            }
          };
        })
        .filter((d): d is DistinctionWithArcherAndResultat => d !== null);
      
      // Trier les saisons
      this.saisons.sort((a, b) => parseInt(b) - parseInt(a));

      console.log('Distinctions chargées:', this.distinctionsWithArcher.length);

      // Calculer le stock virtuel une fois la table rendue / son état restauré
      setTimeout(() => this.recomputeVirtualStock(), 0);

    } catch (error: any) {
      console.error('Erreur lors du chargement des distinctions:', error);
      this.error = 'Erreur lors du chargement des distinctions';
    } finally {
      this.loading = false;
    }
  }

  async onStatutChange(item: DistinctionWithArcherAndResultat, event: any, distinctionsTable: Table) {
    try {
      item.statut = event.value;
      
      // Mettre à jour dans Firestore
      await this.firestoreService.updateDistinction(item.id, {
        statut: item.statut
      });

      // Décrément automatique du stock au passage à « Donnée » (#27, plancher à 0)
      if (event.value === 'Donnée') {
        const key = this.getStockKey(item);
        const stock = this.stockByKey.get(key);
        if (stock && stock.quantite > 0) {
          const quantite = stock.quantite - 1;
          await this.firestoreService.updateStock(stock.id, { quantite });
          stock.quantite = quantite;
        }
      }

      // Rafraîchir le filtre du tableau
      distinctionsTable._filter();

      // Le changement de statut (et le décrément stock « Donnée ») modifie le décompte virtuel
      this.recomputeVirtualStock();

      console.log('Statut mis à jour:', item.id, item.statut);

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      // Recharger les données en cas d'erreur
      await this.fetchData();
    }
  }

  async onRemove(item: DistinctionWithArcherAndResultat, distinctionsTable: Table) {
    try {
      // Supprimer de Firestore
      await this.firestoreService.deleteDistinction(item.id);
      
      // Recharger les données
      await this.fetchData();
      
      // Rafraîchir le filtre du tableau
      distinctionsTable._filter();
      
      console.log('Distinction supprimée:', item.id);
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      this.error = 'Erreur lors de la suppression de la distinction';
    }
  }

  private getStockKey(d: any): string {
    return buildStockKey({
      discipline: d.discipline,
      nom: d.nom,
      arme: d.Resultat?.arme,
      distance: d.distance,
    });
  }

  getStockCount(d: any): number {
    return this.stockByKey.get(this.getStockKey(d))?.quantite ?? 0;
  }

  /**
   * Recalcule le stock virtuel ligne à ligne, dans l'ordre affiché (trié + filtré).
   * Chaque distinction « A donner » consomme une unité virtuelle du stock réel de
   * son type. Les « Donnée » (déjà déduites du stock réel), « N/A » et « NVP » ne
   * consomment rien et n'ont pas de valeur virtuelle.
   */
  recomputeVirtualStock() {
    const rows = this.distinctionsTable?.processedData ?? this.distinctionsWithArcher;
    const running = new Map<string, number>();
    const result = new Map<string, number>();

    for (const d of rows as any[]) {
      if (d.statut !== 'A donner') continue;
      const key = this.getStockKey(d);
      if (!running.has(key)) running.set(key, this.getStockCount(d));
      const v = running.get(key)! - 1;
      running.set(key, v);
      result.set(d.id, v);
    }

    this.virtualById = result;
  }

  /** Recalcul différé, après que la table a mis à jour tri/filtre/état restauré. */
  scheduleRecomputeVirtualStock() {
    setTimeout(() => this.recomputeVirtualStock(), 0);
  }

  /** Valeur du stock virtuel pour une ligne, ou null si non applicable. */
  getVirtualStock(d: any): number | null {
    return this.virtualById.has(d.id) ? this.virtualById.get(d.id)! : null;
  }

  /** Regroupe une sous-discipline sous une entrée unique pour le filtre. */
  disciplineGroupe(discipline: string): string {
    if (discipline === 'CAMPAGNE_MARCASSIN' || discipline === 'CAMPAGNE_ECUREUIL') return 'Campagne';
    if (discipline === '3D_BROCARD' || discipline === '3D_LYNX') return '3D';
    if (discipline === 'NATURE_SANGLIER' || discipline === 'NATURE_MARCASSIN') return 'Nature';
    if (discipline === 'BEURSAULT') return 'Beursault';
    return discipline; // Salle, TAEDI, TAEDN
  }

  getDisciplineDisplay(d: any): string {
    if (d.discipline === 'CAMPAGNE_MARCASSIN' || d.discipline === 'CAMPAGNE_ECUREUIL') {
      return `Campagne - Piquet ${d.piquet}`;
    }
    if (d.discipline === '3D_BROCARD' || d.discipline === '3D_LYNX') {
      return 'Tir 3D';
    }
    if (d.discipline === 'NATURE_SANGLIER' || d.discipline === 'NATURE_MARCASSIN') {
      return 'Tir Nature';
    }
    if (d.discipline === 'BEURSAULT') {
      return 'Beursault';
    }
    return d.discipline;
  }

  getNomDisplay(d: any): string {
    if (d.discipline === 'CAMPAGNE_MARCASSIN') return `Marcassin - ${d.nom}`;
    if (d.discipline === 'CAMPAGNE_ECUREUIL') return `Écureuil - ${d.nom}`;
    if (d.discipline === '3D_BROCARD') return `Brocard - ${d.nom}`;
    if (d.discipline === '3D_LYNX') return `Lynx - ${d.nom}`;
    if (d.discipline === 'NATURE_SANGLIER') return `Sanglier - ${d.nom}`;
    if (d.discipline === 'NATURE_MARCASSIN') return `Marcassin - ${d.nom}`;
    return d.nom;
  }

  exportDistinctionsCSV() {
    if (!this.distinctionsTable) {
      console.error('La référence au tableau PrimeNG est manquante.');
      return;
    }

    const columnHeaders = ['Archer', 'Saison', 'Distinction', 'Statut'];
    const dataToExport = this.distinctionsTable.processedData || this.distinctionsWithArcher;

    const dataFormatted = dataToExport.map(d => ({
      Archer: `${d.Archer?.nom || ''} ${d.Archer?.prenom || ''} (${d.Archer?.noLicence || ''})`.trim(),
      Saison: d.Resultat?.saison || '',
      Distinction: 
        `${d.discipline || ''} - ${d.nom || ''} - ${d.distance || ''} (${d.Resultat?.arme || ''}) : ${d.Resultat?.score || ''} le ${this.formatDate(d.Resultat?.dateDebutConcours)}`.trim(),
      Statut: d.statut || ''
    }));

    const fileName = 'distinctions_export';
    this.exportArrayToCSV(dataFormatted, columnHeaders, fileName);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  exportArrayToCSV(data: any[], headers: string[], fileName: string) {
    let csv = '';

    csv += headers.join(';') + '\n';

    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header] || '';
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
          if (value.includes(';') || value.includes('"') || value.includes('\n')) {
            value = `"${value}"`;
          }
        }
        return value;
      });
      csv += values.join(';') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}