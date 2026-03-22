import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { AppStore, parseFirestoreDate } from '../services/app.store';
import { ResultatDoc } from '../model/firestore-types';

interface ArcherDetails {
  id: string;
  noLicence: string;
  nom: string;
  prenom: string;
  Distinctions: DistinctionWithResultat[];
  Resultats: Resultat[];
}

interface Resultat {
  id: string;
  archerId: string;
  arme: string;
  score: number;
  categorie: string;
  distance: number;
  blason: string;
  numDepart: number;
  dateDebutConcours: Date;
  saison: number;
  discipline: string;
  piquet?: string;
  createdAt?: any;
}

interface DistinctionWithResultat {
  id: string;
  archerId: string;
  nom: string;
  resultatId: string;
  statut: string;
  distance: number;
  discipline: string;
  piquet?: string;
  Resultat: Resultat;
}

@Component({
  selector: 'app-archer-details',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './archer-details.component.html',
  styleUrl: './archer-details.component.scss',
})
export class ArcherDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private firestoreService = inject(AppStore);
  
  archerDetails: ArcherDetails = {
    id: '',
    noLicence: '',
    nom: '',
    prenom: '',
    Distinctions: [],
    Resultats: []
  };
  
  loading = true;
  error = '';

  getDisciplineDisplay(d: DistinctionWithResultat): string {
    if (d.discipline === 'CAMPAGNE_MARCASSIN' || d.discipline === 'CAMPAGNE_ECUREUIL') {
      return `Campagne - Piquet ${d.piquet}`;
    }
    return d.discipline;
  }

  getNomDisplay(d: DistinctionWithResultat): string {
    if (d.discipline === 'CAMPAGNE_MARCASSIN') return `Marcassin - ${d.nom}`;
    if (d.discipline === 'CAMPAGNE_ECUREUIL') return `Écureuil - ${d.nom}`;
    return d.nom;
  }

  getResultatDisciplineDisplay(r: Resultat): string {
    switch (r.discipline) {
      case 'S': return 'Salle';
      case 'T': return 'TAE';
      case 'C': return 'Campagne';
      case '3': return '3D';
      case 'N': return 'Nature';
      default: return r.discipline;
    }
  }

  getResultatLocationDisplay(r: Resultat): string {
    if (r.discipline === 'C') {
      return r.piquet ? `Piquet ${r.piquet}` : '-';
    }
    return r.distance ? `${r.distance}m` : '-';
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async (params) => {
      try {
        this.loading = true;
        const archerId = params['id'];
        
        // Récupérer les données de l'archer avec ses résultats et distinctions
        const data = await this.firestoreService.getArcherWithResults(archerId);
        
        if (!data.archer) {
          this.error = 'Archer non trouvé';
          return;
        }

        // Convertir les Timestamps Firestore en Dates
        const shiftDate = (d: Date | null) => d ? new Date(d.getTime() + 12 * 3600 * 1000) : null;
        const resultats = data.resultats.map((r: any) => ({
          ...r,
          dateDebutConcours: shiftDate(parseFirestoreDate(r.dateDebutConcours))
        })) as Resultat[];

        // Créer un map des résultats pour jointure rapide
        const resultatsMap = new Map(resultats.map(r => [r.id, r]));

        // Joindre les distinctions avec leurs résultats
        const distinctions = data.distinctions.map((d: any) => ({
          ...d,
          Resultat: resultatsMap.get(d.resultatId) || null
        })).filter((d: any) => d.Resultat !== null) as DistinctionWithResultat[];

        // Construire l'objet archerDetails
        this.archerDetails = {
          id: data.archer.id,
          noLicence: data.archer.noLicence,
          nom: data.archer.nom,
          prenom: data.archer.prenom,
          Distinctions: distinctions,
          Resultats: resultats
        };

        console.log('Archer details loaded:', this.archerDetails);
        
      } catch (error: any) {
        console.error('Erreur lors du chargement des détails de l\'archer:', error);
        this.error = 'Erreur lors du chargement des détails';
      } finally {
        this.loading = false;
      }
    });
  }
}