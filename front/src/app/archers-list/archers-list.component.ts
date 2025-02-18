import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Archer } from '../archer-details/archers-details';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-archers-list',
  imports: [RouterLink, RouterLinkActive, TableModule],
  templateUrl: './archers-list.component.html',
  styleUrl: './archers-list.component.scss'
})
export class ArchersListComponent {
 archers!: Archer[];

 ngOnInit(): void {
    fetch('http://localhost:3000/archers').then((response) => {
      return response.json();
    }).then((archers) => {
      this.archers = archers;
    });
  }
}
