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
    const url = 'http://localhost:3000/distinctions/to-order';
    this.apisService.get(url).then((data) => {
        // map reduce data counting the number of distinctions to order grouped by the distinction name
        const distinctions = data.reduce((acc: any, curr: any) => {
          const nom = curr.nom + ' - ' + curr.Resultat.arme;
          if (acc[nom]) {
            acc[nom]++;
          } else {
            acc[nom] = 1;
          }
          return acc;
        }, {});

        // convert the object to an array of key-value pairs
        this.distinctionsToOrder = Object.entries(distinctions).map(
          ([key, value]) => ({ key, value })
        );
      });
  }
}
