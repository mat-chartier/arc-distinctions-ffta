import { QueryTypes } from "sequelize";
import dbconnection from "./connect";
import { Distinction } from "./distinction";
import { Resultat } from "./resultat";
import { Archer } from "./archer";
class DistinctionRepo {
  async updateStatus(id: number, statut: string) {
    return await Distinction.update({ statut }, { where: { id } });
  }
  async getAllWithResultat(): Promise<Distinction[]> {
    return await Distinction.findAll({
      include: [Archer, Resultat],
    });
  }

  async populateFromResultat(saison: number) {
    return await dbconnection.query(
      `
        INSERT INTO arcdistinctions.distinction(archer_id, nom, resultat_id, statut)
        SELECT archer_id, distinction, 
              (
                  SELECT r2.id
                  FROM arcdistinctions.resultat r2
                  WHERE
                      r2.archer_id=r.archer_id
                      and r2.arme=r.arme
                      and r2.categorie=r2.categorie
                      and r2.blason=r.blason
                      and r2.saison = r.saison
                      and r2.score=maxscore limit 1
                ) as resultat_id,
              'A commander'
        FROM
        (
            SELECT archer_id, arme, categorie, distance, blason,saison,
                CASE WHEN (arme='CL' or arme='BB') then
                    CASE WHEN max(score) >= 575 then '3 etoiles'
                          WHEN max(score) between 565 and 574 then '2 etoiles'
                          WHEN max(score) between 555 and 564 then '1 etoile'
                          WHEN max(score) between 545 and 555 then 'Jaune'
                          WHEN max(score) between 530 and 544 then 'Rouge'
                          WHEN max(score) between 515 and 529 then 'Bleu'
                          WHEN max(score) between 500 and 514 then 'Noir'
                          WHEN max(score) between 480 and 499 then 'Blanc'
                          WHEN max(score) between 455 and 479 then 'Vert (Promo)'
                    ELSE null
                    END
                ELSE
                    CASE WHEN max(score) >= 585 then '3 etoiles'
                          WHEN max(score) between 580 and 584 then '2 etoiles'
                          WHEN max(score) between 575 and 579 then '1 etoile'
                          WHEN max(score) between 570 and 574 then 'Jaune'
                          WHEN max(score) between 565 and 569 then 'Rouge'
                          WHEN max(score) between 560 and 564 then 'Bleu'
                          WHEN max(score) between 555 and 559 then 'Noir'
                          WHEN max(score) between 550 and 554 then 'Blanc'
                          WHEN max(score) between 540 and 549 then 'Vert (Promo)'
                    ELSE null
                    END
                END as distinction,
                max(score) as maxscore
            FROM arcdistinctions.resultat
            WHERE distance=18
              AND saison = :saison
            GROUP BY archer_id, arme, categorie, distance, blason,saison
          ) as r
        WHERE distinction is not null
      `,
      { replacements: { saison }, type: QueryTypes.UPDATE }
    );
  }
}

export const distinctionRepo = new DistinctionRepo();
