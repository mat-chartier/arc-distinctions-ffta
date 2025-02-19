import { Archer } from "./archer";
class ArcherRepo {
  async create(
    archer: Pick<Archer, "nom" | "prenom" | "noLicence">
  ): Promise<Archer> {
    return await Archer.create(archer);
  }

  async getByNoLicence(noLicence: string): Promise<Archer | null> {
    return await Archer.findOne({ where: { noLicence } });
  }

  async getAll(): Promise<Archer[]> {
    return await Archer.findAll();
  }
}

export const archerRepo = new ArcherRepo();
