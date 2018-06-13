/* eslint-disable new-cap, no-var */
// Classi di mockk
const ProjectModel = require('../model/ProjectModel.mock');
const RecordingModel = require('../model/RecordingModel.mock');
const SettingsFile = require('../model/SettingsFile.mock');

const project = require('../../../routes/controllers/project');

const logger = require('../../../lib/utility/logger');
const StandupViewer = require('../../../lib/model/viewer/StandupViewer');
const ProjectTrash = require('../../../lib/model/ProjectTrash');
const notFound = require('../../../routes/controllers/notFound');

jest.mock('../../../lib/utility/logger');
jest.mock('../../../lib/model/ProjectTrash');
jest.mock('../../../routes/controllers/notFound');

const res = {
	render: jest.fn(),
	redirect: jest.fn(),
};

const next = jest.fn();

const mockProject = {
	name: 'Giuggiola',
	description: 'Giuggiolotta',
	status: 'OPEN',
	collaborators: ['Pippo', 'Cisco', 'Giulio'],
	keywords: ['Ciao', 'Domani'],
	dateCreation: new Date(),
	lastEdit: new Date(),
	deleted: false,
	entityKey: {
		id: 1234567890,
	},
};

const recordings = [
	{
		projectId: 1234567890,
		filename: '1234a.wav',
		processState: 'INITIAL',
		dateCreation: new Date(),
		lastEdit: new Date(),
		transcript: 'trascritto dello standup seconofo',
		textMining: { results: [{ type: 'TASK' }, { type: 'PROBLEM' }] },
		deleted: false,
	},
	{
		projectId: 1234567890,
		filename: 'aaaxsa.wav',
		processState: 'INITIAL',
		dateCreation: new Date(),
		lastEdit: new Date(),
		transcript: 'trascritto dello standup secondo',
		textMining: { results: [{ type: 'IGNORE' }, { type: 'PROBLEM' }] },
		deleted: false,
	},
];

beforeEach(() => {
	jest.clearAllMocks();
});

describe('new', async () => {
	it('should render the new project view', async () => {
		await project.new({}, res);
		const [viewName, data] = res.render.mock.calls[0];

		expect(res.render).toHaveBeenCalled();
		expect(viewName).toBe('newProject');
		expect(typeof data.title).toBe('string');
		expect(Array.isArray(data.roles)).toBeTruthy();
	});
});

describe('saveNew', async () => {
	const reqNewProject = {
		body: {
			name: 'FakeProject',
			description: 'Finto progetto per test',
			collaborators: [
				{ name: 'Giorgia', role: 'Amministratore' },
				{ name: 'Andrea', role: 'Progettista' },
			],
		},
	};
	// Spezziamo i middleware di project.saveNew nelle 3 componenti
	const [checks, saveNew, errorHandler] = project.saveNew;

	it('should redirect to the new project page', async () => {
		await saveNew(reqNewProject, res);
		expect(res.redirect).toHaveBeenCalled();
		expect(res.redirect.mock.calls[0][0]).toBe(`/project/${ProjectModel.DEFAULT_ID}`);
	});

	it('should save a new entity project', async () => {
		await saveNew(reqNewProject, res);

		expect(ProjectModel).toHaveBeenCalled();
		// expect(projectEntity.save).toHaveBeenCalled();
	});

	it('should throw if failed creating a new project', async () => {
		// Cambia la funzionalità di mock save solo per questo test in particolare
		ProjectModel.mockEntitySave.mockImplementationOnce(() => { throw new Error(); });

		await expect(saveNew(reqNewProject, res)).rejects.toThrow();
	});
});

describe('load', async () => {
	const reqLoad = { params: { projectId: 101 } };
	const [load, notFoundView] = project.load;

	beforeEach(() => {
		// Perchè il middleware `load` carica project in `req.project`.
		reqLoad.project = null;
	});

	it('should make available the project in req.project', async () => {
		await load(reqLoad, res, next);
		expect(reqLoad.project).toBeDefined();
	});

	it('should call next "route" if all good', async () => {
		await load(reqLoad, res, next);
		expect(next).toHaveBeenCalledWith('route');
	});

	it('should call next to the notFoundView if error', async () => {
		ProjectModel.get.mockImplementationOnce(() => { throw new Error(); });
		await load(reqLoad, res, next);
		expect(next).not.toHaveBeenCalledWith('route');
	});
});

describe('get', async () => {
	const reqGet = {
		query: {},
		project: mockProject,
	};

	beforeEach(() => {
		// Un utilizzo del run di una query restituirà i seguenti recordings
		ProjectModel.mockQueryRun.mockImplementationOnce(() => ({
			entities: recordings,
		}));
	});

	it('should show the project page', async () => {
		await project.get(reqGet, res);
		const [viewName, data] = res.render.mock.calls[0];

		expect(res.render).toHaveBeenCalled();
		expect(viewName).toBe('project');
		expect(data).toHaveProperty('graphData');
		expect(data).toHaveProperty('problems');
		expect(data).toHaveProperty('standups');
		expect(data).toHaveProperty('project');
		expect(data).toHaveProperty('id');
	});
});

describe('delete', async () => {
	const reqTrash = {
		project: mockProject,
	};

	it('should put the project in trash', async () => {
		await project.delete(reqTrash, res);

		expect(ProjectTrash.moveToTrash).toHaveBeenCalled();
	});

	it('should redirect if all good', async () => {
		await project.delete(reqTrash, res);

		expect(res.redirect).toHaveBeenCalled();
		expect(res.redirect.mock.calls[0][0]).toBe('/projects');
	});
});


