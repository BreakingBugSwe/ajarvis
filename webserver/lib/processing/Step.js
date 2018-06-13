/**
 * @file Step del processo del recording.
 * Data creazione: 2018-05-02.
 * @version 0.0.2
 * @author	Tommaso Sotte
 */

const logger = require('../utility/logger');
const ProcessStateSetting = require('../model/enum/ProcessStateSetting');

class Step {
	/**
	 * [constructor description]
	 * @param {[type]} state     [description]
	 * @param {[type]} recording [description]
	 */
	constructor(state, recording) {
		if (!Object.keys(ProcessStateSetting).includes(state)) {
			throw new Error(`State '${state}' is not a valid process state`);
		}

		this.state = state;
		this.recording = recording;
	}

	/* eslint-disable-next-line */
	async run() {
		throw new Error('abstract');
	}

	// Template method
	async execute() {
		logger.debug(`Executing step ${this.constructor.name} for standup:
\t${this.recording.dateCreation} (${this.recording.entityKey.id})`);
		await this.run();

		this.recording.processState = this.state;
		await this.recording.save();
		logger.debug(`[${this.recording.entityKey.id} => '${this.state}']`);
	}
}

module.exports = Step;
