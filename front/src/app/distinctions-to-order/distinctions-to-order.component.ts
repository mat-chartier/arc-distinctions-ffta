import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ApisService } from '../services/apis-service';

@Component({
  selector: 'app-distinctions-to-order',
  imports: [TableModule],
  templateUrl: './distinctions-to-order.component.html',
  styleUrl: './distinctions-to-order.component.scss',
})
export class DistinctionsToOrderComponent {
  apisService = inject(ApisService);
  distinctionsCLBBToOrder: any[] = [];
  distinctionsCOToOrder: any[] = [];
  distinctionsCLBBTAEDIToOrder: any[] = [];
  distinctionsCOTAEDIToOrder: any[] = [];
  distinctionsCLBBTAEDNToOrder: any[] = [];
  distinctionsCOTAEDNToOrder: any[] = [];
  ngOnInit() {
    const url = 'distinctions/to-order';
    this.apisService.get(url).then((data) => {
      // map reduce data counting the number of distinctions to order grouped by the distinction name
      // and also keeping the list of archer names for each distinction (stored in curr.archer.name)

      let dataFilteredCLBBSalle: any[] = [];
      let dataFilteredCOSalle: any[] = [];
      let dataFilteredCLBBTAEDI: any[] = [];
      let dataFilteredCLBBTAEDN: any[] = [];
      let dataFilteredCOTAEDI: any[] = [];
      let dataFilteredCOTAEDN: any[] = [];
      data.forEach((resultat: any) => {
        console.log('resultat', resultat.discipline);
        if (resultat.discipline === 'Salle') {
          if (
            resultat.Resultat.arme === 'CL' ||
            resultat.Resultat.arme === 'BB'
          ) {
            dataFilteredCLBBSalle.push(resultat);
          } else {
            dataFilteredCOSalle.push(resultat);
          }
        } else if (resultat.discipline === 'TAEDI') {
          if (
            resultat.Resultat.arme === 'CL' ||
            resultat.Resultat.arme === 'BB'
          ) {
            dataFilteredCLBBTAEDI.push(resultat);
          } else {
            dataFilteredCOTAEDI.push(resultat);
          }
        } else if (resultat.discipline === 'TAEDN') {
          if (
            resultat.Resultat.arme === 'CL' ||
            resultat.Resultat.arme === 'BB'
          ) {
            dataFilteredCLBBTAEDN.push(resultat);
          } else {
            dataFilteredCOTAEDN.push(resultat);
          }
        }
      });

      this.distinctionsCLBBToOrder = this.getDistinctionsCLBBToOrder(
        dataFilteredCLBBSalle
      );
      this.distinctionsCOToOrder = this.getDistinctionsToOrder(
        dataFilteredCOSalle
      );
      this.distinctionsCLBBTAEDIToOrder = this.getDistinctionsToOrder(
        dataFilteredCLBBTAEDI
      );
      this.distinctionsCOTAEDIToOrder = this.getDistinctionsToOrder(
        dataFilteredCOTAEDI
      );
      this.distinctionsCLBBTAEDNToOrder = this.getDistinctionsToOrder(
        dataFilteredCLBBTAEDN
      );
      this.distinctionsCOTAEDNToOrder = this.getDistinctionsToOrder(
        dataFilteredCOTAEDN
      );
    });
  }
  getDistinctionsCLBBToOrder(dataFilteredCLBBSalle: any[]): any {
    let distinctionsToOrder: any[] = this.getDistinctionsToOrder(dataFilteredCLBBSalle);

    // sort distincstionsToOrder by arme first (CL, CO),
    // and then in this order: Vert, Blanc, Noir, Bleu, Rouge, Jaune, 1 étoile, 2 étoiles, 3 étoiles
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

  getDistinctionsToOrder(distinctions: any[]): any {
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

    // convert the object to an array of key-value pairs
    return Object.entries(distinctionsToOrder).map(
      ([key, value]) => ({ key, value })
    );
  }
}
