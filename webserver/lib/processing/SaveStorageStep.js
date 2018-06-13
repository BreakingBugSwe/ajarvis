/**
 * @file Step del salvataggio di una registrazione su Storage.
 * Data Creazione: 2018-04-05.
 *
 * @version 0.0.3
 * @author  Giacomo Del Moro
 * @author	Alessandro Zangari
 * @author	Tommaso Sotte
 * @author	Paolo Rizzardo
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utility/logger');

const env = require('../../env');
const Step = require('./Step');
const ProcessStateSetting = require('../model/enum/ProcessStateSetting');
const recordingStorage = require('../gcp/RecordingBucket');

class SaveStorageStep extends Step {
	constructor(recording) {
		super(ProcessStateSetting.UPLOADED, recording);
	}

	/**
	 * Salva il file audio della registrazione, caricandolo dalla cartella
	 * di upload.
	 * @return {Promise}
	 */
	async run() {
		await recordingStorage.upload(this.recording.filename);

		// Una volta andata a buon fine l'upload del file su Storage è possibile
		// cancellare il file locale.
		const filepath = path.join(env.uploads.dir, this.recording.filename);

		fs.unlink(filepath, (err) => {
			if (err) logger.error(`Failed removing uploaded file to storage from '${filepath}' becuase`, err);
		});
	}
}

module.exports = SaveStorageStep;
