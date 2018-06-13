/**
 * Nome File:       recording.js
 * Data Creazione:  2018-04-27
 *
 * Raccoglie i middleware per le routes della pagina
 * di un recording
 *
 * @file    Metodi di route per la pagina di visualizzazione e modifica
 * del testo di un recording
 * @version 0.0.5
 * @author  Alessandro Zangari
 */

const logger = require('../../lib/utility/logger');

const recordingBucket = require('../../lib/gcp/RecordingBucket');
const RecordingModel = require('../../lib/model/RecordingModel');
const StandupViewer = require('../../lib/model/viewer/StandupViewer');
const PhraseTypes = require('../../lib/tm/PhraseTypes');
const ProcessStates = require('../../lib/model/enum/ProcessStateSetting');

const CommandQueue = require('../../lib/processing/MainQueue');
const NewRecordingCommand = require('../../lib/processing/NewRecordingCommand');
const RedoTranscriptionCommand = require('../../lib/processing/RedoTranscriptionCommand');
const TextMiningCommand = require('../../lib/processing/TextMiningCommand');
const ResetOpenProblemsCommand = require('../../lib/processing/ResetOpenProblemsCommand');
const recordingTrash = require('../../lib/model/RecordingTrash');

// const SettingsFile = require('../../lib/model/SettingsFile');
const notFound = require('./notFound');

/**
 * Rende disponibile il RecordingElement in req.recording
 * @see {@link /routes/controllers/project.js}
 */
exports.load = [
	async (req, res, next) => {
		const { recordingId } = req.params;

		try {
			req.recording = await RecordingModel.get(recordingId);
			next('route');
		} catch (err) {
			logger.error(`Impossibile caricare la registrazione con l'id: ${recordingId}`, err);
			next();
		}
	},
	notFound.view,
];


/**
 * Recupera i dettagli della registrazione
 */
exports.get = async (req, res) => {
	const standupDate = req.recording.dateCreation.toLocaleDateString();
	const standup = new StandupViewer(req.recording);
	const publickLink = await recordingBucket.getPublicLink(req.recording.filename);

	res.render('standup', {
		title: `Standup ${standupDate} - ${req.project.name}`,
		recording: req.recording,
		project: req.project,
		audio: {
			link: publickLink,
		},
		problems: standup.filterPhrases(PhraseTypes.PROBLEM),
		completedTasks: standup.filterPhrases(PhraseTypes.TASK),
		solvedProblems: standup.filterPhrases(PhraseTypes.SOLUTION),
		others: [
			...standup.filterPhrases(PhraseTypes.CONTINUATION),
			...standup.filterPhrases(PhraseTypes.IGNORE),
		],
		authors: standup.getUniqueAuthors(),
	});
};


/**
 * Permette di modificare il testo della registrazione
 */
exports.editTranscription = async (req, res) => {
	const { transcript } = req.body;

	req.recording.transcript = transcript;
	await req.recording.save();

	const command = new TextMiningCommand(req.recording, req.project);
	CommandQueue.add(command);

	CommandQueue.add(new ResetOpenProblemsCommand(req.project));

	redoTextMiningAll(req.project);

	res.redirect(`../${req.recording.entityKey.id}`);
};

/**
 * Riesegue l'upload di una registrazione, e successivamente tutti gli altri passi.
 */
exports.redoUpload = async (req, res) => {
	const command = new NewRecordingCommand(req.recording, req.project);
	CommandQueue.add(command);

	CommandQueue.add(new ResetOpenProblemsCommand(req.project));

	redoTextMiningAll(req.project);

	res.redirect(`../${req.recording.entityKey.id}`);
};

/**
 * Riesegue la transcrizione di una registrazione, e successivamente il text-mining.
 */
exports.redoTranscription = async (req, res) => {
	const command = new RedoTranscriptionCommand(req.recording, req.project);
	CommandQueue.add(command);

	CommandQueue.add(new ResetOpenProblemsCommand(req.project));

	redoTextMiningAll(req.project);

	res.redirect(`../${req.recording.entityKey.id}`);
};

/**
 * Riesegue il text-mining su una registrazione.
 */
exports.redoTextMining = async (req, res) => {
	// const command = new TextMiningCommand(req.recording, req.project);
	// CommandQueue.add(command);

	CommandQueue.add(new ResetOpenProblemsCommand(req.project));

	redoTextMiningAll(req.project);

	// => ../recording/:recordingId
	res.redirect(`../${req.recording.entityKey.id}`);
};

/**
 * Cancella uno stand-up, spostandolo nel cestino
 */
exports.delete = async (req, res) => {
	await recordingTrash.moveToTrash(req.recording.entityKey.id);

	res.redirect('../../'); // pagina del progetto
};

// Riaccoda tutte le registrazioni per rifare il text-mining e
// ricolcolare i problemi aperti
async function redoTextMiningAll(project) {
	const results = await RecordingModel.query()
		.filter('projectId', project.entityKey.id)
		.filter('processState', '=', ProcessStates.TEXTMINED)
		.filter('deleted', '=', false)
		.order('dateCreation', { descending: false })
		.run({ format: 'ENTITY' });

	const recordings = results.entities;

	recordings
		.forEach(recording => CommandQueue.add(new TextMiningCommand(recording, project)));
}
