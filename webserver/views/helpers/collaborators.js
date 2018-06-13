/**
 * Helper che riceve l'array di collab come ['Ruolo1', 'Ruolo2', ecc] e
 * ritorna la stringa corretta nel formato voluto dalla textarea
 * @param  {Array<JSONObject>} context L'array dei ruoli
 * @return {String}        La stringa che rappresenta l'elenco dei ruoli
 */
exports.collaborators = (context, options) => context
	.map(coll => `${coll.name}, ${coll.role}`) // rende ogni {} una stringa
	.join('\n')	// produce un'unica stringa
	.trim();	// pulisce eventuali spazi bianchi a inizio e fine

/* formato = [
	{
		name:
		role:
	},
	{
		...
	}
] */
