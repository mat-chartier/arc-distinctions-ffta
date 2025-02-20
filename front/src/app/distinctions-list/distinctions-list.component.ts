import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-distinctions-list',
  imports: [CommonModule, TableModule, FormsModule, SelectModule, MultiSelectModule],
  templateUrl: './distinctions-list.component.html',
  styleUrl: './distinctions-list.component.scss',
})
export class DistinctionsListComponent {
  distinctionsWithArcher: any;

  // statuts = [{
  //   name: 'A commander', code:'A commander'
  // }, {
  //   name: 'A donner', code:'A donner'
  // }, {
  //   name: 'Donnée', code:'Donnée'
  // }, {
  //   name: 'N/A', code:'N/A'
  // }, {
  //   name: 'NVP', code:'NVP'
  // }];
  statuts = ['A commander', 'A donner', 'Donnée', 'N/A', 'NVP'];

  ngOnInit() {
    // Get personal bests
    fetch('http://localhost:3000/archers/distinctions')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.distinctionsWithArcher = data;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  onStatutChange(item: any, event: any) {
    item.statut = event.value;
    let url =
      'http://localhost:3000/archers/distinction/' + item.id + '/status';
    console.log('URL:', url);
    console.log('Statut:', item.statut);

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: item.statut }),
    };

    fetch(url, requestOptions)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log('Statut mis à jour:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}
