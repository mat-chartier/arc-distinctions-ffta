import { Resultat } from "../../../src/ts/db/resultat";
import { distinctionRules } from "../../../src/ts/model/distinction-rules";

describe.each([
  [455, 479, "Vert (Promo)"],
  [480, 499, "Blanc"],
  [500, 514, "Noir"],
  [515, 529, "Bleu"],
  [530, 544, "Rouge"],
  [545, 554, "Jaune"],
  [555, 564, "1 étoile"],
  [565, 574, "2 étoiles"],
  [575, 600, "3 étoiles"],
])(
  "DistinctionRules.getSalleCLDistinction",
  (lowBound, highBound, distinctionName) => {
    test("should return the correct name for a CL score on a 40cm target face", () => {
      expect(
        distinctionRules.getSalleCLDistinction({
          score: lowBound,
          blason: "40",
        } as Resultat)?.nom
      ).toBe(distinctionName);
      expect(
        distinctionRules.getSalleCLDistinction({
          score: highBound,
          blason: "40",
        } as Resultat)?.nom
      ).toBe(distinctionName);
    });
  }
);

describe.each([
  [455, 479, "Vert (Promo)"],
  [480, 499, "Blanc"],
  [500, 514, "Noir"],
  [515, 529, "Bleu"],
  [530, 544, "Rouge"],
  [545, 554, "Jaune"],
  [555, 564, null],
  [565, 574, null],
  [575, 600, null],
])(
  "DistinctionRules.getSalleCLDistinction",
  (lowBound, highBound, distinctionName) => {
    test("should return the correct name for a CL score on a 60cm target face", () => {
      expect(
        distinctionRules.getSalleCLDistinction({
          score: lowBound,
          blason: "60",
        } as Resultat)?.nom
      ).toBe(distinctionName);
      expect(
        distinctionRules.getSalleCLDistinction({
          score: highBound,
          blason: "60",
        } as Resultat)?.nom
      ).toBe(distinctionName);
    });
  }
);

describe.each([
  [540, 549, "Vert (Promo)"],
  [550, 554, "Blanc"],
  [555, 559, "Noir"],
  [560, 564, "Bleu"],
  [565, 569, "Rouge"],
  [570, 574, "Jaune"],
  [575, 579, "1 étoile"],
  [580, 584, "2 étoiles"],
  [585, 600, "3 étoiles"],
])(
  "DistinctionRules.getSalleCODistinction",
  (lowBound, highBound, distinctionName) => {
    test(`${lowBound} should return ${distinctionName} for a CO score on a 40cm target face`, () => {
      expect(
        distinctionRules.getSalleCODistinction({
          score: lowBound,
          blason: "40",
        } as Resultat)?.nom
      ).toBe(distinctionName);
    });
    test(`${highBound} should return ${distinctionName} for a CO score on a 40cm target face`, () => {
      expect(
        distinctionRules.getSalleCODistinction({
          score: highBound,
          blason: "40",
        } as Resultat)?.nom
      ).toBe(distinctionName);
    });
  }
);

describe.each([
  [540, 549, "Vert (Promo)"],
  [550, 554, "Blanc"],
  [555, 559, "Noir"],
  [560, 564, "Bleu"],
  [565, 569, "Rouge"],
  [570, 574, "Jaune"],
  [575, 579, null],
  [580, 584, null],
  [585, 600, null],
])(
  "DistinctionRules.getSalleCODistinction",
  (lowBound, highBound, distinctionName) => {
    test(`${lowBound} should return ${distinctionName} for a CO score on a 60cm target face`, () => {
      expect(
        distinctionRules.getSalleCODistinction({
          score: lowBound,
          blason: "60",
        } as Resultat)?.nom
      ).toBe(distinctionName);
    });
    test(`${highBound} should return ${distinctionName} for a CO score on a 60cm target face`, () => {
      expect(
        distinctionRules.getSalleCODistinction({
          score: highBound,
          blason: "60",
        } as Resultat)?.nom
      ).toBe(distinctionName);
    });
  }
);

describe("DistinctionRules.getSameOrBetter", () => {
  test("should return the correct distinctions for a given name, discipline and arme", () => {
    expect(distinctionRules.getSameOrBetter("Vert (Promo)", "S")).toEqual([
      "Vert (Promo)",
      "Blanc",
      "Noir",
      "Bleu",
      "Rouge",
      "Jaune",
      "1 étoile",
      "2 étoiles",
      "3 étoiles",
    ]);
    expect(distinctionRules.getSameOrBetter("Blanc", "S")).toEqual([
      "Blanc",
      "Noir",
      "Bleu",
      "Rouge",
      "Jaune",
      "1 étoile",
      "2 étoiles",
      "3 étoiles",
    ]);
    expect(distinctionRules.getSameOrBetter("Noir", "S")).toEqual([
      "Noir",
      "Bleu",
      "Rouge",
      "Jaune",
      "1 étoile",
      "2 étoiles",
      "3 étoiles",
    ]);
    expect(distinctionRules.getSameOrBetter("Bleu", "S")).toEqual([
      "Bleu",
      "Rouge",
      "Jaune",
      "1 étoile",
      "2 étoiles",
      "3 étoiles",
    ]);
    expect(distinctionRules.getSameOrBetter("Rouge", "S")).toEqual([
      "Rouge",
      "Jaune",
      "1 étoile",
      "2 étoiles",
      "3 étoiles",
    ]);
    expect(distinctionRules.getSameOrBetter("Jaune", "S")).toEqual([
      "Jaune",
      "1 étoile",
      "2 étoiles",
      "3 étoiles",
    ]);
    expect(distinctionRules.getSameOrBetter("1 étoile", "S")).toEqual([
      "1 étoile",
      "2 étoiles",
      "3 étoiles",
    ]);
    expect(distinctionRules.getSameOrBetter("2 étoiles", "S")).toEqual([
      "2 étoiles",
      "3 étoiles",
    ]);
    expect(distinctionRules.getSameOrBetter("3 étoiles", "S")).toEqual([
      "3 étoiles",
    ]);
  });
});

// tests for getTAEDistinctionTemplate
describe.each([
  [20, "U11", "80", "", "TAEDI"],
  [20, "U13", "80", "", "TAEDN"],
  [30, "U11", "80", "", "TAEDI"],
  [30, "U13", "80", "", "TAEDI"],
  [30, "U15", "80", "", "TAEDN"],
  [40, "", "80", "", "TAEDI"],
  [50, "", "80", "CO", "TAEDI"],
  [50, "", "122", "CL", "TAEDN"],
  [60, "", "122", "", "TAEDI"],
  [70, "", "122", "CL", "TAEDI"],
])(
  "getTAEDistinctionTemplate",
  (distance, categorie, blason, arme, expectedDiscipline) => {
    test(`should return the correct discipline for distance ${distance}, categorie ${categorie}, blason ${blason}, arme ${arme}`, () => {
      const result = distinctionRules.getTAEDistinctionTemplate({
        distance,
        categorie,
        blason,
        arme,
      } as Resultat);
      expect(result.discipline).toBe(expectedDiscipline);
    });
  }
);
