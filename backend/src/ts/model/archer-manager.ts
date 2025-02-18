import { parse } from "csv-parse";
import { createReadStream, PathLike } from "fs";
import { archerRepo } from "../db/archerRepo";
import { resultatRepo } from "../db/resultatRepo";
import { parseISO } from "date-fns";

class ArcherManager {
  async import(file: PathLike) {
    const stream = createReadStream(file);
    stream
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", async function (row) {
        const noLicence = row[2] as string;
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
          arme: row[11] as string,
          blason: row[18] as string,
          categorie: row[7] as string,
          numDepart: row[41] as number,
        });
      })
      .on("error", function (error) {
        console.log(error.message);
      })
      .on("end", function () {
        console.log("finished");
      });
  }
}

export const archerManager = new ArcherManager();
