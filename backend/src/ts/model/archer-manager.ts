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
        console.log("Creating archer", noLicence);
        const prenom = row[4] as string;
        const nom = row[3] as string;
        archer = await archerRepo.create({ prenom, nom, noLicence });
        console.log("Added new archer with licence number: ", noLicence);
      }
      resultatRepo.create({
        archerId: archer.id!,
        distance: row[17] as number,
        score: row[13] as number,
        dateDebutConcours: parseISO(row[19] as string),
        arme: row[11] as "CO" | "CL" | "BB",
        blason: row[18] as string,
        categorie: row[7] as string,
        numDepart: row[41] as number,
        saison
      });
    }
    if (currentSaison) {
      await distinctionRepo.populateFromResultat(currentSaison!);
    }
  }
}

export const archerManager = new ArcherManager();
