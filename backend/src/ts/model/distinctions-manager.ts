import { get } from "http";
import { distinctionRepo } from "../db/distinctionRepo";
import { Resultat } from "../db/resultat";
import { distinctionRules } from "./distinction-rules";
import { Distinction } from "../db/distinction";

class DistinctionsManager {
  async record(result: Resultat) {
    const distinctionForResult: Distinction | null =
      distinctionRules.getDistinction(result);
    if (distinctionForResult !== null) {
      const distinctionNames = distinctionRules.getSameOrBetter(
        distinctionForResult.nom,
        result.arme
      );

      const isEligible = await distinctionRepo.isDistinctionEligible(
        result.archerId,
        distinctionForResult.discipline,
        distinctionNames
      );

      if (isEligible) {
        await distinctionRepo.create({
          ...distinctionForResult,
          archerId: result.archerId,
          resultatId: result.id!,
          statut: "A commander",
        });
        console.log(`Distinction ${distinctionForResult} created`);
      }
    }
  }
}

export const distinctionsManager = new DistinctionsManager();
