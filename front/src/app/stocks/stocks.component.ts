import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { AppStore } from '../services/app.store';
import { StockDoc, ArmeGroup, armeGroup, buildStockKey, stockTypeLabel } from '../model/stock-key';

interface StockTypeOption {
  label: string;
  key: string;
  discipline: string;
  armeGroup: ArmeGroup | null;
  nom: string;
}

interface StockRow extends StockDoc {
  label: string;
}

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, SelectModule, ButtonModule],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.scss',
})
export class StocksComponent implements OnInit {
  private store = inject(AppStore);

  loading = true;
  error = '';

  stocks: StockRow[] = [];
  typeOptions: StockTypeOption[] = [];

  selectedType: StockTypeOption | null = null;
  newQuantite = 1;

  async ngOnInit() {
    await this.fetchData();
  }

  async fetchData() {
    try {
      this.loading = true;
      this.error = '';

      const [stocks, distinctions, resultats] = await Promise.all([
        this.store.getStocks(),
        this.store.getDistinctions(),
        this.store.getResultats(),
      ]);

      const resultatsMap = new Map(resultats.map(r => [r.id, r]));

      this.stocks = stocks
        .map(s => ({ ...s, label: stockTypeLabel({ ...s, armeGroup: s.armeGroup ?? null }) }))
        .sort((a, b) => a.label.localeCompare(b.label));

      // Types disponibles à l'ajout = types de distinction présents en base
      // (joints à leur résultat pour l'arme), dédupliqués par clé, en excluant
      // ceux déjà stockés.
      const existingKeys = new Set(stocks.map(s => s.key));
      const seen = new Map<string, StockTypeOption>();
      for (const d of distinctions as any[]) {
        const arme = resultatsMap.get(d.resultatId)?.arme;
        const key = buildStockKey({ discipline: d.discipline, nom: d.nom, arme });
        if (seen.has(key) || existingKeys.has(key)) continue;
        seen.set(key, {
          label: stockTypeLabel({ discipline: d.discipline, nom: d.nom, armeGroup: armeGroup(d.discipline, arme) }),
          key,
          discipline: d.discipline,
          armeGroup: armeGroup(d.discipline, arme),
          nom: d.nom,
        });
      }
      this.typeOptions = [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
    } catch (e: any) {
      console.error('Erreur lors du chargement des stocks:', e);
      this.error = 'Erreur lors du chargement des stocks';
    } finally {
      this.loading = false;
    }
  }

  async addStock() {
    if (!this.selectedType || this.newQuantite == null || this.newQuantite < 0) return;
    const t = this.selectedType;
    const data: any = {
      discipline: t.discipline,
      nom: t.nom,
      quantite: this.newQuantite,
      key: t.key,
    };
    if (t.armeGroup) data.armeGroup = t.armeGroup;

    try {
      await this.store.addStock(data);
      this.selectedType = null;
      this.newQuantite = 1;
      await this.fetchData();
    } catch (e) {
      console.error('Erreur lors de l\'ajout au stock:', e);
      this.error = 'Erreur lors de l\'ajout au stock';
    }
  }

  async changeQuantite(row: StockRow, quantite: number) {
    const q = Math.max(0, Math.round(quantite ?? 0));
    if (q === row.quantite) return;
    try {
      await this.store.updateStock(row.id, { quantite: q });
      row.quantite = q;
    } catch (e) {
      console.error('Erreur lors de la mise à jour du stock:', e);
      await this.fetchData();
    }
  }

}
