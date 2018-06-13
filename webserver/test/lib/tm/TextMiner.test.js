const TextMiner = require('../../../lib/tm/TextMiner');
const lda = require('../../../lib/lda/lib/lda'); // Libreria di LDA
const logger = require('../../../lib/utility/logger');

jest.mock('../../../lib/utility/logger');

describe('constructor', () => {
	it('empty transcription', () => {
		expect(() => new TextMiner()).toThrow();
	});
});

describe('deduplicatearray', () => {
	it('deduplicate an array', () => {

	});
});

describe('splitPhrases', () => {
	it('split a document', () => {
		const taggedtext = ['NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB'];
		const prova = [
			[{ tag: 'NOUN', word: 'Ciao' }, { tag: 'VERB', word: 'sono' }, { tag: 'VERB', word: 'Giuseppe' }],
			[{ tag: 'VERB', word: 'Il' }, { tag: 'NOUN', word: 'sole' }, { tag: 'VERB', word: 'è' }, { tag: 'VERB', word: 'blu' }],
		];

		expect(TextMiner.splitPhrases('Ciao sono Giuseppe.Il sole è blu', taggedtext)).toEqual(prova);
	});
});

describe('phraseByName', () => {
	it('assigns every phrase to the person who said it', () => {
		const taggedtext = ['NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB'];
		const doc = 'Mario oggi avere problema database.problema database essere male indicizzato.Giuseppe finire test sistema.risolvere bug codice';
		const names = ['Mario', 'Gianfrancioschio', 'Giuseppe'];
		const textminer = new TextMiner({
			lemmatizedtext: doc,
			taggedtext,
			names,
			transcription: 'test',
		});

		textminer.phraseByName();

		expect(textminer.phrasename[1]).toEqual('Mario');
		expect(textminer.phrasename[2]).toEqual('Giuseppe');
		expect(textminer.phrases[0].length).toEqual(5);
	});
});

