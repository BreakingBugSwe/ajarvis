/**
 * @file Utility per file e filesystem
 * Data Creazione:  2018-03-20
 * @version 0.0.1
 * @author	Tommaso Sotte
 */

const fs = require('fs');

/**
 * Create a directory, if it doesn't already exists and test if it's writable.
 * Throws if it can't create a writable directory in the path specified.
 * @param {String} dirpath Path of the directory
 */
function createWritableDir(dirpath) {
	// Checks if it exists and can write in it
	try {
		/* eslint-disable-next-line no-bitwise */
		fs.accessSync(dirpath, fs.constants.F_OK | fs.constants.W_OK);
		return;
	} catch (err) {
		/* eslint-disable-next-line no-console */
		console.log(`Directory "${dirpath}" doesn't exist or cannot be read/written.`);
	}

	// If does not exists it can be written on it, fail
	try {
		fs.mkdirSync(dirpath);
		/* eslint-disable-next-line no-bitwise */
		fs.accessSync(dirpath, fs.constants.F_OK | fs.constants.W_OK);
	} catch (err) {
		throw new Error(`Failed creation of dir in path ${dirpath}`);
	}
}

module.exports = {
	createWritableDir,
};
