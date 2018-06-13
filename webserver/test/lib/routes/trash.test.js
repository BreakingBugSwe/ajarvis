const env = require('../../../env');
const ProjectModel = require('../model/ProjectModel.mock');
const projectTrash = require('../../../lib/model/ProjectTrash');
const trash = require('../../../routes/controllers/trash');


const entities = [
	{	id: '123' },
	{ id: '345' },
];

const res = {
	render: jest.fn(),
	redirect: jest.fn(),
};

jest.mock('../../../lib/model/ProjectTrash');

// svuota .mock.calls ad ogni test
beforeEach(() => {
	jest.clearAllMocks();
});

describe('load', async () => {
	const req = {
		query: {
			page: 0,
		},
	};
	it('Should load deleted projects in array req.projectss', async () => {
		await trash.load(req, res, () => true);
		expect(Array.isArray(req.projects)).toBeTruthy();
	});
});

describe('get', async () => {
	const req = {
		query: {
			page: 0,
		},
	};
	it('Should respond with the list of deleted projects', async () => {
		await trash.load(req, res, () => true);
		await trash.get(req, res);
		const [viewName, data] = res.render.mock.calls[0];
		expect(res.render).toHaveBeenCalled();
		expect(viewName).toBe('trash');
		expect(data).toHaveProperty('title');
		expect(data).toHaveProperty('trash');
		expect(Array.isArray(data.trash)).toBeTruthy();
	});
});

describe('loadId', async () => {
	const req = {
		body: {
			selected: '123;345',
		},
	};
	it('Should be an empty array in req.selected', async () => {
		await trash.loadId(req, res, () => true);
		expect(Array.isArray(req.selected)).toBeTruthy();
	});

    it('Should load only valid selected ids in req.selected', async () => {
		// ritorna come recs cancellati quelli con id 123, 234, 345
		ProjectModel.mockQueryRun.mockImplementationOnce(() => Promise.resolve({ entities }));
		await trash.loadId(req, res, () => true);
		expect(Array.isArray(req.selected)).toBeTruthy();
	});
});

describe('delete', async () => {
	const req = {
		body: {
			selected: 'id1;id2;id3',
		},
		selected: ['id1', 'id2', 'id3'],
	};
	it('Should call trash.delete', async () => {
		await trash.delete(req, res);
		const [route] = res.redirect.mock.calls[0]; // ha un solo parametro
		expect(projectTrash.delete).toHaveBeenCalled();
		expect(res.redirect).toHaveBeenCalled();
		// testa il parametro di redirect
		expect(route).toBe('/projects/trash');
	});
});

describe('untrash', async () => {
	const req = {
		body: {
			selected: 'id1;id2;id3',
		},
		selected: ['id1', 'id2', 'id3'],
	};

	it('Should call projecTrash.restoreFromTrash', async () => {
		await trash.untrash(req, res);
		const [route] = res.redirect.mock.calls[0]; // ha un solo parametro
		expect(projectTrash.restoreFromTrash).toHaveBeenCalled();
		expect(res.redirect).toHaveBeenCalled();
		// testa il parametro di redirect
		expect(route).toBe('/projects/trash');
	});

	// prova di toThrow() ignorare questo test
	it('Should throw', async () => {
		expect(() => {
			throw new Error();
		}).toThrow();
	});
});
