import { parse } from "csv-parse";
import { createReadStream, PathLike } from "fs";
import { archerRepo } from "../db/archerRepo";
import { resultatRepo } from "../db/resultatRepo";
import { parseISO } from "date-fns";
import { distinctionRepo } from "../db/distinctionRepo";

class ArcherManager {
  async import(file: PathLike) {
    const stream = createReadStream(file);
    const parser = stream.pipe(parse({ delimiter: ",", from_line: 2 }));

    let currentSaison;
    for await (const row of parser) {
      const noLicence = row[2] as string;
      const saison = row[0] as number;
      if (!currentSaison) {
        currentSaison = saison;
      }
      let archer = await archerRepo.getByNoLicence(noLicence);
      if (!archer) {
        const prenom = row[4] as string;
        const nom = row[3] as string;
        archer = await archerRepo.create({ prenom, nom, noLicence });
      }
      const formule = row[24] as string;
      var result: any = {
        archerId: archer.id!,
        distance: row[17] as number,
        dateDebutConcours: parseISO(row[19] as string),
        arme: row[11] as "CO" | "CL" | "BB",
        blason: row[18] as string,
        categorie: row[7] as string,
        numDepart: row[41] as number,
        saison
      };
      
      if (formule === "2X18M") {
        result = {
          ...result,
          score: row[13] as number,
        }
        resultatRepo.create(result);
      } else if (formule === "2X25M + 2X18M") {
        let score:number = Number(row[31] as number) + Number(row[32] as number);
        const result_25 = {
          ...result,
          score: score,
          distance: 25,
          blason: '60'
        }
        resultatRepo.create(result_25);
        score = Number(row[33] as number) + Number(row[34] as number);
        const result_18 = {
          ...result,
          score: score,
          distance: 18,
        }
        resultatRepo.create(result_18);
      }
      
    }
    if (currentSaison) {
      await distinctionRepo.populateFromResultat(currentSaison!);
    }
  }
}

export const archerManager = new ArcherManager();
