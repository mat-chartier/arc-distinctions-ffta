import { Sequelize } from "sequelize-typescript";
import { Archer } from "./archer";
import { Distinction } from "./distinction";
import { Resultat } from "./resultat";
import { ArcDistinctionsConfig } from "../config";

const dbconnection = new Sequelize(
  ArcDistinctionsConfig.dbConnectionUrl,
  {
    models: [Archer, Resultat, Distinction],
  }
);

Archer.hasMany(Distinction, { foreignKey: "archerId"});
Distinction.belongsTo(Archer);

Archer.hasMany(Distinction, { foreignKey: "archerId"});
Distinction.belongsTo(Archer);

Resultat.hasOne(Distinction, {foreignKey: "resultatId"});
Distinction.belongsTo(Resultat);

export default dbconnection;
