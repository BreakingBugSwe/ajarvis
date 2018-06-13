/**
 * @file Queue di Command
 * Data Creazione: 2018-04-13.
 *
 * @version 0.0.2
 * @author	Tommaso Sotte
 * @author	Paolo Rizzardo
 */

const logger = require('../utility/logger');

const States = require('./CommandQueueStates');

class CommandQueue {
	constructor() {
		this.queue = [];
		this.executed = [];
		this.failed = [];

		this.state = States.STOPPED;
	}

	/**
	 * Aggiunge un command alla queue e la avvia.
	 * @param {Command} command
	 */
	add(command) {
		logger.info('Added command', command.id);
		this.queue.push(command);

		this.start();
	}

	/**
	 * Torna vero se ha dei commandi nella queue; falso altrimenti.
	 * @return {Boolean}
	 */
	hasCommandInQueue() {
		return !!this.queue.length;
	}

	/**
	 * Avvia la queue (intelligentemente).
	 */
	start() {
		// Se non sta già eseguendo un comando
		if (this.state === States.RUNNING) return;
		// Se la queue è vuota è inutile avviarla
		if (!this.hasCommandInQueue()) return;

		this.run();
	}

	/**
	 * Ferma la queue. Può essere ripresa con start() o aggiungendo un commando
	 * alla queue con add().
	 */
	stop() {
		logger.info('Queue stopped');
		this.state = States.STOPPED;
	}

	/**
	 * Gestisce il completamento di un commando.
	 * @param  {Command} command
	 */
	onCompletedCommand(command) {
		logger.info('Completed command', command.id);
		this.executed.push(command);
	}

	/**
	 * Gestisce il fallimento di un commando e l'errore generato.
	 * @param  {Command} command
	 * @param  {Error} err
	 */
	onFailedCommand(command, err) {
		// NOTE reimplementando questo metodo è possibile ri-aggiungere alla queue
		// i commandi falliti ad esempio
		logger.error('Failed command', command.id, ' in queue:', err);
		this.failed.push(command);
	}

	/**
	 * Esegue tutti i command nella queue, uno per volta.
	 * Se viene stoppata, si ferma al commando successivo.
	 * @private
	 * @return {Promise}
	 */
	async run() {
		// logger.debug('Running...');
		this.state = States.RUNNING;

		while (this.hasCommandInQueue() && this.state === States.RUNNING) {
			// shift(): estrae primo e modifica lunghezza array
			const command = this.queue.shift();
			// => undefined se vuota
			if (!command) break;

			try {
				/* eslint-disable-next-line no-await-in-loop */
				await command.execute();

				this.onCompletedCommand(command);
			} catch (err) {
				this.onFailedCommand(command, err);
			}
		}

		this.state = States.STOPPED;
	}
}

module.exports = CommandQueue;
