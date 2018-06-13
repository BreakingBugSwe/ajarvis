/**
 * @file Commando per eseguire il text-mining di una registrazione.
 * Data Creazione: 2018-04-12.
 *
 * @version 0.0.2
 * @author	Tommaso Sotte
 * @author	Paolo Rizzardo
 */

const Command = require('./Command');
const TextMiningStep = require('./TextMiningStep');

class TextMiningCommand extends Command {
	constructor(recording, project) {
		super();
		this.recording = recording;
		this.project = project;
	}

	/**
	 * Elabora il text-mining dal testo di un recording.
	 * @return {Promise}
	 */
	async execute() {
		const textMining = new TextMiningStep(this.recording, this.project);

		await textMining.execute();
		this.project.openproblems = this.recording.openproblems;
	}
}

module.exports = TextMiningCommand;
