import sequelize from "./connect";

import { Table, Column, Model, HasMany, DataType } from "sequelize-typescript";

interface ResultatAttributes {
  archerId: number;
  arme: string;
  categorie: string;
  score: number;
  distance: number;
  blason: string;
}

@Table({
  tableName: "resultat",
  underscored: true,
  timestamps: false,
})
export class Resultat extends Model implements ResultatAttributes {
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
  arme!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  categorie!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  score!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  distance!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  blason!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  dateDebutConcours!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  numDepart!: number;
}

@Table({
  underscored: true,
  timestamps: false,
})
export class BestResultat extends Model implements ResultatAttributes {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
  })
  archerId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  arme!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  categorie!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  score!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  distance!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  blason!: string;
}
