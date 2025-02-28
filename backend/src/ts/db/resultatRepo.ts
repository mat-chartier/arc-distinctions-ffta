import { literal, Sequelize } from "sequelize";
import { Resultat } from "./resultat";
class ResultatRepo {
  async create(
    resultat: Pick<
      Resultat,
      | "archerId"
      | "arme"
      | "categorie"
      | "distance"
      | "score"
      | "blason"
      | "dateDebutConcours"
      | "numDepart"
      | "saison"
    >
  ): Promise<Resultat> {
    return await Resultat.create(resultat);
  }
}

export const resultatRepo = new ResultatRepo();
