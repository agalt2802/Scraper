# Scraper

## Descrizione
Questo programma Node.js, è progettato per raccogliere dati relativi a malware da una sorgente OSINT (Open Security Intelligence) all'indirizzo https://das-malwerk.herokuapp.com/. I dati vengono quindi elaborati e salvati in un database Redis.

## Requisiti
- Node.js (Ultima versione LTS)
- Redis

## Installazione
1. Clonare il repository: https://github.com/agalt2802/Scraper
2. Navigare nella directory del progetto
3. Installare le dipendenze con il comando `npm install`

## Utilizzo
Per avviare lo script sarà necessario eseguire il comando `node src/scraper.js`

- Per ogni riga letta verrà genrato un oggetto che conterrà le informazioni relative al malwere. L'oggetto generato sarà così composto: 
```js 
    {
        “threat”: “Malware Name”,
        “sha256”: “sha256”,
        “localPath”: “localPath”,
        “password”: “password”,
        “downloadError”: “downloadError” 
    }
```
- Gli oggetti generati verrano inseriti nella HASH Redis specificata dalla proprietà `MALWERE_KEY` presente nel file di configurazione `config.yml`, con chiave il campo `threat`
- Il programma evita di inserire duplicati nel database Redis, garantendo che ogni entry sia unica.
- Le informazioni sul numero di malware analizzati per ogni esecuzione vengono salvate in Redis nella HASH specificata dalla propietà `COUNT_KEY` presente nel file di configurazione `config.yml`, con la data come chiave.
- In caso di problemi durante il download o la gestione dei file, il programma salva comunque le informazioni nella chiave Redis specificata, indicando quale errore si è verificato nel campo `downloadError`.

## Configurazione
- È possibile configurare il comportamento del programma modificando le variabili nel file `config.yml`.
In particolare nel file `config.yml` si potranno impostare i valori per:
  - `DOWNLOAD_DIR`: la cartella locale in cui verranno salvati i sample
  - `URL`: l'url del sito da cui reperire le informazioni
  - `DB`: i parametri di connessione al DB Redis, come hostname, porta e numero di DB 
  - `MALWARE_KEY, COUNT_KEY`: le chivi Redis in cui salvare rispettivamente gli oggetti creati dall'elaborazione delle informazioni e il conteggio degli oggetti elaborati ad ogni esecuzione
  - `REAPET_EVERY_X_MINUTES`: parametro per decidere ogni quandi minuti eseguire lo script (utilizzato da un eventuale cron node)
  - la password del DB viene recuperata dalla variabile d'ambiente `REDIS_PASSWORD`
## Scheduler
- Per eseguire il programma periodicamente, è possibile utilizzare uno scheduler esterno.
- Nel file `index.js` è stato predisposto anche un cron node che utilizza il parametro `REAPET_EVERY_X_MINUTES` definito nel file `config.yml` per impostare la schedulazione dell'esecuzione dello script. 
Se si vuole utilizzare questo metodo per avviare l'esecuzione dello script si dovrà eseguire il comando `node src/index.js`

## Frequenza di esecuzione
Per stabilire quale possa essere un buon valore per la frequenza di esecuzione dello scraper si potrebbe partire con un valore moderato, come ad esempio 30 minuti, e poi dopo un certo numeri di RUN valutare, in base al numero degli elementi elaborati in ogni RUN, se aumentare la frequenza di elaborazione perchè i dati vengo aggiornati molto spesso o al contrario se diminuire la frequenza di esecuzione perché i dati non sono aggiornati spesso.  


