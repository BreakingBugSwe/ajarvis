/**
 * @file	Trash del ProjectModel
 * Data Creazione:  2018-05-20
 *
 * @version	0.0.2
 * @author	Tommaso Sotte
 */

const logger = require('../utility/logger');
const Trash = require('./Trash');
const recordingTrash = require('./RecordingTrash');
const RecordingModel = require('./RecordingModel');
const ProjectModel = require('./ProjectModel');

class ProjectTrash extends Trash {
	constructor() {
		super(ProjectModel);
	}

	/**
	 * Cancella uno o più progetti e tutte le registrazioni associate ad essi.
	 * @param  {Number|String|[]}  id uno o più id
	 * @return {Promise}
	 */
	async delete(id) {
		const ids = !Array.isArray(id) ? [id] : id;
		if (ids.length) logger.info('Deleting projects', ids.join(', '));
		else logger.info('No projects to be deleted.');

		// Cancella tutti gli id
		await Promise.all(ids.map(async (projectId) => {
			await this.deleteRecordings(projectId);

			// Infine cancella il progetto
			await super.delete(projectId);
		}));
	}

	/**
	 * Cancella tutte le registrazioni associate ad un progetto.
	 * @param  {Number|String}  projectId
	 * @return {Promise}
	 */
	/* eslint-disable-next-line class-methods-use-this */
	async deleteRecordings(projectId) {
		// Ottiene tutte le registrazioni associate al project id
		const response = await RecordingModel.query()
			.filter('projectId', projectId)
			.run();

		// => [{ id, filename }]
		const recs = response.entities.map(e => ({
			id: e.id,
			filename: e.filename,
		}));

		// Cancella tutte le registrazioni e i file audio
		await Promise.all(recs.map(async ({ id, filename }) => {
			await recordingTrash.delete(id, filename);
		}));
	}
}

module.exports = new ProjectTrash();
