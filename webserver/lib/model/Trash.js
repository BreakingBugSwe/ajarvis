/**
 * @file Gestione dell'eliminazione delle entità.
 * Data creazione: 2018-04-22
 * @version 0.0.1
 * @author	Tommaso Sotte
 */

class Trash {
	constructor(model) {
		this.model = model;
	}

	/**
	 * Cancella temporaneamente un'entità, segnando il campo dati
	 * `deleted` come la data di cancellazione (data attuale).
	 * @param  {Number|String}  id
	 * @return {Promise}
	 */
	async moveToTrash(id) {
		await this.model.update(
			id,
			{ deleted: Trash.getCurrentDate() }
		);
	}

	/**
	 * Ripristina un'entità cancellato temporaneamente, segnando il campo dati
	 * `deleted` come null/vuoto.
	 * @param  {Number|String|[]}  id uno o array di id
	 * @return {Promise}
	 */
	async restoreFromTrash(id) {
		const ids = !Array.isArray(id) ? [id] : id;
		await ids.forEach(i => this.model.update(i, { deleted: false }));
	}

	/**
	 * Cancella definitivamente uno o più entità
	 * @param  {Number|String|[]}  id Un id oppure un array di id da eliminare
	 * @return {Promise}
	 */
	async delete(id) {
		await this.model.delete(id);
	}

	/**
	 * Svuota il cestino cancellando definitivamente tutte le entità
	 * precedentemente cancellate temporaneamente (es. da moveToTrash).
	 * @param  {Date}  olderThan
	 * @return {Promise}
	 */
	async emptyTrash(olderThan) {
		const results = await this.model
			.query()
			// HACK: per individuare i cancellati, si confrontano con la data
			// se la data è presente significa che sono stati cancellati.
			.filter('deleted', '<=', olderThan)
			.run({ showKey: true, format: 'ENTITY' });

		const ids = results.entities.map(e => e.entityKey.id);

		await this.delete(ids);
	}

	/**
	 * Calcola la data per la quale tutti le date più vecchie di essa sono
	 * considerati elementi vecchi.
	 * @param  {Number} days giorni da sottrarre alla data attuale
	 * @return {Date} data attuale - n. giorni di vecchiaia
	 */
	static calculateOlderThan(days) {
		const olderThan = Trash.getCurrentDate();
		// NOTE: considerare lib. xx45/dayjs se necessità più complesse
		// aggiunge/sottrare giorni da una data, contando il cambio di mese/anno
		olderThan.setDate(olderThan.getDate() - days);
		return olderThan;
	}

	/**
	 * Funzione che torna la data corrente.
	 * (Utile per il mocking e testing)
	 * @private
	 * @return {Date} data corrente
	 */
	static getCurrentDate() {
		return new Date();
	}
}

module.exports = Trash;
