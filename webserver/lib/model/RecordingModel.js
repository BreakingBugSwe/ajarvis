/**
 * @file Schema del Recording per gstore
 * Data Creazione: 2018-02-30.
 *
 * @version 0.0.1
 * @author  Tommaso Sotte
 */

const gstore = require('gstore-node')();
// const ProcessStateSetting = require('./enum/ProcessStateSetting');
// const enumValidator = require('./enum/EnumValidator');
const env = require('../../env');
const enumValidator = require('./enum/EnumValidator');
const ProcessStateSetting = require('./enum/ProcessStateSetting');

const { Schema } = gstore;

const recordingSchema = new Schema({
	// NOTE: Number|String, dipende dall'id del progetto
	projectId: {},
	filename: { type: String, required: true },
	processState: {
		type: String,
		required: true,
		default: ProcessStateSetting.INITIAL,
		validator: {
			rule: enumValidator,
			args: [ProcessStateSetting],
		},
	},
	dateCreation: { type: Date, required: true, default: () => new Date() },
	lastEdit: { type: Date, required: true, default: () => new Date() },
	transcript: { type: String, excludeFromIndexes: true },
	textMining: { excludeFromIndexes: true },
	openProblems: {},
	deleted: { default: false },
});

// NOTE: il kind 'recording' in un enum/config da qualche parte?
module.exports = gstore.model(env.gcp.kinds.recording, recordingSchema);
