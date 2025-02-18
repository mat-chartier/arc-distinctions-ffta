import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Menubar, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Gestion des distinctions FFTA';
  items: MenuItem[] | undefined;
  ngOnInit() {
    this.items = [
      {
        label: 'Sync',
        icon: 'pi pi-sync',
        items: [
          {
            label: 'Importer un fichier de résultats',
            icon: 'pi pi-upload',
            routerLink: '/results-upload'
          }
        ]
      },
      {
        label: 'Archers',
        icon: 'pi pi-users',
        items: [
          {
            label: 'Liste des archers',
            icon: 'pi pi-list',
            routerLink: '/archers-list'
          }
        ]
      },
      {
        label: 'Distinctions Salle',
        icon: 'pi pi-crown',
        items: [
          {
            label: 'Liste des distinctions',
            icon: 'pi pi-list',
            routerLink: '/distinctions-list'
          }, {
            label: 'Distinctions à commander',
            icon: 'pi pi-shopping-cart',
            routerLink: '/distinctions-to-order'
          }
        ]
      }
    ];
  }
}
