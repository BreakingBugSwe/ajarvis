/**
 * @file	Metodi di route per la pagina 500, "generic error"
 * Data Creazione:  2018-05-20
 *
 * @version	0.0.1
 * @author	Tommaso Loss
 */

/**
 * Route per la pagina 500
*/
exports.view = (err, req, res, next) => {
	// = url di provenienza
	const referer = req.get('Referrer');

	// Referer valido solo se presente e diverso dall'url non trovato
	// ad es. quando raggiungi la pagina direttamente dall'url non trovato.
	const isValidReferer = referer && referer !== req.url;

	res.status(500);
	res.render('error', {
		title: 'Errore',
		url: req.url,
		error: err,
		referer: isValidReferer && referer,
	});
};
