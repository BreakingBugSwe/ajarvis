/**
 * @file Gestisce le impostazioni di AJarvis su un file. (singleton)
 * Data Creazione:  2018-04-27
 *
 * @version 0.0.2
 * @author  Alessandro Zangari
 * @author	Tommaso Sotte
 */

const logger = require('../../lib/utility/logger');
// https://github.com/nodeca/js-yaml
const yaml = require('js-yaml');
const fs = require('fs');
const env = require('../../env');
const path = require('path');
const SortingSetting = require('./enum/SortingSetting');
const DurationSetting = require('./enum/DurationSetting');

const defaultSettings = {
	min_recording_length: 30,
	max_recording_length: 1800,
	projects_sorting_order: SortingSetting.LAST_EDIT,
	project_roles: [
		'Amministratore',
		'Responsabile',
		'Analista',
		'Progettista',
		'Verificatore',
		'Programmatore',
	],
};

/**
 * Classe per la gestione delle impostazioni di AJarvis.
 * Verrà salvata su un file, `<cwd>/ajarvis_config.yaml`.
 * @singleton
 */
class SettingsFile {
	constructor() {
		this.filepath = path.join(process.cwd(), env.settings.filename);
		this.data = { ...defaultSettings };
	}

	getSortOrder() {
		return this.data.projects_sorting_order;
	}

	getMinRecLength() {
		return this.data.min_recording_length;
	}

	getMaxRecLength() {
		return this.data.max_recording_length;
	}

	getRoles() {
		return this.data.project_roles;
	}

	/**
	 * Restituisce le impostazioni leggendole da file di impostazioni.
	 * @return {{}} L'oggetto contenente le impostazioni
	 */
	getData() {
		return this.data;
	}

	/**
	 * Sovrascrive le impostazioni e le salva sul file.
	 * @param {{}} newData nuove impostazioni
	 */
	setData(newData) {
		const newDataDefaulted = {
			...defaultSettings,
			...newData,
		};

		if (!isValid(newDataDefaulted)) throw Error('Impostazioni non valide');

		this.data = newDataDefaulted;
		this.writeData();
	}

	/**
	 * Legge le impostazioni dal file e le carica su `this.data`.
	 * Se non esiste il file lo crea con le impostazioni attuali.
	 */
	readData() {
		// Se non esiste, lo crea, con le impostazioni di default
		if (!fs.existsSync(this.filepath)) {
			logger.debug('Creato nuovo file di impostazioni.');
			this.writeData();
			return;
		}

		try {
			const text = fs.readFileSync(this.filepath, 'utf8');
			// file YAML => {}
			const data = yaml.safeLoad(text);

			// NOTE: validazione in lettura su readData, mentre in scrittura su setData.
			if (!isValid(data)) {
				throw new Error('impostazioni del file non valide.');
			} else {
				this.data = data;
			}
		} catch (e) {
			logger.error(`Errore nella lettura file yaml: ${e.toString()}`);
		}
	}

	/**
	 * Sovrascrive il file con le nuove impostazioni.
	 */
	writeData() {
		try {
			// NOTE: ritorna una stringa in YAML pronta per essere scritta su file
			const text = yaml.safeDump(this.data);

			// NOTE: sovrascrive il file YAML
			fs.writeFileSync(this.filepath, text);
		} catch (e) {
			logger.error(`Errore nella scrittura del file yaml: ${e.toString()}`);
		}
	}

	static get MIN_REC_LENGTH() { return 30; }
	static get MAX_REC_LENGTH() { return 4000; }
}

const settingsFile = new SettingsFile();
// All'apertura dell'app leggerà il file di configurazione.
settingsFile.readData();

module.exports = settingsFile;

// METODI di validazione impostazioni (privati)

/**
 * Valida le impostazioni da salvare.
 * @param  {{}}  object L'oggetto con le impostazioni
 * @return {Boolean}  True se valido, altrimeni false
 */
function isValid(object) {
	return validRecDuration(object.min_recording_length)
		&& validRecDuration(object.max_recording_length)
		&& validSort(object.projects_sorting_order)
		&& validRoles(object.project_roles);
}

function validRecDuration(val) {
	return val > 0
		&& val >= DurationSetting.MIN
		&& val <= DurationSetting.MAX;
}

function validSort(val) {
	return Object.values(SortingSetting).includes(val);
}

function validRoles(val) {
	// È un array e non ci sono valori che non siano stringhe
	return Array.isArray(val) && !val.find(x => typeof x !== 'string');
}
