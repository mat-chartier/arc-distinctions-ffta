import { NgFor } from '@angular/common';
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
  distinctionsToOrder: any[] = [];
  ngOnInit() {
    const url = 'distinctions/to-order';
    this.apisService.get(url).then((data) => {
        // map reduce data counting the number of distinctions to order grouped by the distinction name
        // and also keeping the list of archer names for each distinction (stored in curr.archer.name)
        const distinctions = data.reduce((acc: any, curr: any) => {
          let arme = curr.Resultat.arme;
          if (curr.Resultat.arme == 'BB') {
            arme = 'CL';
          }
          const nom = curr.nom + ' - ' + arme;
          const data = ` ${curr.Archer.prenom} ${curr.Archer.nom} (${curr.Resultat.score})`;
          if (acc[nom]) {
            acc[nom].count++;
            acc[nom].data.push(data);
          } else {
            acc[nom] = { count: 1, data: [data] };
          }
          return acc;
        }, {});

        // convert the object to an array of key-value pairs
        this.distinctionsToOrder = Object.entries(distinctions).map(
          ([key, value]) => ({ key, value })
        );

        // sort distincstionsToOrder by arme first (CL, CO), 
        // and then in this order: Vert, Blanc, Noir, Bleu, Rouge, Jaune, 1 étoile, 2 étoiles, 3 étoiles
        this.distinctionsToOrder.sort((a, b) => {
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
            return order.indexOf(a.key.split(' - ')[0]) - order.indexOf(b.key.split(' - ')[0]);
          }
        }
        );
      });
  }
}
