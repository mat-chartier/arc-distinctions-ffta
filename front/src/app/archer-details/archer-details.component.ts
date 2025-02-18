import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-archer-details',
  imports: [],
  templateUrl: './archer-details.component.html',
  styleUrl: './archer-details.component.scss'
})
export class ArcherDetailsComponent implements OnInit{
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  licenceId = "N/A";

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log(params);
      this.licenceId = params["licenceId"];
   });
  }
}
