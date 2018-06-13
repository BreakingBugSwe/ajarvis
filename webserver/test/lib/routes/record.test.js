const env = require('../../../env');
const logger = require('../../../lib/utility/logger');
const multer = require('multer');
const settingsFile = require('../../../lib/model/SettingsFile');
const RecordingModel = require('../model/RecordingModel.mock');
const ProjectModel = require('../model/ProjectModel.mock');
const CommandQueue = require('../../../lib/processing/MainQueue');
const NewRecordingCommand = require('../../../lib/processing/NewRecordingCommand');

const record = require('../../../routes/controllers/record.js');

const mockStatus = {
	send: jest.fn(),
};

const res = {
	render: jest.fn(),
	redirect: jest.fn(),
	status: jest.fn(() => mockStatus),
};

const req = {
	query: {
		page: 0,
	},
	project: new ProjectModel(),
};

jest.mock('../../../lib/utility/logger');
jest.mock('../../../lib/processing/MainQueue');
jest.mock('../../../lib/processing/NewRecordingCommand');
// jest.mock('multer');
jest.mock('../../../lib/model/SettingsFile', () => ({
	getData: () => ({
		min_recording_length: 30,
		max_recording_length: 1800,
		projects_sorting_order: 'TEST',
		project_roles: [
			'admin',
			'respon',
		],
	}),
}));

beforeEach(() => {
	jest.clearAllMocks();
});

describe('new', () => {
	it('Should respond with new recording page with correct data', async () => {
		await record.new(req, res);
		const [viewName, data] = res.render.mock.calls[0];

		expect(res.render).toHaveBeenCalled();
		expect(viewName).toBe('record');
		// controllo presenza proprietà
		expect(data).toHaveProperty('title');
		expect(data).toHaveProperty('today');
		expect(data).toHaveProperty('project');
		expect(data).toHaveProperty('appSettings');
		// controllo sui tipi
		expect(typeof data.title).toBe('string');
		expect(data.today instanceof Date).toBeTruthy();
		expect(typeof data.title).toBe('string');
		expect(Array.isArray(data.appSettings.project_roles)).toBeTruthy();
		// controllo valori
		expect(data.appSettings.project_roles.includes('admin')).toBeTruthy();
		expect(data.appSettings.project_roles.includes('respon')).toBeTruthy();
		expect(data.appSettings.min_recording_length).toBe(30);
		expect(data.appSettings.max_recording_length).toBe(1800);
		expect(data.appSettings.projects_sorting_order).toBe('TEST');
	});
});

describe('saveNew', () => {
	const [upload, saveNew] = record.saveNew;

	it('Should respond with 500', async () => {
		await saveNew(req, res);
		const data = res.status.mock.calls[0][0];

		expect(mockStatus.send).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalled();
		expect(data).toBe(500);
	});


	it('Should respond with 200', async () => {
		const req2 = {
			project: new ProjectModel(),
			file: {
				filename: 'filefake',
			},
		};

		await saveNew(req2, res);
		const data = res.status.mock.calls[0][0];

		expect(mockStatus.send).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalled();
		expect(data).toBe(200);
	});
});
