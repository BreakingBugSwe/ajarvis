/**
 * @file	Metodi di route per cestino dei progetti
 * Data Creazione:  2018-04-26
 *
 * @version	0.0.4
 * @author	Alessandro Zangari
 * @author	Tommaso Sotte
 */

const env = require('../../env');
const ProjectModel = require('../../lib/model/ProjectModel');
const projectTrash = require('../../lib/model/ProjectTrash');


const deletedProjectsQuery = () => ProjectModel.query()
	.filter('deleted', '<=', new Date());


/**
 * Carica una lista di progetti nel cestino in `req.projects`.
 */
exports.load = async (req, res, next) => {
	const page = req.query.page || 1;

	const response = await deletedProjectsQuery()
		.limit(env.settings.elementsPerPage)
		.offset(env.settings.elementsPerPage * (page - 1))
		.run();

	req.projects = response.entities;

	next('route');
};

/**
 * Mostra tutti i progetti nel cestino.
 */
exports.get = (req, res) => {
	res.render('trash', {
		title: 'Cestino Progetti',
		trash: req.projects,
	});
};

exports.loadId = async (req, res, next) => {
	const { selected } = req.body;

	const response = await deletedProjectsQuery().run();
	const deletedIds = response.entities.map(proj => proj.id);

	req.selected = selected.split(';').filter(id => deletedIds.includes(id));

	next();
};

/**
 * Elimina uno ad uno i progetti con l'ID in req.selected
 */
exports.delete = async (req, res) => {
	await projectTrash.delete(req.selected);
	res.redirect('/projects/trash');
};

/**
 * Rispristina i progetti selezionati, rimuovendoli dal cestino
 */
exports.untrash = async (req, res) => {
	await projectTrash.restoreFromTrash(req.selected);
	res.redirect('/projects/trash');
};
