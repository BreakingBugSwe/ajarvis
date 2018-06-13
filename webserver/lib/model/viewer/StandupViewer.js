/**
 * @file	Viewer di uno standup; utile per le views.
 * Data creazione: 2018-05-20
 * @version	0.0.1
 * @author	Tommaso Sotte
 */

/**
 * @typedef {{ text, name, type, score, recordingId, date }} Phrase
 */

// const PhraseTypes = require('../../tm/PhraseTypes');

/**
 * Classe per visualizzare una registrazione e il risultato del text-mining di
 * uno standup.
 * @see {@link lib/model/RecordingModel}
 * @see {@link lib/tm/TextMiner}
 */
class StandupViewer {
	/**
	 * [constructor description]
	 * @param {RecordingEntity|RecordingModel} recording
	 */
	constructor(recording) {
		this.id = recording.id || recording.entityKey.id;
		this.recording = recording;
		this.textMining = recording.textMining || { results: [] };

		/**
		 * [phrases description]
		 * @type {[Phrase]}
		 */
		this.phrases = this.textMining.results.map(phrase => ({
			...phrase,
			recordingId: this.id,
			date: this.recording.dateCreation,
		}));
	}

	/**
	 * [filterPhrases description]
	 * @param  {String} type PhraseTypes
	 * @return {[Phrase]}
	 */
	filterPhrases(type) {
		return this.phrases.filter(frase => frase.type === type);
	}

	getUniqueAuthors() {
		const authors = this.phrases
			.filter(frase => !!frase.name)
			.map(frase => frase.name);

		return [...(new Set(authors))];
	}
}

module.exports = StandupViewer;
