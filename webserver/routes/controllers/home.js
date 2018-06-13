/**
 * @file	Metodi di route per la homepage
 * Data Creazione:  2018-04-26
 *
 * @version	0.0.2
 * @author	Alessandro Zangari
 */

// const logger = require('../../lib/utility/logger');
const env = require('../../env');
const ProjectModel = require('../../lib/model/ProjectModel');
const SettingsFile = require('../../lib/model/SettingsFile');
const SortingSetting = require('../../lib/model/enum/SortingSetting');

/**
 * L'homepage corrisponde alla lista di progetti, quindi eseguirà il redirect.
 */
exports.index = async (req, res) => {
	res.redirect('/projects');
};

/**
 * Mostra tutti i progetti.
 */
exports.getProjects = async (req, res) => {
	// le pagine partono da 1
	const page = req.query.page || 1;
	const sortProperty = SettingsFile.getSortOrder() || SortingSetting.LAST_EDIT;

	const query = ProjectModel.query()
		.filter('deleted', false)
		.order(sortProperty, { descending: true })
		.limit(env.settings.elementsPerPage)
		.offset(env.settings.elementsPerPage * (page - 1));

	// ritorna oggetto con due proprietà: 'entities' e 'nextPageCursor'
	const results = await query.run();

	// res.render fornisce dati alla view indicata nel percorso
	// e manda al client la pagina HTML
	res.render('home', {
		title: 'Home',
		projects: results.entities,
	});
};
