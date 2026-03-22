import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { AppStore } from '../services/app.store';

interface DistinctionToOrder {
  key: string;
  value: {
    count: number;
    data: string[];
  };
}

@Component({
  selector: 'app-distinctions-to-order',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './distinctions-to-order.component.html',
  styleUrl: './distinctions-to-order.component.scss',
})
export class DistinctionsToOrderComponent implements OnInit {
  firestoreService = inject(AppStore);
  
  distinctionsCLBBToOrder: DistinctionToOrder[] = [];
  distinctionsCOToOrder: DistinctionToOrder[] = [];
  distinctionsCLBBTAEDIToOrder: DistinctionToOrder[] = [];
  distinctionsCOTAEDIToOrder: DistinctionToOrder[] = [];
  distinctionsCLBBTAEDNToOrder: DistinctionToOrder[] = [];
  distinctionsCOTAEDNToOrder: DistinctionToOrder[] = [];
  distinctionsCampagneMarcassinToOrder: DistinctionToOrder[] = [];
  distinctionsCampagneEcureuilCLToOrder: DistinctionToOrder[] = [];
  distinctionsCampagneEcureuilCOToOrder: DistinctionToOrder[] = [];
  distinctionsCampagneEcureuilBBToOrder: DistinctionToOrder[] = [];
  
  loading = true;
  error: string = '';

  async ngOnInit() {
    try {
      this.loading = true;
      this.error = '';

      // Récupérer les distinctions avec statut "À commander"
      const distinctions = await this.firestoreService.getDistinctionsToOrder();
      
      // Récupérer tous les archers et résultats pour les jointures
      const archers = await this.firestoreService.getArchers();
      const resultats = await this.firestoreService.getResultats();
      
      // Créer des maps pour accès rapide
      const archersMap = new Map(archers.map(a => [a.id, a]));
      const resultatsMap = new Map(resultats.map(r => [r.id, r]));
      
      // Joindre les données
      const data = distinctions
        .map((d: any) => {
          const archer = archersMap.get(d.archerId);
          const resultat = resultatsMap.get(d.resultatId);
          
          if (!archer || !resultat) {
            return null;
          }
          
          return {
            ...d,
            Archer: archer,
            Resultat: resultat
          };
        })
        .filter((d): d is any => d !== null);

      // Filtrer par discipline et arme
      let dataFilteredCLBBSalle: any[] = [];
      let dataFilteredCOSalle: any[] = [];
      let dataFilteredCLBBTAEDI: any[] = [];
      let dataFilteredCLBBTAEDN: any[] = [];
      let dataFilteredCOTAEDI: any[] = [];
      let dataFilteredCOTAEDN: any[] = [];
      let dataFilteredCampagneMarcassin: any[] = [];
      let dataFilteredCampagneEcureuilCL: any[] = [];
      let dataFilteredCampagneEcureuilCO: any[] = [];
      let dataFilteredCampagneEcureuilBB: any[] = [];

      data.forEach((resultat: any) => {
        if (resultat.discipline === 'Salle') {
          if (resultat.Resultat.arme === 'CL' || resultat.Resultat.arme === 'BB') {
            dataFilteredCLBBSalle.push(resultat);
          } else {
            dataFilteredCOSalle.push(resultat);
          }
        } else if (resultat.discipline === 'TAEDI') {
          if (resultat.Resultat.arme === 'CL' || resultat.Resultat.arme === 'BB') {
            dataFilteredCLBBTAEDI.push(resultat);
          } else {
            dataFilteredCOTAEDI.push(resultat);
          }
        } else if (resultat.discipline === 'TAEDN') {
          if (resultat.Resultat.arme === 'CL' || resultat.Resultat.arme === 'BB') {
            dataFilteredCLBBTAEDN.push(resultat);
          } else {
            dataFilteredCOTAEDN.push(resultat);
          }
        } else if (resultat.discipline === 'CAMPAGNE_MARCASSIN') {
          dataFilteredCampagneMarcassin.push(resultat);
        } else if (resultat.discipline === 'CAMPAGNE_ECUREUIL') {
          if (resultat.Resultat.arme === 'CL') {
            dataFilteredCampagneEcureuilCL.push(resultat);
          } else if (resultat.Resultat.arme === 'CO') {
            dataFilteredCampagneEcureuilCO.push(resultat);
          } else if (resultat.Resultat.arme === 'BB') {
            dataFilteredCampagneEcureuilBB.push(resultat);
          }
        }
      });

      this.distinctionsCLBBToOrder = this.getDistinctionsCLBBToOrder(dataFilteredCLBBSalle);
      this.distinctionsCOToOrder = this.getDistinctionsToOrder(dataFilteredCOSalle);
      this.distinctionsCLBBTAEDIToOrder = this.getDistinctionsToOrder(dataFilteredCLBBTAEDI);
      this.distinctionsCOTAEDIToOrder = this.getDistinctionsToOrder(dataFilteredCOTAEDI);
      this.distinctionsCLBBTAEDNToOrder = this.getDistinctionsToOrder(dataFilteredCLBBTAEDN);
      this.distinctionsCOTAEDNToOrder = this.getDistinctionsToOrder(dataFilteredCOTAEDN);
      this.distinctionsCampagneMarcassinToOrder = this.getDistinctionsToOrder(dataFilteredCampagneMarcassin);
      this.distinctionsCampagneEcureuilCLToOrder = this.getDistinctionsToOrder(dataFilteredCampagneEcureuilCL);
      this.distinctionsCampagneEcureuilCOToOrder = this.getDistinctionsToOrder(dataFilteredCampagneEcureuilCO);
      this.distinctionsCampagneEcureuilBBToOrder = this.getDistinctionsToOrder(dataFilteredCampagneEcureuilBB);

      console.log('Distinctions à commander chargées');

    } catch (error: any) {
      console.error('Erreur lors du chargement des distinctions à commander:', error);
      this.error = 'Erreur lors du chargement des distinctions';
    } finally {
      this.loading = false;
    }
  }

