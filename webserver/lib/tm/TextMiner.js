/**
 * @file Text-mining con node.js
 * Data Creazione:  2018-04-05
 *
 * @version 0.0.1
 * @author  Tommaso Loss
 */

// const env = require('../../env');
// const fs = require('fs');
// const lda = require('@stdlib/nlp/lda');
const logger = require('../utility/logger');
const TCI = require('./taskcompletetionidentifiers'); // Array di parole che identificano un task completato
const PI = require('./problemidentifiers'); // Array di parole che identificato un problema
const PCI = require('./problemcompletetionidentifiers'); // Array di parole che indentificano un problema risolto
const STWS = require('./stopwords'); // Array di parole che indentificano un problema risolto
const pwords = require('./powerwords'); // Array di parole enfatizzanti
const lda = require('../lda/lib/lda'); // Libreria di LDA
const PhraseTypes = require('./PhraseTypes');

const MAXSCORE = 10; // massimo punteggi assegnato alla singola frase
const SCOREMULTIPLIER = 10; // indice di contenimento del punteggio delle frasi (>indice <punteggio)
const MINIMUM_SIMILARITY = 0.35;
const MINIMUM_EQUALITY = 0.9;
// possibili magie di machine learning per autocalcolare il valore
/**
 * Opera il text-mining su una stringa di testo.
 */
class TextMiner {
	/**
	 * Costruisce un oggetto TextMiner per operazioni di text mining
	 * @param {String} transcription testo trascritto
	 * @param {String[]} taggedtext Array contente il tipo grammaticale delle frasi
	 * @param {String[]} names Array contente i nomi dei componenti
	 * @param {String} lemmatizedText testo lemmatizzato
	 * @param {String[]} keywords array di parole importanti esterne
	 * @param {JSON[]} problems problemi da risolvere
	 * NOTE: i punti devone essere attaccatti alla parola prima e alla parola successiva
	 * @param {String[]} phrases Array contente tutte le frasi del documento
	 * @param {String[]} phrasetype Array contenente la tipologia delle frasi
	 * @param {String[]} phrasename Array contenente il "proprietario" della frase
	 * @param {String[]} phrasescore Array contente il punteggio delle frasi
	 */
	constructor({
		lemmatizedtext = [],
		taggedtext = [],
		names = [],
		transcription = [],
		keywords = [],
		problems = [],
	} = {}) {
		if (lemmatizedtext.length === 0) { // stand-up vuoto
			logger.error('nessun frase da elaborare');
			throw new Error('Empty lemmatizedText');
		}
		if (taggedtext.length === 0) {
			logger.error('nessun tag sintattico');
			throw new Error('Empty taggedtext');
		}
		if (transcription.length === 0) {
			logger.error('nessuna trascrizione standup');
			throw new Error('Empty transcription');
		}
		this.documento = lemmatizedtext.replace(/[,?!]/g, '');
		this.taggedtext = TextMiner.removePunctuation(taggedtext);
		this.names = names;
		this.transcription = TextMiner.splitTranscription(transcription, names);
		this.phrases = TextMiner.splitPhrases(this.documento, this.taggedtext);
		this.keywords = keywords;
		this.problems = problems || [];

		this.phrasetype = [];
		this.phrasescore = [];
		this.phrasename = [];
	}

	static removePunctuation(text) {
		const newtext = [];
		for (let i = 0; i < text.length; i += 1) {
			if (text[i] !== 'PUNCT') newtext.push(text[i]);
		}
		return newtext;
	}

	// ritorna i tag del testo
	getTaggedText() {
		return this.taggedtext;
	}

