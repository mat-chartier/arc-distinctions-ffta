import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Archer, ArcherWithDistinctions, Distinction, DistinctionStatus, DistinctionWithArcher } from '../archer-details/archers-details';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-distinctions-list',
  imports: [NgFor, CommonModule, TableModule],
  templateUrl: './distinctions-list.component.html',
  styleUrl: './distinctions-list.component.scss'
})
export class DistinctionsListComponent {
  distinctionsWithArcher!: DistinctionWithArcher[]
  ngOnInit(): void {
    let archer = new Archer("0909451J","Matthieu","Chartier");
    this.distinctionsWithArcher = [
      new DistinctionWithArcher(new Distinction ("Rouge", new Date(2024, 11, 23), 541,DistinctionStatus.A_DONNER), archer),
      new DistinctionWithArcher(new Distinction("Jaune", new Date(2024, 12, 8), 546,  DistinctionStatus.A_COMMANDER), archer)
    ];
  }
}

