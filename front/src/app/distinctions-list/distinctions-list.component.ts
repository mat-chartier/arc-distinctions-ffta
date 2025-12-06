import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ApisService } from '../services/apis-service';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-distinctions-list',
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
export class DistinctionsListComponent {
  editMode = false;
  deleteMode = false;
  distinctionsWithArcher: any;
  apisService = inject(ApisService);
  url = 'archers/distinctions';

  statuts = ['A commander', 'A donner', 'Donnée', 'N/A', 'NVP'];
  saisons: string[] = [];
  disciplines: string[] = ['Salle', 'TAEDI', 'TAEDN', 'Campagne', '3D', 'Nature'];

  @ViewChild('distinctionsTable') distinctionsTable!: Table;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.apisService.get(this.url).then((data) => {
      this.saisons = [];
      this.distinctionsWithArcher = data;
      data.forEach((item: any) => {
        if (!this.saisons.includes(item.Resultat.saison)) {
          this.saisons.push(item.Resultat.saison);
        }
      });
    });
  }

  onStatutChange(item: any, event: any, distinctionsTable: Table) {
    item.statut = event.value;
    let url = 'archers/distinction/' + item.id + '/status';

    this.apisService.post(url, { status: item.statut }).then(() => {
      distinctionsTable._filter();
    });
  }

  onRemove(item: any, distinctionsTable: Table) {
    let url = 'archers/distinction/' + item.id + '/delete';
    this.apisService.post(url, {}).then(() => {
      this.fetchData();
      distinctionsTable._filter();
    });
  }

  exportDistinctionsCSV() {
    // ⚠️ Vérification de sécurité avant d'accéder à processedData
    if (!this.distinctionsTable) {
      console.error('La référence au tableau PrimeNG est manquante.');
      return;
    }

    // 1. Définir les en-têtes
    const columnHeaders = ['Archer', 'Saison', 'Distinction', 'Statut'];

    // 2. Utiliser les données traitées (filtrées/triées) du tableau PrimeNG.
    // C'est la clé pour garantir que vous exportez ce que l'utilisateur voit (dans les limites de la source de données).
    // Si processedData est vide (ex: avant le chargement), on utilise la source complète.
    const dataToExport = this.distinctionsTable.processedData || this.distinctionsWithArcher;

    const dataFormatted = dataToExport.map(d => ({
        // Utilisation de l'Optional Chaining (?) pour la robustesse (comme vu précédemment)
        Archer: `${d.Archer?.nom || ''} ${d.Archer?.prenom || ''} (${d.Archer?.noLicence || ''})`.trim(),
        Saison: d.Resultat?.saison || '',
        Distinction: 
          `${d.discipline || ''} - ${d.nom || ''} - ${d.distance || ''} (${d.Resultat?.arme || ''}) : ${d.Resultat?.score || ''} le ${this.formatDate(d.Resultat?.dateDebutConcours)}`.trim(),
        Statut: d.statut || ''
    }));

    // 3. Appeler la méthode d'exportation manuelle SANS toucher à this.distinctionsTable.value
    const fileName = 'distinctions_export';
    this.exportArrayToCSV(dataFormatted, columnHeaders, fileName); // ⬅️ On appelle directement notre utilitaire.

    // Il ne faut rien ajouter d'autre ici qui manipule this.distinctionsTable !
  }

  // Fonction utilitaire pour le formatage de date simple (pour simuler le pipe | date)
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // --- Fonction utilitaire pour générer le CSV (Doit être dans le .ts) ---
  exportArrayToCSV(data: any[], headers: string[], fileName: string) {
    let csv = '';

    // 1. Ajouter l'en-tête
    csv += headers.join(';') + '\n'; // Utilisation du point-virgule comme séparateur pour la France

    // 2. Ajouter les lignes de données
    data.forEach(row => {
      // Récupérer les valeurs dans l'ordre des en-têtes
      const values = headers.map(header => {
        // Nettoyer les valeurs (remplacer les sauts de ligne, guillemets, etc.)
        let value = row[header] || '';
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""'); // Échapper les guillemets
          if (value.includes(';') || value.includes('"') || value.includes('\n')) {
            value = `"${value}"`; // Encadrer les champs avec des guillemets si nécessaire
          }
        }
        return value;
      });
      csv += values.join(';') + '\n';
    });

    // 3. Créer et télécharger le Blob CSV
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
