export class Archer {
  licenceId: string;
  firstname: string;
  lastname: string;
  constructor(licenceId: string, firstname: string, lastname: string) {
    this.licenceId = licenceId;
    this.firstname = firstname;
    this.lastname = lastname;
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
  NVP = "N'en veut pas"
}

export enum DistinctionArme {
    CL = 'Classique',
    CO = 'Compound',
    BB = 'Barebow',
}

export class Distinction {
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
    category?: DistinctionArme
  ) {
    this.name = name;
    this.date = date;
    this.score = score;
    this.status = status;
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
