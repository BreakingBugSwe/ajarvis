/**
 * @file	Trash del RecordingModel
 * Data Creazione:  2018-05-19
 *
 * @version	0.0.2
 * @author	Tommaso Sotte
 */

const logger = require('../utility/logger');
const Trash = require('./Trash');
const RecordingModel = require('./RecordingModel');
const recordingBucket = require('../gcp/RecordingBucket');

class RecordingTrash extends Trash {
	constructor() {
		super(RecordingModel);
	}

	/**
	 * Cancella una registrazione e il suo file audio associato.
	 * @param  {Number|String}  recId
	 * @return {Promise}
	 */
	async delete(id) {
		const ids = !Array.isArray(id) ? [id] : id;
		if (ids.length) logger.info('Deleting recordings', ids.join(', '));
		else logger.info('No recordings to be deleted.');

		// Cancella tutti gli id
		await Promise.all(ids.map(async (recId) => {
			const recording = await RecordingModel.get(recId);
			// Elimina il file audio associato al recording
			await recordingBucket.delete(recording.filename);

			// Infine cancella la registrazione
			await super.delete(recId);
		}));
	}
}

module.exports = new RecordingTrash();
