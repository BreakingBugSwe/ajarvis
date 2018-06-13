/**
 * @file	Registra tutti gli helper personalizzati per Handlebars
 * Data Creazione:  2018-04-06
 *
 * @version	0.0.3
 * @author	Alessandro Zangari
 * @author	Tommaso Sotte
 */

const date = require('./date');
const list = require('./list');
const json = require('./json');
const array = require('./array');
const concat = require('./concat');

const collaborators = require('./collaborators');
const enums = require('./enums');

const all = [
	date, list, json, array, concat,
	collaborators, enums,
];

module.exports = (opts = {}) => {
	const handlebars = opts.handlebars || opts.hbs;

	// load all helpers
	all.forEach((group) => {
		Object.keys(group).forEach(name => handlebars.registerHelper(name, group[name]));
	});
};