	/**
	 * Separa le frasi di una stringa documento tramite il '.' e lo ' ',
	 * e abbina alla parole il tag relativo
	 * @param {String} documento Stringa contenente il testo di uno stand-up
	 * @param {JSON} taggedtext Json contente i tag del testo
	 * @return {JSON[][]} Array di array contenenti le parole e il  corrispettivo tag
	 */
	static splitPhrases(documento, taggedtext = []) {
		const trimmedDoc = documento.trim().replace(/\s\s+/g, ' '); // forse non serve
		let phrases = trimmedDoc.split('.');
		if (phrases[phrases.length - 1] === '') phrases.pop(); // check di sicurezza per ultima frase vuota
		phrases = phrases.map(frase => frase.trim());
		const parsedphrases = [];
		let wordcounter = 0;
		for (let i = 0; i < phrases.length; i += 1) {
			const phrase = TextMiner.splitString(phrases[i]);
			const wordsarray = [];
			for (let j = 0; j < phrase.length; j += 1) {
				const element = { word: phrase[j], tag: taggedtext[wordcounter] };
				wordcounter += 1;
				wordsarray.push(element);
			}
			parsedphrases.push(wordsarray);
		}
		return parsedphrases;
	}

	/**
	 * Separa le frasi di una stringa documento tramite il '.'
	 * @param {String} documento Stringa contenente il testo di uno stand-up
	 * @return {String[]} Array di array di parole corrispettivo
	 */
	static splitTranscription(documento, names) {
		const doc = this.eraseNames(documento, names);
		return doc.split('.');
	}

	/**
	 * Separa le frasi di una stringa tramite lo ' '
	 * @param {String} documento Stringa contenente il testo di uno stand-up
	 * @return {String[]} Array di parole
	 */
	static splitString(string) {
		const words = string.trim().split(' ');
		return words;
	}

	/**
	 * Chiama ordinatamente le funzioni di text-mining
	 */
	textMining() {
		this.phraseByName();
		// elimina i nomi dalle frasi, e assegna un nome a ciascuna di esse
		const topics = this.typeAnalysis();
		if (this.problems.length !== 0) this.resolveProblems();
		this.documento = TextMiner.eraseNames(this.documento, this.names);
		this.documento = TextMiner.eraseNames(this.documento, STWS.IT);
		const doc = this.documento.match(/[^.!?]+[.!?]+/g);
		let result = lda(doc, topics, 10, null, null, null, 100);
		// Arbitrario il numero di termini per topics
		// result.combine(arrayuserkeywords); aggiungere keywords personalizzate
		result = this.addKeywords(result);
		this.scoreAssignment(TextMiner.ldaToWords(result));
	}

	// aggiunge le keywords volute dall'utente all'output di lda
	addKeywords(result) {
		const newarray = result;
		for (let i = 0; i < this.keywords.length; i += 1) {
			if (result.find(x => x === this.keywords[i]) === undefined) newarray.push(this.keywords[i]);
		}
		return newarray;
	}


	// Elmina i nomi dal documento
	static eraseNames(documento, names) {
		let doc = ' '.concat(documento);
		for (let i = 0; i < names.length; i += 1) {
			const name = new RegExp(' '.concat(names[i]).concat(' '), 'g');
			doc = doc.replace(name, ' ');
		}
		return doc;
	}

	// Assegna i nomi dei componenti alle frasi.
	phraseByName() {
		for (let i = 0; i < this.phrases.length; i += 1) {
			let trovato = false;
			for (let j = 0; j < this.names.length && !trovato; j += 1) {
				if (this.phrases[i][0].word === this.names[j]) {
					trovato = true;
					this.phrasename[i] = this.names[j];
				}
				if (i === 0 && trovato === false) this.phrasename[i] = 'unknown';
				else if (trovato === false) {
					this.phrasename[i] = this.phrasename[i - 1];
				}
			}
		}
	}

