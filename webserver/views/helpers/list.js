/**
 * Helper che riceve l'array di ruoli come ['Ruolo1', 'Ruolo2', ecc] e
 * ritorna la stringa corretta nel formato voluto dalla textarea
 * @param  {Array<String>} context L'array dei ruoli
 * @return {String}        La stringa che rappresenta l'elenco dei ruoli
 */
exports.list = context => context.join('; ').trim().concat(';');
