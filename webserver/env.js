/**
 * @file	Impostazioni del backend di AJarvis
 * Data Creazione: 2018-04-27
 *
 * @version	0.0.3
 * @author	Tommaso Sotte
 */

const path = require('path');
const config = require('./config.json');

/**
 * Path del file key per il service account gi Google Cloud.
 * @type {String}
 */
const keyFilename = path.join(__dirname, 'service-account.json');

module.exports = {
	gcp: {
		keyFilename,
		// bucket di Google Cloud Storage
		buckets: {
			// il nome 'recordings' non è usabile come bucket, duh
			standups: 'standups',
		},
		// kind di Google Cloud Datastore
		kinds: {
			project: 'project',
			recording: 'recording',
		},
		// Sovrascrive la configurazione di default con config.json
		...config.gcp,
	},
	uploads: {
		// cartella per l'upload temporaneo dei file
		dir: 'uploads',
		...config.uploads,
	},
	settings: {
		// Nome del file con le impostazioni di AJarvis
		filename: 'ajarvis_config.yaml',
		elementsPerPage: 20,
		...config.settings,
	},
	logging: {
		// Cartella per i file di log
		dir: './logs',
		...config.logging,
	},
};
