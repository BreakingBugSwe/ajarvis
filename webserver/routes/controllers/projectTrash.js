/**
 * @file	Metodi di route per il cestino delle registrazioni di un progetto
 * Data Creazione:  2018-04-27
 *
 * @version	0.0.7
 * @author	Alessandro Zangari
 * @author	Tommaso Sotte
 */

const env = require('../../env');
const RecordingModel = require('../../lib/model/RecordingModel');
const recordingTrash = require('../../lib/model/RecordingTrash');

// Query base per ottenere dei recording cancellati di un progetto
const deletedRecordingQuery = projectId => RecordingModel.query()
	.filter('deleted', '<=', new Date())
	.filter('projectId', projectId);

/**
 * Carica una lista di recordinds nel cestino in `req.recordings`.
 */
exports.load = async (req, res, next) => {
	const page = req.query.page || 1;

	const response = await deletedRecordingQuery(req.project.entityKey.id)
		.limit(env.settings.elementsPerPage)
		.offset(env.settings.elementsPerPage * (page - 1))
		.run();

	req.recordings = response.entities;

	next('route');
};

/**
 * Mostra il cestino di un progetto.
 */
exports.get = async (req, res) => {
	res.render('projectTrash', {
		title: `Cestino stand-up del progetto ${req.project.name}`,
		trash: req.recordings,
		project: req.project,
	});
};

/**
 * Rende disponibile un array di Id da eliminare in `req.selected`.
 */
exports.loadId = async (req, res, next) => {
	const { selected } = req.body;

	const response = await deletedRecordingQuery(req.project.entityKey.id).run();
	const deletedIds = response.entities.map(rec => rec.id);

	req.selected = selected.split(';').filter(id => deletedIds.includes(id));

	next();
};

/**
 * Elimina definitivamente i recording selezionati.
 */
exports.delete = async (req, res) => {
	await recordingTrash.delete(req.selected);
	res.redirect(`/project/${req.project.entityKey.id}/trash`);
};

/**
 * Ripristina i recording selezionati, rimuovendoli dal cestino.
 */
exports.untrash = [
	async (req, res) => {
		if (req.project.deleted) {
			throw new Error('Non è possibile ripristinare delle registrazioni di un progetto nel cestino.');
		}

		await recordingTrash.restoreFromTrash(req.selected);

		res.redirect(`/project/${req.project.entityKey.id}/trash`);
	},
	(err, req, res, next) => {
		res.render('projectTrash', {
			title: `Cestino stand-up del progetto ${req.project.name}`,
			trash: req.recordings,
			project: req.project,
			failed: err.message,
		});
	},
];
