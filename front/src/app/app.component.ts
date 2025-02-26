import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { User } from './model/user';
import { AuthenticationService } from './services/authentication.service';
import { Archer } from './archer-details/archers-details';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Menubar, CommonModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Gestion des distinctions FFTA';
  items: MenuItem[] | undefined;
  archer?: Archer | null;

  constructor(private authenticationService: AuthenticationService) {
    this.authenticationService.user.subscribe((x) => (this.archer = x));
  }

  logout() {
    this.authenticationService.logout();
  }
  ngOnInit() {
    this.items = [
      {
        label: 'Accueil',
        icon: 'pi pi-home',
        routerLink: '/',
      },
      {
        label: 'Archers',
        icon: 'pi pi-users',
        items: [
          {
            label: 'Liste des archers',
            icon: 'pi pi-list',
            routerLink: '/archers-list',
          },
        ],
      },
      {
        label: 'Distinctions Salle',
        icon: 'pi pi-crown',
        items: [
          {
            label: 'Liste des distinctions',
            icon: 'pi pi-list',
            routerLink: '/distinctions-list',
          },
          {
            label: 'Distinctions à commander',
            icon: 'pi pi-shopping-cart',
            routerLink: '/distinctions-to-order',
          },
        ],
      },
      {
        label: 'Sync',
        icon: 'pi pi-sync',
        items: [
          {
            label: 'Importer un fichier de résultats',
            icon: 'pi pi-upload',
            routerLink: '/results-upload',
          },
        ],
      },
    ];
  }

  isAuthenticated() {
    return this.archer !== null;
  }
}
