import { parse } from "csv-parse";
import { createReadStream, PathLike } from "fs";
import { archerRepo } from "../db/archerRepo";
import { resultatRepo } from "../db/resultatRepo";
import { parseISO } from "date-fns";
import { distinctionRepo } from "../db/distinctionRepo";
import { ResultRaw } from "./result-raw";
import { Resultat } from "../db/resultat";
import { distinctionsManager } from "./distinctions-manager";
import { Archer } from "../db/archer";

class ArcherManager {
  async import2(file: PathLike) {
    const stream = createReadStream(file);
    let rawResults: ResultRaw[] = [];
    const parser = stream
      .pipe(parse({ delimiter: ";", from_line: 2 }))
      .map((r) => new ResultRaw(r))
      .forEach(async (resultRaw: ResultRaw) => {
        rawResults.push(resultRaw);
      });
    await parser;
    rawResults.sort((a, b) => {
      if (a.licence < b.licence) {
        return -1;
      }
      if (a.licence > b.licence) {
        return 1;
      }
      if (a.score < b.score) {
        return 1;
      }
      if (a.score > b.score) {
        return -1;
      }
      if (a.dateDebutConcours < b.dateDebutConcours) {
        return -1;
      }
      if (a.dateDebutConcours > b.dateDebutConcours) {
        return 1;
      }
      return 0;
    });

    // replace with foreach
    for (const resultRaw of rawResults) {
      switch (resultRaw.discipline) {
        case "T":
          await this.importTAE(resultRaw);
          break;
        case "S":
          await this.importSalle(resultRaw);
          break;
        case "C":
          // await this.importCampagne(row);
          break;
        case "3":
          // await this.import3D(row);
          break;
        case "N":
          // await this.importNature(row);
          break;
        default:
          break;
      }
    }
  }

  async importTAE(resultRaw: ResultRaw) {
    const archer = await this.getOrCreateArcher(resultRaw);
    let result = this.getResultFromResultRawForArcher(resultRaw, archer.id!);
    result.score = resultRaw.score;
    await this.saveResult(result);
  }

  async importSalle(resultRaw: ResultRaw) {
    const archer = await this.getOrCreateArcher(resultRaw);
    let result = this.getResultFromResultRawForArcher(resultRaw, archer.id!);

    const formule = resultRaw.formuleTir;
    if (formule === "2X18M") {
      result = {
        ...result,
        score: resultRaw.score,
      };
      await this.saveResult(result);
    } else if (formule === "2X25M + 2X18M") {
      let score: number =
        Number(resultRaw.scoreDist1) + Number(resultRaw.scoreDist2);
      const result_25 = {
        ...result,
        score: score,
        distance: 25,
        blason: "60",
      };
      await this.saveResult(result_25);
      score = Number(resultRaw.scoreDist3) + Number(resultRaw.scoreDist4);
      const result_18 = {
        ...result,
        score: score,
        distance: 18,
      };
      await this.saveResult(result_18);
    }
  }

  getResultFromResultRawForArcher(resultRaw: ResultRaw, archerId: number): any {
    return {
      archerId: archerId,
      distance: resultRaw.distance,
      dateDebutConcours: parseISO(resultRaw.dateDebutConcours),
      arme: resultRaw.arme as "CO" | "CL" | "BB",
      blason: resultRaw.blason,
      categorie: resultRaw.categorie,
      numDepart: resultRaw.numDepart,
      saison: resultRaw.saison,
      discipline: resultRaw.discipline,
    };
  }

  async getOrCreateArcher(resultRaw: ResultRaw): Promise<Archer> {
    const noLicence = resultRaw.licence;
    let archer = await archerRepo.getByNoLicence(noLicence);
    if (!archer) {
      const nom = resultRaw.nom;
      const prenom = resultRaw.prenom;
      archer = await archerRepo.create({ prenom, nom, noLicence });
    }
    return archer;
  }

  async saveResult(result: Resultat) {
    const existingResult = await resultatRepo.getByExactMatch(result);
    if (!existingResult) {
      result = await resultatRepo.create(result);
      console.log(`Resultat created ${result.score}`);
      await distinctionsManager.record(result);
    }
  }

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
        saison,
      };

      if (formule === "2X18M") {
        result = {
          ...result,
          score: row[13] as number,
        };
        resultatRepo.create(result);
      } else if (formule === "2X25M + 2X18M") {
        let score: number =
          Number(row[29] as number) + Number(row[30] as number);
        const result_25 = {
          ...result,
          score: score,
          distance: 25,
          blason: "60",
        };
        resultatRepo.create(result_25);
        score = Number(row[31] as number) + Number(row[32] as number);
        const result_18 = {
          ...result,
          score: score,
          distance: 18,
        };
        resultatRepo.create(result_18);
      }
    }
    if (currentSaison) {
      await distinctionRepo.populateFromResultat(currentSaison!);
    }
  }
}

export const archerManager = new ArcherManager();
