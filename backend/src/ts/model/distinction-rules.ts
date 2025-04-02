import { Distinction } from "../db/distinction";
import { Resultat } from "../db/resultat";

class DistinctionRules {
  DISTINCTIONS_S_TAE = [
    "Vert (Promo)",
    "Blanc",
    "Noir",
    "Bleu",
    "Rouge",
    "Jaune",
    "1 étoile",
    "2 étoiles",
    "3 étoiles",
  ];
  DISTINCTIONS_TAE_DN_CO = [
    "1 Archer (argent)",
    "2 Archers (argent)",
    "3 Archers (argent)",
    "4 Archers (argent)",
    "Archer d'or (argent)",
  ];
  DISTINCTIONS_TAE_DN_CL = [
    "1 Archer (or)",
    "2 Archers (or)",
    "3 Archers (or)",
    "4 Archers (or)",
    "Archer d'or (or)",
  ];

  getSameOrBetter(
    nom: string,
    discipline: string,
    arme: string
  ): string[] | null {
    if (discipline === "Salle" || discipline === "TAEDI") {
      return this.DISTINCTIONS_S_TAE.slice(
        this.DISTINCTIONS_S_TAE.findIndex((distinction) => distinction === nom)
      );
    } else if (discipline === "TAEDN") {
      if (arme === "CO") {
        return this.DISTINCTIONS_TAE_DN_CO.slice(
          this.DISTINCTIONS_TAE_DN_CO.findIndex(
            (distinction) => distinction === nom
          )
        );
      }
      return this.DISTINCTIONS_TAE_DN_CL.slice(
        this.DISTINCTIONS_TAE_DN_CL.findIndex(
          (distinction) => distinction === nom
        )
      );
    }
    return null;
  }

  getDistinction(resultat: Resultat): Distinction | null {
    switch (resultat.discipline) {
      case "S":
        return this.getSalleDistinction(resultat);
      case "T":
        return this.getTAEDistinction(resultat);
      case "C":
        return this.getCampagneDistinction(resultat);
      case "3":
        return this.get3DDistinction(resultat);
      case "N":
        return this.getNatureDistinction(resultat);
      default:
        return null;
    }
  }
  getNatureDistinction(resultat: Resultat): Distinction {
    throw new Error("Method not implemented.");
  }
  get3DDistinction(resultat: Resultat): Distinction {
    throw new Error("Method not implemented.");
  }
  getCampagneDistinction(resultat: Resultat): Distinction {
    throw new Error("Method not implemented.");
  }
  getTAEDistinction(resultat: Resultat): Distinction | null {
    const d = this.getTAEDistinctionTemplate(resultat);
    if (d === null) {
      return null;
    }

    console.log(`getTAEDistinctionTemplate: ${JSON.stringify(d)}`);

    switch (d.discipline) {
      case "TAEDI":
        return this.getTAEDIDistinction(resultat, d);
      case "TAEDN":
        return this.getTAEDNDistinction(resultat, d);
      default:
        return null;
    }
  }

  getTAEDIDistinction(
    resultat: Resultat,
    distinction: Distinction
  ): Distinction | null {
    if (resultat.arme === "CO") {
      return this.getTAEDICODistinction(resultat, distinction);
    }
    return this.getTAEDICLDistinction(resultat, distinction);
  }
  getTAEDICODistinction(
    resultat: Resultat,
    distinction: Distinction
  ): Distinction | null {
    const score = resultat.score;
    if (score >= 620 && score < 635) {
      return { ...distinction, nom: "Vert (Promo)" } as Distinction;
    } else if (score >= 635 && score < 645) {
      return { ...distinction, nom: "Blanc" } as Distinction;
    } else if (score >= 645 && score < 655) {
      return { ...distinction, nom: "Noir" } as Distinction;
    } else if (score >= 655 && score < 665) {
      return { ...distinction, nom: "Bleu" } as Distinction;
    } else if (score >= 665 && score < 675) {
      return { ...distinction, nom: "Rouge" } as Distinction;
    } else if (score >= 675 && score < 685) {
      return { ...distinction, nom: "Jaune" } as Distinction;
    } else if (score >= 685 && score < 695) {
      return { ...distinction, nom: "1 étoile" } as Distinction;
    } else if (score >= 695 && score < 700) {
      return { ...distinction, nom: "2 étoiles" } as Distinction;
    } else if (score >= 700) {
      return { ...distinction, nom: "3 étoiles" } as Distinction;
    }
    return null;
  }
  getTAEDICLDistinction(
    resultat: Resultat,
    distinction: Distinction
  ): Distinction | null {
    const score = resultat.score;
    if (score >= 480 && score < 510) {
      return { ...distinction, nom: "Vert (Promo)" } as Distinction;
    } else if (score >= 510 && score < 535) {
      return { ...distinction, nom: "Blanc" } as Distinction;
    } else if (score >= 535 && score < 560) {
      return { ...distinction, nom: "Noir" } as Distinction;
    } else if (score >= 560 && score < 585) {
      return { ...distinction, nom: "Bleu" } as Distinction;
    } else if (score >= 585 && score < 605) {
      return { ...distinction, nom: "Rouge" } as Distinction;
    } else if (score >= 605 && score < 625) {
      return { ...distinction, nom: "Jaune" } as Distinction;
    } else if (score >= 625 && score < 645) {
      return { ...distinction, nom: "1 étoile" } as Distinction;
    } else if (score >= 645 && score < 660) {
      return { ...distinction, nom: "2 étoiles" } as Distinction;
    } else if (score >= 660) {
      return { ...distinction, nom: "3 étoiles" } as Distinction;
    }
    return null;
  }

