import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Archer,
  ArcherWithDistinctions,
  Distinction,
  DistinctionStatus,
} from './archers-details';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-archer-details',
  imports: [NgFor, CommonModule],
  templateUrl: './archer-details.component.html',
  styleUrl: './archer-details.component.scss',
})
export class ArcherDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  archerDetails!: ArcherWithDistinctions;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      console.log(params);
      this.archerDetails = this.getArcherDetails(params['licenceId']);
    });
  }

  getArcherDetails(licenceId: string): ArcherWithDistinctions {
    let distinctions_18m_cl = [
      new Distinction(
        'Vert promo',
        new Date(2021, 1, 1),
        460,
        DistinctionStatus.DONNEE
      ),
      new Distinction(
        'Jaune',
        new Date(2024, 12, 8),
        546,
        DistinctionStatus.A_COMMANDER
      ),
    ];
    let distinctions_18m_co: Distinction[] = [];
    return new ArcherWithDistinctions(
      new Archer(licenceId, 'Matthieu', 'Chartier'),
      distinctions_18m_cl,
      distinctions_18m_co
    );
  }
}
