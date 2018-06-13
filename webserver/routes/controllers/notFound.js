/**
 * @file	Metodi di route per la pagina 404, "not found"
 * Data Creazione:  2018-05-17
 *
 * @version	0.0.1
 * @author	Tommaso Sotte
 */

/**
 * Route per la pagina 404
 */
exports.view = (req, res) => {
	// = url di provenienza
	const referer = req.get('Referrer');

	// Referer valido solo se presente e diverso dall'url non trovato
	// ad es. quando raggiungi la pagina direttamente dall'url non trovato.
	const isValidReferer = referer && referer !== req.url;

	res.status(404).render('notFound', {
		title: 'Errore 404',
		url: req.url,
		referer: isValidReferer && referer,
	});
};
