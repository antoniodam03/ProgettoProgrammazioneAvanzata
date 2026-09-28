import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { assegnazione, assegnazioneId } from './assegnazione';
import type { paziente, pazienteId } from './paziente';
import type { utente, utenteId } from './utente';

export interface richiestaAttributes {
  id: number;
  id_paziente: number;
  quantita: number;
  priorita: 'normale' | 'urgente';
  stato: 'in_attesa' | 'soddisfatta' | 'non_soddisfatta';
  id_utente: number;
  data_richiesta?: Date;
}

export type richiestaPk = "id";
export type richiestaId = richiesta[richiestaPk];
export type richiestaOptionalAttributes = "id" | "quantita" | "priorita" | "stato" | "data_richiesta";
export type richiestaCreationAttributes = Optional<richiestaAttributes, richiestaOptionalAttributes>;

export class richiesta extends Model<richiestaAttributes, richiestaCreationAttributes> implements richiestaAttributes {
  id!: number;
  id_paziente!: number;
  quantita!: number;
  priorita!: 'normale' | 'urgente';
  stato!: 'in_attesa' | 'soddisfatta' | 'non_soddisfatta';
  id_utente!: number;
  data_richiesta?: Date;

  // richiesta belongsTo paziente via id_paziente
  id_paziente_paziente!: paziente;
  getId_paziente_paziente!: Sequelize.BelongsToGetAssociationMixin<paziente>;
  setId_paziente_paziente!: Sequelize.BelongsToSetAssociationMixin<paziente, pazienteId>;
  createId_paziente_paziente!: Sequelize.BelongsToCreateAssociationMixin<paziente>;
  // richiesta hasMany assegnazione via id_richiesta
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
  // richiesta belongsTo utente via id_utente
  id_utente_utente!: utente;
  getId_utente_utente!: Sequelize.BelongsToGetAssociationMixin<utente>;
  setId_utente_utente!: Sequelize.BelongsToSetAssociationMixin<utente, utenteId>;
  createId_utente_utente!: Sequelize.BelongsToCreateAssociationMixin<utente>;

  static initModel(sequelize: Sequelize.Sequelize): typeof richiesta {
    return richiesta.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id_paziente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'paziente',
        key: 'id'
      }
    },
    quantita: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    priorita: {
      type: DataTypes.ENUM('normale','urgente'),
      allowNull: false,
      defaultValue: "normale"
    },
    stato: {
      type: DataTypes.ENUM('in_attesa','soddisfatta','non_soddisfatta'),
      allowNull: false,
      defaultValue: "in_attesa"
    },
    id_utente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'utente',
        key: 'id'
      }
    },
    data_richiesta: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'richiesta',
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
        name: "id_paziente",
        using: "BTREE",
        fields: [
          { name: "id_paziente" },
        ]
      },
      {
        name: "id_utente",
        using: "BTREE",
        fields: [
          { name: "id_utente" },
        ]
      },
    ]
  });
  }
}
