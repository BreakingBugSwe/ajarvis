// const hbs = require('hbs');
const pad = require('../../lib/utility/pad');

const dateDate = date =>
	`${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCFullYear())}`;

const dateHours = date =>
	`${pad(date.getHours())}:${pad(date.getMinutes())}`;

/**
 * Helpers per handlebars. Sono funzioni che vengono invocate quando su un template
 *  si usa l'healper. Quindi possono modificare i dati passati per parametro.
 * @param  {[type]} context [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
exports.dateOnlyDate = (context) => {
	const date = new Date(context);
	return `${dateDate(date)}`;
};

exports.dateDateHours = (context) => {
	const date = new Date(context);
	return `${dateDate(date)} - ${dateHours(date)}`;
};

exports.dateMonthDay = (context) => {
	const date = new Date(context);
	return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
};

exports.dateInput = (context) => {
	const date = new Date(context);
	return `${pad(date.getUTCFullYear())}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

/**
 * Visualizza un oggetto Date nel formato locale con data e ora
 * @param  {Date} context La data da visualizzare
 * @param  {JSONObject} options [description]
 * @return {String}         Una data leggibile
 */
exports.dateLocale = exports.dateDateHours;
