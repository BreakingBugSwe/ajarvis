/**
 * @file	Factory di mock di gstore#Model
 * Data creazione: 2018-04-22
 * @version	0.0.1
 * @author	Tommaso Sotte
 */

/* eslint-disable new-cap, no-param-reassign */
/**
 * Passandogli un mock di un gstore#Model, gli assegna funzionalità utili
 * ai fini del mocking.
 * @example
 * 	// ProjectModel.mock.js
 * 	...
 * 	const ProjectModel = require('../ProjectModel');
 * 	jest.mock('../ProjectModel');
 * 	...
 * 	const ModelMock = ModelMockFactory(ProjectModel);
 * 	...
 * 	module.exports = ModelMock
 * @param       {gstore#Model} Model
 * @return {{}}
 */
function ModelMockFactory(Model) {
	/**
	* Mock di una query del datastore
	*/
	const mockQuery = jest.fn().mockImplementation(() => ({
		filter: jest.fn().mockReturnThis(),
		select: jest.fn().mockReturnThis(),
		order: jest.fn().mockReturnThis(),
		limit: jest.fn().mockReturnThis(),
		offset: jest.fn().mockReturnThis(),
		check: 3,
		run: Model.mockQueryRun,
	}));

	/**
	* Mock di un modello del gstore:
	* - Entity: creandone un instanza si crea una Entity
	* - Model: ha i metodi statici (es. get, update, ecc)
	* @type {Object}
	*/
	Model.mockImplementation(() => ({
		entityKey: { id: Model.DEFAULT_ID },
		save: Model.mockEntitySave,
	}));

	// Mock dei metodi statici di un gstore#Model
	Model.get = jest.fn(() => new Model());
	Model.update = jest.fn();
	Model.delete = jest.fn();
	Model.query = jest.fn(() => new mockQuery());

	// Utili per mocking
	Model.DEFAULT_ID = 1001;

	/**
	* Mock del metodo statico save
	* @example
	* 	// per ottenere risultati diversi, come errori/throw
	* 	Model.mockEntitySave.mockImplementationOnce(...)...
	*/
	Model.mockEntitySave = jest.fn().mockReturnThis();

	/**
	* Mock di Query#run, utile per mockare risultati diversi
	* @example
	* 	// guardare esempio di mockEntitySave
	*/
	Model.mockQueryRun = jest.fn().mockReturnValue({ entities: [] });

	return Model;
}

module.exports = ModelMockFactory;
