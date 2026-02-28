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
  query,
  where,
  orderBy,
  Firestore,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { ArcherDoc, ResultatDoc, DistinctionDoc, ArcherWithResultsData } from '../model/firestore-types';

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
    return await addDoc(archersCol, {
      ...archerData,
      createdAt: Timestamp.now()
    });
  }

  async updateArcher(id: string, archerData: any) {
    console.log('[Firestore] UPDATE archer', id);
    const archerRef = doc(this.firestore, 'archers', id);
    return await updateDoc(archerRef, archerData);
  }

  async deleteArcher(id: string) {
    console.log('[Firestore] DELETE archer', id);
    const archerRef = doc(this.firestore, 'archers', id);
    return await deleteDoc(archerRef);
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

  async addResultat(resultatData: any) {
    console.log('[Firestore] ADD resultat');
    const resultatsCol = collection(this.firestore, 'resultats');
    return await addDoc(resultatsCol, {
      ...resultatData,
      createdAt: Timestamp.now()
    });
  }

  async updateResultat(id: string, resultatData: any) {
    console.log('[Firestore] UPDATE resultat', id);
    const resultatRef = doc(this.firestore, 'resultats', id);
    return await updateDoc(resultatRef, resultatData);
  }

  async deleteResultat(id: string) {
    console.log('[Firestore] DELETE resultat', id);
    const resultatRef = doc(this.firestore, 'resultats', id);
    return await deleteDoc(resultatRef);
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
    return await addDoc(distinctionsCol, {
      ...distinctionData,
      createdAt: Timestamp.now()
    });
  }

  async updateDistinction(id: string, distinctionData: any) {
    console.log('[Firestore] UPDATE distinction', id);
    const distinctionRef = doc(this.firestore, 'distinctions', id);
    return await updateDoc(distinctionRef, distinctionData);
  }

  async deleteDistinction(id: string) {
    console.log('[Firestore] DELETE distinction', id);
    const distinctionRef = doc(this.firestore, 'distinctions', id);
    return await deleteDoc(distinctionRef);
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

  async getDistinctionsToOrder(): Promise<DistinctionDoc[]> {
    // Récupérer les distinctions avec statut "A commander" (sans accent)
    const distinctionsCol = collection(this.firestore, 'distinctions');
    const q = query(distinctionsCol, where('statut', '==', 'A commander'));
    const distinctionsSnapshot = await getDocs(q);
    return distinctionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DistinctionDoc));
  }
}
