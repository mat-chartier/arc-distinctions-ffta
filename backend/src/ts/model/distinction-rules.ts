import { Resultat } from "../db/resultat";

class DistinctionRules {

    DISTINCTIONS_S_TAE = [
        "Vert (Promo)",
        "Blanc",
        "Noir",
        "Bleu",
        "Rouge",
        "Jaune",
        "1 etoile",
        "2 etoiles",
        "3 etoiles"
    ];

  getSameOrBetter(nom: string, discipline: string): string[] {
    return this.DISTINCTIONS_S_TAE.slice(
      this.DISTINCTIONS_S_TAE.findIndex((distinction) => distinction === nom)
    );
  }

  getDistinctionName(resultat: Resultat): string | null {
    switch (resultat.discipline) {
      case "S":
        return this.getSalleDistinctionName(resultat);
      case "T":
        return this.getTAEDistinctionName(resultat);
      case "C":
        return this.getCampagneDistinctionName(resultat);
      case "3":
        return this.get3DDistinctionName(resultat);
      case "N":
        return this.getNatureDistinctionName(resultat);
      default:
        return "";
    }
  }
  getNatureDistinctionName(resultat: Resultat): string {
    throw new Error("Method not implemented.");
  }
  get3DDistinctionName(resultat: Resultat): string {
    throw new Error("Method not implemented.");
  }
  getCampagneDistinctionName(resultat: Resultat): string {
    throw new Error("Method not implemented.");
  }
  getTAEDistinctionName(resultat: Resultat): string {
    throw new Error("Method not implemented.");
  }
  getSalleDistinctionName(resultat: Resultat): string | null {
    switch (resultat.arme) {
      case "CO":
        return this.getSalleCODistinctionName(resultat);
      default:
        return this.getSalleCLDistinctionName(resultat);
    }
  }
  getSalleCLDistinctionName(
    resultat: Pick<Resultat, "score" | "blason">
  ): string | null {
    const score = resultat.score;
    if (score >= 455 && score < 480) {
      return "Vert (Promo)";
    } else if (score >= 480 && score < 500) {
      return "Blanc";
    } else if (score >= 500 && score < 515) {
      return "Noir";
    } else if (score >= 515 && score < 530) {
      return "Bleu";
    } else if (score >= 530 && score < 545) {
      return "Rouge";
    }
    if (score >= 545 && score < 555) {
      return "Jaune";
    } else if (resultat.blason === "40") {
      if (score >= 555 && score < 565) {
        return "1 etoile";
      } else if (score >= 565 && score < 575) {
        return "2 etoiles";
      } else if (score >= 575) {
        return "3 etoiles";
      }
    }
    return null;
  }

  getSalleCODistinctionName(
    resultat: Pick<Resultat, "score" | "blason">
  ): string | null {
    const score = resultat.score;
    // same as getSalleCLDistinctionName but with CO score limits
    if (score >= 540 && score < 550) {
      return "Vert (Promo)";
    } else if (score >= 550 && score < 555) {
      return "Blanc";
    } else if (score >= 555 && score < 560) {
      return "Noir";
    } else if (score >= 560 && score < 565) {
      return "Bleu";
    } else if (score >= 565 && score < 570) {
      return "Rouge";
    } else if (score >= 570 && score < 575) {
      return "Jaune";
    } else {
      if (resultat.blason === "40") {
        if (score >= 575 && score < 580) {
          return "1 etoile";
        } else if (score >= 580 && score < 585) {
          return "2 etoiles";
        } else if (score >= 585) {
          return "3 etoiles";
        }
      }
    }
    return null;
  }
}

export const distinctionRules = new DistinctionRules();
