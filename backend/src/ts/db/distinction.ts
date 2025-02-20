import sequelize from "./connect";

import { Table, Column, Model, HasMany, DataType } from "sequelize-typescript";
import { Resultat } from "./resultat";

@Table({
  tableName: "distinction",
  underscored: true,
  timestamps: false,
})
export class Distinction extends Model {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  id?: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  archerId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nom!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  statut!: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  resultatId!: number;
}
