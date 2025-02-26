import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ApisService } from '../services/apis-service';
@Component({
  selector: 'app-distinctions-list',
  imports: [CommonModule, TableModule, FormsModule, SelectModule, MultiSelectModule,ToggleSwitch],
  templateUrl: './distinctions-list.component.html',
  styleUrl: './distinctions-list.component.scss',
})
export class DistinctionsListComponent {
  editMode = false;
  distinctionsWithArcher: any;
  apisService = inject(ApisService);

  statuts = ['A commander', 'A donner', 'Donnée', 'N/A', 'NVP'];

  ngOnInit() {
    const url = 'http://localhost:3000/archers/distinctions';
    this.apisService.get(url).then((data) => {
      this.distinctionsWithArcher = data;
    });
  }

  onStatutChange(item: any, event: any, distinctionsTable: Table) {
    item.statut = event.value;
    let url =
      'http://localhost:3000/archers/distinction/' + item.id + '/status';

    this.apisService.post(url, { status: item.statut }).then(() => {
      distinctionsTable._filter();
    });
  }
}
