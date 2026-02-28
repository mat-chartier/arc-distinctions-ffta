import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Archer } from '../archer-details/archers-details';
import { TableModule } from 'primeng/table';
import { ApisService } from '../services/apis-service';
import { AppStore } from '../services/app.store';

@Component({
  selector: 'app-archers-list',
  imports: [RouterLink, RouterLinkActive, TableModule],
  templateUrl: './archers-list.component.html',
  styleUrl: './archers-list.component.scss',
})
export class ArchersListComponent {
  constructor(private apisService: ApisService) {}
  private firestoreService = inject(AppStore);
  archers: Archer[] = [];
  loading = true;
  error = '';


  async ngOnInit(): Promise<void> {
    try {
      this.loading = true;
      this.archers = await this.firestoreService.getArchers() as unknown as Archer[];
      console.log('Archers chargés:', this.archers.length);
    } catch (error: any) {
      console.error('Erreur lors du chargement des archers:', error);
      this.error = 'Erreur lors du chargement des archers';
    } finally {
      this.loading = false;
    }
  }

  // Méthode utilitaire pour trier par nom
  get archersSorted(): Archer[] {
    return [...this.archers].sort((a, b) => 
      a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom)
    );
  }
}
