import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ApisService } from '../services/apis-service';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-distinctions-list',
  imports: [CommonModule, TableModule, FormsModule, SelectModule, MultiSelectModule,ToggleSwitch, ButtonModule],
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

  ngOnInit() {
    this.fetchData();
  }
  
  fetchData() {
    this.apisService.get(this.url).then((data) => {
      this.distinctionsWithArcher = data;
    });
  }

  onStatutChange(item: any, event: any, distinctionsTable: Table) {
    item.statut = event.value;
    let url =
      'archers/distinction/' + item.id + '/status';

    this.apisService.post(url, { status: item.statut }).then(() => {
      distinctionsTable._filter();
    });
  }

  onRemove(item: any, distinctionsTable: Table) {
    let url = 'archers/distinction/' + item.id + "/delete";
    this.apisService.post(url, {}).then(() => {
      this.fetchData();
      distinctionsTable._filter();
    });
  }
}
