const logger = require('../../../lib/utility/logger');
const settingsFile = require('../../../lib/model/SettingsFile');
const SortingSetting = require('../../../lib/model/enum/SortingSetting');
const DurationSetting = require('../../../lib/model/enum/DurationSetting');
const { check, validationResult } = require('express-validator/check');
const settings = require('../../../routes/controllers/settings');

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
	project: {},
	params: {
		recordingId: 1345432,
	},
	body: {
		transcript: 'fakeTranscript',
		roles: 'aaa;bbb;ccc',
		minDuration: 4,
		maxDuration: 3,
	},
	recording: {
		entityKey: {
			id: 1112345,
		},
		dateCreation: new Date(),
		save: jest.fn(),
	},
};

jest.mock('../../../lib/utility/logger');
jest.mock('../../../lib/model/SettingsFile', () => ({
	setData: jest.fn(),
	getData: jest.fn(),
}));

beforeEach(() => {
	jest.clearAllMocks();
});


describe('get', async () => {
	it('Should call res render with correct data', async () => {
		await settings.get(req, res);
		expect(res.render).toBeCalled();
		const [viewName, data] = res.render.mock.calls[0];
		expect(viewName).toBe('settings');
		expect(data).toHaveProperty('title');
		expect(data).toHaveProperty('sortSettings');
		expect(data).toHaveProperty('data');
	});
});


describe('save', async () => {
	it('Should save correct new data', async () => {
		await settings.save[1](req, res);
		expect(res.redirect).toBeCalled();
		expect(res.redirect.mock.calls[0][0]).toBe('/projects');
		expect(settingsFile.setData).toBeCalled();
		const [newData] = settingsFile.setData.mock.calls[0];
		expect(newData.project_roles).toEqual(['aaa', 'bbb', 'ccc']);
	});

	const req2 = {
		body: {
			transcript: 'fakeTranscript',
			roles: 'ciao; ciao; prova;  ciao',
			minDuration: 4,
			maxDuration: 3,
		},
	};

	it('Should trim new data with set', async () => {
		await settings.save[1](req2, res);
		expect(res.redirect).toBeCalled();
		expect(res.redirect.mock.calls[0][0]).toBe('/projects');
		expect(settingsFile.setData).toBeCalled();
		const [newData] = settingsFile.setData.mock.calls[0];
		expect(newData.project_roles).toEqual(['ciao', 'prova']);
	});

	/* const req3 = {
		body: {
			transcript: 'fakeTranscript',
			roles: 'ciao; ciao; prova;  ciao',
			minDuration: 2,
			maxDuration: 10,
		},
	};

	it('Should throw', async () => {
		expect(async () => {
			await settings.save[1](req3, res);
		}).toThrow();
	}); */

	const err = {
		message: 'errorem',
	};

	it('Should call res.render correctly', async () => {
		await settings.save[2](err, req, res, () => true);
		expect(res.render).toBeCalled();
		const [viewName, data] = res.render.mock.calls[0];
		expect(viewName).toBe('settings');
		expect(data).toHaveProperty('title');
		expect(data).toHaveProperty('sortSettings');
		expect(data).toHaveProperty('data');
		expect(data).toHaveProperty('failed');
		expect(data.failed).toBe(err.message);
	});
});
