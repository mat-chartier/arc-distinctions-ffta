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

  async getToOrder(): Promise<Distinction[]> {
    return await Distinction.findAll({
      where: { statut: "A commander" },
      include: [Resultat],
    });
  }

  async populateFromResultat(saison: number) {
    return await dbconnection.query(
      `
        INSERT INTO arcdistinctions.distinction(archer_id, resultat_id, statut, nom)
        select q.archer_id, q.resultat_id, 'A commander', distinction
        from (
            select id as resultat_id, archer_id as archer_id, score as max_score, rank() OVER (PARTITION by archer_id order by score desc, id asc), 
            CASE WHEN (arme='CL' or arme='BB') then
                CASE WHEN score >= 575 and blason = '40' then '3 etoiles'
                    WHEN score between 565 and 574 and blason = '40' then '2 etoiles'
                    WHEN score between 555 and 564 and blason = '40' then '1 etoile'
                    WHEN score between 545 and 555 then 'Jaune'
                    WHEN score between 530 and 544 then 'Rouge'
                    WHEN score between 515 and 529 then 'Bleu'
                    WHEN score between 500 and 514 then 'Noir'
                    WHEN score between 480 and 499 then 'Blanc'
                    WHEN score between 455 and 479 then 'Vert (Promo)'
                ELSE null
                END
            ELSE
                CASE WHEN score >= 585 then '3 etoiles'
                    WHEN score between 580 and 584 then '2 etoiles'
                    WHEN score between 575 and 579 then '1 etoile'
                    WHEN score between 570 and 574 then 'Jaune'
                    WHEN score between 565 and 569 then 'Rouge'
                    WHEN score between 560 and 564 then 'Bleu'
                    WHEN score between 555 and 559 then 'Noir'
                    WHEN score between 550 and 554 then 'Blanc'
                    WHEN score between 540 and 549 then 'Vert (Promo)'
                ELSE null
                END
            END as distinction 
            from arcdistinctions.resultat r
            where 
                ((distance=18 AND (blason = '40' or blason = '60')) or (distance=25 AND blason = '60')) and 
                saison = :saison
        ) q
        where 
            q.rank = 1 and 
            distinction is not null and 
            not exists (select 1 from arcdistinctions.distinction d2 join arcdistinctions.resultat r2 on r2.id = d2.resultat_id where d2.resultat_id <> q.resultat_id and d2.archer_id = q.archer_id and (d2.nom = q.distinction or q.max_score < r2.score))
      `,
      { replacements: { saison }, type: QueryTypes.UPDATE }
    );
  }
}

export const distinctionRepo = new DistinctionRepo();
