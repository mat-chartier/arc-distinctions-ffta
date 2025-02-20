import { Archer } from "./archer";
import { Distinction } from "./distinction";
import { Resultat } from "./resultat";
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
    return await Archer.findAll({
      include: { model: Distinction, include: [Resultat] },
    });
  }
}

export const archerRepo = new ArcherRepo();
