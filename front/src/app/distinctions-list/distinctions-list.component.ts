import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ArcherWithDistinctions, Distinction, DistinctionStatus, DistinctionWithArcher } from '../archer-details/archers-details';

@Component({
  selector: 'app-distinctions-list',
  imports: [NgFor, CommonModule],
  templateUrl: './distinctions-list.component.html',
  styleUrl: './distinctions-list.component.scss'
})
export class DistinctionsListComponent {
  distinctionsWithArcher!: DistinctionWithArcher[]
  ngOnInit(): void {
    let archer = {
      licenceId: "0909451J",
      firstname: "Matthieu",
      lastname: "Chartier"
    };
    this.distinctionsWithArcher = [
      new DistinctionWithArcher(new Distinction ("Rouge", new Date(2024, 11, 23), 541,DistinctionStatus.A_DONNER), archer),
      new DistinctionWithArcher(new Distinction("Jaune", new Date(2024, 12, 8), 546,  DistinctionStatus.A_COMMANDER), archer)
    ];
  }
}

