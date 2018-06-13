/**
 * @file Istanza di logger da usare per fare log
 * Data Creazione:  2018-03-21
 * @version 0.0.2
 * @author	Alessandro Zangari
 */

const env = require('../../env');
const path = require('path');
const Winston = require('winston');
const { pad, file } = require('./index');

const defaultTransportOpts = {
	// livello di errori da mostrare: "debug" vuol dire tutti
	level: 'debug',
	colorize: true,
	json: false,
	timestamp: () => (new Date()).toLocaleTimeString(),
};

// Sets colors to be used for error levels
Winston.addColors({
	error: 'red',
	warn: 'yellow',
	info: 'cyan',
	debug: 'green',
});

function dateToday() {
	const date = new Date();
	return `${pad(date.getUTCFullYear())}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function createDevelLogger() {
	// Settings for file transports
	const loggingDir = path.normalize(`${process.cwd()}/${env.logging.dir}`);
	const filenameLog = path.join(loggingDir, `${dateToday()}.log`);
	const filenameJson = `${filenameLog}.json`;

	// Ensure there's a writeable dir to record the logs
	file.createWritableDir(loggingDir);

	return new (Winston.Logger)({
		transports: [
			new Winston.transports.Console({ ...defaultTransportOpts }),
			new Winston.transports.File({
				...defaultTransportOpts,
				filename: filenameLog,
				name: 'human-readable-log',
				colorize: false,
			}),
			new Winston.transports.File({
				...defaultTransportOpts,
				filename: filenameJson,
				name: 'json-log',
				json: true,
			}),
		],
		exceptionHandlers: [
			new Winston.transports.Console(),
		],
	});

}

function createTestsLogger() {
	return new (Winston.Logger)({
		transports: [
			new Winston.transports.Console({ ...defaultTransportOpts }),
		],
		exceptionHandlers: [
			new Winston.transports.Console(),
		],
	});
}

function createLogger() {
	switch (process.env.NODE_ENV) {
	case 'testing':
		return createTestsLogger();
	case 'development':
	default:
		return createDevelLogger();
	}
}

module.exports = createLogger();

