/**
 * @file	Mock di un ProjectModel (simile a RecordingModel)
 * Data creazione: 2018-04-23
 * @version	0.0.1
 * @author	Tommaso Sotte
 */

const ModelMockFactory = require('./ModelMockFactory');
const ProjectModel = require('../../../lib/model/ProjectModel');

// => jest mock del ProjectModel
jest.mock('../../../lib/model/ProjectModel');

module.exports = ModelMockFactory(ProjectModel);
