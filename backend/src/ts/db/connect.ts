import { Sequelize } from "sequelize-typescript";
import { Archer } from "./archer";
import { Distinction } from "./distinction";
import { Resultat } from "./resultat";
const dbconnection = new Sequelize(
  "postgres://arcdistinctions:arcdistinctions@localhost:5432/arcdistinctions",
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
