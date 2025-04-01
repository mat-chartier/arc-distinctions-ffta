import { get } from "http";
import { distinctionRepo } from "../db/distinctionRepo";
import { Resultat } from "../db/resultat";
import { distinctionRules } from "./distinction-rules";

class DistinctionsManager {
  async record(result: Resultat) {
    const distinction = {
      archerId: result.archerId,
      resultatId: result.id!,
      statut: "A commander",
    };

    const distinctionName = distinctionRules.getDistinctionName(result);
    console.log(`Result ${result.score} grants ${distinctionName} distinction`);

    if (distinctionName !== null) {
      const distinctionNames = distinctionRules.getSameOrBetter(
        distinctionName,
        result.arme
      );

      console.log(`Same or better distinctions are : ${distinctionNames}`);

      const isEligible = await distinctionRepo.isDistinctionEligible(
        distinction.archerId,
        result.discipline,
        distinctionNames
      );

      console.log(
        `Distinction : ${result.archerId} ${result.score} is eligible : ${isEligible}`
      );
      if (isEligible) {
        await distinctionRepo.create({ ...distinction, nom: distinctionName });
        console.log(`Distinction ${distinctionName} created`);
      }
    }
  }
}

export const distinctionsManager = new DistinctionsManager();
