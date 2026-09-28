import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { richiesta, richiestaId } from './richiesta';
import type { scorta, scortaId } from './scorta';

export interface assegnazioneAttributes {
  id: number;
  id_richiesta: number;
  id_scorta: number;
  quantita_assegnata: number;
  data_calcolo?: Date;
}

export type assegnazionePk = "id";
export type assegnazioneId = assegnazione[assegnazionePk];
export type assegnazioneOptionalAttributes = "id" | "data_calcolo";
export type assegnazioneCreationAttributes = Optional<assegnazioneAttributes, assegnazioneOptionalAttributes>;

export class assegnazione extends Model<assegnazioneAttributes, assegnazioneCreationAttributes> implements assegnazioneAttributes {
  id!: number;
  id_richiesta!: number;
  id_scorta!: number;
  quantita_assegnata!: number;
  data_calcolo?: Date;

  // assegnazione belongsTo richiesta via id_richiesta
  id_richiesta_richiestum!: richiesta;
  getId_richiesta_richiestum!: Sequelize.BelongsToGetAssociationMixin<richiesta>;
  setId_richiesta_richiestum!: Sequelize.BelongsToSetAssociationMixin<richiesta, richiestaId>;
  createId_richiesta_richiestum!: Sequelize.BelongsToCreateAssociationMixin<richiesta>;
  // assegnazione belongsTo scorta via id_scorta
  id_scorta_scortum!: scorta;
  getId_scorta_scortum!: Sequelize.BelongsToGetAssociationMixin<scorta>;
  setId_scorta_scortum!: Sequelize.BelongsToSetAssociationMixin<scorta, scortaId>;
  createId_scorta_scortum!: Sequelize.BelongsToCreateAssociationMixin<scorta>;

  static initModel(sequelize: Sequelize.Sequelize): typeof assegnazione {
    return assegnazione.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_richiesta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'richiesta',
        key: 'id'
      }
    },
    id_scorta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'scorta',
        key: 'id'
      }
    },
    quantita_assegnata: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    data_calcolo: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'assegnazione',
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
        name: "id_richiesta",
        using: "BTREE",
        fields: [
          { name: "id_richiesta" },
        ]
      },
      {
        name: "id_scorta",
        using: "BTREE",
        fields: [
          { name: "id_scorta" },
        ]
      },
    ]
  });
  }
}
