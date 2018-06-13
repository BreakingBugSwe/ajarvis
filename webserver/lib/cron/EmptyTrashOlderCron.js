/**
 * @file Modulo per la pulizia intervallata dei cestini
 * Data creazione: 2018-04-28
 * @version 0.0.1
 * @author	Tommaso Sotte
 */

const logger = require('../utility/logger');
const Trash = require('../model/Trash');

const DAY_IN_MILLIS = 24 * 60 * 60 * 1000;
const MONTH_IN_DAYS = 30;

/**
 * Modulo per la pulizia intervallata dei cestini
 * (Cron dai cronjob)
 */
class EmptyTrashOlderCron {
	/**
	 * @param {Trash} Trash with a gstore#Model
	 * @param {Number} [olderThanDays=30]
	 * @param {Number} [timeout=DAY_IN_MILLIS]
	 */
	constructor(trash, olderThanDays = MONTH_IN_DAYS, timeout = DAY_IN_MILLIS) {
		this.trash = trash;
		this.olderThanDays = olderThanDays;
		this.timeout = timeout;

		this.interval = null;
	}

	start() {
		this.execute().catch(err => logger.error(err));
		this.interval = setInterval(this.execute.bind(this), this.timeout);
	}

	stop() {
		this.interval = clearInterval(this.interval);
	}

	/**
	 * Elimina definitivamente tutti gli elementi dal cestino.
	 * Se passata una data come parametro, elimina tutti gli elementi che sono
	 * stati spostati nel cestino da più tempo della data segnata.
	 * es. se voglio cancellare tutti gli elementi più vecchi di un mese passerò
	 * la data di oggi sottraendogli un mese.
	 * @return {Promise}
	 */
	async execute() {
		logger.info(`Executing ${this.getTitle()}. Deleting older than ${this.olderThanDays} days. Next in ${this.timeout / 1000}s.`);
		const olderThan = Trash.calculateOlderThan(this.olderThanDays);

		try {
			await this.trash.emptyTrash(olderThan);
		} catch (err) {
			logger.error('Failed executing', this.getTitle(), err);
		}
	}

	getTitle() {
		return `"Cronjob ${this.trash.constructor.name}"`;
	}
}

module.exports = EmptyTrashOlderCron;
