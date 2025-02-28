import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ApisService } from '../services/apis-service';

@Component({
  selector: 'app-archer-details',
  imports: [CommonModule, TableModule],
  templateUrl: './archer-details.component.html',
  styleUrl: './archer-details.component.scss',
})
export class ArcherDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apisService = inject(ApisService);

  archerDetails: any = {};

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      const url = 'archer/' + params['id'] + '/details';
      this.archerDetails = await this.apisService.get(url);
    });
  }
}
