import { Injectable, inject, signal } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { ArcherDoc, ResultatDoc, DistinctionDoc, ArcherWithResultsData } from '../model/firestore-types';

const TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

const STORAGE_KEYS = {
  archers:      'cache:archers',
  resultats:    'cache:resultats',
  distinctions: 'cache:distinctions',
} as const;

// Replacer JSON : convertit les Timestamps Firestore en ISO string.
// Attention : JSON.stringify appelle toJSON() AVANT le replacer, donc on reçoit
// { type: "firestore/timestamp/1.0", seconds, nanoseconds } et non l'objet Timestamp.
function timestampReplacer(_key: string, value: any): any {
  if (value != null && typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      return value.toDate().toISOString();
    }
    if (value.type === 'firestore/timestamp/1.0' && typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000 + Math.round((value.nanoseconds || 0) / 1_000_000)).toISOString();
    }
  }
  return value;
}

// Convertit n'importe quelle représentation Firestore Timestamp ou string ISO en Date.
export function parseFirestoreDate(raw: any): Date | null {
  if (raw == null) return null;
  if (typeof raw.toDate === 'function') return raw.toDate();
  if (typeof raw.seconds === 'number') {
    return new Date(raw.seconds * 1000 + Math.round((raw.nanoseconds || 0) / 1_000_000));
  }
  const d = new Date(raw as string);
  return isNaN(d.getTime()) ? null : d;
}

@Injectable({ providedIn: 'root' })
export class AppStore {
  private firestoreService = inject(FirestoreService);

  // null = non chargé ; array = données en cache
  private archersCache      = signal<ArcherDoc[]      | null>(null);
  private resultatsCache    = signal<ResultatDoc[]    | null>(null);
  private distinctionsCache = signal<DistinctionDoc[] | null>(null);

  // Timestamps de dernière hydratation (plain property, pas besoin d'être réactif)
  private archersFetchedAt:      number | null = null;
  private resultatsFetchedAt:    number | null = null;
  private distinctionsFetchedAt: number | null = null;

  private isExpired(fetchedAt: number | null): boolean {
    return fetchedAt === null || Date.now() - fetchedAt > TTL_MS;
  }

  // ── localStorage ──────────────────────────────────────────────────────────

