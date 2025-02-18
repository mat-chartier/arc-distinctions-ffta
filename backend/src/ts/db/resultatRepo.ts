import dbconnection from "./connect";
import { BestResultat, Resultat } from "./resultat";
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
    >
  ): Promise<Resultat> {
    return await Resultat.create(resultat);
  }

  async getBestResults() {
    return dbconnection.query(
      `
          SELECT archer_id, arme, categorie, distance, blason,
            MAX(score)
          FROM resultat
          GROUP BY archer_id, arme, categorie, distance, blason
      `,
      { model: BestResultat, mapToModel: true }
    );
  }
}

export const resultatRepo = new ResultatRepo();
