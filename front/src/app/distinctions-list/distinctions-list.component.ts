import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { AppStore, parseFirestoreDate } from '../services/app.store';
import { ArcherDoc, ResultatDoc } from '../model/firestore-types';

interface DistinctionWithArcherAndResultat {
  id: string;
  archerId: string;
  nom: string;
  resultatId: string;
  statut: string;
  distance: number;
  discipline: string;
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
  distinctionsWithArcher: DistinctionWithArcherAndResultat[] = [];
  firestoreService = inject(AppStore);
  
  loading = true;
  error: string = '';

  statuts = ['A commander', 'A donner', 'Donnée', 'N/A', 'NVP'];
  saisons: string[] = [];
  disciplines: string[] = ['Salle', 'TAEDI', 'TAEDN', 'CAMPAGNE_MARCASSIN', 'CAMPAGNE_ECUREUIL', '3D', 'Nature'];

  @ViewChild('distinctionsTable') distinctionsTable!: Table;

  async ngOnInit() {
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
      
      // Rafraîchir le filtre du tableau
      distinctionsTable._filter();
      
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

  getDisciplineDisplay(d: any): string {
    if (d.discipline === 'CAMPAGNE_MARCASSIN' || d.discipline === 'CAMPAGNE_ECUREUIL') {
      return `Campagne - Piquet ${d.piquet}`;
    }
    return d.discipline;
  }

  getNomDisplay(d: any): string {
    if (d.discipline === 'CAMPAGNE_MARCASSIN') return `Marcassin - ${d.nom}`;
    if (d.discipline === 'CAMPAGNE_ECUREUIL') return `Écureuil - ${d.nom}`;
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