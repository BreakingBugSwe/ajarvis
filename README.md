# AJarvis

> Progetto AJarvis, capitolato C1, per la proponente zero12. Basato su express.js e Google Cloud Platform

## Indice

1. [Installazione](#installazione)
2. [Uso](#uso)
3. [Struttura](#struttura)
4. [Contribuire](#contribuire)
5. [Test](#test)
6. [Documentazione](#documentazione)
7. [Tecnologie](#tecnologie)
8. [Documentazione Esterna](#documentazione-esterna)

## Installazione

Tutte le guide in questa sezione sono necessarie per poter avviare correttamente il server.

### Node.js

1. Installare Node.js, versione `LTS 8` (o più recente, ma sempre `LTS`):
    - _Windows_: scaricatelo ed installatelo da [nodejs.org](https://nodejs.org/en/download/), Windows Installer, 64-bit;
    - _Ubuntu/Debian_: aggiungete il repository con `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -` ed installatelo con `sudo apt-get install -y nodejs`.
2. Una volta installato assicurati di avere i comandi `node` e `npm` disponibili da terminale. Se no, riaprite il terminale, sloggatevi o riavviate il computer.
3. Da terminale, andate nella cartella `<repo>` ed eseguite `npm install`.

### Google Cloud SDK

E' consigliato creare un nuovo progetto su Google Cloud Platform da usare appositamente per AJarvis evitando di generare conflitti con la nomenclatura del bucket su Google Cloud Storage e delle entity su Google Cloud Datastore.

1. Creare un file JSON contenente delle credenziali valide per un account Google Cloud Platform seguendo la procedura descritta alla pagina https://cloud.google.com/sdk/docs/authorizing#authorizing_with_a_service_account
2. Posizionare il file appena creato nel percorso `webserver/service-account.json`

AJarvis utilizza Google Cloud Datastore come database non relazionale per la persistenza dei dati.

1. Aggiungere gli indexes personalizzati al Datastore dal file `webserver/lib/gcp/index.yaml` seguendo la guida https://cloud.google.com/datastore/docs/tools/indexconfig#Datastore_Updating_indexes
2. L'operazione potrà richiedere del tempo, solitamente qualche minuto.

Infine creare un file `webserver/service-account.json` contentente delle credenziali valide per un account Google Cloud.

_Riferimenti:_
[GCP Node.js Tutorial (YT)](https://www.youtube.com/watch?v=n4svrNcAkJg),
[Getting Started with Authentication](https://cloud.google.com/docs/authentication/getting-started).

## Uso

Assicuratevi di aver installato tutti i componenti necessari, come descritto nella sezione di [Installazione](#installazione).

### Avvio

1. Per avviare il server in locale, andate nella cartella `webserver` ed eseguite `npm start`;
2. Il server sarà raggiungibile all'indirizzo di default `http://localhost:3000`.

### Monitoraggio/Debug

Una volta avviato, sulla console verranno mostrati i messaggi relativi alle richieste inviate al server ed eventuali errori/eccezioni.
- Ad esempio, se andate sulla home verrà scritto `GET /`, ovvero la richiesta GET per la homepage.
- Se ci sono stati errori verranno ugualmente mostrati sulla console, completi di stacktrace di dov'è successo.


## Struttura

È diviso in una cartella principale e la cartella specifica del webserver.

### Devtools (cartella principale)

La cartella principale contiene tools per il development (al momento solo le regole per eslint, ma più avanti anche per il testing), mentre le altre cartelle sono per i componenti più specifici.

```
<repo>
    └── webserver
```

### Webserver (cartella webserver)

La cartella webserver si occupa esclusivamente del webserver express. Al momento è anche la cartella dove andrà tutto il nostro progetto (es. registrazione, web ui, interazione con GCP, text-mining, ecc).

```
webserver
    ├── bin/
    │   ├── www
    ├── public/
    │   ├── css/
    │   ├── img/
    │   └── js/
    ├── routes/
    ├── views/
    ├── uploads/
    ├── app.js
    └── app.yaml
```

- `bin/`: separa l'app Express dal server, per semplificare il testing (["Separate Express 'app' and 'server'"](https://github.com/i0natan/nodebestpractices#-14-separate-express-app-and-server)):
    - `www`: script in Node.js per avviare il server (invocato dal comando `npm start`);
- `public/`: tutti gli asset "statici", come JS, CSS e immagini vanno qui, nelle rispettive cartelle. Contiene la `favicon.ico`.
- `routes/`: ogni pagina o gruppo di pagine è indicato in un file che ne specifica la sua route.
- `views/`: template e layout delle pagine
- `uploads/`: cartella nella quale il webserver salva i file caricati; verrà generata se provate a uploadare un file.
- `app.js`: file principale contenente il server Express.

## Contribuire

Per contribuire al progetto seguite le linee guida che trovate su [CONTRIBUTING.md](CONTRIBUTING.md).
Lì potete trovate le regole di stile per i vari linguaggi e come fare il setup dell'IDE `atom`.

## Test

Un'analisi statica dal codice sorgente verrà eseguita da `eslint`.
I test di integrazione, unità e di sistema sono eseguiti da `jest`.

Per più informazioni riferirsi alla sezione [Contribuire](#contribuire).

Per avviare i test eseguire:

```sh
$ npm test
```

## Documentazione

La documentazione va generata localmente, e la potete trovare nella cartella `docs/devdocs`.
Per generare la documentazione interna eseguite:

```sh
$ npm run generate-docs
```

## Tecnologie

Alcune tecnologie e "Scelte implementative" le potete trovare su [docs/tecnologie.md](docs/tecnologie.md).

## Documentazione Esterna

### Google Cloud Platform (GCP)

Riferitevi sempre alla documentazione in Node.js. Il primo link è la documentazione generale, mentre API si riferisce direttamente alle API Node.js.

- [**Google Cloud Storage**](https://cloud.google.com/storage/docs/?hl=it): file temporanei, registrazioni audio, blob, file pesanti.
    - [Browse Buckets](https://console.cloud.google.com/storage/browser?project=ajarvis-poc&authuser=2&hl=it): file browser online per i buckets.
    - [API](https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/?hl=it):
        - [Bucket](https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/Bucket?hl=it)
        - [File](https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/File?hl=it)
    - [Termini: buckets e objects (nei buckets)](https://cloud.google.com/storage/docs/key-terms?hl=it#buckets): i bucket non sono cartelle, ma contenitori di oggetti (o file). Va considerata la locazione geografica. Idealmente vanno collocati in Italia e per il progetto ne useremo uno contenente tutte le registrazioni.
- [**Google Cloud Datastore**](https://cloud.google.com/datastore/docs/?hl=it): database NoSQL per la gestione degli utenti, registrazioni, progetti e output del text-mining;
    - [Browse Datastore](https://console.cloud.google.com/datastore/entities/query?project=ajarvis-poc&authuser=2&hl=it&ns=&kind=project): visualizza le entità presenti nel datastore (una sorta di PHPMyAdmin)
    - [API](https://cloud.google.com/nodejs/docs/reference/datastore/1.3.x/?hl=it): Datastore, Query, ecc.
    - [Entities](https://cloud.google.com/datastore/docs/concepts/entities#datastore-properties-nodejs)
- [**Google Cloud Speech**](https://cloud.google.com/speech/docs/?hl=it): speech to text;
    - [API](https://cloud.google.com/nodejs/docs/reference/speech/1.1.x/?hl=it)
- [**Google Cloud Natural Language**](https://cloud.google.com/natural-language/docs/?hl=it): comprendere il testo capito da Speech.
    - [API](https://cloud.google.com/nodejs/docs/reference/language/1.1.x/?hl=it)

### HTML/CSS Handlebars/Bootstrap

- [Documentazione di Bootstrap](https://getbootstrap.com/docs/4.0/layout/overview/): docs per tutti gli elementi e componenti di Bootstrap;
    - [Esempi di componenti su Bootstrap](https://getbootstrap.com/docs/4.0/examples/): esempi di componenti già assemblati con le classi Bootstrap, da cui potremmo prendere esempio.
- [Handlebars.js](http://handlebarsjs.com/): template engine.
    - [hbs](https://github.com/pillarjs/hbs): addattamento di Handlebars per Express. Docs più specifica per funzioni avanzate, per il resto affidarsi alla docs ufficiale di Handlebars.

### JS ed ES6+

Express è il backend ed è scritto e gira su Node.js, il quale supporta ES6+, cioè è JS ma moderno. Per cominciare vi elenco alcune guide:

- [Tutorial base](https://www.airpair.com/javascript/node-js-tutorial): è abbastanza completo come tutorial, ma l'unico modo che ho trovato utile e cercare su internet ogni volta che non capite qualcosa, tanto è vasto l'argomento:
    - Internet (es. StackOverflow (obv), Quora, medium, hackernews, ecc)
    - [MDN (Mozilla Developer Network)](https://developer.mozilla.org/en-US/): per tutte le API di JS nativo e ES6+ spiegato bene e con esempi.
- ["Cos'è ES6 (o ES2015)?"](https://babeljs.io/learn-es2015/): se conoscete già JS base.
    - ["Callback -> Promise -> Async/Await: cosa sono e come funzionano"](https://www.toptal.com/javascript/asynchronous-javascript-async-await-tutorial): utile per capire i concetti di callback, Promise, async/await per Node.js.

Non capite come funzioni qualcosa? Provatelo al volo, con il comando `node` (console interattiva) o fate uno script temporaneo ed eseguitelo con `node nome-script.js`.

### Express

Express è come PHP e oltre, governa tutto il lato backend del server. Tramite il `ruoter` gestisce i path delle pagine disponibili. Ogni ruote ha le proprie richieste (request) e risposte (response).

- [API](https://expressjs.com/en/4x/api.html)
    - [req (Request)](https://expressjs.com/en/4x/api.html#req)
    - [res (Response)](https://expressjs.com/en/4x/api.html#res)
- [Ottimizzazione/Performance di Express](https://expressjs.com/en/advanced/best-practice-performance.html)
- *Best practices*: essendo molto opinionate o vecchie, si cerca di prendere il meglio da ognuna.
    - [Organizzazione router](https://www.terlici.com/2014/09/29/express-router.html)
    - [Express structure](https://www.terlici.com/2014/08/25/best-practices-express-structure.html)
    - [[repo esempio](https://github.com/terlici/base-express)]
    - [Tutorial mozilla](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
- Validazione input:
    - [express-validator](https://express-validator.github.io/docs/validation-chain-api.html): Si usa in congiungzione con le API di `validator`, che sono integrate nella Validation Chain. (guardare esempi dell'utilizzo su `newProject.js`)
    - [validator API](https://github.com/chriso/validator.js)
