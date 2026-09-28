import type { Sequelize } from "sequelize";
import { assegnazione as _assegnazione } from "./assegnazione";
import type { assegnazioneAttributes, assegnazioneCreationAttributes } from "./assegnazione";
import { paziente as _paziente } from "./paziente";
import type { pazienteAttributes, pazienteCreationAttributes } from "./paziente";
import { richiesta as _richiesta } from "./richiesta";
import type { richiestaAttributes, richiestaCreationAttributes } from "./richiesta";
import { scorta as _scorta } from "./scorta";
import type { scortaAttributes, scortaCreationAttributes } from "./scorta";
import { utente as _utente } from "./utente";
import type { utenteAttributes, utenteCreationAttributes } from "./utente";

export {
  _assegnazione as assegnazione,
  _paziente as paziente,
  _richiesta as richiesta,
  _scorta as scorta,
  _utente as utente,
};

export type {
  assegnazioneAttributes,
  assegnazioneCreationAttributes,
  pazienteAttributes,
  pazienteCreationAttributes,
  richiestaAttributes,
  richiestaCreationAttributes,
  scortaAttributes,
  scortaCreationAttributes,
  utenteAttributes,
  utenteCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const assegnazione = _assegnazione.initModel(sequelize);
  const paziente = _paziente.initModel(sequelize);
  const richiesta = _richiesta.initModel(sequelize);
  const scorta = _scorta.initModel(sequelize);
  const utente = _utente.initModel(sequelize);

  richiesta.belongsTo(paziente, { as: "id_paziente_paziente", foreignKey: "id_paziente"});
  paziente.hasMany(richiesta, { as: "richiesta", foreignKey: "id_paziente"});
  assegnazione.belongsTo(richiesta, { as: "id_richiesta_richiestum", foreignKey: "id_richiesta"});
  richiesta.hasMany(assegnazione, { as: "assegnaziones", foreignKey: "id_richiesta"});
  assegnazione.belongsTo(scorta, { as: "id_scorta_scortum", foreignKey: "id_scorta"});
  scorta.hasMany(assegnazione, { as: "assegnaziones", foreignKey: "id_scorta"});
  richiesta.belongsTo(utente, { as: "id_utente_utente", foreignKey: "id_utente"});
  utente.hasMany(richiesta, { as: "richiesta", foreignKey: "id_utente"});

  return {
    assegnazione: assegnazione,
    paziente: paziente,
    richiesta: richiesta,
    scorta: scorta,
    utente: utente,
  };
}
