/**
 * @file Step del text-mining
 * Data Creazione: 2018-04-05.
 *
 * @version 0.0.2
 * @author  Giacomo Del Moro
 * @author  Alessandro Zangari
 * @author  Tommaso Sotte
 * @author  Paolo Rizzardo
 */

const logger = require('../utility/logger');
const Step = require('./Step');
const ProcessStateSetting = require('../model/enum/ProcessStateSetting');
const TextMiner = require('../tm/TextMiner');
const naturalLanguange = require('../gcp/NaturalLanguage');

const baseLanguageRequest = {
	document: {
		type: 'PLAIN_TEXT',
		content: '',
		// NOTE: si può specificare la lingua; nostro target è misto fra EN/IT
	},
	encodingType: 'NONE',
};

class TextMiningStep extends Step {
	constructor(recording, project) {
		super(ProcessStateSetting.TEXTMINED, recording);
		this.project = project;
	}

	/**
	 * Effettua l'analisi del testo lemmatizzato con l'ausilio dei tag
	 * ottenuti da Google Natural Language.
	 * @return {Promise<{ results: [] }>} da {@link TextMiner#getResultToJson}
	 */
	async run() {
		// => [0: { tokens: [{}], language }]
		const results = await naturalLanguange
			.analyzeSyntax({
				...baseLanguageRequest,
				document: {
					...baseLanguageRequest.document,
					content: this.recording.transcript || '',
				},
			});

		const { tokens } = results[0];
		// [{ partOfSpeech: { tag } }] => [tag]
		const tokenstags = tokens.map(token => token.partOfSpeech.tag);

		const text = tokens
			.map(token => token.text.content)
			.join(' ');

		const lemmatizedtext = tokens
			.map(token => token.lemma)
			.join(' ');

		const names = this.project.collaborators.map(c => c.name);

		const textminer = new TextMiner({
			names,
			lemmatizedtext,
			keywords: this.project.keywords,
			taggedtext: tokenstags,
			transcription: text,
			problems: this.project.openProblems,
		});

		textminer.textMining();

		logger.debug('TextMiningStep#mine completed.');
		this.recording.textMining = textminer.getResultToJson();

		this.project.openProblems = textminer.getProblems().map(phrase => ({
			...phrase,
			recordingId: phrase.recordingId || this.recording.id || this.recording.entityKey.id,
		}));

		await this.project.save();
	}
}

/**
 * Ritorna true se token può essere un verbo radice della frase,
 *  altrimenti false
 */
/*
function isRoot(tokens, index) {
	const token = tokens[index];
	return token.dependencyEdge.label === 'ROOT' ||
	(token.partOfSpeech.tag === 'VERB' && (
		token.dependencyEdge.label === 'CONJ' ||
		token.dependencyEdge.label === 'PARATAXIS' ||
		token.dependencyEdge.label === 'VMOD' ||
		token.dependencyEdge.label === 'CCOMP' ||
		token.dependencyEdge.label === 'RCMOD' ||
		(index > 0 && tokens[index - 1].dependencyEdge.label === 'AUX')
	));
} */

/**
 * Ritorna true se tokens[index] dipende da tokens[root],
 *  altrimenti false
 *  PRE = frase è un array di indici che dipendono dalla radice della frase,
 *  e contiene almeno la radice
 */
/*
function dependsOn(tokens, index, root) {
	let i = tokens[index].dependencyEdge.headTokenIndex;
	let otherRoot = isRoot(tokens, i);
	while (i !== root && !otherRoot) {
		console.log('Errore', i, otherRoot);
		i = tokens[i].dependencyEdge.headTokenIndex;
		otherRoot = isRoot(tokens, i);
		console.log('Ciao!', i, otherRoot);
	}
	return i === root;
} */
// POST = ritorna true se tokens[index] ha una dipendenza da una parola il cui indice
// è contenuto in frase[].


/* VECCHIA FUNZIONE RICORSIVA
const father = tokens[index].dependencyEdge.headTokenIndex;
if (frase.includes(father)) {
	frase.push(index);
	return true;
}

const depends = dependsOn(tokens, father);
console.log(`Dipende da ${father}?`, depends);
// POST = true => tokens[father] ha una dipendenza da una parola in frase[]
// 								e 'father' è stato inserito nell'array frase[]
// 				false => non ha una dipendenza e non è stato inserito
if (depends) {
	frase.push(index);
	return true;
}
return false;
FINE VECCHIA FUNZIONE */


/**
 *  Splitta l'array di token in frasi sulla base
 *  delle dipendenze lessicali
 */
/*
function recogniseSentence(tokens) {
	console.log('Sono esntrato nella funz');
	let i = 0;
	const newTokens = []; // = JSON.parse(JSON.stringify(tokens)); // deep copy
	while (i < tokens.length) {
		newTokens.push(tokens[i]);
		if (isRoot(tokens, i)) {
			console.log('Is root');
			const root = i;
			let done = false;

			i += 1;
			for (; !done && i < tokens.length; i += 1) {
				newTokens.push(tokens[i]);
				console.log('!done 1 < lenght');
				if (!dependsOn(tokens, i, root)) {
					done = true;
					if (tokens[i - 1].dependencyEdge.label === 'CC') {
						newTokens.splice(i - 1, 1, {
							text: {
								content: '.',
								beginOffset: null,
							},
							partOfSpeech: null,
							dependencyEdge: null,
							lemma: null,
						});
					} else {
						newTokens.push({
							text: {
								content: '.',
								beginOffset: null,
							},
							partOfSpeech: null,
							dependencyEdge: null,
							lemma: null,
						});
					}
					// console.log(tokens);
				}
			} // end for
		} // end if
		i += 1;
	} // end while
	return newTokens;
} */

module.exports = TextMiningStep;
