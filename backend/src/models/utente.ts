import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { richiesta, richiestaId } from './richiesta';

export interface utenteAttributes {
  id: number;
  nome: string;
  cognome: string;
  username: string;
  email: string;
  password_hash: string;
  ruolo: 'admin' | 'operatore';
  data_creazione?: Date;
}

export type utentePk = "id";
export type utenteId = utente[utentePk];
export type utenteOptionalAttributes = "id" | "ruolo" | "data_creazione";
export type utenteCreationAttributes = Optional<utenteAttributes, utenteOptionalAttributes>;

export class utente extends Model<utenteAttributes, utenteCreationAttributes> implements utenteAttributes {
  id!: number;
  nome!: string;
  cognome!: string;
  username!: string;
  email!: string;
  password_hash!: string;
  ruolo!: 'admin' | 'operatore';
  data_creazione?: Date;

  // utente hasMany richiesta via id_utente
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

  static initModel(sequelize: Sequelize.Sequelize): typeof utente {
    return utente.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cognome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "username"
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: "email"
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ruolo: {
      type: DataTypes.ENUM('admin','operatore'),
      allowNull: false,
      defaultValue: "operatore"
    },
    data_creazione: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'utente',
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
        name: "username",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "username" },
        ]
      },
      {
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
  }
}