	/**
	 * Divide le frasi per tipologia (problemi, risoluzione di problemi, completamento di task,
	 * continuazione di altre frasi e farsi senza significato)
	 * @return {Integer} il numero di argomenti per il calcolo dell'LDA
	 */
	typeAnalysis() {
		for (let i = 0; i < this.phrases.length; i += 1) {
			let type = TextMiner.identify(this.phrases[i]);
			if (i === 0 && type === PhraseTypes.CONTINUATION) {
				type = PhraseTypes.IGNORE;
			} // ignora le frasi iniziali inutili
			this.phrasetype[i] = this.checkContinuity(i, type);
			// controlla se è una continuazione di una frase precedente
		}
		return TextMiner.topicsNumber(this.phrasetype);
	}

	// Compares problems to solutions and erase the solved getProblems
	resolveProblems() {
		const solutions = [];
		for (let i = 0; i < this.phrases.length; i += 1) {
			if (this.phrasetype[i] === PhraseTypes.SOLUTION) solutions.push(this.phrases[i]);
		}
		for (let i = 0; i < solutions.length; i += 1) {
			const maxmatch = { match: 0, index: -1 };
			for (let j = 0; j < this.problems.length; j += 1) {
				let match = TextMiner.comparePhrasePhrase(solutions[i], this.problems[j].phrase);
				match /= (this.problems[j].phrase.length + solutions[i].length);
				if (maxmatch.match < match) {
					maxmatch.match = match;
					maxmatch.index = j;
				}
			}
			if (maxmatch.index !== -1) this.problems.splice(maxmatch.index, 1);
		}
	}

	/**
	 * Identifica se una frase è di tipo 'type'
	 * @param {String[]} phrase la frase da analizzare
	 * @return {String} stringa contenente il tipo della frase ricercata
	 */
	static identify(phrase) {
		const pcisearch = TextMiner.comparePhraseArray(phrase, PCI.IT);
		const pisearch = TextMiner.comparePhraseArray(phrase, PI.IT);
		const tcisearch = TextMiner.comparePhraseArray(phrase, TCI.IT);

		const solutioncont = pcisearch.pos; // numero di match per le parole indicanti problemi risolti
		let problemcont = pisearch.pos; // numero di match per parole indicanti problemi individuati
		const taskcont = tcisearch.pos; // numero di match per parole che indicano task completati
		problemcont += pcisearch.neg; // aggiungo ai problemi i match di problemi irrisolti
		problemcont += tcisearch.neg; // aggiungo ai problemi i match di task incompleti
		if (solutioncont === 0 && problemcont === 0 && taskcont === 0) return PhraseTypes.CONTINUATION;
		// se non ho trovato niente, la frase dipende dalle precedenti
		const max = Math.max(solutioncont, problemcont, taskcont);
		switch (max) {
		case (solutioncont):
			return PhraseTypes.SOLUTION;
		case (problemcont):
			return PhraseTypes.PROBLEM;
		default:
			return PhraseTypes.TASK;
		}
		// ritorno il tipo punteggio più elevato
	}

	/**
	 * Verifica se la frase è la continuazione di una frase precedente
	 * @param {Integer} index indice che identifica la frase da considerare
	 * @param {String} type tipo della frase da confrontare con le precedenti
	 * @returns tipo della frase analizzata (continuation o tipo indicato)
	 */
	checkContinuity(index, type) {
		if (index === 0) return type;
		let j = index - 1;
		for (; j >= 0 && this.phrasetype[j] === PhraseTypes.CONTINUATION; j -= 1);
		if (this.phrasetype[j] === type &&
			TextMiner.checkSimilarity(this.phrases[index], this.phrases[j])) {
			return PhraseTypes.CONTINUATION;
		} return type;
	}

	/**
	 * Conta il numero di argomenti in un array di tipi di frasi, ingnorando
	 * continuazioni e frasi nulle
	 * @param {String[]} typeArray array di tipi di frasi da scorrere
	 * @returns il numero di argomenti
	 */
	static topicsNumber(typeArray) {
		let cont = typeArray.length; // massimo numero di argomenti
		for (let i = 0; i < typeArray.length; i += 1) {
			if (typeArray[i] === PhraseTypes.CONTINUATION || typeArray[i] === PhraseTypes.IGNORE) {
				cont -= 1;
			}
			// ignora le frasi inutili e quelle che si riferiscono ad altre
		}
		return cont;
	}

