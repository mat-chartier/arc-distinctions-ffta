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
  distinctionsWithArcher: any;

  ngOnInit() {
    // Get personal bests
    fetch('http://localhost:3000/archers/distinctions').then((response) => {
      return response.json();
    }
    ).then((data) => {
      this.distinctionsWithArcher = data;
    }
    ).catch((error) => {
      console.error('Error:', error);
    }
    );  
  }
}

