# Progetto Programmazione Avanzata A.A. 25/26 - Gestione Trasfusioni

<div align="center">
    <h2>🩸 Sistema di Gestione Trasfusioni Ospedaliere</h2>
</div>

<p align="left">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white" alt="Sequelize"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest"/>
  <img src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white" alt="Postman"/>
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  <img src="https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="VS Code"/>
</p>

# Indice

- [📌 Obiettivo](#-obiettivo)
- [🏗️ Progettazione](#️-progettazione)
  - [🖥️ Architettura dei servizi](#️-architettura-dei-servizi)
  - [📊 Diagramma dei casi d'uso](#-diagramma-dei-casi-duso)
  - [🗂️ Diagramma E-R e Schema del Database](#️-diagramma-e-r-e-schema-del-database)
  - [Schema Relazionale](#schema-relazionale-traduzione-logica)
- [🧱 Pattern utilizzati](#-pattern-utilizzati)
- [🔄 Diagrammi delle sequenze](#-diagrammi-delle-sequenze)
- [🔌 API Routes](#-api-routes)
- [🔌 Esempi rotte](#-esempi-rotte)
- [⚙️ Set-up](#️-set-up)
- [🧪 Test](#-test)
  - [Test unitari con Jest](#test-unitari-con-jest)
  - [Test delle rotte con Postman](#test-delle-rotte-con-postman)
- [🛠️ Strumenti Utilizzati](#️-strumenti-utilizzati)
- [👥 Autori](#-autori)

---

## 📌 Obiettivo

Il presente progetto ha come obiettivo quello di sviluppare un sistema di gestione delle trasfusioni di sangue all'interno di una struttura ospedaliera, che permetta di monitorare le scorte ematiche, la registrazione dei pazienti e l'**assegnazione automatica, sicura e matematicamente ottimizzata** delle sacche di sangue. 

Il sistema consente nello specifico:
* **Gestione degli Utenti e dei Ruoli**: Distinzione tra due tipologie di utenti (`admin` e `operatore`), con permessi differenziati gestiti tramite autenticazione basata su JWT e chiavi RSA (RS256).
* **Gestione dei Pazienti e Richieste**: Registrazione pazienti con gruppo sanguigno e gestione delle richieste di trasfusione (con priorità "urgente" o "normale").
* **Gestione delle Scorte Ematiche**: Monitoraggio della disponibilità delle sacche di sangue.
* **Assegnazione Algoritmica**: Assegnazione automatica del sangue ai pazienti tramite algoritmo di Teoria dei Grafi, rispettando le priorità cliniche (urgenze) e le regole di compatibilità sanguigna, preservando il sangue universale (Gruppo 0) dove possibile.

L’intera applicazione backend è containerizzata tramite **Docker** e sviluppata in **TypeScript** ed **Express.js**.

---

## 🏗️ Progettazione

### 🖥️ Architettura dei servizi

```mermaid
graph TD;
    user[Utente / Postman]

    subgraph Rete-Backend
        subgraph Container-Backend
            backend[Backend-Trasfusioni<br>backend:3000]
        end
        subgraph Container-DB
            db[(MySQL<br>db:3306)]
        end
        subgraph Container-Redis
            redis[(Redis 7<br>redis:6379)]
        end
    end

    %% Usando frecce più lunghe (--->) il testo non si accavalla
    user ---> |API REST Calls| backend
    backend ---> |Sequelize ORM| db
    backend ---> |Sessioni: blacklist e versioni dei token| redis

    style backend fill:#9ff,stroke:#333,stroke-width:4px,color:#000
    style db fill:#ff9,stroke:#333,stroke-width:4px,color:#000
    style redis fill:#f99,stroke:#333,stroke-width:4px,color:#000
    style user fill:#acf,stroke:#333,stroke-width:4px,color:#000
```

L'ambiente backend prevede l'orchestrazione tramite `docker-compose` di tre container: il backend Node.js, il database MySQL e il database in memory Redis, usato per gestire le sessioni (logout e revoca dei token). La logica applicativa è racchiusa interamente nel container Node.js, che implementa un'architettura **monolitica modulare**, isolando nettamente i livelli di Routing, Middleware (autenticazione, autorizzazione, validazione), Controller, Repository/Service e DAO.

L'architettura del progetto si riflette sulle directory, che sono organizzate come segue: 

```text
Programmazione_Avanzata_trasfusioni/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── dao/
│   │   ├── events/
│   │   ├── graph/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── db/
│   └── init.sql
│
├── docs/
│   └── diagrammi
│
├── postman/
│   └── collection API
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

### 📊 Diagramma dei casi d'uso

Il diagramma dei casi d'uso (UML Use Case Diagram) illustra le interazioni degli attori principali (**Admin** e **Operatore**) e dell'attore generale (**Utente**) con i diversi casi d'uso racchiusi all'interno del confine del sistema trasfusionale.

<div align="center">
  <img src="docs/Diagramma_casi_uso1.drawio.png" alt="Diagramma dei Casi d'Uso UML" width="100%">
</div>

#### Attori e Funzionalità Principali

1. **Utente non autenticato**
   - **Esegue Login**: Consente a chiunque di autenticarsi fornendo le credenziali per ottenere un token JWT e accedere alle risorse protette in base al proprio ruolo.

2. **Utente Autenticato**
   - Funge da base per la gestione dell'autorizzazione basata sui ruoli.

3. **Admin**
   - **Gestione Profili Utenti**:
     - *Crea utente*: Registrazione di nuove credenziali e associazione di un ruolo specifico (`admin` o `operatore`).
     - *Ottieni utenti* & *Ottieni specifico utente*: Lettura globale o puntuale dei profili registrati.
     - *Aggiorna ruolo*: Modifica dei privilegi di accesso.
     - *Elimina utente*: Rimozione di un profilo.
   - **Gestione Scorte Ematiche**:
     - *Visualizza scorte* & *Visualizza specifica scorta per gruppo sanguigno*: Consultazione delle sacche disponibili in tempo reale.
     - *Aggiorna quantità scorte*: Aggiorna le scorte di magazzino. Questa azione **include** automaticamente il ricalcolo del flusso (`Calcola Min Cost Max Flow`).

4. **Operatore**
   - **Gestione Richieste**:
     - *Visualizza richieste trasfusioni* e *Visualizza specifica richiesta*: Monitoraggio dello stato delle richieste sanitarie, con i dati del paziente associato.
     - *Inserimento nuova richiesta*: Registrazione di un nuovo bisogno trasfusionale. Questa azione **include** automaticamente il ricalcolo del flusso (`Calcola Min Cost Max Flow`).
     - *Annulla richiesta*: Cancellazione di una richiesta ancora `in_attesa`, cioè che non ha ancora ricevuto sacche. Una richiesta già servita, anche solo in parte, non può essere annullata.
   - **Gestione Pazienti**:
     - *Visualizza pazienti* e *Visualizza specifico paziente*: Ricerca e visualizzazione delle schede cliniche.
     - *Visualizza pazienti ricoverati*: Elenco dei soli pazienti attualmente ricoverati, esclusi i dimessi.
     - *Registra paziente*: Inserimento di una nuova scheda anagrafica e del gruppo sanguigno associato.
     - *Aggiorna anagrafica paziente*: Modifica dei dettagli del paziente.
     - *Dimetti paziente*: Dimissione del paziente, gestita tramite soft-delete logico (lo stato passa a `dimesso`) per non perdere lo storico. La dimissione è consentita solo se il paziente non ha richieste pendenti (`in_attesa` o `non_soddisfatta`).
   - **Gestione Assegnazioni**:
     - *Visualizza assegnazioni* e *Visualizza specifica assegnazione*: Consultazione delle sacche assegnate alle richieste dal calcolo del flusso, con la scorta di provenienza e la quantità.

5. **Relazioni di Inclusione Interna (`<<include>>`)**
   - **Calcola Min Cost Max Flow**: Invocato automaticamente da *Aggiorna quantità scorte* e *Inserimento nuova richiesta*. Rappresenta il motore algoritmico del sistema che ricalcola il flusso massimo a costo minimo della rete trasfusionale.
   - **Assegnazione sacche**: Incluso da *Calcola Min Cost Max Flow*. Rappresenta l'associazione fisica delle sacche disponibili ai pazienti.

### 🗂️ Diagramma E-R e Schema del Database

Il RDBMS scelto per la persistenza dei dati è **MySQL**. Di seguito vengono presentati il diagramma concettuale del database e, nella sezione successiva, la sua traduzione logica (schema relazionale).

#### Diagramma Entità-Relazione (ER)
Mostra le entità del dominio, le relazioni logiche (con le molteplicità associate) e gli attributi, focalizzandosi sui requisiti informativi del sistema:

<div align="center">
  <img src="docs/er_diagram.jpg" alt="Diagramma E-R di Chen" width="100%">
</div>

---

## Schema Relazionale (Traduzione Logica)

Di seguito è riportata la traduzione logica delle tabelle del database (le chiavi primarie sono **sottolineate**, le chiavi esterne sono *in corsivo*):

- **UTENTE** (<u>id</u>, nome, cognome, username, email, password_hash, ruolo, data_creazione)

- **PAZIENTE** (<u>id</u>, codice_paziente, nome, cognome, data_nascita, gruppo_sanguigno, stato, data_registrazione)

- **RICHIESTA** (<u>id</u>, quantita, priorita, stato, data_richiesta, *id_utente*, *id_paziente*)
  - *id_utente* chiave esterna che referenzia UTENTE(id)
  - *id_paziente* chiave esterna che referenzia PAZIENTE(id)

- **SCORTA** (<u>id</u>, gruppo_sanguigno, quantita, data_aggiornamento)

- **ASSEGNAZIONE** (<u>id</u>, quantita_assegnata, data_calcolo, *id_richiesta*, *id_scorta*)
  - *id_richiesta* chiave esterna che referenzia RICHIESTA(id)
  - *id_scorta* chiave esterna che referenzia SCORTA(id)

Oltre ai controlli applicativi, lo schema definisce dei vincoli `CHECK` come ulteriore garanzia di integrità a livello di database: `SCORTA.quantita >= 0`, `RICHIESTA.quantita > 0` e `ASSEGNAZIONE.quantita_assegnata > 0`.

---

## 🧱 Pattern utilizzati

### Model-View-Controller (MVC)

Il pattern architetturale scelto per la struttura del sistema è il Model-View-Controller (MVC), il quale permette di separare la presentazione e l'interazione dai dati del sistema, facilitando la manutenzione e l'evoluzione del codice. L'utilizzo di questo pattern prevede la separazione dell'applicazione in tre componenti logiche che interagiscono tra loro:

- **Model**: rappresenta i dati e la logica dell'applicazione. È responsabile della gestione dello stato e dell'interazione con il database. Nel caso del sistema sviluppato, i Model (`backend/src/models/`: `utente`, `paziente`, `richiesta`, `scorta`, `assegnazione`) sono definiti utilizzando Sequelize, un framework per l'Object-Relational Mapping (ORM) per interagire con il database.
- **Controller**: gestisce l'interazione dell'utente e le operazioni CRUD (Create, Read, Update, Delete). Interagisce con i livelli sottostanti per eseguire le operazioni richieste e restituire le risposte appropriate. Nel sistema sviluppato, i Controller (`backend/src/controllers/`) si limitano a leggere i dati della richiesta HTTP, invocare il livello sottostante e restituire la risposta. La regola adottata è la seguente:
  - se l'operazione contiene logica (controllo di esistenza con `NotFound`, regole di business, transazioni), il Controller invoca il **Repository** o il **Service**;
  - se l'operazione è una semplice lettura senza logica (ad esempio l'elenco completo di un'entità), il Controller invoca direttamente il **DAO**.

  Gli errori lanciati dai livelli sottostanti vengono inoltrati al middleware di gestione degli errori tramite `next(error)`.
- **View**: rappresenta i dati recuperati dal modello, gestendo la logica di presentazione. Nel caso specifico del sistema sviluppato, che risulta essere un backend puro, la componente logica della View non è stata propriamente sviluppata. Tuttavia, Postman viene utilizzato per fornire una visualizzazione dei dati in formato JSON, a seconda della richiesta inoltrata.

### Data Access Object (DAO)

Per astrarre la logica di accesso ai dati, indipendentemente dal tipo di meccanismo di memorizzazione utilizzato, è stato scelto il pattern Data Access Object (DAO). Esso fornisce un'interfaccia astratta comune per eseguire operazioni CRUD e altre operazioni di accesso ai dati, isolando il codice di accesso ai dati dalla logica di business.

Il DAO presenta diverse componenti: l'interfaccia di definizione dei metodi di accesso ai dati che devono essere implementati (`daoInterface.ts`), l'implementazione concreta dei metodi definiti dall'interfaccia DAO, che contiene il codice specifico di interazione con la base di dati, e le classi di entità, cioè i Model, che rappresentano i dati che vengono manipolati dal DAO. Queste ultime classi sono mappate alle tabelle del database.

L'utilità principale del pattern è rappresentata dal fatto che ad un singolo Model viene corrisposto un singolo DAO, garantendo l'accesso ai dati necessari, e, soprattutto, uno o più DAO possono essere richiamati da componenti superiori quali i Repository, per l'utilizzo combinato dell'accesso ai dati. In questo modo, non solo è garantita un'elevata riutilizzabilità del codice in diverse parti dell'applicazione, ma soprattutto viene implementata una forte modularità e separazione delle responsabilità da parte di tutte le componenti.

All'interno del progetto, i DAO (`backend/src/dao/`) di `utente`, `paziente` e `richiesta` implementano l'interfaccia CRUD completa (`DAO`), mentre quelli di `scorta` e `assegnazione` implementano solo l'interfaccia di lettura (`ReadDAO`), più i metodi effettivamente necessari: l'aggiornamento della quantità delle scorte e l'inserimento in blocco delle assegnazioni calcolate dal flusso. In questo modo nessuna classe è costretta a implementare metodi che non utilizza (principio di segregazione delle interfacce).

### Repository

Per avere una centralizzazione della logica di accesso ai dati e offrire un'interfaccia coerente per il resto dell'applicazione, è stato utilizzato il pattern Repository, il quale fornisce un'astrazione dell'accesso ai dati, nascondendo i dettagli di come i dati vengono effettivamente recuperati o memorizzati.

Centralizzando la logica di accesso ai dati, un Repository permette di trattare le entità come se fossero raccolte di memoria, fornendo metodi per aggiungere, rimuovere e recuperare oggetti. Al suo interno, il Repository (`backend/src/repositories/`: `richiestaRepository`, `scortaRepository`, `pazienteRepository`, `utenteRepository`, `assegnazioneRepository`) fornisce l'implementazione concreta dei metodi necessari, utilizzando i DAO come tecnica di persistenza per l'interazione con le classi di dati.

Mentre il DAO lavora ad un livello più basso, vicino al database, per eseguire operazioni CRUD, il Repository fornisce un livello di astrazione superiore, incapsulando la logica di accesso ai dati e utilizzando uno o più DAO per realizzare le operazioni di persistenza. Il vantaggio principale del Repository consiste proprio nella capacità di astrazione sopra il livello di persistenza, consentendo di cambiare facilmente l'implementazione senza influenzare il resto dell'applicazione.

Nel progetto i Repository hanno le seguenti responsabilità:
- **Controllo di esistenza**
- **Regole di business**
- **Coordinamento di più DAO in una transazione**
- **Traduzione degli errori**

### Service

Accanto ai Repository, legati a una singola entità, il progetto utilizza un livello **Service** (`backend/src/services/`) per i casi d'uso applicativi che coinvolgono più componenti e non corrispondono alla gestione dei dati di una singola entità:
- **`authService`**: gestisce il login. Recupera l'utente tramite `utenteDAO`, verifica la password con bcrypt e genera il token JWT firmato con RS256. In caso di credenziali errate lancia un errore `Unauthorized` con lo stesso messaggio, sia che l'email non esista sia che la password sia sbagliata. Gestisce inoltre, tramite Redis:
  - *logout*: inserisce l'hash SHA-256 del token nella blacklist su Redis, con la stessa scadenza del token;
  - *revoca dei token*: dopo un cambio di ruolo o l'eliminazione di un utente incrementa su Redis la sua versione, così che tutti i token già emessi per quell'utente vengano rifiutati.
- **`FlowService`**: esegue il ricalcolo delle assegnazioni tramite l'algoritmo Min-Cost Max-Flow, coordinando `scortaDAO`, `richiestaRepository`, `richiestaDAO` e `assegnazioneDAO` all'interno di un'unica transazione.

### Chain of Responsibility (COR)

Il pattern Chain of Responsibility (COR) è un design pattern comportamentale che permette di passare le richieste lungo catene di gestori, che sono rappresentati da oggetti che possono gestire la richiesta o passarla all'oggetto successivo della catena. L'utilizzo di questo pattern permette una gestione accurata delle richieste, senza l'effettiva conoscenza degli oggetti coinvolti da parte del mittente.

I middleware, in particolare, permettono la creazione della catena di responsabilità, poiché Express.js stesso fa un ampio uso di questo pattern. I middleware, infatti, sono funzioni che vengono eseguite in sequenza per gestire le richieste HTTP. Sfruttando il COR, sono state implementate le seguenti funzionalità dei middleware:

- **Middleware di autenticazione e autorizzazione** (`authMiddleware.ts`): verifica se l'utente è autenticato tramite JWT (firma e scadenza del token, poi su Redis che il token non sia stato invalidato con il logout o revocato per un cambio di ruolo o un'eliminazione dell'utente) e se il suo ruolo (`admin` o `operatore`) è autorizzato ad eseguire l'operazione richiesta. Se non lo è, restituisce una risposta d'errore; altrimenti, passa la richiesta al middleware successivo.
- **Middleware di validazione** (`middleware/validate/`): viene utilizzato per validare i dati di una richiesta, che possono essere passati come `param`, `query` o `body`.
- **Middleware di gestione degli errori** (`errorHandlerMiddleware.ts`): intercetta eventuali errori che si verificano nei middleware precedenti e restituisce una risposta d'errore appropriata, sfruttando un `errorHandler` personalizzato con il pattern Factory.

### Factory

Per la gestione personalizzata degli errori è stato scelto l'utilizzo del design pattern creazionale Factory, il quale permette di delegare la creazione di oggetti a una factory (fabbrica), che decide quale tipo di oggetto creare in base ai parametri forniti.

All'interno del sistema sviluppato, il pattern è stato utilizzato per la creazione di errori personalizzati attraverso l'`ErrorFactory` (`utils/errorFactory.ts`), che fornisce un metodo per creare istanze di errori `HttpError` con diversi tipi e messaggi, sfruttando anche l'utilizzo della libreria `http-status-codes` per la stampa dei codici di errore, incapsulando la logica di creazione degli errori in un'unica classe. In questo modo, risulta particolarmente facilitata la gestione e la possibile estensione degli errori, essendo l'intera logica localizzata in un unico punto.

### Singleton

Poiché diverse componenti dell'applicazione (Model, DAO, Repository) devono condividere la stessa connessione al database, è stato necessario l'utilizzo di un design pattern creazionale, chiamato Singleton, che garantisce la presenza di una classe con una sola istanza, la quale fornisce un punto di accesso globale ad essa. L'implementazione del pattern è stata eseguita proprio attraverso l'utilizzo del metodo `getInstance()` nella classe `Database` (`utils/database.ts`), che garantisce l'istanza di connessione Sequelize condivisa al database.

Per la gestione delle risorse condivise, come ad esempio la connessione al DB, questo pattern risulta particolarmente efficace. In questo modo, oltre a garantire una sola connessione condivisa tra le varie parti dell'applicazione, vengono evitati problemi di concorrenza e viene migliorata l'efficienza delle risorse.

Lo stesso pattern è applicato al client Redis: la classe `Redis` (`utils/redis.ts`) espone il metodo `getInstance()`, che crea un solo client condiviso da middleware e service. La connessione viene aperta una sola volta all'avvio, in `server.ts`, insieme a quella al database.

### Observer (Event-Driven con Debouncing)

L'aggiornamento del calcolo dei flussi non viene chiamato esplicitamente all'interno del flusso HTTP. Si è optato per il pattern comportamentale **Observer** (Publish/Subscribe), realizzato con l'`EventEmitter` nativo di Node.js: l'`EventBus` (`events/eventbus.ts`) riceve gli eventi emessi dai Controller, mentre il `flowListener` (`events/flowListener.ts`) è l'osservatore che, all'arrivo della notifica, avvia il ricalcolo tramite `FlowService`.
Quando un operatore inserisce una richiesta o un admin aggiorna le scorte, il Controller emette un evento asincrono e risponde immediatamente all'utente (`200 OK` per l'aggiornamento scorte, `201 Created` per la creazione di una nuova richiesta), delegando il ricalcolo a un processo in background.
- **Debouncing delle scorte**: se l'admin aggiorna rapidamente 4 gruppi sanguigni diversi, l'algoritmo non ricalcola il grafo 4 volte inutilmente, ma attende un *delay* configurabile (3 secondi di inattività) prima di far partire un singolo ricalcolo ottimizzato.
- **Richieste immediate**: la creazione di una richiesta ha delay 0 e avvia subito il ricalcolo. Se in quel momento è in attesa un timer delle scorte, questo viene annullato: il ricalcolo legge tutti i dati dal database, quindi comprende anche gli aggiornamenti delle scorte.
- **Serializzazione dei ricalcoli**: l'`EventBus` decide *quando* ricalcolare, mentre il `flowListener` garantisce che sia in esecuzione *un solo ricalcolo alla volta*. Se arrivano nuovi eventi mentre un ricalcolo è in corso, il `flowListener` ne esegue un altro subito dopo, così che nessuna modifica venga persa.
- **Eventi tipizzati**: l'`EventBus` dichiara gli eventi e i loro argomenti (`AGGIORNA_FLUSSO` con il tipo `richiesta` o `scorta`), così TypeScript segnala già in compilazione un evento emesso con un nome o un argomento sbagliato.
- **Nota sulla priorità**: la precedenza delle richieste urgenti sulle normali vale all'interno di ogni singolo ricalcolo. Poiché ogni nuova richiesta avvia subito un ricalcolo e le sacche già assegnate non vengono più rimesse nel calcolo, una richiesta normale arrivata prima può ricevere sacche che, arrivando in un momento successivo, una richiesta urgente non troverà più disponibili.

---

## 🔄 Diagrammi delle sequenze

## 1.5.3 Autenticazione (/auth)

### 1. Autenticazione (POST /auth/login)

Questo diagramma illustra il processo di autenticazione asimmetrica dell'utente. Il Controller delega l'intera logica all'`authService`, che verifica le credenziali tramite hash bcrypt, legge da Redis la versione attuale dei token dell'utente e genera il token JWT firmato con la chiave privata RSA (RS256), che contiene anche la versione e un identificativo casuale (`jti`) che rende ogni token unico. Se le credenziali non sono valide, il Service lancia un errore che il Controller inoltra al middleware di gestione degli errori.

```mermaid
sequenceDiagram
    actor U as Utente
    participant R as authRoutes
    participant V as validateLogin + validateRequestMiddleware
    participant C as AuthController
    participant S as authService
    participant D as utenteDAO
    participant DB as Database (Sequelize)
    participant PW as password.ts (bcrypt)
    participant RD as Redis
    participant JWT as jwt.ts
    participant EH as errorHandlerMiddleware

    U->>R: POST /auth/login { email, password }
    R->>V: esegue catena di validazione

    alt Email o password mancanti, non stringhe o email non valida
        V->>EH: next(BadRequest)
        EH-->>U: 400 Bad Request
    else Dati validi
        V->>C: next() → AuthController.login(req, res, next)
        C->>S: authService.login(email, password)

        S->>D: findByEmailWithPassword(email)
        D->>DB: utente.findOne({ where: { email } })
        DB-->>D: utente | null
        D-->>S: user

        alt Utente non trovato
            S-->>C: throw Unauthorized ("Credenziali non valide")
            C->>EH: next(error)
            EH-->>U: 401 Unauthorized
        else Utente trovato
            S->>PW: verifyPassword(password, user.password_hash)
            PW-->>S: true / false

            alt Password errata
                S-->>C: throw Unauthorized ("Credenziali non valide")
                C->>EH: next(error)
                EH-->>U: 401 Unauthorized
            else Password corretta
                S->>RD: GET versioneUtente:<id>
                RD-->>S: versione (0 se assente)
                S->>JWT: generateToken({ id, email, ruolo, versione, jti })
                JWT-->>S: token JWT (RS256, 1h)
                S-->>C: { token, ruolo }
                C-->>U: 200 OK { token, ruolo }
            end
        end
    end
```

### 2. Logout (POST /auth/logout)

Il logout invalida il token usato nella richiesta. La rotta passa da `authMiddleware`, che verifica il token e salva in `req` il token e i dati dell'utente; il Controller delega all'`authService`, che inserisce l'hash SHA-256 del token nella blacklist su Redis con la stessa scadenza del token, così che Redis lo rimuova da solo quando il token non sarebbe comunque più valido. Da quel momento ogni richiesta con quel token riceve `401`.

```mermaid
sequenceDiagram
    actor U as Utente (Admin o Operatore)
    participant R as authRoutes
    participant AUTH as authMiddleware
    participant RD as Redis
    participant C as AuthController
    participant S as authService
    participant EH as errorHandlerMiddleware

    U->>R: POST /auth/logout  (Header: Bearer token)
    R->>AUTH: authMiddleware(req, res, next)

    alt Token assente, scaduto o malformato
        AUTH->>EH: next(Unauthorized / TokenExpired / InvalidToken)
        EH-->>U: 401 / 400
    else Firma e scadenza valide
        AUTH->>RD: EXISTS blacklist:<hash del token> + GET versioneUtente:<id>
        alt Redis non raggiungibile
            AUTH->>EH: next(error)
            EH-->>U: 500 Internal Server Error
        else Token già in blacklist o versione superata
            AUTH->>EH: next(Unauthorized)
            EH-->>U: 401 Unauthorized
        else Token attivo
            AUTH->>C: next() → AuthController.logout (req.user, req.token)
            C->>S: authService.logout(token, exp)
            S->>RD: SET blacklist:<hash del token> "1" EXAT exp
            RD-->>S: OK
            S-->>C: void
            C-->>U: 200 OK { message: "Logout effettuato con successo" }
        end
    end
```

## 1.5.4 Gestione Scorte Ematiche (/scorte)

### 3. Visualizzazione Scorte (GET /scorte)

Questo diagramma mostra il recupero delle scorte ematiche. Trattandosi di una semplice lettura senza logica, il Controller invoca direttamente il DAO.

```mermaid
sequenceDiagram
    actor U as Utente (Admin)
    participant R as scortaRoutes
    participant AUTH as authMiddleware
    participant RD as Redis
    participant AUTHZ as authorize(admin)
    participant C as scortaController
    participant D as scortaDAO
    participant DB as Database (Sequelize)
    participant EH as errorHandlerMiddleware

    U->>R: GET /scorte  (Header: Bearer token)
    R->>AUTH: authMiddleware(req, res, next)

    alt Token assente o scaduto
        AUTH->>EH: next(Unauthorized / TokenExpired)
        EH-->>U: 401 Unauthorized
    else Token malformato
        AUTH->>EH: next(InvalidToken / JsonWebTokenError)
        EH-->>U: 400 Bad Request
    else Token valido
        AUTH->>AUTH: verifyToken(token) → req.user
        AUTH->>RD: EXISTS blacklist:<hash> + GET versioneUtente:<id>
        alt Redis non raggiungibile
            AUTH->>EH: next(error)
            EH-->>U: 500 Internal Server Error
        else Token revocato (logout) o versione superata (ruolo cambiato / utente eliminato)
            AUTH->>EH: next(Unauthorized)
            EH-->>U: 401 Unauthorized
        else Token attivo
            AUTH->>AUTHZ: next() → authorize(Ruolo.admin)

            alt Ruolo utente ≠ admin
                AUTHZ->>EH: next(Forbidden)
                EH-->>U: 403 Forbidden
            else Ruolo admin confermato
                AUTHZ->>C: next() → getAllScorte(req, res, next)

                C->>D: scortaDAO.getAll()
                D->>DB: scorta.findAll()

                alt Errore nell'accesso al DB
                    DB-->>D: errore Sequelize
                    D-->>C: propaga l'errore
                    C->>EH: next(error)
                    EH-->>U: 500 Internal Server Error
                else Successo
                    DB-->>D: [ { id, gruppo_sanguigno, quantita, ... }, ... ]
                    D-->>C: array di scorte
                    C-->>U: 200 OK  [ scorte ]
                end
            end
        end
    end
```

## 1.5.5 Gestione Richieste Trasfusionali (/richieste)

### 4. Visualizzazione Richieste (GET /richieste)

**Accesso**: Ruolo Operatore.

**Descrizione**: Questo diagramma ottiene tutte le richieste di trasfusione, con i dettagli del rispettivo paziente, supportando filtri opzionali via query string (`stato`, `priorita`, `gruppo_sanguigno`). Il Repository compone il risultato a partire da due DAO distinti, ciascuno sulla propria tabella: `pazienteDAO` fornisce i pazienti (filtrati per gruppo sanguigno, se richiesto) e `richiestaDAO` le richieste dei soli pazienti trovati, filtrate per stato e priorità. Il Repository ordina poi le richieste per priorità (prima le urgenti) e per data decrescente, e a ciascuna allega i dati del proprio paziente. Il DAO resta così limitato all'accesso ai dati di una singola tabella, senza join.

```mermaid
sequenceDiagram
    actor U as Utente (Operatore)
    participant R as richiestaRoutes
    participant AUTH as authMiddleware
    participant REDIS as Redis
    participant AUTHZ as authorize(operatore)
    participant V as validateGetRichieste
    participant C as richiestaController
    participant REPO as richiestaRepository
    participant PD as pazienteDAO
    participant RD as richiestaDAO
    participant DB as Database (Sequelize)
    participant EH as errorHandlerMiddleware

    U->>R: GET /richieste?stato=&priorita=&gruppo_sanguigno=  (Bearer token)
    R->>AUTH: authMiddleware(req, res, next)

    alt Token assente o scaduto
        AUTH->>EH: next(Unauthorized / TokenExpired)
        EH-->>U: 401 Unauthorized
    else Token malformato
        AUTH->>EH: next(InvalidToken / JsonWebTokenError)
        EH-->>U: 400 Bad Request
    else Token valido (firma e scadenza)
        AUTH->>REDIS: EXISTS blacklist:<hash> + GET versioneUtente:<id>
        alt Redis non raggiungibile
            AUTH->>EH: next(error)
            EH-->>U: 500 Internal Server Error
        else Token revocato (logout) o versione superata (ruolo cambiato / utente eliminato)
            AUTH->>EH: next(Unauthorized)
            EH-->>U: 401 Unauthorized
        else Token attivo
            AUTH->>AUTHZ: next() → authorize(Ruolo.operatore)

            alt Ruolo utente ≠ operatore
                AUTHZ->>EH: next(Forbidden)
                EH-->>U: 403 Forbidden
            else Ruolo operatore confermato
                AUTHZ->>V: next() → validateGetRichieste

                alt Query string non valida (stato/priorita/gruppo_sanguigno fuori enum)
                    V->>EH: next(BadRequest)
                    EH-->>U: 400 Bad Request
                else Query valida
                    V->>C: next() → getAllRichieste(req, res, next)

                    C->>REPO: getAllRichieste({ stato, priorita, gruppo_sanguigno })
                    REPO->>PD: getAll()
                    PD->>DB: paziente.findAll()
                    DB-->>PD: pazienti
                    PD-->>REPO: pazienti
                    REPO->>REPO: filtra per gruppo_sanguigno (se richiesto)

                    alt Nessun paziente corrisponde al filtro
                        REPO-->>C: []
                    else Pazienti trovati
                        REPO->>RD: getAll({ id_paziente IN pazienti, stato, priorita })
                        RD->>DB: richiesta.findAll({ where })
                        DB-->>RD: richieste
                        RD-->>REPO: richieste
                        REPO->>REPO: ordina per priorità (urgenti prima) e data DESC<br/>e allega a ogni richiesta il proprio paziente
                        REPO-->>C: array di richieste con paziente
                    end
                    C-->>U: 200 OK  [ richieste ]
                end
            end
        end
    end
```

---

## 1.5.6 Gestione Assegnazioni (/assegnazioni)

### 5. Visualizzazione Assegnazioni (GET /assegnazioni)

**Accesso**: Ruolo Operatore.

**Descrizione**: Mostra l'elenco delle assegnazioni matematiche effettuate in automatico dal risolutore di flusso. Trattandosi di una semplice lettura senza logica di business, il Controller invoca direttamente il DAO.

```mermaid
sequenceDiagram
    actor U as Utente (Operatore)
    participant R as assegnazioneRoutes
    participant AUTH as authMiddleware
    participant RD as Redis
    participant AUTHZ as authorize(operatore)
    participant C as assegnazioneController
    participant D as assegnazioneDAO
    participant DB as Database (Sequelize)
    participant EH as errorHandlerMiddleware

    U->>R: GET /assegnazioni  (Bearer token)
    R->>AUTH: authMiddleware(req, res, next)

    alt Token assente o scaduto
        AUTH->>EH: next(Unauthorized / TokenExpired)
        EH-->>U: 401 Unauthorized
    else Token malformato
        AUTH->>EH: next(InvalidToken / JsonWebTokenError)
        EH-->>U: 400 Bad Request
    else Token valido (firma e scadenza)
        AUTH->>RD: EXISTS blacklist:<hash> + GET versioneUtente:<id>
        alt Redis non raggiungibile
            AUTH->>EH: next(error)
            EH-->>U: 500 Internal Server Error
        else Token revocato (logout) o versione superata (ruolo cambiato / utente eliminato)
            AUTH->>EH: next(Unauthorized)
            EH-->>U: 401 Unauthorized
        else Token attivo
            AUTH->>AUTHZ: next() → authorize(Ruolo.operatore)

            alt Ruolo utente ≠ operatore
                AUTHZ->>EH: next(Forbidden)
                EH-->>U: 403 Forbidden
            else Ruolo operatore confermato
                AUTHZ->>C: next() → getAllAssegnazioni(req, res, next)

                C->>D: assegnazioneDAO.getAll()
                D->>DB: assegnazione.findAll()
                DB-->>D: [ { id, id_richiesta, id_scorta, quantita_assegnata, ... }, ... ]
                D-->>C: array di assegnazioni
                C-->>U: 200 OK  [ assegnazioni ]
            end
        end
    end
```

---

## 🔌 API Routes

Il sistema espone rotte protette (necessitano di header `Authorization: Bearer <token>`).


| Tipo   | Rotta                         | Autenticazione | Autorizzazione     | Descrizione                                    |
|--------|--------------------------------|:--------------:|----------------------|-------------------------------------------------|
| POST   | /auth/login                    |                 |                       | Login e generazione token JWT                   |
| POST   | /auth/logout                   | ✓               | Admin, Operatore      | Logout: invalida il token usato nella richiesta |
| GET    | /utenti                        | ✓               | Admin      | Elenco di tutti gli utenti                       |
| GET    | /utenti/:id                     | ✓               | Admin, Operatore      | Dettagli di un singolo utente                    |
| POST   | /utenti                        | ✓               | Admin                 | Crea un nuovo utente                             |
| PUT    | /utenti/:id/ruolo                | ✓               | Admin                 | Aggiorna il ruolo di un utente                   |
| DELETE | /utenti/:id                     | ✓               | Admin                 | Elimina un utente                                |
| GET    | /pazienti/ricoverati             | ✓               | Operatore             | Elenco dei pazienti attualmente ricoverati       |
| GET    | /pazienti                      | ✓               | Operatore             | Elenco di tutti i pazienti (storico incluso)     |
| GET    | /pazienti/:id                    | ✓               | Operatore             | Dettagli di un singolo paziente                  |
| POST   | /pazienti                      | ✓               | Operatore             | Registra un nuovo paziente                       |
| PUT    | /pazienti/:id                    | ✓               | Operatore             | Aggiorna i dati anagrafici di un paziente        |
| DELETE | /pazienti/:id                    | ✓               | Operatore             | Dimette il paziente (soft delete), solo se non ha richieste pendenti |
| GET    | /scorte                        | ✓               | Admin                 | Elenco delle scorte per gruppo sanguigno         |
| GET    | /scorte/:id                      | ✓               | Admin                 | Dettagli di una singola scorta                   |
| PUT    | /scorte/:id                      | ✓               | Admin                 | Aggiorna la quantità di una scorta tramite `delta` |
| GET    | /richieste                      | ✓               | Operatore             | Elenco delle richieste di trasfusione            |
| GET    | /richieste/:id                    | ✓               | Operatore             | Dettagli di una singola richiesta con i dati del paziente |
| POST   | /richieste                      | ✓               | Operatore             | Crea una nuova richiesta di trasfusione          |
| DELETE | /richieste/:id                  | ✓               | Operatore             | Annulla una richiesta ancora in attesa (nessuna sacca assegnata) |
| GET    | /assegnazioni                    | ✓               | Operatore             | Elenco delle assegnazioni calcolate dal flusso   |
| GET    | /assegnazioni/:id                  | ✓               | Operatore             | Dettagli di una singola assegnazione             |

Il logout invalida solo il token usato nella richiesta. Dopo un cambio di ruolo o l'eliminazione di un utente, invece, vengono invalidati **tutti** i token già emessi per quell'utente: per continuare deve rifare il login.

---
## 🔌 Esempi rotte

Esempi reali delle rotte che ricevono dati nel body della richiesta, più alcune rotte senza body (`GET /utenti`, `GET /assegnazioni` e `POST /auth/logout`), con la relativa risposta.

1. Rotta
```json
POST /auth/login
```

Unica rotta pubblica: non richiede il token. Il token restituito va inviato nelle altre richieste nell'header `Authorization: Bearer <token>`.
**Richiesta:**

Nel body:

```json
{
    "email": "admin@ospedale.it",
    "password": "Password123!"
}
```

**Risposta** (`200`):

```json
{
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "ruolo": "admin"
}
```

2. Rotta
```json
GET /utenti
```

Solo admin. Restituisce tutti gli utenti registrati; il campo `password_hash` non compare mai nella risposta.

**Richiesta:**

Nessun body: basta l'header `Authorization: Bearer <token>` con il token dell'admin.

**Risposta** (`200`):

```json
[
    {
        "id": 1,
        "nome": "Admin",
        "cognome": "Sistema",
        "username": "admin",
        "email": "admin@ospedale.it",
        "ruolo": "admin",
        "data_creazione": "2026-10-08T13:48:31.000Z"
    },
    {
        "id": 2,
        "nome": "Giulia",
        "cognome": "Romano",
        "username": "giulia.r",
        "email": "giulia.romano@ospedale.it",
        "ruolo": "operatore",
        "data_creazione": "2026-10-08T13:48:31.000Z"
    },
    {
        "id": 3,
        "nome": "Marco",
        "cognome": "Ferri",
        "username": "marco.f",
        "email": "marco.ferri@ospedale.it",
        "ruolo": "operatore",
        "data_creazione": "2026-10-08T13:48:31.000Z"
    }
]
```

3. Rotta
```json
POST /utenti
```

Solo admin. La password viene salvata come hash bcrypt e non compare mai nella risposta; l'email viene salvata in minuscolo.

**Richiesta:**

Nel body:

```json
{
    "nome": "Test",
    "cognome": "Test",
    "username": "TestUser",
    "email": "TestUser@ospedale.it",
    "password": "TestPassword",
    "ruolo": "operatore"
}
```

**Risposta** (`201`):

```json
{
    "id": 4,
    "nome": "Test",
    "cognome": "Test",
    "username": "TestUser",
    "email": "testuser@ospedale.it",
    "ruolo": "operatore",
    "data_creazione": "2026-10-03T16:28:49.000Z"
}
```

4. Rotta
```json
PUT /utenti/:id/ruolo
```

Solo admin. Il ruolo può essere `admin` o `operatore`.

**Richiesta:**

Nel body:

```json
{
    "ruolo": "admin"
}
```

**Risposta** (`200`):

```json
{
    "message": "Ruolo aggiornato con successo per l'utente 4",
    "utente": {
        "id": 4,
        "nome": "Test",
        "cognome": "Test",
        "username": "TestUser",
        "email": "testuser@ospedale.it",
        "ruolo": "admin",
        "data_creazione": "2026-10-03T16:28:49.000Z"
    }
}
```

5. Rotta
```json
PUT /scorte/:id
```

Solo admin. `delta` positivo aggiunge sacche, negativo le rimuove. Dopo l'aggiornamento parte, con un ritardo di 3 secondi, il ricalcolo del flusso.

**Richiesta:**

Nel body:

```json
{
    "delta": 5
}
```

**Risposta** (`200`):

```json
{
    "id": 1,
    "gruppo_sanguigno": "A",
    "quantita": 15,
    "data_aggiornamento": "2026-10-03T16:28:49.000Z"
}
```

**Risposta** (`400`, quantità risultante negativa con `"delta": -100`):

```json
{
    "error": {
        "statusCode": 400,
        "code": "BAD_REQUEST",
        "message": "Scorte insufficienti. Quantità attuale: 15, variazione richiesta: -100, risultato: -85"
    }
}
```

6. Rotta
```json
POST /pazienti
```

Solo operatore. Il codice `PZ-<id>` e lo stato `ricoverato` vengono assegnati automaticamente.

**Richiesta:**

Nel body:

```json
{
    "nome": "Elena",
    "cognome": "Conti",
    "data_nascita": "1992-05-14",
    "gruppo_sanguigno": "A"
}
```

**Risposta** (`201`):

```json
{
    "id": 4,
    "codice_paziente": "PZ-4",
    "nome": "Elena",
    "cognome": "Conti",
    "data_nascita": "1992-05-14",
    "gruppo_sanguigno": "A",
    "stato": "ricoverato",
    "data_registrazione": "2026-10-03T16:28:49.000Z"
}
```

7. Rotta
```json
PUT /pazienti/:id
```

Solo operatore. Si possono inviare uno o più campi tra `nome`, `cognome`, `data_nascita` e `gruppo_sanguigno`; gli altri restano invariati.

**Richiesta:**

Nel body:

```json
{
    "cognome": "Conti Rossi"
}
```

**Risposta** (`200`):

```json
{
    "id": 4,
    "codice_paziente": "PZ-4",
    "nome": "Elena",
    "cognome": "Conti Rossi",
    "data_nascita": "1992-05-14",
    "gruppo_sanguigno": "A",
    "stato": "ricoverato",
    "data_registrazione": "2026-10-03T16:28:49.000Z"
}
```

8. Rotta
```json
POST /richieste
```

Solo operatore. L'utente viene ricavato dal token. La richiesta nasce `in_attesa` e fa partire subito il ricalcolo del flusso, che può assegnarle le sacche e cambiarne lo stato.

**Richiesta:**

Nel body:

```json
{
    "id_paziente": 4,
    "quantita": 2,
    "priorita": "urgente"
}
```

**Risposta** (`201`):

```json
{
    "id": 4,
    "id_paziente": 4,
    "quantita": 2,
    "priorita": "urgente",
    "stato": "in_attesa",
    "id_utente": 2,
    "data_richiesta": "2026-10-03T16:28:49.000Z"
}
```

9. Rotta
```json
GET /assegnazioni
```

Solo operatore. Restituisce le assegnazioni calcolate dall'algoritmo di flusso. Risultato reale ottenuto sul database iniziale di `init.sql`, che contiene 3 richieste in attesa: l'admin aggiunge 5 sacche alla scorta A (`PUT /scorte/1` con `"delta": 5`, A passa da 10 a 15). Dopo i 3 secondi del debounce parte il ricalcolo del flusso, che serve le 3 richieste esistenti.

**Richiesta:**

Nessun body: basta l'header `Authorization: Bearer <token>` con il token dell'operatore.

**Risposta** (`200`):

```json
[
    {
        "id": 1,
        "id_richiesta": 1,
        "id_scorta": 1,
        "quantita_assegnata": 3,
        "data_calcolo": "2026-10-08T19:52:08.000Z"
    },
    {
        "id": 2,
        "id_richiesta": 3,
        "id_scorta": 3,
        "quantita_assegnata": 4,
        "data_calcolo": "2026-10-08T19:52:08.000Z"
    },
    {
        "id": 3,
        "id_richiesta": 2,
        "id_scorta": 2,
        "quantita_assegnata": 2,
        "data_calcolo": "2026-10-08T19:52:08.000Z"
    }
]
```

Lettura del risultato (scorte: `1` = A, `2` = B, `3` = 0, `4` = AB):

| Richiesta | Paziente | Priorità | Sacche | Assegnate da | Stato |
|---|---|---|---|---|---|
| 1 | Marco Rossi (A) | urgente | 3 | scorta A (costo 1) | soddisfatta |
| 3 | Luca Verdi (0) | urgente | 4 | scorta 0 (costo 1) | soddisfatta |
| 2 | Giulia Bianchi (B) | normale | 2 | scorta B (costo 1) | soddisfatta |

Le urgenti vengono servite nella prima fase e la normale nella seconda. Ogni richiesta riceve sangue del proprio gruppo, cioè al costo minimo, e il sangue di gruppo 0 non viene usato per gli altri gruppi. Le scorte finali sono A = 12, B = 4, 0 = 11, AB = 4.

10. Rotta
```json
POST /auth/logout
```

Admin e operatore. Invalida il token usato nella richiesta: il suo hash viene inserito nella blacklist su Redis fino alla scadenza del token.

**Richiesta:**

Nessun body: basta l'header `Authorization: Bearer <token>` con il token da invalidare.

**Risposta** (`200`):

```json
{
    "message": "Logout effettuato con successo"
}
```

**Risposta** (`401`, richiesta successiva con lo stesso token):

```json
{
    "error": {
        "statusCode": 401,
        "code": "UNAUTHORIZED",
        "message": "Token revocato"
    }
}
```

---

## ⚙️ Set-up

### Prerequisiti

- **Docker Desktop**, che include Docker Compose;
- **OpenSSL**, necessario per generare localmente la coppia di chiavi RSA usata dai JWT;
- Git.

### 1. Clonare il progetto

```bash
git clone https://github.com/antoniodam03/ProgettoProgrammazioneAvanzata.git
cd ProgettoProgrammazioneAvanzata
```

### 2. Configurare le variabili d'ambiente

Nella cartella principale del progetto creare il file `.env` con la seguente configurazione:

```env
MYSQL_ROOT_PASSWORD=<your-root-password>
MYSQL_USER=<your-user>
MYSQL_PASSWORD=<your-password>
MYSQL_DATABASE=mydb
DB_HOST=db
DB_PORT=3306
PORT=3000
REDIS_URL=redis://redis:6379
```

Le chiavi JWT non vanno scritte a mano: i comandi del punto 3 aggiungono automaticamente in fondo al `.env` due variabili di questo tipo (ogni chiave su una sola riga, con `\n` al posto degli a capo):

```env
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIJKA...\n-----END RSA PRIVATE KEY-----\n"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIj...\n-----END PUBLIC KEY-----\n"
```

### 3. Generare la coppia di chiavi RSA per i JWT

Le chiavi sono volutamente escluse dal repository e devono essere create una sola volta sul proprio computer. Dalla cartella principale del progetto, dopo aver creato il file .env eseguire:

```bash
# Generiamo la chiave privata RSA a 4096 bit (non inserire la passphrase: premere Invio due volte)
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key

# Ricaviamo la chiave pubblica in formato PEM (sovrascrive il jwtRS256.key.pub in formato SSH creato da ssh-keygen)
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub

#Aggiungiamo le chiavi all'env
echo "" >> .env
echo "JWT_PRIVATE_KEY=\"$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' jwtRS256.key)\"" >> .env
echo "JWT_PUBLIC_KEY=\"$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' jwtRS256.key.pub)\"" >> .env

#Rimuoviamo i file temporanei delle chiavi
rm jwtRS256.key jwtRS256.key.pub
```

Le chiavi vengono memorizzate nel file `.env` (escluso dal repository tramite `.gitignore`) e caricate in `backend/src/utils/jwt.ts`, dove vengono passate alla libreria `jsonwebtoken`: la chiave privata firma i token, la chiave pubblica li verifica (schema RS256).

### 4. Avviare l'applicazione con Docker

```bash
docker compose up --build
```

Docker inizializza MySQL con `db/init.sql`, avvia Redis, attende che entrambi siano pronti e avvia il backend. Il server sarà raggiungibile su `http://127.0.0.1:3000`.

Per arrestare i container usare `Ctrl+C`; per arrestarli in background usare:

```bash
docker compose down
```

Per riportare il database allo stato iniziale dei seed (ad esempio prima di eseguire i test Postman) occorre eliminare anche il volume di MySQL, così che `db/init.sql` venga rieseguito all'avvio:

```bash
docker compose down -v && docker compose up --build
```

## 🧪 Test

Il progetto è verificato su due livelli: **test unitari** dei middleware con Jest, e **test delle rotte** tramite una collection Postman.

### Test unitari con Jest

I test si trovano in `backend/src/tests/` e non richiedono né il database né le chiavi JWT reali: i moduli `utils/jwt` e `utils/redis` vengono sostituiti con dei mock (`jest.mock`), così che il comportamento dei middleware sia verificato in isolamento.

| File | Funzione testata | Casi verificati |
|---|---|---|
| `authMiddlewareToken.test.ts` | middleware **`authMiddleware`** (autenticazione JWT) | header `Authorization` assente → `401`; token non di tipo `Bearer` → `400`; token valido → `req.user` popolato e `next()` chiamato senza errori; token invalidato con il logout (in blacklist) → `401`; token con versione superata (ruolo cambiato dopo il login) → `401` |
| `authMiddleware.test.ts` | middleware **`authorize`** (autorizzazione per ruolo) | ruolo che corrisponde esattamente; ruolo incluso tra più ruoli ammessi; `req.user` assente → `401`; operatore su rotta admin → `403`; admin su rotta operatore → `403` |

Per eseguire i test in locale, dalla cartella `backend`:

```bash
npm test
```

L'esito atteso è `Tests: 10 passed, 10 total`.

<div align="center">
  <img src="docs/test_screenshot.png" alt="Esito dei test Jest: 10 superati" width="50%">
</div>

### Test delle rotte con Postman

Nella cartella `postman/` è presente la collection con tutte le rotte dell'applicazione, organizzata in due cartelle, una per ruolo:

- **Operatore**: login, gestione pazienti (registrazione, aggiornamento, dimissione), richieste di trasfusione (creazione e annullamento di una richiesta già servita, `400`), visualizzazione delle assegnazioni.
- **Admin**: login, logout, gestione utenti (creazione, cambio ruolo, eliminazione), gestione delle scorte.

Il token viene gestito automaticamente: la richiesta di login contiene lo script

```js
const jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```

che salva il token nella variabile d'ambiente `token`, usata come *Bearer Token* da tutte le altre richieste. Le richieste usano gli ID dei dati iniziali di `init.sql` e delle risorse create durante l'esecuzione (ad esempio `/utenti/4` e `/pazienti/4`), quindi la collection va eseguita sul database appena creato (`docker compose down -v && docker compose up --build`).

## 🛠️ Strumenti Utilizzati

Per lo sviluppo dell'applicazione presentata sono stati utilizzati i seguenti strumenti di lavoro:

- [TypeScript](https://www.typescriptlang.org/) come linguaggio di programmazione principale;
- [Express.js](https://expressjs.com/) come framework per applicazioni Web per Node.js;
- [Node.js](https://nodejs.org/) come sistema per la gestione di moduli e pacchetti;
- [Sequelize](https://sequelize.org/) per l'Object Relational Mapping (ORM);
- [Docker](https://www.docker.com/) come sistema di containerizzazione per il deployment dell'applicazione;
- [MySQL](https://www.mysql.com/) come database;
- [Redis](https://redis.io/) per la gestione delle sessioni (logout e revoca dei token);
- [JWT](https://jwt.io/) (RS256) e [bcrypt](https://www.npmjs.com/package/bcrypt) per l'autenticazione e la sicurezza delle password;
- [Jest](https://jestjs.io/) per i test automatizzati;
- [Postman](https://www.postman.com/) per il testing delle rotte API;
- [GitHub](https://github.com/) come piattaforma di condivisione e versioning del codice;
- [Visual Studio Code](https://code.visualstudio.com/) come editor di codice.


## 👥 Autori

- [Antonio D'Amelio](https://github.com/antoniodam03)
