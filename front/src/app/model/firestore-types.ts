// Types pour les documents Firestore

export interface ArcherDoc {
  id: string;
  noLicence: string;
  nom: string;
  prenom: string;
  role?: string;
  email?: string;
  createdAt?: any;
  linkedAt?: any;
}

export interface ResultatDoc {
  id: string;
  archerId: string;
  arme: string;
  score: number;
  categorie: string;
  distance: number;
  blason: string;
  numDepart: number;
  dateDebutConcours: any; // Timestamp Firestore
  saison: number;
  discipline: string;
  piquet?: string;
  createdAt?: any;
}

export interface DistinctionDoc {
  id: string;
  archerId: string;
  nom: string;
  resultatId: string;
  statut: string;
  distance: number;
  discipline: string;
  piquet?: string;
  createdAt?: any;
}

// Compte de connexion lié à un archer.
// docID = uid Firebase Auth ; archerId pointe vers archers/{archerId}.
export interface UserAccountDoc {
  id: string;        // uid Firebase Auth
  archerId: string;  // référence vers archers/{archerId}
  role: string;      // 'admin' | 'archer'
  email?: string;
  linkedAt?: any;
}

export interface ArcherWithResultsData {
  archer: ArcherDoc;
  resultats: ResultatDoc[];
  distinctions: DistinctionDoc[];
}