  private readFromStorage<T>(key: string): { data: T[]; fetchedAt: number } | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as { data: T[]; fetchedAt: number };
    } catch {
      return null;
    }
  }

  private writeToStorage(key: string, data: any[], fetchedAt: number): void {
    try {
      localStorage.setItem(key, JSON.stringify({ data, fetchedAt }, timestampReplacer));
    } catch {
      // Ignore : storage plein, mode privé, etc.
    }
  }

  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  // ── Helpers internes ──────────────────────────────────────────────────────

  private async loadArchers(): Promise<ArcherDoc[]> {
    let cached = this.archersCache();

    if (cached === null) {
      const stored = this.readFromStorage<ArcherDoc>(STORAGE_KEYS.archers);
      if (stored && !this.isExpired(stored.fetchedAt)) {
        this.archersCache.set(stored.data);
        this.archersFetchedAt = stored.fetchedAt;
        cached = stored.data;
        console.log(`[Cache HIT] archers (localStorage, ${cached.length})`);
        return cached;
      }
    }

    if (cached !== null && !this.isExpired(this.archersFetchedAt)) {
      console.log(`[Cache HIT] archers (${cached.length})`);
      return cached;
    }

    console.log(`[Cache MISS] archers (${cached === null ? 'null' : 'expiré'}) → Firestore`);
    const data = await this.firestoreService.getArchers();
    this.archersCache.set(data);
    this.archersFetchedAt = Date.now();
    this.writeToStorage(STORAGE_KEYS.archers, data, this.archersFetchedAt);
    return data;
  }

  private async loadResultats(): Promise<ResultatDoc[]> {
    let cached = this.resultatsCache();

    if (cached === null) {
      const stored = this.readFromStorage<ResultatDoc>(STORAGE_KEYS.resultats);
      if (stored && !this.isExpired(stored.fetchedAt)) {
        this.resultatsCache.set(stored.data);
        this.resultatsFetchedAt = stored.fetchedAt;
        cached = stored.data;
        console.log(`[Cache HIT] resultats (localStorage, ${cached.length})`);
        return cached;
      }
    }

    if (cached !== null && !this.isExpired(this.resultatsFetchedAt)) {
      console.log(`[Cache HIT] resultats (${cached.length})`);
      return cached;
    }

    console.log(`[Cache MISS] resultats (${cached === null ? 'null' : 'expiré'}) → Firestore`);
    const data = await this.firestoreService.getResultats();
    this.resultatsCache.set(data);
    this.resultatsFetchedAt = Date.now();
    this.writeToStorage(STORAGE_KEYS.resultats, data, this.resultatsFetchedAt);
    return data;
  }

  private async loadDistinctions(): Promise<DistinctionDoc[]> {
    let cached = this.distinctionsCache();

    if (cached === null) {
      const stored = this.readFromStorage<DistinctionDoc>(STORAGE_KEYS.distinctions);
      if (stored && !this.isExpired(stored.fetchedAt)) {
        this.distinctionsCache.set(stored.data);
        this.distinctionsFetchedAt = stored.fetchedAt;
        cached = stored.data;
        console.log(`[Cache HIT] distinctions (localStorage, ${cached.length})`);
        return cached;
      }
    }

    if (cached !== null && !this.isExpired(this.distinctionsFetchedAt)) {
      console.log(`[Cache HIT] distinctions (${cached.length})`);
      return cached;
    }

    console.log(`[Cache MISS] distinctions (${cached === null ? 'null' : 'expiré'}) → Firestore`);
    const data = await this.firestoreService.getDistinctions();
    this.distinctionsCache.set(data);
    this.distinctionsFetchedAt = Date.now();
    this.writeToStorage(STORAGE_KEYS.distinctions, data, this.distinctionsFetchedAt);
    return data;
  }

  // ── Invalidation globale (bouton refresh ou TTL forcé) ────────────────────

  invalidateAll(): void {
    this.archersCache.set(null);
    this.archersFetchedAt = null;
    this.resultatsCache.set(null);
    this.resultatsFetchedAt = null;
    this.distinctionsCache.set(null);
    this.distinctionsFetchedAt = null;
    this.removeFromStorage(STORAGE_KEYS.archers);
    this.removeFromStorage(STORAGE_KEYS.resultats);
    this.removeFromStorage(STORAGE_KEYS.distinctions);
  }

  // ── ARCHERS ───────────────────────────────────────────────────────────────

  async getArchers(): Promise<ArcherDoc[]> {
    return this.loadArchers();
  }

  async getArcher(id: string): Promise<ArcherDoc | null> {
    const archers = await this.loadArchers();
    return archers.find(a => a.id === id) ?? null;
  }

  async addArcher(archerData: any) {
    const result = await this.firestoreService.addArcher(archerData);
    this.archersCache.set(null);
    this.archersFetchedAt = null;
    this.removeFromStorage(STORAGE_KEYS.archers);
    return result;
  }

  async updateArcher(id: string, archerData: any) {
    const result = await this.firestoreService.updateArcher(id, archerData);
    this.archersCache.set(null);
    this.archersFetchedAt = null;
    this.removeFromStorage(STORAGE_KEYS.archers);
    return result;
  }

  async deleteArcher(id: string) {
    const result = await this.firestoreService.deleteArcher(id);
    this.archersCache.set(null);
    this.archersFetchedAt = null;
    this.removeFromStorage(STORAGE_KEYS.archers);
    return result;
  }

  // ── RÉSULTATS ─────────────────────────────────────────────────────────────

  async getResultats(archerId?: string, discipline?: string): Promise<ResultatDoc[]> {
    const all = await this.loadResultats();
    return all.filter(r =>
      (!archerId   || r.archerId   === archerId) &&
      (!discipline || r.discipline === discipline)
    );
  }

  async getResultat(id: string): Promise<ResultatDoc | null> {
    const all = await this.loadResultats();
    return all.find(r => r.id === id) ?? null;
  }

  async addResultat(resultatData: any) {
    const result = await this.firestoreService.addResultat(resultatData);
    this.resultatsCache.set(null);
    this.resultatsFetchedAt = null;
    this.removeFromStorage(STORAGE_KEYS.resultats);
    return result;
  }

  // Passthrough sans invalidation : les résultats sont immuables
  async updateResultat(id: string, resultatData: any) {
    return this.firestoreService.updateResultat(id, resultatData);
  }

  async deleteResultat(id: string) {
    const result = await this.firestoreService.deleteResultat(id);
    this.resultatsCache.set(null);
    this.resultatsFetchedAt = null;
    this.removeFromStorage(STORAGE_KEYS.resultats);
    return result;
  }

  // ── DISTINCTIONS ──────────────────────────────────────────────────────────

  async getDistinctions(archerId?: string, statut?: string): Promise<DistinctionDoc[]> {
    const all = await this.loadDistinctions();
    return all.filter(d =>
      (!archerId || d.archerId === archerId) &&
      (!statut   || d.statut   === statut)
    );
  }

  async getDistinction(id: string): Promise<DistinctionDoc | null> {
    const all = await this.loadDistinctions();
    return all.find(d => d.id === id) ?? null;
  }

  async getDistinctionsToOrder(): Promise<DistinctionDoc[]> {
    return this.getDistinctions(undefined, 'A commander');
  }

  async addDistinction(distinctionData: any) {
    const result = await this.firestoreService.addDistinction(distinctionData);
    this.distinctionsCache.set(null);
    this.distinctionsFetchedAt = null;
    this.removeFromStorage(STORAGE_KEYS.distinctions);
    return result;
  }

  async updateDistinction(id: string, distinctionData: any) {
    const result = await this.firestoreService.updateDistinction(id, distinctionData);
    this.distinctionsCache.set(null);
    this.distinctionsFetchedAt = null;
    this.removeFromStorage(STORAGE_KEYS.distinctions);
    return result;
  }

  async deleteDistinction(id: string) {
    const result = await this.firestoreService.deleteDistinction(id);
    this.distinctionsCache.set(null);
    this.distinctionsFetchedAt = null;
    this.removeFromStorage(STORAGE_KEYS.distinctions);
    return result;
  }

  // ── QUERIES COMPLEXES ─────────────────────────────────────────────────────

  async getArcherWithResults(archerId: string): Promise<ArcherWithResultsData> {
    const [archers, resultats, distinctions] = await Promise.all([
      this.loadArchers(),
      this.loadResultats(),
      this.loadDistinctions(),
    ]);

    const archer = archers.find(a => a.id === archerId);
    if (!archer) throw new Error('Archer not found');

    return {
      archer,
      resultats:    resultats.filter(r => r.archerId === archerId),
      distinctions: distinctions.filter(d => d.archerId === archerId),
    };
  }
}
