/**
 * @file Commando per rifare la transcrizione ed il text-mining di una registrazione.
 * Data Creazione: 2018-04-12.
 *
 * @version 0.0.2
 * @author	Tommaso Sotte
 * @author	Paolo Rizzardo
 */

const Command = require('./Command');
const SpeechToTextStep = require('./SpeechToTextStep');
const TextMiningStep = require('./TextMiningStep');

class RedoTranscriptionCommand extends Command {
	constructor(recording, project) {
		super();
		this.recording = recording;
		this.project = project;
	}

	/**
	 * Effetua la trascrizione di una registrazione audio e con il testo
	 * ottenuto elabora il text-mining.
	 * @return {Promise}
	 */
	async execute() {
		const speechToText = new SpeechToTextStep(this.recording, this.project);
		await speechToText.execute();

		const textMining = new TextMiningStep(this.recording, this.project);
		await textMining.execute();
	}
}

module.exports = RedoTranscriptionCommand;
