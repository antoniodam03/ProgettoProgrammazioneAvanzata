import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { richiesta, richiestaId } from './richiesta';

export interface pazienteAttributes {
  id: number;
  codice_paziente: string;
  nome: string;
  cognome: string;
  data_nascita?: string;
  gruppo_sanguigno: 'A' | 'B' | '0' | 'AB';
  stato?: 'ricoverato' | 'dimesso';
  data_registrazione?: Date;
}

export type pazientePk = "id";
export type pazienteId = paziente[pazientePk];
export type pazienteOptionalAttributes = "id" | "data_nascita" | "stato" | "data_registrazione";
export type pazienteCreationAttributes = Optional<pazienteAttributes, pazienteOptionalAttributes>;

export class paziente extends Model<pazienteAttributes, pazienteCreationAttributes> implements pazienteAttributes {
  id!: number;
  codice_paziente!: string;
  nome!: string;
  cognome!: string;
  data_nascita?: string;
  gruppo_sanguigno!: 'A' | 'B' | '0' | 'AB';
  stato!: 'ricoverato' | 'dimesso';
  data_registrazione?: Date;

  // paziente hasMany richiesta via id_paziente
  richiesta!: richiesta[];
  getRichiesta!: Sequelize.HasManyGetAssociationsMixin<richiesta>;
  setRichiesta!: Sequelize.HasManySetAssociationsMixin<richiesta, richiestaId>;
  addRichiestum!: Sequelize.HasManyAddAssociationMixin<richiesta, richiestaId>;
  addRichiesta!: Sequelize.HasManyAddAssociationsMixin<richiesta, richiestaId>;
  createRichiestum!: Sequelize.HasManyCreateAssociationMixin<richiesta>;
  removeRichiestum!: Sequelize.HasManyRemoveAssociationMixin<richiesta, richiestaId>;
  removeRichiesta!: Sequelize.HasManyRemoveAssociationsMixin<richiesta, richiestaId>;
  hasRichiestum!: Sequelize.HasManyHasAssociationMixin<richiesta, richiestaId>;
  hasRichiesta!: Sequelize.HasManyHasAssociationsMixin<richiesta, richiestaId>;
  countRichiesta!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof paziente {
    return paziente.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    codice_paziente: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "codice_paziente"
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cognome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    data_nascita: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gruppo_sanguigno: {
      type: DataTypes.ENUM('A','B','0','AB'),
      allowNull: false
    },
    stato: {
      type: DataTypes.ENUM('ricoverato','dimesso'),
      allowNull: false,
      defaultValue: "ricoverato"
    },
    data_registrazione: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'paziente',
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
        name: "codice_paziente",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "codice_paziente" },
        ]
      },
    ]
  });
  }
}