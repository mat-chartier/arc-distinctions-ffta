import { PostgresDialect } from "@sequelize/postgres";
import { Sequelize } from "sequelize-typescript";
import { Archer } from "./archer";
import { BestResultat, Resultat } from "./resultat";
import { Distinction } from "./distinction";
const dbconnection = new Sequelize(
  "postgres://arcdistinctions:arcdistinctions@localhost:5432/arcdistinctions",
  {
    models: [Archer, Resultat,BestResultat,Distinction],
  }
);

export default dbconnection;
