interface Resultat {
  discipline: string;
  score: number;
  distance: number;
  blason: string;
  arme: string;
  categorie: string;
  piquet?: string;
}

interface Distinction {
  nom: string;
  distance: number;
  discipline: string;
  piquet?: string;
}

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
  DISTINCTIONS_CAMPAGNE_MARCASSIN = [
    "Vert sur fond blanc ", 
    "Argent sur fond vert", 
    "Or sur fond blanc", 
    "Or sur fond noir "
  ];
  DISTINCTIONS_CAMPAGNE_ECUREUIL = [
    "Vert sur fond blanc",
    "Argent sur fond vert",
    "Or sur fond blanc",
    "Or sur fond noir",
    "Or sur fond bleu",
    "Or sur fond rouge",
  ];
  // Tir 3D — Brocard (adultes) : 6 niveaux, mêmes libellés que l'Écureuil campagne.
  DISTINCTIONS_3D_BROCARD = [
    "Vert sur fond blanc",
    "Argent sur fond vert",
    "Or sur fond blanc",
    "Or sur fond noir",
    "Or sur fond bleu",
    "Or sur fond rouge",
  ];
  // Tir 3D — Lynx (U13/U15/U18, Arc Nu) : 3 niveaux sur fond orange.
  DISTINCTIONS_3D_LYNX = [
    "Noir sur fond orange",
    "Argent sur fond orange",
    "Or sur fond orange",
  ];
  // Tir Nature — Sanglier (adultes) : 6 niveaux, mêmes libellés que l'Écureuil campagne.
  DISTINCTIONS_NATURE_SANGLIER = [
    "Vert sur fond blanc",
    "Argent sur fond vert",
    "Or sur fond blanc",
    "Or sur fond noir",
    "Or sur fond bleu",
    "Or sur fond rouge",
  ];
  // Tir Nature — Marcassin (U13/U15/U18, Arc Nu) : 3 niveaux sur fond orange.
  DISTINCTIONS_NATURE_MARCASSIN = [
    "Noir sur fond orange",
    "Argent sur fond orange",
    "Or sur fond orange",
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
    } else if (discipline === "CAMPAGNE_MARCASSIN") {
      return this.DISTINCTIONS_CAMPAGNE_MARCASSIN.slice(
        this.DISTINCTIONS_CAMPAGNE_MARCASSIN.findIndex((d) => d === nom)
      );
    } else if (discipline === "CAMPAGNE_ECUREUIL") {
      return this.DISTINCTIONS_CAMPAGNE_ECUREUIL.slice(
        this.DISTINCTIONS_CAMPAGNE_ECUREUIL.findIndex((d) => d === nom)
      );
    } else if (discipline === "3D_BROCARD") {
      return this.DISTINCTIONS_3D_BROCARD.slice(
        this.DISTINCTIONS_3D_BROCARD.findIndex((d) => d === nom)
      );
    } else if (discipline === "3D_LYNX") {
      return this.DISTINCTIONS_3D_LYNX.slice(
        this.DISTINCTIONS_3D_LYNX.findIndex((d) => d === nom)
      );
    } else if (discipline === "NATURE_SANGLIER") {
      return this.DISTINCTIONS_NATURE_SANGLIER.slice(
        this.DISTINCTIONS_NATURE_SANGLIER.findIndex((d) => d === nom)
      );
    } else if (discipline === "NATURE_MARCASSIN") {
      return this.DISTINCTIONS_NATURE_MARCASSIN.slice(
        this.DISTINCTIONS_NATURE_MARCASSIN.findIndex((d) => d === nom)
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
  // Tir Nature : parcours de 21 cibles tirées 1 fois, seuils de score par
  // catégorie/arme. Aiguillage validé (docs/reglement-nature-extrait.md) :
  //  - Arc Nu (CL/BB) + jeunes {U13,U15,U18} → MARCASSIN
  //  - sinon → SANGLIER, colonne selon l'arme.
  // Mapping code export → colonne : AD=Droit, AC=Chasse, CL/BB=Arc Nu,
  // CO=Arc à Poulies Nu, TL=Arc Libre. (En Nature, le code CL de l'export = arc nu.)
  SANGLIER_SEUILS: Record<string, number[]> = {
    AD: [125, 240, 350, 425, 500, 540], // Arc Droit
    AC: [175, 290, 400, 475, 550, 590], // Arc Chasse
    CL: [200, 315, 425, 500, 575, 615], // Arc Nu (classique en Nature)
    BB: [200, 315, 425, 500, 575, 615], // Arc Nu (bare bow)
    CO: [250, 340, 450, 525, 600, 640], // Arc à Poulies Nu
    TL: [300, 415, 525, 600, 675, 715], // Arc Libre (tir libre)
  };

  getNatureDistinction(resultat: Resultat): Distinction | null {
    const { arme, categorie, score } = resultat;
    const dist = { discipline: "NATURE", distance: 0 };
    const JEUNE_CAT = ["U13", "U15", "U18"];

    // Marcassin : Arc Nu (CL/BB), jeunes uniquement
    if ((arme === "CL" || arme === "BB") && JEUNE_CAT.includes(categorie)) {
      return this.getCampagneDistinctionByThresholds(
        score, this.DISTINCTIONS_NATURE_MARCASSIN, [165, 275, 390],
        { ...dist, discipline: "NATURE_MARCASSIN" }
      );
    }

    // Sanglier : colonne selon l'arme
    const seuils = this.SANGLIER_SEUILS[arme];
    if (seuils) {
      return this.getCampagneDistinctionByThresholds(
        score, this.DISTINCTIONS_NATURE_SANGLIER, seuils,
        { ...dist, discipline: "NATURE_SANGLIER" }
      );
    }
    return null;
  }
  // Tir 3D : parcours de 1×24 cibles, seuils de score par catégorie/arme.
  // Aiguillage validé (docs/reglement-3d-extrait.md) :
  //  - Arc Nu (CL/BB) + jeunes {U13,U15,U18} → LYNX
  //  - sinon → BROCARD, colonne selon l'arme.
  // Mapping code export → colonne : AD=Droit, AC=Chasse, CL/BB=Arc Nu,
  // CO=Arc à Poulies Nu, TL=Arc Libre. (En 3D, le code CL de l'export = arc nu.)
  BROCARD_SEUILS: Record<string, number[]> = {
    AD: [70, 125, 185, 235, 270, 335], // Arc Droit
    AC: [85, 140, 195, 260, 300, 360], // Arc Chasse
    CL: [110, 160, 220, 270, 315, 375], // Arc Nu (classique en 3D)
    BB: [110, 160, 220, 270, 315, 375], // Arc Nu (bare bow)
    CO: [140, 210, 280, 330, 385, 435], // Arc à Poulies Nu
    TL: [185, 260, 330, 380, 435, 460], // Arc Libre (tir libre)
  };

  get3DDistinction(resultat: Resultat): Distinction | null {
    const { arme, categorie, score } = resultat;
    const dist = { discipline: "3D", distance: 0 };
    const JEUNE_CAT = ["U13", "U15", "U18"];

    // Lynx : Arc Nu (CL/BB), jeunes uniquement
    if ((arme === "CL" || arme === "BB") && JEUNE_CAT.includes(categorie)) {
      return this.getCampagneDistinctionByThresholds(
        score, this.DISTINCTIONS_3D_LYNX, [150, 175, 210],
        { ...dist, discipline: "3D_LYNX" }
      );
    }

    // Brocard : colonne selon l'arme
    const seuils = this.BROCARD_SEUILS[arme];
    if (seuils) {
      return this.getCampagneDistinctionByThresholds(
        score, this.DISTINCTIONS_3D_BROCARD, seuils,
        { ...dist, discipline: "3D_BROCARD" }
      );
    }
    return null;
  }
  getCampagneDistinction(resultat: Resultat): Distinction | null {
    const { arme, categorie, score } = resultat;
    const dist = { discipline: "CAMPAGNE", distance: 0 };

    const MARCASSIN_CAT = ["U13", "U15", "U18"];
    const ADULT_CAT = ["U21", "S1", "S2", "S3"];

    const piquet = resultat.piquet;

    // Marcassins : CL uniquement, U13/U15/U18
    if (arme === "CL" && MARCASSIN_CAT.includes(categorie)) {
      return this.getCampagneDistinctionByThresholds(score, this.DISTINCTIONS_CAMPAGNE_MARCASSIN, [160, 210, 270, 320], { ...dist, discipline: "CAMPAGNE_MARCASSIN", piquet });
    }
    // Écureuils CL : U21+
    if (arme === "CL" && ADULT_CAT.includes(categorie)) {
      return this.getCampagneDistinctionByThresholds(score, this.DISTINCTIONS_CAMPAGNE_ECUREUIL, [200, 240, 260, 300, 340, 380], { ...dist, discipline: "CAMPAGNE_ECUREUIL", piquet });
    }
    // Écureuils CO : U18+
    if (arme === "CO" && [...MARCASSIN_CAT.slice(-1), ...ADULT_CAT].includes(categorie)) {
      return this.getCampagneDistinctionByThresholds(score, this.DISTINCTIONS_CAMPAGNE_ECUREUIL, [220, 260, 280, 320, 360, 400], { ...dist, discipline: "CAMPAGNE_ECUREUIL", piquet });
    }
    // Écureuils BB U18
    if (arme === "BB" && categorie === "U18") {
      return this.getCampagneDistinctionByThresholds(score, this.DISTINCTIONS_CAMPAGNE_ECUREUIL, [160, 200, 220, 260, 300, 340], { ...dist, discipline: "CAMPAGNE_ECUREUIL", piquet });
    }
    // Écureuils BB adultes : U21+
    if (arme === "BB" && ADULT_CAT.includes(categorie)) {
      return this.getCampagneDistinctionByThresholds(score, this.DISTINCTIONS_CAMPAGNE_ECUREUIL, [180, 220, 240, 280, 320, 360], { ...dist, discipline: "CAMPAGNE_ECUREUIL", piquet });
    }
    return null;
  }

  private getCampagneDistinctionByThresholds(score: number, noms: string[], seuils: number[], dist: any): Distinction | null {
    for (let i = seuils.length - 1; i >= 0; i--) {
      if (score >= seuils[i]) {
        return { ...dist, nom: noms[i] };
      }
    }
    return null;
  }
  getTAEDistinction(resultat: Resultat): Distinction | null {
    const d = this.getTAEDistinctionTemplate(resultat);
    if (d === null) {
      return null;
    }

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
      return { ...distinction, nom: "Noir" } as Distinction;  ;
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
    if (nomDistinction === null) {
      return null; // no distinction found
    }
    return {
      nom: nomDistinction,
      distance: resultat.distance,
      discipline: "Salle",
    } as Distinction;
  }

  getSalleCODistinction(result : Resultat): Distinction | null {
    let nomDistinction = null;
    const score = result.score;

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
      if (result.blason === "40") {
        if (score >= 575 && score < 580) {
          nomDistinction = "1 étoile";
        } else if (score >= 580 && score < 585) {
          nomDistinction = "2 étoiles";
        } else if (score >= 585) {
          nomDistinction = "3 étoiles";
        }
      }
    }
    if (nomDistinction === null) {
      return null; // no distinction found
    }
    return {
      nom: nomDistinction,
      distance: result.distance,
      discipline: "Salle",
    } as Distinction;
  }
}

export const distinctionRules = new DistinctionRules();
