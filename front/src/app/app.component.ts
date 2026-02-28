import { CommonModule, NgIf } from '@angular/common';
import { Component, Injector, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { AuthenticationService } from './services/authentication.service';
import { AppStore } from './services/app.store';
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

  // Injector utilisé pour résoudre AppStore de façon paresseuse (après initializeApp())
  private injector = inject(Injector);
  private router = inject(Router);

  constructor(private authenticationService: AuthenticationService) {
    this.authenticationService.user.subscribe((x) => (this.archer = x));
  }

  logout() {
    this.authenticationService.logout();
  }

  async refreshCache() {
    this.injector.get(AppStore).invalidateAll();
    const currentUrl = this.router.url;
    await this.router.navigateByUrl('/', { skipLocationChange: true });
    await this.router.navigate([currentUrl]);
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
        label: 'Distinctions',
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
        label: 'Import',
        icon: 'pi pi-sync',
        items: [
          {
            label: 'Importer un fichier de résultats',
            icon: 'pi pi-upload',
            routerLink: '/results-upload',
          },
        ],
      }
    ];
    if (this.isAdmin()) {
      this.items.push({
        label: 'Refresh Cache',
        icon: 'pi pi-refresh',
        command: () => confirm("Voulez-vous vraiment rafraîchir le cache de données Firestore ?") && this.refreshCache()
      });
    }

  }

  isAdmin() {
    return this.isAuthenticated() && this.archer?.role === 'admin';
  }

  isAuthenticated() {
    return this.archer !== null && this.archer !== undefined;
  }
}
