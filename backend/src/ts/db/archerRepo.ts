import { Archer } from "./archer";
import { Distinction } from "./distinction";
import { Resultat } from "./resultat";
class ArcherRepo {
  async authenticate(licenceId: string, password: string): Promise<Archer | null> {
    return await Archer.findOne({ where: { noLicence: licenceId, password: password } });
  }

  async create(
    archer: Pick<Archer, "nom" | "prenom" | "noLicence">
  ): Promise<Archer> {
    return await Archer.create(archer);
  }

  async getArcherById(id: number): Promise<Archer | null> {
    return await Archer.findByPk(id);
  }

  async getArcherDetails(arg0: number): Promise<Archer | null> {
    return await Archer.findByPk(arg0, {
      include: [{ model: Distinction, include: [Resultat] }, {model : Resultat}],
    });
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
