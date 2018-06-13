## Contribuire

Se non sapete da dove cominciare seguite la [Struttura](README.md#struttura) del progetto.

### Regole generali

- **Tabs, no spazi**: evitiamo discussioni inutili ed usate i tabs, in qualsiasi parte del codice, no eccezioni, chi si opporrà verrà linciato l'indomani.

### JS

Riferitevi alla documentazione per JS nella sezione di [Documentazione esterna](README.md#documentazione-esterna).

- [**Styleguide Airbnb**](https://github.com/airbnb/javascript): da leggere assolutamente perchè vi mostra [da wei](https://youtu.be/eix7fLsS058?t=1m26s) per scrivere il codice.

#### Logging (con winston)

Non si usa `console.log` per fare logging, solo per debugging temporaneo.
Usiamo il logger `winston`. L'istanza del logger si può trovare su `/lib/utility/logger.js`.

Comandi utili:

- `logger.debug()`
- `logger.info()`
- `logger.error()`
- `logger.warn()`

Link utili:

- [Docs ufficiali Winston](https://www.npmjs.com/package/winston)
- [Spunto per codice di logger.js](https://stackoverflow.com/questions/47133451/can-i-change-the-color-of-log-data-in-winston)

### Test

I test verranno fatti con [Jest](https://facebook.github.io/jest/) e il mock dei require con [proxyquire](https://github.com/thlorenz/proxyquire).

- I test si trovano all'interno della cartella `webserver/test` ed internamente seguono la struttura gerarchica della cartella `webserver`.
- Ogni test avrà il nome del file definito nel seguente modo `<file-to-test>.test.js`.
- Guardare gli esempi per vedere come strutturare un test ed usare jest e proxyquire.

*Riferimenti: [test su Datastore](https://github.com/googleapis/nodejs-datastore/blob/master/test/index.js#L107)*

### CSS

- Non usare ID per lo stile (solo lato JS per riconoscere elementi unici nella pagina).
- Usare il più possibile gli elementi forniti da Bootstrap (link utili sulla [Documentazione](README.md#documentazione-esterna)).
- Se serve aggiungere o modificare regole, create una classe apposta.
    - Nomi degli identificatori in minuscolo; se più parole, separate da `-`.
- Non modificare MAI le classi fornite da Bootstrap (a meno che non siate consapevoli che verrà modificata ovunque nel sito).

### HTML

- Seguite la struttura dei tag su Bootstrap, nelle guide elencate sul paragrafo di [CSS](#css).
- Non mettete tutto sulla stessa riga. Non viene versionato bene ed è illeggibile. Separate su più righe, a meno che non siano solo elementi inline.
    ```html
    <!-- NO! -->
    <div class="..."><p><a href=""><span>link</span></a></p><p>Un altro paragrafo</p><button>invio</button></div>

    <!-- SI -->
    <div class="...">
        <p><a href=""><span>link</span></a></p>
        <p>Un altro paragrafo</p>
        <button>invio</button>
    </div>
    ```

### IDE

Per mantenere il codice coerente ed uniforme vi consiglio di usare Atom e i relativi plugin, come descritto nell'ambiente di sviluppo nelle *Norme di Progetto*. Atom è pesante e vi chiava la batteria, però offre un sacco di tools comodi ed è molto supportato dalla community.

**Plugins Atom**:

Su Settings > Install Packages, cercate il nome ed installate ognuno dei seguenti:

> atom-ide-ui, autoclose-html, autocomplete-modules, autocomplete-paths, color-picker, colorful-json, docblockr, file-icons, highlight-selected, ide-typescript, language-babel, linter, linter-eslint, pigments, project-manager, todo-show

**Setup (dopo aver installato i plugins)**:

- Assicuratevi che `linter` sia disabilitato (viene rimpiazzato dal linter integrato nel plugin `atom-ide-ui`).
- Create un progetto con Project Manager sulla cartella principale.
- Su Settings > Core > Ignored Names mettete `.git, .hg, .svn, .DS_Store, ._*, Thumbs.db, desktop.ini, node_modules`.

**Shortcuts Utili**
- `Ctrl + Shift + P`: command palette, tutte le funzionalità a portata di tastiera.
- `Ctrl + P`: ricerca di un file tramite nome, comodo per aprirli velocemente.
- `Ctrl + /`: de/commenta una riga.
- `Ctrl + F`: ricerca all'interno del file corrente.
