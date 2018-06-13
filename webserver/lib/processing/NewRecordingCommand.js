/**
 * @file Commando per la creazione e processamento di una nuova registrazione.
 * Data Creazione: 2018-04-12.
 *
 * @version 0.0.1
 * @author	Tommaso Sotte
 * @author	Paolo Rizzardo
 */

const Command = require('./Command');
const SaveStorageStep = require('./SaveStorageStep');
const SpeechToTextStep = require('./SpeechToTextStep');
const TextMiningStep = require('./TextMiningStep');
// const RecordingModel = require('../model/RecordingModel');

class NewRecordingCommand extends Command {
	constructor(recording, project) {
		super();
		this.recording = recording;
		this.project = project;
	}

	/**
	 * Salva la registrazione su storage, dopodichè effettua la trascrizione
	 * dell'audio e con il testo ottenuto elabora il text-mining.
	 * @return {Promise}
	 */
	async execute() {
		const saveStorage = new SaveStorageStep(this.recording);
		await saveStorage.execute();

		const speechToText = new SpeechToTextStep(this.recording, this.project);
		await speechToText.execute();

		const textMining = new TextMiningStep(this.recording, this.project);
		await textMining.execute();
	}
}

module.exports = NewRecordingCommand;
