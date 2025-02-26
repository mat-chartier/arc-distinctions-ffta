import sequelize from "./connect";

import { Table, Column, Model, HasMany, DataType } from "sequelize-typescript";

@Table({
  tableName: "archer",
  underscored: true,
  timestamps: false,
})
export class Archer extends Model {
  @Column({
    type: DataType.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  })
  id?: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  noLicence!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nom!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  prenom!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  role!: string;
}
