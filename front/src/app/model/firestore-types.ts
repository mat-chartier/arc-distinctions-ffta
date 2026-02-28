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
  createdAt?: any;
}

export interface ArcherWithResultsData {
  archer: ArcherDoc;
  resultats: ResultatDoc[];
  distinctions: DistinctionDoc[];
}