/* eslint-disable new-cap */

const home = require('../../../routes/controllers/home');
const ProjectModel = require('../../../lib/model/ProjectModel');
const SettingsFile = require('../../../lib/model/SettingsFile');

const req = {
	query: {
		page: 0,
	},
};

const res = {
	render: jest.fn(),
	redirect: jest.fn(),
};

const mockproject = {
	name: 'Giuggiola',
	description: 'Giuggiolotta',
	status: 'OPEN',
	collaborators: ['Pippotto', 'Cisco', 'Giulio'],
	keywords: ['Ciao', 'Domani'],
	dateCreation: new Date(),
	lastEdit: new Date(),
	deleted: false,
};

const mockModelQuery = jest.fn().mockImplementation(() => ({
	filter: () => new mockModelQuery(),
	order: () => new mockModelQuery(),
	offset: () => new mockModelQuery(),
	limit: () => new mockModelQuery(),
	run: jest.fn().mockReturnValue({ entities: [mockproject] }),
}));

const MockModel = jest.fn().mockImplementation(() => ({
	// update: jest.fn(),
	// delete: jest.fn(),
	query: () => new mockModelQuery(),
}));

// const mockModel = new MockModel();

jest.mock('../../../lib/model/ProjectModel', () => ({ query: () => new mockModelQuery() }));
jest.mock('../../../lib/model/SettingsFile');


describe('GET /projects', () => {
	it('Should respond with res.render', async () => {
		await home.getProjects(req, res);
		const data = res.render.mock.calls;
		expect(res.render).toHaveBeenCalled();
		expect(data[0][0]).toBe('home');
		expect(typeof data[0][1].title).toBe('string');
		expect(Array.isArray(data[0][1].projects)).toBeTruthy();
	});
});
