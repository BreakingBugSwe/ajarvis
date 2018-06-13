/**
 * @file	Mock di un RecordingModel (simile a ProjectModel)
 * Data creazione: 2018-04-23
 * @version	0.0.1
 * @author	Tommaso Sotte
 */

const ModelMockFactory = require('./ModelMockFactory');
const RecordingModel = require('../../../lib/model/RecordingModel');

// => jest mock del RecordingModel
jest.mock('../../../lib/model/RecordingModel');

module.exports = ModelMockFactory(RecordingModel);
