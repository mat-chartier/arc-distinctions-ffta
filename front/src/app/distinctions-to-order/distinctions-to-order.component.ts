import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { AppStore } from '../services/app.store';
import { buildStockKey } from '../model/stock-key';

interface DistinctionToOrder {
  key: string;
  value: {
    count: number;
    data: string[];
    stockKey: string;
    attribue: number;
    aCommander: number;
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
  // Tir 3D : badge par niveau (indépendant de l'arme) → une table par groupe.
  distinctions3DBrocardToOrder: DistinctionToOrder[] = [];
  distinctions3DLynxToOrder: DistinctionToOrder[] = [];
  
  loading = true;
  error: string = '';

  // Stock physique par clé de type (#27) : quantité en base.
  stockByKey = new Map<string, number>();

  async ngOnInit() {
    try {
      this.loading = true;
      this.error = '';

      // Récupérer toutes les distinctions (la demande = celles au statut « À donner »)
      const distinctions = await this.firestoreService.getDistinctions();

      // Récupérer tous les archers et résultats pour les jointures
      const archers = await this.firestoreService.getArchers();
      const resultats = await this.firestoreService.getResultats();

      // Récupérer les stocks et indexer par clé de type (#27)
      const stocks = await this.firestoreService.getStocks();
      this.stockByKey = new Map(stocks.map(s => [s.key, s.quantite]));

      // Créer des maps pour accès rapide
      const archersMap = new Map(archers.map(a => [a.id, a]));
      const resultatsMap = new Map(resultats.map(r => [r.id, r]));

      // Toute distinction non encore remise (« À donner ») pèse sur le stock ;
      // le déficit vs stock = quantité à commander.
      const data = distinctions
        .filter((d: any) => d.statut === 'A donner')
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
      let dataFiltered3DBrocard: any[] = [];
      let dataFiltered3DLynx: any[] = [];

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
        } else if (resultat.discipline === '3D_BROCARD') {
          dataFiltered3DBrocard.push(resultat);
        } else if (resultat.discipline === '3D_LYNX') {
          dataFiltered3DLynx.push(resultat);
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
      this.distinctions3DBrocardToOrder = this.getDistinctionsToOrder(dataFiltered3DBrocard);
      this.distinctions3DLynxToOrder = this.getDistinctionsToOrder(dataFiltered3DLynx);

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
        // La clé de stock est constante au sein d'un groupe (discipline fixe,
        // armeGroup fixe par tableau CLBB/CO, distance déjà incluse dans le nom pour TAEDI).
        const stockKey = buildStockKey({
          discipline: curr.discipline,
          nom: curr.nom,
          arme: curr.Resultat.arme,
          distance: curr.distance,
        });
        acc[nom] = { count: 1, data: [data], stockKey, attribue: 0, aCommander: 0 };
      }
      return acc;
    }, {});

    // Calculer l'attribution du stock et le reste à commander (#27).
    // demande = distinctions « À donner » ; à commander = max(0, demande - stock).
    Object.values(distinctionsToOrder).forEach((v: any) => {
      const stock = this.stockByKey.get(v.stockKey) ?? 0;
      v.attribue = Math.min(v.count, stock);
      v.aCommander = Math.max(0, v.count - stock);
    });

    // Convertir en tableau et ne garder que les types ayant réellement quelque chose
    // à commander (stock insuffisant) ; masquer ceux entièrement couverts par le stock.
    return Object.entries(distinctionsToOrder)
      .map(([key, value]) => ({ key, value } as DistinctionToOrder))
      .filter(d => d.value.aCommander > 0);
  }
}