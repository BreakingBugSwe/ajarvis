/**
 * @file	Metodi di route per la pagina principale di un progetto.
 * Data Creazione:  2018-04-26
 *
 * @version	0.0.3
 * @author	Alessandro Zangari
 * @author	Tommaso Sotte
 */

const env = require('../../env');
const logger = require('../../lib/utility/logger');
const ProjectModel = require('../../lib/model/ProjectModel');
const RecordingModel = require('../../lib/model/RecordingModel');
const PhraseTypes = require('../../lib/tm/PhraseTypes');
const SettingsFile = require('../../lib/model/SettingsFile');
const StandupViewer = require('../../lib/model/viewer/StandupViewer');
const projectTrash = require('../../lib/model/ProjectTrash');
const notFound = require('./notFound');

const { check, validationResult } = require('express-validator/check');
const ProjectValidators = require('../../lib/model/ProjectValidators');

/**
 * Form per la creazione di un progetto
 */
exports.new = async (req, res) => {
	res.render('newProject', {
		title: 'Crea un nuovo progetto',
		roles: SettingsFile.getRoles(),
	});
};

/**
 * Crea e salva un progetto con il nome richiesto
 */
exports.saveNew = [
	[
		check('name').not().isEmpty().trim()
			.custom(ProjectValidators.validateUniqueName),
		check('description').isString().trim(),
		check('collaborators')
			.customSanitizer(ProjectValidators.sanitizeCollaborators)
			.custom(ProjectValidators.validateCollaborators),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const errStr = errors
				.array()
				.map(err => `'${err.param}': ${err.msg}`)
				.join('. ');

			throw new Error(errStr);
		}

		try {
			// Crea nuova entità, non ancora salvata
			const projectEntity = new ProjectModel({
				name: req.body.name,
				description: req.body.description,
				collaborators: req.body.collaborators,
			});

			// NOTE validazione già eseguito da save()
			const savedEntity = await projectEntity.save(null, { method: 'insert' });

			res.redirect(`/project/${savedEntity.entityKey.id}`);
		} catch (err) {
			throw new Error('Fallito salvataggio sul datastore. Riprova più tardi.');
		}
	},
	(err, req, res, next) => {
		logger.error('Fallita creazione di un progetto', err);

		res.render('newProject', {
			title: 'Crea un nuovo progetto',
			roles: SettingsFile.getRoles(),
			failed: err.message,
		});
	},
];

/**
 * Middleware express per le route con `:projectId`.
 * Fetcha il progetto e lo rende disponibile nella req (request) in `req.project`.
 * ref: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
exports.load = [
	async (req, res, next) => {
		const { projectId } = req.params;

		try {
			req.project = await ProjectModel.get(projectId);
			// Ha caricato correttamente il progetto e lo rende disponibile alla prossima route
			next('route');
		} catch (err) {
			logger.error(`Impossibile caricare il progetto con l'id: ${projectId}`, err);
			// Va sul middleware successivo (ovvero pagina 404)
			next();
		}
	},
	// Pagina 404
	notFound.view,
];


/**
 * Homepage di uno specifico progetto, individuato da :projectId
 * Ottiene i recording di un progetto
 */
exports.get = async (req, res) => {
	
	const projectId = req.project.entityKey.id;

	const results = await RecordingModel.query()
		.filter('projectId', '=', projectId)
		.filter('deleted', '=', false)
		.order('dateCreation', { descending: true })
		.run();

	const standups = results.entities.map(entity => new StandupViewer(entity)).reverse();

	
	const tasks = standups
		.reduce((all, standup) => all.concat(standup.filterPhrases(PhraseTypes.TASK)), []);

	const standupsList = standups.map(standup => ({
		id: standup.id,
		solved: standup.filterPhrases(PhraseTypes.SOLUTION).length,
		problems: standup.filterPhrases(PhraseTypes.PROBLEM).length,
		dateCreation: standup.recording.dateCreation,
		processState: standup.recording.processState,
	}));

	const graphData = {
		solved: incrementalSum(standupsList.map(standup => standup.solved)),
		problems: incrementalSum(standupsList.map(standup => standup.problems)),
		labels: standupsList.map(standup => standup.dateCreation),
	};

	res.render('project', {
		id: projectId,
		title: `${req.project.name}`,
		project: req.project,
		// NOTE: 'settings' è una keyword di hbs
		appSettings: SettingsFile.getData(),
		standups: standupsList.reverse(),
		problems: req.project.openProblems || [],
		tasks,
		graphData,
	});
};

/**
 * Sposta nel cestino un progetto
 */
exports.delete = async (req, res) => {
	try {
		await projectTrash.moveToTrash(req.project.entityKey.id);
	} catch (err) {
		logger.error('Fallita cancellazione di un progetto', err);
	}

	res.redirect('/projects');
};

function incrementalSum(array) {
	if (!array.length) return [];

	const sums = [array[0]];
	for (let i = 1; i < array.length; i += 1) {
		sums[i] = array[i] + sums[i - 1];
	}
	return sums;
}
