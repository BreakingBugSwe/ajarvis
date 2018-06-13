/**
 * @file Schema del Project per gstore
 * Data Creazione: 2018-02-30.
 *
 * @version 0.0.1
 * @author  Tommaso Sotte
 */

const gstore = require('gstore-node')();
const ProjectStatusSetting = require('./enum/ProjectStatusSetting');
const enumValidator = require('./enum/EnumValidator');
const env = require('../../env');

const { Schema } = gstore;

const projectSchema = new Schema({ // perchè non c'è l'ID?
	name: { type: String, required: true },
	// "excludeFromIndexes: true" per campi con molti dati o
	// sicuramente (!!) non usati nelle query.
	description: { type: String, excludeFromIndexes: true },
	status: {
		type: String,
		required: true,
		default: ProjectStatusSetting.OPEN,
		validator: {
			rule: enumValidator,
			args: [ProjectStatusSetting],
		},
	},
	collaborators: { type: Array, default: [] },
	keywords: { type: Array, default: [] },
	openProblems: { type: Array },
	dateCreation: { type: Date, required: true, default: () => new Date() },
	// `lastEdit`: perchè non modifiedOn? potrebbero esserci casi in cui non
	// vogliamo aggiornare la data, ma comunque modificare dei campi dati.
	lastEdit: { type: Date, required: true, default: () => new Date() },
	// `deleted`: di default non è cancellato ("false"). Se lo fosse, sarebbe
	// valorizzato con un Date (che indica la data di cancellazione).
	// Per mostrare i non-cancellati necessari il filtro deleted=false.
	// Per mostrare i cancellati usare il filtro deleted<=NOW
	deleted: { default: false },
});

module.exports = gstore.model(env.gcp.kinds.project, projectSchema);
