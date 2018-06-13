# Tecnologie e Scelte Implementative

Librerie e framework importanti: [Express (4.6.1)](https://expressjs.com/),  [Bootstrap (4.0)](https://getbootstrap.com/), [jQuery (3.3.1)](https://jquery.com/), [Handlebars (4.0.1)](http://handlebarsjs.com/).

Tutte le dipendenze segnate su `package.json` nella cartella webserver.

## File Upload

**Cosa vogliamo ottenere**

L'upload di un file da locale al webserver in express.  
I file saranno in particolare le registrazioni, quindi se salvate con un formato lossless raggiungeranno dai 20-100 MB (10 min di .wav registrato quanto pesa?).

**Soluzioni considerate**

Ogni richiesta per express passa per un middleware, di default abbiamo [`body-parser`](https://www.npmjs.com/package/body-parser), che transforma automaticamente JSON e si occupa degli url codificati.

Per i file tuttavia è necessario un altro middleware, e dopo varie ricerche: express 4+ ha tolto il supporto a `req.files`, il miglior middleware è `busboy`.

**Soluzione scelta**

`busboy` è stato portato su express sotto il nome di [`multer`](https://github.com/expressjs/multer). Può essere usato come middleware per-route e permette la gestione dei file comodamente.

**Implementazione**

- Aggiungere ad una route [(Come?)](https://github.com/expressjs/multer/blob/master/README.md#usage)
- Il file è disponibile nella request, su `req.file`

*Riferimenti: ["File uploading in express 4"](https://stackoverflow.com/questions/23114374/file-uploading-with-express-4-0-req-files-undefined); ["Express 4 simple file uploads (multer)"](http://lollyrock.com/articles/express4-file-upload/).*

## Registrazione

**Cosa vogliamo ottenere**

Creare un file audio comprensibile da Google Cloud Speech. Specifiche:
- [*Encoding*](https://cloud.google.com/nodejs/docs/reference/speech/1.1.x/google.cloud.speech.v1?hl=it#.AudioEncoding): Per i risultati migliori usare **FLAC** o **LINEAR16** (pesanti), altrimenti OGG_OPUS (leggero ma qualità inferiore);
- *SampleRateHertz*: minima/default 16000 Hz, di solito si aggira sui 44100hz;
- *Canali*: deve essere mono-canale.

**Soluzioni da considerare**

- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream): tutti i browser moderni (No IE, ma Edge si):
    - [microphone-stream](https://www.npmjs.com/package/microphone-stream): wav, API semplice, stream audio (?), config completa;
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API): (tutti i browser moderni) comandi comodi, abbastanza complesso ma completo. Librerie:
    - [opus-recorder](https://www.npmjs.com/package/opus-recorder): ogg o wav, API semplice, tutti i browser, config completa; encoder + decoder + lib = [~60 KB](https://github.com/chris-rudmin/opus-recorder/tree/master/dist) (da testare!);
    - [msr (Media Stream Recorder)](https://www.npmjs.com/package/msr): ogg o wav, API semplice, tutti i browser, config completa, demo non funzionante (a me); minified_lib = [40 KB](https://github.com/streamproc/MediaStreamRecorder/blob/master/MediaStreamRecorder.min.js) (da testare!);
    - [WebAudioRecorder.js](https://github.com/higuma/web-audio-recorder-js) [[demo](https://higuma.github.io/web-audio-recorder-js/)]: supporta .wav, .mp3, .ogg; configurazioni comode e semplici; vecchia, aggiornata 3 anni fa; **migliore candidata** per ora, se riuscissimo a testarla;
    - [JSSoundRecorder](https://github.com/daaain/JSSoundRecorder) [[demo](http://daaain.github.com/JSSoundRecorder)]
- recorderjs [[demo](http://webaudiodemos.appspot.com/AudioRecorder/index.html), [code](https://webaudiodemos.appspot.com/AudioRecorder/js/recorderjs/recorderWorker.js)]: wav;
- [Speech.streamingRecognize](https://cloud.google.com/nodejs/docs/reference/speech/1.1.x/v1.SpeechClient?hl=it#streamingRecognize): (è fattibile via browser? Richiede gli `stream`).

**Soluzione scelta**

`opus-recorder`. Supportato da tutti i browser moderni e rientra esattamente nelle specifiche di codifica richieste da Google Cloud Speech.

**Implementazione**

1. Richiede i permessi del microfono e assicura il funzionamento;
    1. Se non sento niente o livello molto basso segnalo con un feedback visivo;
2. Registra localmente tramite JS un audio tramite una delle soluzioni sopra elencate;
3. Stoppata la registrazione uploada automaticamente il file su Storage:
    - identificato dal *nome-progetto* e *data-registrazione* (YYYY-MM-DD HH:mm:ss)
    - vanno salvate altre informazioni nei metadata, come encoding, sampleRate, ecc?
4. Finito l'upload chiede se si vuole scaricare (per backup?).
