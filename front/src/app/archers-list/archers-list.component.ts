import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { first } from 'rxjs';

@Component({
  selector: 'app-archers-list',
  imports: [NgFor, RouterLink, RouterLinkActive],
  templateUrl: './archers-list.component.html',
  styleUrl: './archers-list.component.scss'
})
export class ArchersListComponent {
 archers = [
  {licenceId: "0909451J", lastname: "Chartier", firstname: "Matthieu"},
  {licenceId: "654321", lastname: "Durand", firstname: "Pierre"},
 ];
}
