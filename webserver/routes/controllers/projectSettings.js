/**
 * @file	Metodi di route per la pagina delle impostazioni di un progetto
 * Data Creazione:  2018-04-26
 * @version	0.0.3
 * @author	Alessandro Zangari
 * @author	Tommaso Sotte
 */

const logger = require('../../lib/utility/logger');
const ProjectModel = require('../../lib/model/ProjectModel');
const SettingsFile = require('../../lib/model/SettingsFile');
const ProjectStatus = require('../../lib/model/enum/ProjectStatusSetting');

const { check, validationResult } = require('express-validator/check');
const ProjectValidators = require('../../lib/model/ProjectValidators');

const ProjectStatuses = Object.keys(ProjectStatus);

const resData = {
	title: 'Impostazioni del progetto',
	roles: SettingsFile.getRoles(),
	statuses: ProjectStatuses,
};

/**
  * Form per la modifica delle informazioni generali di un progetto
  */
exports.get = async (req, res) => {
	res.render('projectSettings', {
		...resData,
		project: req.project,
	});
};

/**
 * Modifica le informazioni generali di un progetto
 */
exports.save = [
	[
		check('name').not().isEmpty().trim()
			.custom((name, { req }) => {
				// se il nome è uguale al corrente, non servono controlli
				if (name === req.project.name) return true;
				return ProjectValidators.validateUniqueName(name);
			}),
		check('status').isIn(ProjectStatuses),
		check('description').isString().trim(),
		check('collaborators')
			.customSanitizer(ProjectValidators.sanitizeCollaborators)
			.custom(ProjectValidators.validateCollaborators),
		check('keywords')
			.customSanitizer(ProjectValidators.sanitizeKeywords),
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

		const projectId = req.project.entityKey.id;

		try {
			const projectData = {
				lastEdit: new Date(),
				name: req.body.name,
				description: req.body.description,
				status: req.body.status,
				collaborators: req.body.collaborators,
				keywords: req.body.keywords,
			};

			await ProjectModel.update(projectId, projectData);

			res.redirect(`/project/${projectId}`);
		} catch (err) {
			throw new Error('Fallito salvataggio sul datastore, riprovare più tardi.');
		}
	},
	(err, req, res, next) => {
		const projectId = req.project.entityKey.id;

		logger.error(`Fallita modifica del progetto '${projectId}'.`, err);

		res.render('projectSettings', {
			...resData,
			project: req.project,
			failed: err.message,
		});
	},
];