  getTAEDNDistinction(
    resultat: Resultat,
    distinction: Distinction
  ): Distinction | null {
    if (resultat.arme === "CO") {
      return this.getTAEDNCODistinction(resultat, distinction);
    }
    return this.getTAEDNCLDistinction(resultat, distinction);
  }

  getTAEDNCODistinction(
    resultat: Resultat,
    distinction: Distinction
  ): Distinction | null {
    const score = resultat.score;
    if (score >= 550 && score < 600) {
      return { ...distinction, nom: "1 Archer (argent)" } as Distinction;
    } else if (score >= 600 && score < 640) {
      return { ...distinction, nom: "2 Archers (argent)" } as Distinction;
    } else if (score >= 640 && score < 670) {
      return { ...distinction, nom: "3 Archers (argent)" } as Distinction;
    } else if (score >= 670 && score < 690) {
      return { ...distinction, nom: "4 Archers (argent)" } as Distinction;
    } else if (score >= 690) {
      return { ...distinction, nom: "Archer d'or (argent)" } as Distinction;
    }
    return null;
  }
  getTAEDNCLDistinction(
    resultat: Resultat,
    distinction: Distinction
  ): Distinction | null {
    const score = resultat.score;
    if (score >= 500 && score < 550) {
      return { ...distinction, nom: "1 Archer (or)" } as Distinction;
    } else if (score >= 550 && score < 600) {
      return { ...distinction, nom: "2 Archers (or)" } as Distinction;
    } else if (score >= 600 && score < 640) {
      return { ...distinction, nom: "3 Archers (or)" } as Distinction;
    } else if (score >= 640 && score < 670) {
      return { ...distinction, nom: "4 Archers (or)" } as Distinction;
    } else if (score >= 670) {
      return { ...distinction, nom: "Archer d'or (or)" } as Distinction;
    }
    return null;
  }

  getTAEDistinctionTemplate(resultat: Resultat): Distinction | null {
    const distinction = {
      distance: Number.parseInt("" + resultat.distance),
    };
    switch (distinction.distance) {
      case 20:
        if (resultat.categorie === "U11") {
          return { ...distinction, discipline: "TAEDI" } as Distinction;
        }
        return { ...distinction, discipline: "TAEDN" } as Distinction;
      case 30:
        if (
          resultat.blason === "80" &&
          (resultat.categorie === "U11" || resultat.categorie === "U13")
        ) {
          return { ...distinction, discipline: "TAEDI" } as Distinction;
        }
        return { ...distinction, discipline: "TAEDN" } as Distinction;
      case 40:
        return { ...distinction, discipline: "TAEDI" } as Distinction;
      case 50:
        if (resultat.blason === "80" && resultat.arme === "CO") {
          return { ...distinction, discipline: "TAEDI" } as Distinction;
        }
        return { ...distinction, discipline: "TAEDN" } as Distinction;
      case 60:
      case 70:
        return { ...distinction, discipline: "TAEDI" } as Distinction;
      default:
        console.log(
          `Distance ${
            resultat.distance
          } not supported => type=${typeof resultat.distance}`
        );
        return null;
    }
  }

  getSalleDistinction(resultat: Resultat): Distinction | null {
    switch (resultat.arme) {
      case "CO":
        return this.getSalleCODistinction(resultat);
      default:
        return this.getSalleCLDistinction(resultat);
    }
  }
  getSalleCLDistinction(resultat: Resultat): Distinction | null {
    const score = resultat.score;
    let nomDistinction = null;
    if (score >= 455 && score < 480) {
      nomDistinction = "Vert (Promo)";
    } else if (score >= 480 && score < 500) {
      nomDistinction = "Blanc";
    } else if (score >= 500 && score < 515) {
      nomDistinction = "Noir";
    } else if (score >= 515 && score < 530) {
      nomDistinction = "Bleu";
    } else if (score >= 530 && score < 545) {
      nomDistinction = "Rouge";
    }
    if (score >= 545 && score < 555) {
      nomDistinction = "Jaune";
    } else if (resultat.blason === "40") {
      if (score >= 555 && score < 565) {
        nomDistinction = "1 étoile";
      } else if (score >= 565 && score < 575) {
        nomDistinction = "2 étoiles";
      } else if (score >= 575) {
        nomDistinction = "3 étoiles";
      }
    }
    return {
      nom: nomDistinction,
      distance: resultat.distance,
      discipline: "Salle",
    } as Distinction;
  }

  getSalleCODistinction(resultat: Resultat): Distinction | null {
    const score = resultat.score;
    let nomDistinction = null;

    // same as getSalleCLDistinctionName but with CO score limits
    if (score >= 540 && score < 550) {
      nomDistinction = "Vert (Promo)";
    } else if (score >= 550 && score < 555) {
      nomDistinction = "Blanc";
    } else if (score >= 555 && score < 560) {
      nomDistinction = "Noir";
    } else if (score >= 560 && score < 565) {
      nomDistinction = "Bleu";
    } else if (score >= 565 && score < 570) {
      nomDistinction = "Rouge";
    } else if (score >= 570 && score < 575) {
      nomDistinction = "Jaune";
    } else {
      if (resultat.blason === "40") {
        if (score >= 575 && score < 580) {
          nomDistinction = "1 étoile";
        } else if (score >= 580 && score < 585) {
          nomDistinction = "2 étoiles";
        } else if (score >= 585) {
          nomDistinction = "3 étoiles";
        }
      }
    }
    return {
      nom: nomDistinction,
      distance: resultat.distance,
      discipline: "Salle",
    } as Distinction;
  }
}

export const distinctionRules = new DistinctionRules();
