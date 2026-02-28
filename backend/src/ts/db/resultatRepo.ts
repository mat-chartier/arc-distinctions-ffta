import { literal, Sequelize } from "sequelize";
import { Resultat } from "./resultat";
import { rejects } from "assert";
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
      | "discipline"
    >
  ): Promise<Resultat> {
    return await Resultat.create(resultat);
  }


  async getByExactMatch(resultat: Resultat) {
    return await Resultat.findOne({
      where: {
        archerId: resultat.archerId,
        saison: resultat.saison,
        arme: resultat.arme,
        categorie: resultat.categorie,
        score: resultat.score,
        distance: resultat.distance,
        blason: resultat.blason,
        dateDebutConcours: resultat.dateDebutConcours,
        numDepart: resultat.numDepart,
        discipline: resultat.discipline,
      },
    });
  }
}

export const resultatRepo = new ResultatRepo();