  getDistinctionsCLBBToOrder(dataFilteredCLBBSalle: any[]): DistinctionToOrder[] {
    let distinctionsToOrder: DistinctionToOrder[] = this.getDistinctionsToOrder(dataFilteredCLBBSalle);
    
    // Tri par arme puis par ordre des distinctions
    distinctionsToOrder.sort((a, b) => {
      const armeA = a.key.split(' - ')[1];
      const armeB = b.key.split(' - ')[1];
      if (armeA < armeB) {
        return -1;
      } else if (armeA > armeB) {
        return 1;
      } else {
        const order = [
          'Vert (Promo)',
          'Blanc',
          'Noir',
          'Bleu',
          'Rouge',
          'Jaune',
          '1 étoile',
          '2 étoiles',
          '3 étoiles',
        ];
        return (
          order.indexOf(a.key.split(' - ')[0]) -
          order.indexOf(b.key.split(' - ')[0])
        );
      }
    });
    return distinctionsToOrder;
  }

  getDistinctionsToOrder(distinctions: any[]): DistinctionToOrder[] {
    let distinctionsToOrder = distinctions.reduce((acc: any, curr: any) => {
      let nom = curr.nom;
      if (curr.discipline === 'TAEDI') {
        nom = `${nom} - ${curr.distance}`;
      }
      const data = ` ${curr.Archer.prenom} ${curr.Archer.nom} : ${curr.Resultat.score} (${curr.Resultat.saison})`;
      if (acc[nom]) {
        acc[nom].count++;
        acc[nom].data.push(data);
      } else {
        acc[nom] = { count: 1, data: [data] };
      }
      return acc;
    }, {});

    // Convertir l'objet en tableau de paires clé-valeur
    return Object.entries(distinctionsToOrder).map(
      ([key, value]) => ({ key, value } as DistinctionToOrder)
    );
  }
}