describe('findNot', () => {
	it('find not in a phrase', () => {
		const taggedtext = ['NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB'];
		const taggedtext2 = ['NOUN', 'VERB', 'NOUN', 'VERB', 'NOUN'];
		const prova = 'Oggi non ho avuto problemi';
		const textminer = new TextMiner({
			lemmatizedtext: prova,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer2 = new TextMiner({
			lemmatizedtext: prova,
			taggedtext: taggedtext2,
			names: [],
			transcription: 'test',
		});

		const frase = textminer.getPhrases();
		const frase2 = textminer2.getPhrases();

		expect(TextMiner.findNon(frase[0], 3)).toEqual(false);
		expect(TextMiner.findNon(frase2[0], 3)).toEqual(false);
	});
});

describe('comparePhraseArray', () => {
	it('compare phrase to an array', () => {
		const array = ['impedimento', 'problemi'];
		const result1 = { pos: 1, neg: 0 };
		const result2 = { pos: 1, neg: 0 };
		const taggedtext = ['NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB'];
		const phrase1 = 'Oggi non ho avuto problemi';
		const phrase2 = 'Oggi ho avuto problemi';
		const textminer = new TextMiner({
			lemmatizedtext: phrase1,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer2 = new TextMiner({
			lemmatizedtext: phrase2,
			taggedtext,
			names: [],
			transcription: 'test',
		});

		const frase1 = textminer.getPhrases();
		const frase2 = textminer2.getPhrases();

		expect(TextMiner.comparePhraseArray(frase1[0], array)).toEqual(result1);
		expect(TextMiner.comparePhraseArray(frase2[0], array)).toEqual(result2);
	});
});

describe('identify', () => {
	it('identifies the type of the phrase', () => {
		const taggedtext = ['NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB'];
		const phrase1 = 'Oggi non ho avuto problema';
		const phrase2 = 'Oggi ho avuto problema';
		const phrase3 = 'Oggi ho fare database';
		const phrase4 = 'Oggi ho risolvere problema';
		const textminer1 = new TextMiner({
			lemmatizedtext: phrase1,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer2 = new TextMiner({
			lemmatizedtext: phrase2,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer3 = new TextMiner({
			lemmatizedtext: phrase3,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer4 = new TextMiner({
			lemmatizedtext: phrase4,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const frase1 = textminer1.getPhrases();
		const frase2 = textminer2.getPhrases();
		const frase3 = textminer3.getPhrases();
		const frase4 = textminer4.getPhrases();

		expect(TextMiner.identify(frase1[0])).toEqual('p');
		expect(TextMiner.identify(frase2[0])).toEqual('p');
		expect(TextMiner.identify(frase3[0])).toEqual('cp');
		expect(TextMiner.identify(frase4[0])).toEqual('pc');
	});
});

describe('comparePhrasePhrase', () => {
	it('find the words in common between two phrases', () => {
		const taggedtext = ['NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB'];
		const phrase1 = 'Oggi ho avuto problema database';
		const phrase2 = 'problema database male indicizzato';
		const phrase3 = 'Oggi non ho avuto problema';
		const phrase4 = 'Oggi ho avuto problema';
		const textminer1 = new TextMiner({
			lemmatizedtext: phrase1,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer3 = new TextMiner({
			lemmatizedtext: phrase3,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer2 = new TextMiner({
			lemmatizedtext: phrase2,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer4 = new TextMiner({
			lemmatizedtext: phrase4,
			taggedtext,
			names: [],
			transcription: 'test',
		});

		const frase1 = textminer1.getPhrases();
		const frase2 = textminer2.getPhrases();
		const frase3 = textminer3.getPhrases();
		const frase4 = textminer4.getPhrases();

		expect(TextMiner.comparePhrasePhrase(frase1[0], frase2[0])).toEqual(2);
		expect(TextMiner.comparePhrasePhrase(frase3[0], frase4[0])).toEqual(4);
	});
});

describe('checkSimilarity', () => {
	it('verifies that two phrases are about the same problem ', () => {
		const taggedtext = ['NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB'];
		const phrase1 = 'Oggi ho avuto problema database';
		const phrase2 = 'problema database male indicizzato';
		const phrase3 = 'Oggi non ho avuto problema';
		const textminer1 = new TextMiner({
			lemmatizedtext: phrase1,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer2 = new TextMiner({
			lemmatizedtext: phrase2,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer3 = new TextMiner({
			lemmatizedtext: phrase3,
			taggedtext,
			names: [],
			transcription: 'test',
		});

		const frase1 = textminer1.getPhrases();
		const frase2 = textminer2.getPhrases();
		const frase3 = textminer3.getPhrases();

		expect(TextMiner.checkSimilarity(frase1[0], frase2[0])).toEqual(true);
		expect(TextMiner.checkSimilarity(frase1[0], frase3[0])).toEqual(true);
	});
});

describe('checkContinuity', () => {
	it('Verifies if a phrase talks about the same event of the one before it', () => {
		const taggedtext = ['NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB',	'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB', 'VERB'];
		const phrases1 = 'Oggi ho avuto problema database.problema database male indicizzato';
		const phrases2 = 'Oggi ho avuto problema database.database male indicizzato.problema memoria troppo piccola';
		const textminer1 = new TextMiner({
			lemmatizedtext: phrases1,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer2 = new TextMiner({
			lemmatizedtext: phrases2,
			taggedtext,
			names: [],
			transcription: 'test',
		});

		textminer1.phrasetype.push('p');
		textminer1.phrasetype.push('cp');
		textminer1.phrasetype.push('p');
		textminer2.phrasetype.push('p');
		textminer2.phrasetype.push('cp');
		textminer2.phrasetype.push('p');

		expect(textminer1.checkContinuity(1, 'p')).toEqual('cp');
		expect(textminer2.checkContinuity(2, 'p')).toEqual('p');
	});
});

describe('topicsNumber', () => {
	it('Counts the number of topics', () => {
		const phrasetypes = ['p', 'cp', 'p', 'p', 'cp', 'no'];

		expect(TextMiner.topicsNumber(phrasetypes)).toEqual(3);
	});
});

describe('typeAnalysis', () => {
	it('Divides the events based on the context ', () => {
		const taggedtext = ['VERB', 'VERB', 'NOUN', 'NOUN', 'NOUN', 'NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB'];
		const doc1 = 'oggi avere problema database.problema database essere male indicizzato';
		const doc2 = 'oggi avere problema database.problema database essere male indicizzato.finire test sistema.risolvere bug codice';
		const result1 = ['p', 'cp'];
		const result2 = ['p', 'cp', 'tc', 'pc'];
		const textminer1 = new TextMiner({
			lemmatizedtext: doc1,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer2 = new TextMiner({
			lemmatizedtext: doc2,
			taggedtext,
			names: [],
			transcription: 'test',
		});

		expect(textminer1.typeAnalysis()).toEqual(1);
		expect(textminer1.phrasetype).toEqual(result1);
		expect(textminer2.typeAnalysis()).toEqual(3);
		expect(textminer2.phrasetype).toEqual(result2);
	});
});

describe('resolveProblems', () => {
	it('matching problems to solutions ', () => {
		const taggedtext = ['VERB', 'VERB', 'NOUN', 'NOUN', 'NOUN', 'NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB'];
		const doc1 = 'oggi avere problema database.problema database essere male indicizzato.risolvere bug codice';
		const doc2 = 'risolvere problema database.sistemare indicizzazione database.completare riconoscimento vocale';
		const doc3 = 'risolvere bug codice.risolvere problema database';
		const doc4 = 'risolvere bug codice.mangiare bene trattoria.sistemare indicizzazione database';
		const problems1 = [
			{ phrase: [{ word: 'problema', tag: '' }, { word: 'bug', tag: '' }, { word: 'codice', tag: '' }] },
		];
		const problems2 = [
			{ phrase: [{ word: 'avere', tag: '' }, { word: 'problema', tag: '' }, { word: 'database', tag: '' }] },
			{ phrase: [{ word: 'avere', tag: '' }, { word: 'problema', tag: '' }, { word: 'indicizzazione', tag: '' }, { word: 'database', tag: '' }] },
		];
		const problems3 = [
			{ phrase: [{ word: 'avere', tag: '' }, { word: 'problema', tag: '' }, { word: 'database', tag: '' }] },
			{ phrase: [{ word: 'avere', tag: '' }, { word: 'problema', tag: '' }, { word: 'indicizzazione', tag: '' }, { word: 'database', tag: '' }] },
		];
		const problems4 = [
			{ phrase: [{ word: 'avere', tag: '' }, { word: 'problema', tag: '' }, { word: 'database', tag: '' }] },
			{ phrase: [{ word: 'avere', tag: '' }, { word: 'problema', tag: '' }, { word: 'indicizzazione', tag: '' }, { word: 'database', tag: '' }] },
		];
		const textminer1 = new TextMiner({
			lemmatizedtext: doc1,
			taggedtext,
			names: [],
			transcription: 'test',
			keywords: [],
			problems: problems1,
		});
		const textminer2 = new TextMiner({
			lemmatizedtext: doc2,
			taggedtext,
			names: [],
			transcription: 'test',
			keywords: [],
			problems: problems2,
		});
		const textminer3 = new TextMiner({
			lemmatizedtext: doc3,
			taggedtext,
			names: [],
			transcription: 'test',
			keywords: [],
			problems: problems3,
		});
		const textminer4 = new TextMiner({
			lemmatizedtext: doc4,
			taggedtext,
			names: [],
			transcription: 'test',
			keywords: [],
			problems: problems4,
		});

		textminer1.textMining();
		textminer2.textMining();
		textminer3.textMining();
		textminer4.textMining();

		expect(textminer1.problems).not.toContain({ phrase: [{ word: 'problema', tag: '' }, { word: 'bug', tag: '' }, { word: 'codice', tag: '' }] });
		expect(textminer2.problems.length).toEqual(0);
		expect(textminer3.problems).not.toContain([{ word: 'avere', tag: '' }, { word: 'problema', tag: '' }, { word: 'database', tag: '' }]);
		expect(textminer3.problems).toEqual([{ phrase: [{ word: 'avere', tag: '' }, { word: 'problema', tag: '' }, { word: 'indicizzazione', tag: '' }, { word: 'database', tag: '' }] }]);
		expect(textminer4.problems).not.toContain([{ word: 'avere', tag: '' }, { word: 'problema', tag: '' }, { word: 'indicizzazione', tag: '' }, { word: 'database', tag: '' }]);
		expect(textminer4.problems).toEqual([{ phrase: [{ word: 'avere', tag: '' }, { word: 'problema', tag: '' }, { word: 'database', tag: '' }] }]);
	});
});

describe('ldaToWords', () => {

    it('Transforms the LDA output in an array', () => {
		let doc = 'oggi avere problema database.problema database essere male indicizzato. finire test sistema.risolvere bug codice';
		doc = doc.match(/[^.!?]+[.!?]+/g);

		const result = lda(doc, 3, 2, null, null, null, 100);

		expect(TextMiner.ldaToWords(result)).toContain('problema');
		expect(TextMiner.ldaToWords(result)).toContain('test');
	});

	it('LDA analysis', () => {
		let doc = 'oggi avere problema database.problema database essere male indicizzato. finire test sistema.risolvere bug codice';
		doc = doc.match(/[^.!?]+[.!?]+/g);

		const result = lda(doc, 3, 2, null, null, null, 100);

		expect(TextMiner.ldaToWords(result)).toContain('problema');
	});
});

describe('addKeywords', () => {
	it('Find if the user keywords are added to the LDA array ', () => {
		const taggedtext = ['VERB', 'VERB', 'NOUN', 'NOUN', 'NOUN', 'NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB'];
		const doc1 = 'oggi avere problema database.problema database essere male indicizzato';
		const textminer1 = new TextMiner({
			lemmatizedtext: doc1,
			taggedtext,
			names: [],
			transcription: 'test',
			keywords: ['good', 'bad'],
		});

		const result = textminer1.addKeywords(['problema', 'database', 'good']);

		expect(result).toContain('bad');
	});
});

describe('evaluateWord', () => {
	it('Assignes the correct score for a VIP word, based on the context', () => {
		const phrase1 = [{ word: 'Oggi', tag: '' }, { word: 'ho', tag: '' }, { word: 'problema', tag: '' }, { word: 'database', tag: '' }];
		const phrase2 = [{ word: 'Oggi', tag: '' }, { word: 'ho', tag: '' }, { word: 'male', tag: '' }, { word: 'problema', tag: '' }, { word: 'database', tag: '' }];
		const vipword = 'problema';

		expect(TextMiner.evaluateWord(vipword, phrase1, 2)).toEqual(1);
		expect(TextMiner.evaluateWord(vipword, phrase2, 3)).toEqual(1.5);
	});
});

describe('scoreAssignment', () => {
	it('Phrase score', () => {
		const taggedtext = ['VERB', 'VERB', 'NOUN', 'NOUN', 'NOUN', 'NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB'];
		const doc1 = 'oggi avere male problema database.problema database essere male indicizzato';
		const doc2 = 'oggi avere problema database.problema database essere male indicizzato.finire test sistema.risolvere bug codice';
		const vipwords = ['problema', 'database', 'scadenza'];
		const textminer1 = new TextMiner({
			lemmatizedtext: doc1,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		const textminer2 = new TextMiner({
			lemmatizedtext: doc2,
			taggedtext,
			names: [],
			transcription: 'test',
		});
		textminer1.typeAnalysis();
		textminer2.typeAnalysis();
		textminer1.scoreAssignment(vipwords);
		textminer2.scoreAssignment(vipwords);

		expect(textminer1.phrasescore[0]).toBeGreaterThan(0);
		expect(textminer1.phrasescore[0]).toBeGreaterThan(0);
	});
});

describe('textMining', () => {
	it('Textmining', () => {
		const taggedtext = ['VERB', 'VERB', 'NOUN', 'NOUN', 'NOUN', 'NOUN', 'VERB', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'NOUN', 'VERB', 'VERB', 'VERB', 'VERB'];
		const doc = 'Mario oggi avere problema database.problema database essere male indicizzato.Giuseppe finire test sistema.risolvere bug codice';
		const names = ['Mario', 'Gianfrancioschio', 'Giuseppe'];
		const textminer = new TextMiner({
			lemmatizedtext: doc,
			taggedtext,
			names,
			transcription: 'test',
		});

		textminer.textMining();

		expect(textminer.phrasetype.length).toEqual(4);
		expect(textminer.phrasescore.length).toEqual(4);
		expect(textminer.phrasename[3]).toEqual('Giuseppe');
	});
});


describe('TextMiner', () => {
	const transcription = 'test';
	const taggedtext = ['NOUN', 'nn', 'NOUN', 'NOUN', 'NOUN', 'NOUN', 'NOUN', 'nn', 'NOUN', 'NOUN', 'NOUN', 'nn', 'NOUN', 'NOUN', 'nn', 'NOUN',
		'NOUN', 'NOUN', 'NOUN', 'nn', 'nn', 'nn', 'NOUN', 'nn', 'nn', 'NOUN', 'NOUN', 'nn', 'nn', 'nn', 'NOUN', 'nn', 'nn', 'NOUN', 'NOUN', 'NOUN',
		'nn', 'NOUN', 'NOUN', 'nn', 'nn', 'NOUN', 'NOUN', 'NOUN', 'nn',	'nn', 'NOUN']; // 47
	const lemmatizedtext = 'dindo.finire logo progetto.vincere partita playstation.passare parola mario.mario.completare integrazione database.fallire integrazione librerie javascript.programma usare troppo vecchio.giuseppe.non completare ripristino dati corrotti.trovare quantità dati maggiore previsto.paolo.route view sistemare.pattern mvc non adattare progetto.gui progetto troppo complicato mvc';
	const names = ['dindo', 'mario', 'paolo', 'giuseppe'];

	// Getters
	it('Getters', () => {
		const textminer = new TextMiner({
			lemmatizedtext,
			taggedtext,
			names,
			transcription,
		});
		textminer.textMining();
		expect(textminer.getTaggedText()).toEqual(taggedtext);
		expect(textminer.getPhraseType()).toEqual(['no', 'tc', 'cp', 'cp', 'cp', 'tc', 'p', 'cp', 'cp', 'p', 'tc', 'cp', 'pc', 'p', 'cp']);
		expect(textminer.getPhraseScore()).toEqual([0, 1.1, 0.5, 0.9, 0.7, 1.5, 1.2, 1,
			0.3, 1.9, 0.9, 0.3, 0.7, 1.2, 0.7]);
		expect(textminer.getPhrases()).toEqual(textminer.phrases);
	});

	// Test textMining
	it('More complex textMining', () => {
		const textminer = new TextMiner({
			lemmatizedtext,
			taggedtext,
			names,
			transcription,
		});
		textminer.textMining();

		expect(textminer.phrasetype.length).toEqual(15);
		expect(textminer.phrasescore.length).toEqual(15);
	});

	// test getResultToJson
	it('Text mining conversion into JSON', () => {
		const textminer = new TextMiner({
			lemmatizedtext,
			taggedtext,
			names,
			transcription,
		});
		textminer.textMining();

		const result = textminer.getResultToJson();
		expect(result.results.length).toEqual(textminer.phrasetype.length);
	});

	// test getProblems
	it('Returning problem phrases', () => {
		const textminer = new TextMiner({
			lemmatizedtext,
			taggedtext,
			names,
			transcription,
		});
		textminer.textMining();

		const result = textminer.getProblems();
		expect(result.length).toEqual(3);
	});
});
