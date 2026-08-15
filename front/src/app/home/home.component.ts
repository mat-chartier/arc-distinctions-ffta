import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import {
  SALLE,
  TAE_DI,
  TAE_DN,
  CAMPAGNE_MARCASSIN,
  CAMPAGNE_ECUREUIL,
  BROCARD_3D,
  LYNX_3D,
  SANGLIER_NATURE,
  MARCASSIN_NATURE,
} from './baremes';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TabsModule, CardModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  salle = SALLE;
  taeDI = TAE_DI;
  taeDN = TAE_DN;
  campagneMarcassin = CAMPAGNE_MARCASSIN;
  campagneEcureuil = CAMPAGNE_ECUREUIL;
  brocard3D = BROCARD_3D;
  lynx3D = LYNX_3D;
  sanglierNature = SANGLIER_NATURE;
  marcassinNature = MARCASSIN_NATURE;

  // Slugs d'images introuvables → repli sur la pastille colorée.
  imgFailed = new Set<string>();

  /** Classe CSS de la pastille colorée d'un palier Salle/TAE. */
  classePalier(nom: string): string {
    if (nom.includes('étoile')) return 'palier--etoile';
    if (nom.startsWith('Vert')) return 'palier--vert';
    if (nom.startsWith('Blanc')) return 'palier--blanc';
    if (nom.startsWith('Noir')) return 'palier--noir';
    if (nom.startsWith('Bleu')) return 'palier--bleu';
    if (nom.startsWith('Rouge')) return 'palier--rouge';
    if (nom.startsWith('Jaune')) return 'palier--jaune';
    return 'palier--defaut';
  }

  /** Nombre d'étoiles (1/2/3) d'un palier « n étoile(s) », sinon 0. */
  nbEtoiles(nom: string): number {
    const m = nom.match(/^(\d)\s*étoile/);
    return m ? parseInt(m[1], 10) : 0;
  }

  /** Chaîne d'étoiles (« ★★ ») pour un palier étoilé, sinon vide. */
  etoiles(nom: string): string {
    return '★'.repeat(this.nbEtoiles(nom));
  }
}