	/**
	 * Verifica se la frase è la continuazione di una frase precedente
	 * @param {String[]} phraseA frase da confrontare (fissa)
	 * @param {String[]} phraseB frase oggetto del confronto (la prima non continuation)
	 * @returns true è una continuazione, false se no
	 */
	static checkSimilarity(phraseA, phraseB) {
		const match = TextMiner.comparePhrasePhrase(phraseA, phraseB); // decide su quale frase
		// calcolare la somiglianza
		const phraselength = Math.max(phraseA.length, phraseB.length);
		const similarity = (match) / phraselength;
		if (similarity >= MINIMUM_SIMILARITY) return true; // percentuale da testare
		return false;
	}

	/**
	 * Conta il numero di stringhe in comune tra una frase e un array di parole significative
	 * @param {String[]} phrase frase da confrontare
	 * @param {String} wordsdata Array di parole significative
	 * @param {Json} contenente il testo taggato con il tipo sintattico
	 * @return array contente il numero di uguaglianze e il numero di "non" uguaglianze
	 */
	static comparePhraseArray(phrase, wordsdata) {
		const result = { pos: 0, neg: 0 };
		for (let i = 0; i < phrase.length; i += 1) {
			for (let j = 0; j < wordsdata.length; j += 1) {
				if (phrase[i].word.toLowerCase() === wordsdata[j]) {
					if (i !== 0 && TextMiner.findNon(phrase, i - 1)) result.neg += 1;
					// conta le negazioni di parole
					else result.pos += 1; // conta le parole se uguali
				}
			}
		}
		return result;
	}

	/**
	 * Conta il numero di stringhe in comune tra due frasi
	 * @param {String[]} arrayA frase da confrontare
	 * @param {String[]} arrayB frase oggetto del confronte
	 * @return numero di uguaglianze
	 */
	static comparePhrasePhrase(arrayA, arrayB) {
		let cont = 0;
		for (let i = 0; i < arrayA.length; i += 1) {
			for (let j = 0; j < arrayB.length; j += 1) {
				if (arrayA[i].word === arrayB[j].word) {
					const nonA = TextMiner.findNon(arrayA, i - 1);
					const nonB = TextMiner.findNon(arrayB, j - 1);
					if ((nonA && nonB) || (!nonA && !nonB)) cont += 1;
					// perchè due parole siano uguali devono avere entrambe la negazione o nessuna delle due
				}
			}
		}
		return cont;
	}

	/**
	 * Controlla se una parola è preceduta da un "non"
	 * @param {String[]} array frase controllare
	 * @param {Integer} index indice della parola
	 * @param {Json} contenente il testo taggato con il tipo sintattico
	 * @return true se la parola è preceduta da non, false viceversa
	 */
	static findNon(array, index) {
		let non = false;
		for (let i = index; i >= 0 && array[i].tag !== 'NOUN' && array[i].tag !== 'VERB' && !non; i -= 1) {
			if (array[i].word === 'non') non = true;
		}
		return non;
	}

	/**
	 * Assegna un punteggio a ciascuna frase in base ai match con le parole importanti
	 * ottenute da LDA
	 * @param {String[]} vipwords parole importanti (LDA)
	 * @return punteggio della frase
	 */
	scoreAssignment(vipwords) {
		for (let i = 0; i < this.phrases.length; i += 1) { // scorre le frasi
			const type = this.phrasetype[i];
			if (type !== PhraseTypes.IGNORE) {
				const words = this.phrases[i];
				let score = 0;
				for (let j = 0; j < words.length; j += 1) { // scorre le parole
					for (let k = 0; k < vipwords.length; k += 1) { // scorre le vipwords
						const wordscore = TextMiner.evaluateWord(vipwords[k], words, j); // assegna il punteggio
						score += wordscore;
						// corretto alla parola importante trovata
					}
				}
				if (type !== PhraseTypes.CONTINUATION) {
					score += 1; // base punteggio frasi principali
					for (let j = i + 1; j < this.phrases.length &&
						this.phrasetype[j] === PhraseTypes.CONTINUATION; j += 1) {
						score *= 1.1; // aumenta il punteggio in base alla lunghezza (calcolo da testare)
					}
				}
				this.phrasescore[i] = TextMiner.cutScore(score);
			} else this.phrasescore[i] = 0;
		}
	}

