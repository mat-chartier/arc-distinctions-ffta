import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-distinctions-to-order',
  imports: [TableModule, NgFor],
  templateUrl: './distinctions-to-order.component.html',
  styleUrl: './distinctions-to-order.component.scss',
})
export class DistinctionsToOrderComponent {
  distinctionsToOrder: any[] = [];
  ngOnInit() {
    fetch('http://localhost:3000/distinctions/to-order')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // map reduce data counting the number of distinctions to order grouped by the distinction name
        const distinctions = data.reduce((acc: any, curr: any) => {
          console.log(curr);
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

        console.log(data);
        console.log('===');
        console.log(this.distinctionsToOrder);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}
