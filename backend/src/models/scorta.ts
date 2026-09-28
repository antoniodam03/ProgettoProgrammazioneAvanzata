import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { assegnazione, assegnazioneId } from './assegnazione';

export interface scortaAttributes {
  id: number;
  gruppo_sanguigno: 'A' | 'B' | '0' | 'AB';
  quantita: number;
  data_aggiornamento?: Date;
}

export type scortaPk = "id";
export type scortaId = scorta[scortaPk];
export type scortaOptionalAttributes = "id" | "quantita" | "data_aggiornamento";
export type scortaCreationAttributes = Optional<scortaAttributes, scortaOptionalAttributes>;

export class scorta extends Model<scortaAttributes, scortaCreationAttributes> implements scortaAttributes {
  id!: number;
  gruppo_sanguigno!: 'A' | 'B' | '0' | 'AB';
  quantita!: number;
  data_aggiornamento?: Date;

  // scorta hasMany assegnazione via id_scorta
  assegnaziones!: assegnazione[];
  getAssegnaziones!: Sequelize.HasManyGetAssociationsMixin<assegnazione>;
  setAssegnaziones!: Sequelize.HasManySetAssociationsMixin<assegnazione, assegnazioneId>;
  addAssegnazione!: Sequelize.HasManyAddAssociationMixin<assegnazione, assegnazioneId>;
  addAssegnaziones!: Sequelize.HasManyAddAssociationsMixin<assegnazione, assegnazioneId>;
  createAssegnazione!: Sequelize.HasManyCreateAssociationMixin<assegnazione>;
  removeAssegnazione!: Sequelize.HasManyRemoveAssociationMixin<assegnazione, assegnazioneId>;
  removeAssegnaziones!: Sequelize.HasManyRemoveAssociationsMixin<assegnazione, assegnazioneId>;
  hasAssegnazione!: Sequelize.HasManyHasAssociationMixin<assegnazione, assegnazioneId>;
  hasAssegnaziones!: Sequelize.HasManyHasAssociationsMixin<assegnazione, assegnazioneId>;
  countAssegnaziones!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof scorta {
    return scorta.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    gruppo_sanguigno: {
      type: DataTypes.ENUM('A','B','0','AB'),
      allowNull: false,
      unique: "gruppo_sanguigno"
    },
    quantita: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    data_aggiornamento: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'scorta',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "gruppo_sanguigno",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "gruppo_sanguigno" },
        ]
      },
    ]
  });
  }
}