	static cutScore(score) {
		let newscore = score;
		if (score > MAXSCORE * SCOREMULTIPLIER) newscore = MAXSCORE * SCOREMULTIPLIER;
		newscore /= SCOREMULTIPLIER;
		return Number((newscore).toFixed(1));
	}

	/**
	 * Trasforma l'output del LDA in un array di parole
	 * @param {String[]}  wordscollection importanti (LDA)
	 * @return array delle parole importanti
	 */
	static ldaToWords(wordscollection) {
		const words = [];
		for (let i = 0; i < wordscollection.length; i += 1) {
			const row = wordscollection[i];
			for (let j = 0; j < row.length; j += 1) {
				const element = row[j];
				words.push(element.term);
			}
		}
		return words;
	}
	/**
	 * Assegna un punteggio alla parola della frase in base a vipword
	 * @param {String} vipword parola importante che si vuole confrontare con phrase[index]
	 * @param {JSON[]} phrase da controllare
	 * @param {Integer} index indice della parola nella frase
	 * @returns punteggio della parola
	 */
	static evaluateWord(vipword, phrase, index) {
		if (vipword !== phrase[index].word)	return 0; // se sono diverse nessun punto
		let trovato = 0;
		if (index !== 0) {
			for (let i = 0; i < pwords.IT.length && trovato === 0; i += 1) { // controllo
				// se la parola precedente a phrase[index] è un accrescitivo
				if (pwords.IT[i] === phrase[index - 1].word) trovato = 1;
			}
		}
		return 1 + (0.5 * trovato);
	}

	// ritorna le frasi
	getPhrases() {
		return this.phrases;
	}

	// ritorna le tipologie
	getPhraseType() {
		return this.phrasetype;
	}

	// ritorna i punteggi
	getPhraseScore() {
		return this.phrasescore;
	}

	/**
	 * Ottieni i risultati del text-mining.
	 * @return {{ results: [{ name: String, type: String, score: Number , text: String}]}}
	 */
	getResultToJson() {
		return {
			results: this.phrasetype.map((val, i) => ({
				name: this.phrasename[i],
				type: this.phrasetype[i],
				score: this.phrasescore[i],
				text: this.transcription[i],
			})),
		};
	}

	getProblems() {
		const problems = [];
		for (let i = 0; i < this.phrases.length; i += 1) {
			if (this.phrasetype[i] === PhraseTypes.PROBLEM) {
				const data = {
					name: this.phrasename[i],
					type: this.phrasetype[i],
					text: this.transcription[i],
					score: this.phrasescore[i],
					phrase: this.phrases[i],
				};
				problems.push(data);
			}
		}
		return TextMiner.phrasededuplicator(problems.concat(this.problems));
	}

	static phrasededuplicator(array) {
		const deduplicatearray = [];
		for (let i = 0; i < array.length; i += 1) {
			const found = deduplicatearray.find((x) => {
				const match = TextMiner.comparePhrasePhrase(x.phrase, array[i].phrase);
				return (match / Math.max(x.phrase.length, array[i].phrase.length)) >= MINIMUM_EQUALITY;
			});
			if (!found) deduplicatearray.push(array[i]);
		}
		return deduplicatearray;
	}
}
module.exports = TextMiner;
