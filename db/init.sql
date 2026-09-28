-- ============================================================
-- Gestione Trasfusioni — Schema completo
-- ============================================================
-- Riepilogo entità:
--   utente : account (admin gestisce le scorte, operatore registra pazienti e richieste)
--   scorta : sacche disponibili per gruppo sanguigno (quantita = residuo attuale, decrementata a ogni assegnazione confermata)
--   paziente : anagrafica paziente, con il suo gruppo sanguigno noto
--   richiesta : richiesta di trasfusione di un paziente
--                    
--   assegnazione : esito del calcolo del flusso: quale scorta copre quale richiesta, e per quanto
-- ============================================================


-- ------------------------------------------------------------
-- 1. UTENTE
-- ------------------------------------------------------------
CREATE TABLE utente (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(100) NOT NULL,
    cognome         VARCHAR(100) NOT NULL,
    username        VARCHAR(100) NOT NULL UNIQUE,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    ruolo           ENUM('admin', 'operatore') NOT NULL DEFAULT 'operatore',
    data_creazione  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- 2. SCORTA
-- Una riga per gruppo sanguigno. `quantita` è il residuo attuale
-- (scende ad ogni assegnazione confermata, sale quando l'admin
-- registra una nuova sacca di sangue in arrivo).
-- ------------------------------------------------------------
CREATE TABLE scorta (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    gruppo_sanguigno    ENUM('A', 'B', '0', 'AB') NOT NULL UNIQUE,
    quantita            INT NOT NULL DEFAULT 0,
    data_aggiornamento  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- 3. PAZIENTE
-- Anagrafica paziente. Il gruppo sanguigno qui è quello
-- anagrafico noto: le richieste lo ricavano sempre da qui.
-- ------------------------------------------------------------
CREATE TABLE paziente (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    codice_paziente      VARCHAR(50) NOT NULL UNIQUE,
    nome                 VARCHAR(100) NOT NULL,
    cognome              VARCHAR(100) NOT NULL,
    data_nascita         DATE,
    gruppo_sanguigno     ENUM('A', 'B', '0', 'AB') NOT NULL,
    stato                ENUM('ricoverato', 'dimesso') NOT NULL DEFAULT 'ricoverato',
    data_registrazione   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- 4. RICHIESTA
-- Richieste di trasfusione dei pazienti
-- ------------------------------------------------------------
CREATE TABLE richiesta (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    id_paziente      INT NOT NULL,
    quantita         INT NOT NULL DEFAULT 1,
    priorita         ENUM('normale', 'urgente') NOT NULL DEFAULT 'normale',
    stato            ENUM('in_attesa', 'soddisfatta', 'non_soddisfatta') NOT NULL DEFAULT 'in_attesa',
    id_utente        INT NOT NULL,
    data_richiesta   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_paziente) REFERENCES paziente(id) ON DELETE CASCADE,
    FOREIGN KEY (id_utente) REFERENCES utente(id) ON DELETE RESTRICT
);


-- ------------------------------------------------------------
-- 5. ASSEGNAZIONE
-- Esito del calcolo del flusso massimo: quante sacche di una
-- certa scorta sono state assegnate a una certa richiesta.
-- ------------------------------------------------------------
CREATE TABLE assegnazione (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    id_richiesta        INT NOT NULL,
    id_scorta           INT NOT NULL,
    quantita_assegnata  INT NOT NULL,
    data_calcolo        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_richiesta) REFERENCES richiesta(id) ON DELETE CASCADE,
    FOREIGN KEY (id_scorta) REFERENCES scorta(id) ON DELETE CASCADE
);


-- ============================================================
-- Seeders
-- ============================================================

-- Utenti: un admin + due operatori
INSERT INTO utente (nome, cognome, username, email, password_hash, ruolo) VALUES
('Admin',   'Sistema',  'admin',    'admin@ospedale.it',          '$2b$10$WsFgLhdk96NGgB1k.8Ga/OKWPiUf3m673kwpdyrQFS0o0RUeq2H1K',  'admin'),
('Giulia',  'Romano',   'giulia.r', 'giulia.romano@ospedale.it',  '$2b$10$WsFgLhdk96NGgB1k.8Ga/OKWPiUf3m673kwpdyrQFS0o0RUeq2H1K', 'operatore'),
('Marco',   'Ferri',    'marco.f',  'marco.ferri@ospedale.it',    '$2b$10$WsFgLhdk96NGgB1k.8Ga/OKWPiUf3m673kwpdyrQFS0o0RUeq2H1K', 'operatore');

-- Scorta iniziale, una riga per gruppo sanguigno
INSERT INTO scorta (gruppo_sanguigno, quantita) VALUES
('A',  10),
('B',  6),
('0',  15),
('AB', 4);

-- Pazienti di esempio
INSERT INTO paziente (codice_paziente, nome, cognome, data_nascita, gruppo_sanguigno, stato) VALUES
('PZ-1', 'Marco',  'Rossi',   '1985-03-14', 'A',  'ricoverato'),
('PZ-2', 'Giulia', 'Bianchi', '1990-06-21', 'B',  'ricoverato'),
('PZ-3', 'Luca',   'Verdi',   '1972-11-02', '0',  'ricoverato');

-- Richieste di esempio (alcune urgenti, alcune normali; tutte in attesa)
INSERT INTO richiesta (id_paziente, quantita, priorita, stato, id_utente) VALUES
(1, 3, 'urgente', 'in_attesa', 2),
(2, 2, 'normale', 'in_attesa', 2),
(3, 4, 'urgente', 'in_attesa', 3);
