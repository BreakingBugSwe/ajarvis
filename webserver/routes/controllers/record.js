/**
 * @file    Route per il recorder
 * Data Creazione:  2018-04-27
 * @version 0.0.1
 * @author  Giacomo Del Moro
 * @author	Tommaso Sotte
 */

const env = require('../../env');
const logger = require('../../lib/utility/logger');
const utility = require('../../lib/utility');
const multer = require('multer');

const settingsFile = require('../../lib/model/SettingsFile');

const RecordingModel = require('../../lib/model/RecordingModel');

const CommandQueue = require('../../lib/processing/MainQueue');
const NewRecordingCommand = require('../../lib/processing/NewRecordingCommand');

utility.file.createWritableDir(env.uploads.dir);

/**
 * 	Docs:`https://github.com/expressjs/multer` sotto 'diskStorage'
 * 	Salva il file audio nella cartella ./uploads e gli assegna
 * 	il nome 'projectId-data'.
 * 	Esempio: 'projectId-2018-04-30T09-36-50.980Z'
*/
const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, env.uploads.dir);
	},
	filename: (req, file, callback) => {
		// NOTE: Windows non vuole i ':' nei nomi file. Li sostituiamo con '-'
		callback(null, `${req.params.projectId}-${(new Date()).toISOString().replace(':', '-')}`);
	},
});

// NOTE: storage (non dest) per poter usare diskStorage
const upload = multer({ storage });

exports.new = async (req, res) => {
	res.render('record', {
		title: `Registra uno standup per ${req.project.title}`,
		project: req.project,
		today: new Date(),
		appSettings: settingsFile.getData(),
	});
};

/**
 * Crea un nuovo RecordingElement e avvia gli stati di processing
 */
exports.saveNew = [
	upload.single('audiofile'),
	async (req, res) => {
		if (!req.file) {
			res.status(500).send();
			return;
		}

		const data = {
			projectId: req.project.entityKey.id,
			filename: req.file.filename,
		};

		try {
			const recording = new RecordingModel(data);
			const savedRec = await recording.save(null, { method: 'insert' });

			req.project.lastEdit = new Date();
			await req.project.save();

			CommandQueue.add(new NewRecordingCommand(savedRec, req.project));

			res.status(200).send();
		} catch (err) {
			res.status(500).send();
			logger.error(`There was an error while saving the new recording ${err.toString()}`);
		}
	},
];
