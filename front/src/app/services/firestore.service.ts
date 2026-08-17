import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Firestore,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { ArcherDoc, ResultatDoc, DistinctionDoc, ArcherWithResultsData, UserAccountDoc } from '../model/firestore-types';
import { StockDoc } from '../model/stock-key';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore;

  constructor() {
    // Utiliser l'app Firebase déjà initialisée par AuthenticationService
    const app = getApp();
    this.firestore = getFirestore(app);
  }

  // ============ CACHE VERSION ============

  subscribeToCacheVersion(
    onData: (data: any) => void,
    onError: (err: any) => void
  ): () => void {
    const versionRef = doc(this.firestore, 'meta', 'cacheVersion');
    return onSnapshot(versionRef, snap => onData(snap.exists() ? snap.data() : null), onError);
  }

  private async updateCacheVersion(col: 'archers' | 'resultats' | 'distinctions' | 'stocks'): Promise<void> {
    const versionRef = doc(this.firestore, 'meta', 'cacheVersion');
    await setDoc(versionRef, { [col]: Timestamp.now() }, { merge: true });
  }

  // ============ ARCHERS ============

  async getArchers(): Promise<ArcherDoc[]> {
    console.log('[Firestore] GET archers');
    const archersCol = collection(this.firestore, 'archers');
    const archersSnapshot = await getDocs(archersCol);
    return archersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ArcherDoc));
  }

  async getArcher(id: string): Promise<ArcherDoc | null> {
    console.log('[Firestore] GET archer', id);
    const archerRef = doc(this.firestore, 'archers', id);
    const archerSnap = await getDoc(archerRef);
    if (archerSnap.exists()) {
      return { id: archerSnap.id, ...archerSnap.data() } as ArcherDoc;
    }
    return null;
  }

  async addArcher(archerData: any) {
    console.log('[Firestore] ADD archer');
    const archersCol = collection(this.firestore, 'archers');
    const result = await addDoc(archersCol, { ...archerData, createdAt: Timestamp.now() });
    this.updateCacheVersion('archers').catch(console.error);
    return result;
  }

  async updateArcher(id: string, archerData: any) {
    console.log('[Firestore] UPDATE archer', id);
    const archerRef = doc(this.firestore, 'archers', id);
    const result = await updateDoc(archerRef, archerData);
    this.updateCacheVersion('archers').catch(console.error);
    return result;
  }

  async deleteArcher(id: string) {
    console.log('[Firestore] DELETE archer', id);
    const archerRef = doc(this.firestore, 'archers', id);
    const result = await deleteDoc(archerRef);
    this.updateCacheVersion('archers').catch(console.error);
    return result;
  }

  // ============ RESULTATS ============

  async getResultats(archerId?: string, discipline?: string): Promise<ResultatDoc[]> {
    console.log('[Firestore] GET resultats', { archerId, discipline });
    const resultatsCol = collection(this.firestore, 'resultats');
    const constraints: QueryConstraint[] = [];

    if (archerId) {
      constraints.push(where('archerId', '==', archerId));
    }
    if (discipline) {
      constraints.push(where('discipline', '==', discipline));
    }
    constraints.push(orderBy('dateDebutConcours', 'desc'));

    const q = query(resultatsCol, ...constraints);
    const resultatsSnapshot = await getDocs(q);
    return resultatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ResultatDoc));
  }

  async getResultat(id: string): Promise<ResultatDoc | null> {
    console.log('[Firestore] GET resultat', id);
    const resultatRef = doc(this.firestore, 'resultats', id);
    const resultatSnap = await getDoc(resultatRef);
    if (resultatSnap.exists()) {
      return { id: resultatSnap.id, ...resultatSnap.data() } as ResultatDoc;
    }
    return null;
  }

  /** Firestore refuse les champs `undefined` : on les retire avant tout addDoc. */
  private stripUndefined<T extends Record<string, any>>(data: T): T {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = value;
      }
    }
    return clean as T;
  }

  async addResultat(resultatData: any) {
    console.log('[Firestore] ADD resultat');
    const resultatsCol = collection(this.firestore, 'resultats');
    const result = await addDoc(resultatsCol, this.stripUndefined({ ...resultatData, createdAt: Timestamp.now() }));
    this.updateCacheVersion('resultats').catch(console.error);
    return result;
  }

  async updateResultat(id: string, resultatData: any) {
    console.log('[Firestore] UPDATE resultat', id);
    const resultatRef = doc(this.firestore, 'resultats', id);
    const result = await updateDoc(resultatRef, resultatData);
    this.updateCacheVersion('resultats').catch(console.error);
    return result;
  }

  async deleteResultat(id: string) {
    console.log('[Firestore] DELETE resultat', id);
    const resultatRef = doc(this.firestore, 'resultats', id);
    const result = await deleteDoc(resultatRef);
    this.updateCacheVersion('resultats').catch(console.error);
    return result;
  }

  // ============ DISTINCTIONS ============

  async getDistinctions(archerId?: string, statut?: string): Promise<DistinctionDoc[]> {
    console.log('[Firestore] GET distinctions', { archerId, statut });
    const distinctionsCol = collection(this.firestore, 'distinctions');
    const constraints: QueryConstraint[] = [];

    if (archerId) {
      constraints.push(where('archerId', '==', archerId));
    }
    if (statut) {
      constraints.push(where('statut', '==', statut));
    }

    const q = query(distinctionsCol, ...constraints);
    const distinctionsSnapshot = await getDocs(q);
    return distinctionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DistinctionDoc));
  }

  async getDistinction(id: string): Promise<DistinctionDoc | null> {
    console.log('[Firestore] GET distinction', id);
    const distinctionRef = doc(this.firestore, 'distinctions', id);
    const distinctionSnap = await getDoc(distinctionRef);
    if (distinctionSnap.exists()) {
      return { id: distinctionSnap.id, ...distinctionSnap.data() } as DistinctionDoc;
    }
    return null;
  }

  async addDistinction(distinctionData: any) {
    console.log('[Firestore] ADD distinction');
    const distinctionsCol = collection(this.firestore, 'distinctions');
    const result = await addDoc(distinctionsCol, this.stripUndefined({ ...distinctionData, createdAt: Timestamp.now() }));
    this.updateCacheVersion('distinctions').catch(console.error);
    return result;
  }

  async updateDistinction(id: string, distinctionData: any) {
    console.log('[Firestore] UPDATE distinction', id);
    const distinctionRef = doc(this.firestore, 'distinctions', id);
    const result = await updateDoc(distinctionRef, distinctionData);
    this.updateCacheVersion('distinctions').catch(console.error);
    return result;
  }

  async deleteDistinction(id: string) {
    console.log('[Firestore] DELETE distinction', id);
    const distinctionRef = doc(this.firestore, 'distinctions', id);
    const result = await deleteDoc(distinctionRef);
    this.updateCacheVersion('distinctions').catch(console.error);
    return result;
  }

  // ============ STOCKS ============

  async getStocks(): Promise<StockDoc[]> {
    console.log('[Firestore] GET stocks');
    const stocksCol = collection(this.firestore, 'stocks');
    const stocksSnapshot = await getDocs(stocksCol);
    return stocksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StockDoc));
  }

  async addStock(stockData: any) {
    console.log('[Firestore] ADD stock');
    const stocksCol = collection(this.firestore, 'stocks');
    const result = await addDoc(stocksCol, this.stripUndefined({ ...stockData, updatedAt: Timestamp.now() }));
    this.updateCacheVersion('stocks').catch(console.error);
    return result;
  }

  async updateStock(id: string, stockData: any) {
    console.log('[Firestore] UPDATE stock', id);
    const stockRef = doc(this.firestore, 'stocks', id);
    const result = await updateDoc(stockRef, this.stripUndefined({ ...stockData, updatedAt: Timestamp.now() }));
    this.updateCacheVersion('stocks').catch(console.error);
    return result;
  }

  async deleteStock(id: string) {
    console.log('[Firestore] DELETE stock', id);
    const stockRef = doc(this.firestore, 'stocks', id);
    const result = await deleteDoc(stockRef);
    this.updateCacheVersion('stocks').catch(console.error);
    return result;
  }

  // ============ USERS (comptes de connexion) ============

  /** Comptes de connexion (collection `users`, docID = uid Firebase Auth). */
  async getUsers(): Promise<UserAccountDoc[]> {
    console.log('[Firestore] GET users');
    const usersCol = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersCol);
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserAccountDoc));
  }

  async getUser(uid: string): Promise<UserAccountDoc | null> {
    console.log('[Firestore] GET user', uid);
    const userRef = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as UserAccountDoc;
    }
    return null;
  }

  /** Crée (ou remplace) le compte users/{uid} liant un archer à un login. */
  async createUserAccount(uid: string, data: { archerId: string; role: string; email?: string }) {
    console.log('[Firestore] SET user', uid);
    const userRef = doc(this.firestore, 'users', uid);
    return setDoc(userRef, this.stripUndefined({ ...data, linkedAt: Timestamp.now() }));
  }

  async updateUserRole(uid: string, role: string) {
    console.log('[Firestore] UPDATE user role', uid, role);
    const userRef = doc(this.firestore, 'users', uid);
    return updateDoc(userRef, { role });
  }

  // ============ QUERIES COMPLEXES ============

  async getArcherWithResults(archerId: string): Promise<ArcherWithResultsData> {
    const archer = await this.getArcher(archerId);
    const resultats = await this.getResultats(archerId);
    const distinctions = await this.getDistinctions(archerId);

    if (!archer) {
      throw new Error('Archer not found');
    }

    return {
      archer,
      resultats,
      distinctions
    };
  }
}
