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

  async getBestResults() {
    return await Resultat.findAll({
      attributes: [
        "archer_id",
        "arme",
        "categorie",
        "distance",
        "blason",
        [Sequelize.fn("MAX", Sequelize.col("score")), "score"],
      ],
      group: ["archer_id", "arme", "categorie", "distance", "blason"],
      raw: true,
    });
  }
}

export const resultatRepo = new ResultatRepo();
