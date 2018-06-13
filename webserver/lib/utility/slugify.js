/**
 * Slugify a text/url/ecc. Tiene conto anche delle lettere accentate.
 * https://gist.github.com/mathewbyrne/1280286#gistcomment-2005392
 *
 * @param  {string} text
 * @return {string}
 */
module.exports = (text) => {
	// TODO: definirle esternamente, inutile ricrearle ogni chiamata
	const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
	const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
	const p = new RegExp(a.split('').join('|'), 'g');

	return text.toString().toLowerCase()
		// Replace spaces with -
		.replace(/\s+/g, '-')
		// Replace special chars
		.replace(p, c => b.charAt(a.indexOf(c)))
		// Replace & with 'and'
		.replace(/&/g, '-and-')
		// Remove all non-word chars
		.replace(/[^\w-]+/g, '')
		// Replace multiple - with single -
		.replace(/--+/g, '-')
		// Trim - from start of text
		.replace(/^-+/, '')
		// Trim - from end of text
		.replace(/-+$/, '');
};
