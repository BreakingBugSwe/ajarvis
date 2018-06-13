/**
 * @file	Metodi di route per lista di standups, con intervallo di date
 * Data Creazione:  2018-04-26
 *
 * @version	0.0.2
 * @author	Tommaso Sotte
 */

// const env = require('../../env');
// const logger = require('../../lib/utility/logger');
const ProjectModel = require('../../lib/model/ProjectModel');
const RecordingModel = require('../../lib/model/RecordingModel');
const PhraseTypes = require('../../lib/tm/PhraseTypes');
// const SettingsFile = require('../../lib/model/SettingsFile');
const StandupViewer = require('../../lib/model/viewer/StandupViewer');

// const { check, validationResult } = require('express-validator/check');

const FROM_DATE_DEFAULT = '2018-01-01';

exports.view = async (req, res) => {
	// const page = req.query.page || 1;
	// const limit = env.settings.elementsPerPage;
	const intervalTo = (req.query.to) ? new Date(req.query.to) : new Date();
	const intervalFrom = req.query.from ? new Date(req.query.from) : new Date(FROM_DATE_DEFAULT);

	let query = RecordingModel.query()
		.filter('deleted', '=', false)
		.filter('dateCreation', '<=', intervalTo)
		.filter('dateCreation', '>=', intervalFrom);
		// .limit(limit)
		// ritorna solo i rec della pagina giusta
		// .offset(limit * (page - 1));

	if (req.project) query = query.filter('projectId', req.project.entityKey.id);

	const results = await query.run();
	const standups = results.entities.map(entity => new StandupViewer(entity));

	const projects = await fetchStandupProjects(standups);
	const projectsList = projects.map(project => ({
		id: project.entityKey.id,
		name: project.name,
	}));

	const standupsList = standups.map(standup => ({
		id: standup.id,
		solved: standup.filterPhrases(PhraseTypes.SOLUTION).length,
		problems: standup.filterPhrases(PhraseTypes.PROBLEM).length,
		tasks: standup.filterPhrases(PhraseTypes.TASK).length,
		dateCreation: standup.recording.dateCreation,
		processState: standup.recording.processState,
		project: projectsList
			.find(project => project.id === standup.recording.projectId),
	}));

	return res.render('standups', {
		title: 'Lista registrazioni',
		standups: standupsList,
		project: req.project || null,
		// NOTE url without query params
		url: `${req.baseUrl}${req.path}`,
		interval: {
			from: intervalFrom,
			to: intervalTo,
		},
	});
};

async function fetchStandupProjects(standups) {
	if (!standups.length) return [];

	const projectsIds = standups.map(standup => standup.recording.projectId);
	const uniqueIds = [...(new Set(projectsIds))];

	const projects = await ProjectModel.get(uniqueIds);
	return Array.isArray(projects) ? projects : [projects];
}
