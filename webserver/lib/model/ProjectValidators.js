/**
 * @file	Validatori e sanitizers per ProjectModel
 * Data Creazione:  2018-05-17
 *
 * @version	0.0.1
 * @author	Tommaso Sotte
 */

const ProjectModel = require('../../lib/model/ProjectModel');

/**
 * Valida un nome: controlla che non sia vuoto e che non sia già presente come
 * nome di un altro progetto nel database.
 * @param  {String} name
 * @throws se non è valido
 */
exports.validateUniqueName = async (name) => {
	if (!name) {
		throw new Error('Il campo nome non può essere vuoto.');
	}

	// Query ricerca di project con nome identico
	const result = await ProjectModel.query().filter('name', name).run();

	if (result.entities && result.entities.length) {
		throw new Error(`Esiste già un progetto con il nome '${name}'.`);
	}
};

/**
 * 'name;role|...' => [{ name, role }, ...]
 * @see {@link public/js/collaborators-form}}
 * @param  {String} collabs
 * @return {[{ name, role }]}
 */
exports.sanitizeCollaborators = (collabsStr) => {
	if (!collabsStr) return [];

	return collabsStr
		.split('|')
		.map((nameRole) => {
			const [name, role] = nameRole.split(';');
			return {
				name: name.trim(),
				role: role.trim(),
			};
		})
		.filter(collab => collab.name && collab.role);
};

/**
 * Valida che tutti i nomi dei collaboratori siano unici.
 * Throwa invece che eliminare i duplicati, perchè non sappiamo quale dei
 * più ruoli sia quello corretto da mantenere per il collaboratore duplicato.
 * @param  {[{ name, role }]} collabs
 * @return {bool} true se tutti unici, false altrimenit
 * @throws
 */
exports.validateCollaborators = (collabs) => {
	const duplicate = collabs.find((current) => {
		let skipFirst = true;

		return collabs.find((other) => {
			const found = current.name.toLowerCase() === other.name.toLowerCase();

			if (!!found && skipFirst) {
				skipFirst = false;
				return null;
			}

			return found;
		});
	});

	if (duplicate) {
		throw new Error(`Esiste già un collaboratore con il nome '${duplicate.name}'`);
	}
	return true;
};

/**
 * 'kw1;Kw2 ;;KW4;...' => ['kw1', 'kw2', 'kw4', ...]
 * Elimina inoltre i duplicati.
 * @param  {String} keywordsStr
 * @return {[String]} torna array di keywords uniche
 */
exports.sanitizeKeywords = (keywordsStr) => {
	const keywords = keywordsStr
		.split(';')
		.map(r => r.trim().toLowerCase())
		// elimina stringhe vuote
		.filter(x => !!x);

	return [...(new Set(keywords))];
};
