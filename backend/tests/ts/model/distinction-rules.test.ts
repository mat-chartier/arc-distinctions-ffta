import { distinctionRules } from "../../../src/ts/model/distinction-rules";

describe.each([
    [455, 479, "Vert (Promo)"],
    [480, 499, "Blanc"],
    [500, 514, "Noir"],
    [515, 529, "Bleu"],
    [530, 544, "Rouge"],
    [545, 554, "Jaune"],
    [555, 564, "1 etoile"],
    [565, 574, "2 etoiles"],
    [575, 600, "3 etoiles"],
])('DistinctionRules.getSalleCLDistinctionName', (lowBound, highBound, distinctionName) => {
    test('should return the correct name for a CL score on a 40cm target face', () => {
        expect(distinctionRules.getSalleCLDistinctionName({score: lowBound, blason: "40" })).toBe(distinctionName);
        expect(distinctionRules.getSalleCLDistinctionName({score: highBound, blason: "40" })).toBe(distinctionName);
    });
});

describe.each([
    [455, 479, "Vert (Promo)"],
    [480, 499, "Blanc"],
    [500, 514, "Noir"],
    [515, 529, "Bleu"],
    [530, 544, "Rouge"],
    [545, 554, "Jaune"],
    [555, 564, "N/A"],
    [565, 574, "N/A"],
    [575, 600, "N/A"],
])('DistinctionRules.getSalleCLDistinctionName', (lowBound, highBound, distinctionName) => {
    test('should return the correct name for a CL score on a 60cm target face', () => {
        expect(distinctionRules.getSalleCLDistinctionName({score: lowBound, blason: "60" })).toBe(distinctionName);
        expect(distinctionRules.getSalleCLDistinctionName({score: highBound, blason: "60" })).toBe(distinctionName);
    });
});


describe.each([
    [540, 549, "Vert (Promo)"],
    [550, 554, "Blanc"],
    [555, 559, "Noir"],
    [560, 564, "Bleu"],
    [565, 569, "Rouge"],
    [570, 574, "Jaune"],
    [575, 579, "1 etoile"],
    [580, 584, "2 etoiles"],
    [585, 600, "3 etoiles"],
])('DistinctionRules.getSalleCODistinctionName', (lowBound, highBound, distinctionName) => {
    test(`${lowBound} should return ${distinctionName} for a CO score on a 40cm target face`, () => {
        expect(distinctionRules.getSalleCODistinctionName({score: lowBound, blason: "40" })).toBe(distinctionName);
    });
    test(`${highBound} should return ${distinctionName} for a CO score on a 40cm target face`, () => {
        expect(distinctionRules.getSalleCODistinctionName({score: highBound, blason: "40" })).toBe(distinctionName);
    });
});

describe.each([
    [540, 549, "Vert (Promo)"],
    [550, 554, "Blanc"],
    [555, 559, "Noir"],
    [560, 564, "Bleu"],
    [565, 569, "Rouge"],
    [570, 574, "Jaune"],
    [575, 579, "N/A"],
    [580, 584, "N/A"],
    [585, 600, "N/A"],
])('DistinctionRules.getSalleCODistinctionName', (lowBound, highBound, distinctionName) => {
    test(`${lowBound} should return ${distinctionName} for a CO score on a 60cm target face`, () => {
        expect(distinctionRules.getSalleCODistinctionName({score: lowBound, blason: "60" })).toBe(distinctionName);
    });
    test(`${highBound} should return ${distinctionName} for a CO score on a 60cm target face`, () => {
        expect(distinctionRules.getSalleCODistinctionName({score: highBound, blason: "60" })).toBe(distinctionName);
    });
});

describe('DistinctionRules.getSameOrBetter', () => {
    test('should return the correct distinctions for a given name, discipline and arme', () => {
        expect(distinctionRules.getSameOrBetter("Vert (Promo)", "S")).toEqual(["Vert (Promo)", "Blanc", "Noir", "Bleu", "Rouge", "Jaune", "1 etoile", "2 etoiles", "3 etoiles"]);
        expect(distinctionRules.getSameOrBetter("Blanc", "S")).toEqual(["Blanc", "Noir", "Bleu", "Rouge", "Jaune", "1 etoile", "2 etoiles", "3 etoiles"]);
        expect(distinctionRules.getSameOrBetter("Noir", "S")).toEqual(["Noir", "Bleu", "Rouge", "Jaune", "1 etoile", "2 etoiles", "3 etoiles"]);
        expect(distinctionRules.getSameOrBetter("Bleu", "S")).toEqual(["Bleu", "Rouge", "Jaune", "1 etoile", "2 etoiles", "3 etoiles"]);
        expect(distinctionRules.getSameOrBetter("Rouge", "S")).toEqual(["Rouge", "Jaune", "1 etoile", "2 etoiles", "3 etoiles"]);
        expect(distinctionRules.getSameOrBetter("Jaune", "S")).toEqual(["Jaune", "1 etoile", "2 etoiles", "3 etoiles"]);
        expect(distinctionRules.getSameOrBetter("1 etoile", "S")).toEqual(["1 etoile", "2 etoiles", "3 etoiles"]);
        expect(distinctionRules.getSameOrBetter("2 etoiles", "S")).toEqual(["2 etoiles", "3 etoiles"]);
        expect(distinctionRules.getSameOrBetter("3 etoiles", "S")).toEqual(["3 etoiles"]);
    });
});
