export class Archer {
  id?: string;
  noLicence: string;
  nom: string;
  prenom: string;
  email?: string;
  role?: string;

  constructor(noLicence: string, prenom: string, nom: string, id?: string) {
    this.noLicence = noLicence;
    this.prenom = prenom;
    this.nom = nom;
    this.id = id;
  }
}

export class ArcherWithDistinctions {
  archer: Archer;
  distinctions_18m_cl: Distinction[];
  distinctions_18m_co: Distinction[];

  constructor(
    archer: Archer,
    distinctions_18m_cl: Distinction[],
    distinctions_18m_co: Distinction[]
  ) {
    this.archer = archer;
    this.distinctions_18m_cl = distinctions_18m_cl;
    this.distinctions_18m_co = distinctions_18m_co;
  }
}

export enum DistinctionStatus {
  A_COMMANDER = 'À Commander',
  A_DONNER = 'À Donner',
  DONNEE = 'Donnée',
  NVP = "N'en veut pas",
}

export enum DistinctionArme {
  CL = 'Classique',
  CO = 'Compound',
  BB = 'Barebow',
}

export class Distinction {
  id?: string;
  name: string;
  date: Date;
  score: number;
  status: DistinctionStatus;
  arme: DistinctionArme = DistinctionArme.CL;

  constructor(
    name: string,
    date: Date,
    score: number,
    status: DistinctionStatus,
    category?: DistinctionArme,
    id?: string
  ) {
    this.name = name;
    this.date = date;
    this.score = score;
    this.status = status;
    this.id = id;
    if (category) {
      this.arme = category;
    }
  }
}

export class DistinctionWithArcher {
  distinction: Distinction;
  archer: Archer;

  constructor(distinction: Distinction, archer: Archer) {
    this.distinction = distinction;
    this.archer = archer;
  }
}

// Nouveaux modèles pour Firestore
export interface ResultatFirestore {
  id: string;
  archerId: string;
  arme: string;
  score: number;
  categorie: string;
  distance: number;
  blason: string;
  numDepart: number;
  dateDebutConcours: Date;
  saison: number;
  discipline: string;
  createdAt?: any;
}

export interface DistinctionFirestore {
  id: string;
  archerId: string;
  nom: string;
  resultatId: string;
  statut: string;
  distance: number;
  discipline: string;
  createdAt?: any;
}