const RecordingModel = require('../model/RecordingModel.mock');
const projectTrash = require('../../../routes/controllers/projectTrash');
const ProjectModel = require('../model/ProjectModel.mock');
const ProjectStatus = require('../../../lib/model/enum/ProjectStatusSetting');
const recordingTrash = require('../../../lib/model/RecordingTrash');

const res = {
	render: jest.fn(),
	redirect: jest.fn(),
};

const projectEntity = {
	entityKey: { id: ProjectModel.DEFAULT_ID },
	name: 'FakeProject',
	description: 'Finto progetto per test',
	collaborators: [
		{ name: 'Giorgia', role: 'Amministratore' },
		{ name: 'Andrea', role: 'Progettista' },
	],
	status: ProjectStatus.OPEN,
	keywords: ['uno', 'due'],
	lastEdit: new Date(),
	dateCreation: new Date(),
};

const entities = [
	{	id: '123' },
	{ id: '345' },
];

jest.mock('../../../lib/model/RecordingTrash');

// svuota .mock.calls ad ogni test
beforeEach(() => {
	jest.clearAllMocks();
});

describe('deletedRecordingQuery', async () => {
	it('Should filter deleted recs returning query object', async () => {
		const recs = await RecordingModel.query()
			.filter('deleted', '<=', new Date());
		expect(recs.check).toEqual(3);
	});
});

describe('load', async () => {
	const req = {
		query: {
			page: 0,
		},
		project: projectEntity,
	};

	it('Should load deleted recordings in array req.recordings', async () => {
		await projectTrash.load(req, res, () => true);
		expect(Array.isArray(req.recordings)).toBeTruthy();
	});
});


describe('get', async () => {
	const req = {
		query: {
			page: 0,
		},
		project: projectEntity,
	};

	it('Should respond with the list of deleted recordings', async () => {
		await projectTrash.load(req, res, () => true);
		await projectTrash.get(req, res);
		const [viewName, data] = res.render.mock.calls[0];

		expect(res.render).toHaveBeenCalled();
		expect(viewName).toBe('projectTrash');
		// controllo presenza proprietà
		expect(data).toHaveProperty('title');
		expect(data).toHaveProperty('trash');
		expect(data).toHaveProperty('project');
		// constrollo sui tipi
		expect(data.project).toBe(projectEntity);
		expect(Array.isArray(data.trash)).toBeTruthy();
		expect(typeof data.title).toBe('string');
	});
});


describe('loadId', async () => {
	const req = {
		body: {
			selected: '123;345',
		},
		project: projectEntity,
	};

	it('Should be an empty array in req.selected', async () => {
		await projectTrash.loadId(req, res, () => true);
		expect(Array.isArray(req.selected)).toBeTruthy();
	});
    
	it('Should load only valid selected ids in req.selected', async () => {
		// ritorna come recs cancellati quelli con id 123, 234, 345
		RecordingModel.mockQueryRun.mockImplementationOnce(() => Promise.resolve({ entities }));
		await projectTrash.loadId(req, res, () => true);
		expect(Array.isArray(req.selected)).toBeTruthy();
		// console.debug(JSON.stringify(req.selected));
		/* expect(req.selected.includes('123')).toBeTruthy();
		expect(req.selected.includes('345')).toBeTruthy();
		expect(req.selected.includes('234')).toBeFalsy(); */
	});
});


describe('delete', async () => {
	const req = {
		body: {
			selected: 'id1;id2;id3',
		},
		project: projectEntity,
		selected: ['id1', 'id2', 'id3'],
	};

	it('Should call recordingTrash.delete', async () => {
		await projectTrash.delete(req, res);
		const [route] = res.redirect.mock.calls[0]; // ha un solo parametro

		expect(recordingTrash.delete).toHaveBeenCalled();
		expect(res.redirect).toHaveBeenCalled();
		// testa il parametro di redirect
		expect(route).toBe(`/project/${req.project.entityKey.id}/trash`);
	});
});

// TODO: finire questo test
describe('untrash', async () => {
	const req = {
		body: {
			selected: 'id1;id2;id3',
		},
		project: projectEntity,
		selected: ['id1', 'id2', 'id3'],
		recordings: [],
	};

	const err = {};

	it('Should call recordingTrash.restoreFromTrash', async () => {
		await projectTrash.untrash[0](req, res);
		const [route] = res.redirect.mock.calls[0]; // ha un solo parametro

		expect(recordingTrash.restoreFromTrash).toHaveBeenCalled();
		expect(res.redirect).toHaveBeenCalled();
		// testa il parametro di redirect
		expect(route).toBe(`/project/${req.project.entityKey.id}/trash`);

		await projectTrash.untrash[1](err, req, res);

		expect(res.render).toHaveBeenCalled();
		const [viewName, data] = res.render.mock.calls[0];
		// controllo presenza proprietà
		expect(data).toHaveProperty('title');
		expect(data).toHaveProperty('trash');
		expect(data).toHaveProperty('project');
		// constrollo sui tipi
		expect(Array.isArray(data.trash)).toBeTruthy();
		expect(typeof data.title).toBe('string');
		expect(viewName).toBe('projectTrash');
		expect(data.failed).toBe(undefined);
	});
});
