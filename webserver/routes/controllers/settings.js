/**
 * @file	Metodi di route per la pagina di impostazioni AJarvis.
 * Data Creazione:  2018-04-26
 *
 * @version	0.0.3
 * @author	Alessandro Zangari
 * @author	Tommaso Sotte
 */

const logger = require('../../lib/utility/logger');
const settingsFile = require('../../lib/model/SettingsFile');
const SortingSetting = require('../../lib/model/enum/SortingSetting');
const DurationSetting = require('../../lib/model/enum/DurationSetting');

const { check, validationResult } = require('express-validator/check');
// const ProjectValidators = require('../../lib/model/ProjectValidators');

const SortingSettings = Object.values(SortingSetting);

const resData = {
	title: 'Impostazioni di AJarvis',
	sortSettings: SortingSettings,
};

/**
 * Ottiene le impostazioni dal file di configurazione locale
 */
exports.get = (req, res) => {
	res.render('settings', {
		...resData,
		data: settingsFile.getData(),
	});
};


/**
 * Salva le impostazioni passate nel req.body e sovrascrive
 * il file di configurazione locale
 */
exports.save = [
	[
		check('maxDuration').exists().isInt({ min: DurationSetting.MIN, max: DurationSetting.MAX }),
		check('minDuration').exists().isInt({ min: DurationSetting.MIN, max: DurationSetting.MAX }),
		check('sorting').exists().isIn(SortingSettings),
		check('roles').exists().isString(),
	],
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// TODO se usassimo framework, gestione migliore degli errori nei form
			const errStr = errors
				.array()
				.map(err => `'${err.param}': ${err.msg}`)
				.join('. ');

			throw new Error(errStr);
		}

		if (req.body.minDuration < req.body.maxDuration) {
			throw new Error('La durata massima dev\'essere superiore alla durata minima.');
		}

		const rolesArr = req.body.roles
			.split(';')
			.map(r => r.trim())
			.filter(x => !!x);

		const newSettings = {
			min_recording_length: Number.parseInt(req.body.minDuration, 10),
			max_recording_length: Number.parseInt(req.body.maxDuration, 10),
			projects_sorting_order: req.body.sorting,
			// Rimuove eventuali duplicati
			project_roles: [...(new Set(rolesArr))],
		};

		settingsFile.setData(newSettings);
		res.redirect('/projects');
	},
	(err, req, res, next) => {
		logger.error('Errore nel salvataggio delle impostazioni dell\'app', err);

		res.render('settings', {
			...resData,
			failed: err.message,
			data: settingsFile.getData(),
		});
	},
];
