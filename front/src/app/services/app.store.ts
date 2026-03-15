import { Injectable, inject, signal } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { ArcherDoc, ResultatDoc, DistinctionDoc, ArcherWithResultsData } from '../model/firestore-types';

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

  // Timestamps de dernière hydratation (ms depuis epoch)
  private archersFetchedAt:      number | null = null;
  private resultatsFetchedAt:    number | null = null;
  private distinctionsFetchedAt: number | null = null;

  // Dernières versions serveur reçues via onSnapshot
  private serverArchersVersion:      number = 0;
  private serverResultatsVersion:    number = 0;
  private serverDistinctionsVersion: number = 0;

  // Promesse résolue dès le premier snapshot du listener de version
  private ready: Promise<void>;
  private resolveReady!: () => void;

  constructor() {
    this.ready = new Promise(resolve => { this.resolveReady = resolve; });
    this.startCacheVersionListener();
  }

  // ── Listener version serveur ───────────────────────────────────────────────

  private startCacheVersionListener(): void {
    this.firestoreService.subscribeToCacheVersion(
      (data) => {
        console.log('[Cache] onSnapshot cacheVersion reçu', data);
        if (data) {
          const serverArchers      = parseFirestoreDate(data['archers'])?.getTime()      ?? 0;
          const serverResultats    = parseFirestoreDate(data['resultats'])?.getTime()    ?? 0;
          const serverDistinctions = parseFirestoreDate(data['distinctions'])?.getTime() ?? 0;

          this.serverArchersVersion      = serverArchers;
          this.serverResultatsVersion    = serverResultats;
          this.serverDistinctionsVersion = serverDistinctions;

          console.log('[Cache] comparaison archers      — server:', serverArchers,      'fetchedAt:', this.archersFetchedAt);
          console.log('[Cache] comparaison resultats    — server:', serverResultats,    'fetchedAt:', this.resultatsFetchedAt);
          console.log('[Cache] comparaison distinctions — server:', serverDistinctions, 'fetchedAt:', this.distinctionsFetchedAt);

          if (this.archersFetchedAt !== null && serverArchers > this.archersFetchedAt) {
            this.archersCache.set(null);
            this.archersFetchedAt = null;
            this.removeFromStorage(STORAGE_KEYS.archers);
            console.log('[Cache] archers invalidé par version serveur');
          }
          if (this.resultatsFetchedAt !== null && serverResultats > this.resultatsFetchedAt) {
            this.resultatsCache.set(null);
            this.resultatsFetchedAt = null;
            this.removeFromStorage(STORAGE_KEYS.resultats);
            console.log('[Cache] resultats invalidé par version serveur');
          }
          if (this.distinctionsFetchedAt !== null && serverDistinctions > this.distinctionsFetchedAt) {
            this.distinctionsCache.set(null);
            this.distinctionsFetchedAt = null;
            this.removeFromStorage(STORAGE_KEYS.distinctions);
            console.log('[Cache] distinctions invalidé par version serveur');
          }
        }
        this.resolveReady();
      },
      (error) => {
        console.error('[Cache] Erreur listener version:', error);
        this.resolveReady(); // Ne pas bloquer l'app en cas d'erreur réseau
      }
    );
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
    await this.ready;

    const cached = this.archersCache();
    if (cached !== null) {
      console.log(`[Cache HIT] archers (${cached.length})`);
      return cached;
    }

    const stored = this.readFromStorage<ArcherDoc>(STORAGE_KEYS.archers);
    if (stored && this.serverArchersVersion <= stored.fetchedAt) {
      this.archersCache.set(stored.data);
      this.archersFetchedAt = stored.fetchedAt;
      console.log(`[Cache HIT] archers (localStorage, ${stored.data.length})`);
      return stored.data;
    }
    if (stored) {
      console.log('[Cache] archers localStorage périmé vs version serveur → Firestore');
      this.removeFromStorage(STORAGE_KEYS.archers);
    }

    console.log('[Cache MISS] archers → Firestore');
    const data = await this.firestoreService.getArchers();
    this.archersCache.set(data);
    this.archersFetchedAt = Date.now();
    this.writeToStorage(STORAGE_KEYS.archers, data, this.archersFetchedAt);
    return data;
  }

  private async loadResultats(): Promise<ResultatDoc[]> {
    await this.ready;

    const cached = this.resultatsCache();
    if (cached !== null) {
      console.log(`[Cache HIT] resultats (${cached.length})`);
      return cached;
    }

    const stored = this.readFromStorage<ResultatDoc>(STORAGE_KEYS.resultats);
    if (stored && this.serverResultatsVersion <= stored.fetchedAt) {
      this.resultatsCache.set(stored.data);
      this.resultatsFetchedAt = stored.fetchedAt;
      console.log(`[Cache HIT] resultats (localStorage, ${stored.data.length})`);
      return stored.data;
    }
    if (stored) {
      console.log('[Cache] resultats localStorage périmé vs version serveur → Firestore');
      this.removeFromStorage(STORAGE_KEYS.resultats);
    }

    console.log('[Cache MISS] resultats → Firestore');
    const data = await this.firestoreService.getResultats();
    this.resultatsCache.set(data);
    this.resultatsFetchedAt = Date.now();
    this.writeToStorage(STORAGE_KEYS.resultats, data, this.resultatsFetchedAt);
    return data;
  }

  private async loadDistinctions(): Promise<DistinctionDoc[]> {
    await this.ready;

    const cached = this.distinctionsCache();
    if (cached !== null) {
      console.log(`[Cache HIT] distinctions (${cached.length})`);
      return cached;
    }

    const stored = this.readFromStorage<DistinctionDoc>(STORAGE_KEYS.distinctions);
    console.log('[Cache] distinctions localStorage fetchedAt:', stored?.fetchedAt, 'serverVersion:', this.serverDistinctionsVersion);
    if (stored && this.serverDistinctionsVersion <= stored.fetchedAt) {
      this.distinctionsCache.set(stored.data);
      this.distinctionsFetchedAt = stored.fetchedAt;
      console.log(`[Cache HIT] distinctions (localStorage, ${stored.data.length})`);
      return stored.data;
    }
    if (stored) {
      console.log('[Cache] distinctions localStorage périmé vs version serveur → Firestore');
      this.removeFromStorage(STORAGE_KEYS.distinctions);
    }

    console.log('[Cache MISS] distinctions → Firestore');
    const data = await this.firestoreService.getDistinctions();
    this.distinctionsCache.set(data);
    this.distinctionsFetchedAt = Date.now();
    this.writeToStorage(STORAGE_KEYS.distinctions, data, this.distinctionsFetchedAt);
    return data;
  }

  // ── Invalidation globale (bouton refresh) ─────────────────────────────────

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
    const docRef = await this.firestoreService.addArcher(archerData);
    const current = this.archersCache();
    if (current !== null) {
      const updated = [...current, { id: docRef.id, ...archerData } as ArcherDoc];
      this.archersFetchedAt = Date.now();
      this.archersCache.set(updated);
      this.writeToStorage(STORAGE_KEYS.archers, updated, this.archersFetchedAt);
    }
    return docRef;
  }

  async updateArcher(id: string, archerData: any) {
    const result = await this.firestoreService.updateArcher(id, archerData);
    const current = this.archersCache();
    if (current !== null) {
      const updated = current.map(a => a.id === id ? { ...a, ...archerData } : a);
      this.archersFetchedAt = Date.now();
      this.archersCache.set(updated);
      this.writeToStorage(STORAGE_KEYS.archers, updated, this.archersFetchedAt);
    }
    return result;
  }

  async deleteArcher(id: string) {
    const result = await this.firestoreService.deleteArcher(id);
    const current = this.archersCache();
    if (current !== null) {
      const updated = current.filter(a => a.id !== id);
      this.archersFetchedAt = Date.now();
      this.archersCache.set(updated);
      this.writeToStorage(STORAGE_KEYS.archers, updated, this.archersFetchedAt);
    }
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
    const docRef = await this.firestoreService.addResultat(resultatData);
    const current = this.resultatsCache();
    if (current !== null) {
      const updated = [...current, { id: docRef.id, ...resultatData } as ResultatDoc];
      this.resultatsFetchedAt = Date.now();
      this.resultatsCache.set(updated);
      this.writeToStorage(STORAGE_KEYS.resultats, updated, this.resultatsFetchedAt);
    }
    return docRef;
  }

  async updateResultat(id: string, resultatData: any) {
    const result = await this.firestoreService.updateResultat(id, resultatData);
    const current = this.resultatsCache();
    if (current !== null) {
      const updated = current.map(r => r.id === id ? { ...r, ...resultatData } : r);
      this.resultatsFetchedAt = Date.now();
      this.resultatsCache.set(updated);
      this.writeToStorage(STORAGE_KEYS.resultats, updated, this.resultatsFetchedAt);
    }
    return result;
  }

  async deleteResultat(id: string) {
    const result = await this.firestoreService.deleteResultat(id);
    const current = this.resultatsCache();
    if (current !== null) {
      const updated = current.filter(r => r.id !== id);
      this.resultatsFetchedAt = Date.now();
      this.resultatsCache.set(updated);
      this.writeToStorage(STORAGE_KEYS.resultats, updated, this.resultatsFetchedAt);
    }
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
    const docRef = await this.firestoreService.addDistinction(distinctionData);
    const current = this.distinctionsCache();
    if (current !== null) {
      const updated = [...current, { id: docRef.id, ...distinctionData } as DistinctionDoc];
      this.distinctionsFetchedAt = Date.now();
      this.distinctionsCache.set(updated);
      this.writeToStorage(STORAGE_KEYS.distinctions, updated, this.distinctionsFetchedAt);
    }
    return docRef;
  }

  async updateDistinction(id: string, distinctionData: any) {
    const result = await this.firestoreService.updateDistinction(id, distinctionData);
    const current = this.distinctionsCache();
    if (current !== null) {
      const updated = current.map(d => d.id === id ? { ...d, ...distinctionData } : d);
      this.distinctionsFetchedAt = Date.now();
      this.distinctionsCache.set(updated);
      this.writeToStorage(STORAGE_KEYS.distinctions, updated, this.distinctionsFetchedAt);
    }
    return result;
  }

  async deleteDistinction(id: string) {
    const result = await this.firestoreService.deleteDistinction(id);
    const current = this.distinctionsCache();
    if (current !== null) {
      const updated = current.filter(d => d.id !== id);
      this.distinctionsFetchedAt = Date.now();
      this.distinctionsCache.set(updated);
      this.writeToStorage(STORAGE_KEYS.distinctions, updated, this.distinctionsFetchedAt);
    }
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
