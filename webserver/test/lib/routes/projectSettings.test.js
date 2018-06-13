const ProjectModel = require('../model/ProjectModel.mock');
// const SettingsFile = require('../model/SettingsFile.mock');

const projectSettings = require('../../../routes/controllers/projectSettings');
const logger = require('../../../lib/utility/logger');
const ProjectStatus = require('../../../lib/model/enum/ProjectStatusSetting');
// const ProjectValidators = require('../../../lib/model/ProjectValidators');

// Non dovendo utilizzare dei metodi specifici dell'entità ci basta avere
// un oggetto come mock di un istanza di un Project
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

const res = {
	render: jest.fn(),
	redirect: jest.fn(),
};

jest.mock('../../../lib/utility/logger');
jest.mock('../../../lib/model/ProjectModel');
jest.mock('../../../lib/model/SettingsFile');
jest.mock('../../../lib/model/ProjectValidators');

beforeEach(() => {
	jest.clearAllMocks();
});

describe('get', async () => {
	const reqGet = {
		project: projectEntity,
	};

	it('should respond with the project settings page', async () => {
		await projectSettings.get(reqGet, res);
		const [viewName, data] = res.render.mock.calls[0];

		expect(res.render).toHaveBeenCalled();
		expect(viewName).toBe('projectSettings');
		expect(data).toHaveProperty('roles');
		expect(data).toHaveProperty('statuses');
		expect(data).toHaveProperty('project');
	});
});

describe('save', async () => {
	const reqSave = {
		project: projectEntity,
		body: { ...projectEntity },
	};

	// Scompongono i vari middleware e li testo separatemente
	const [checks, save, errorHandler] = projectSettings.save;

	it('should update the entity', async () => {
		await save(reqSave, res);

		expect(ProjectModel.update).toHaveBeenCalled();
	});

	it('should redirect to the project page if all good', async () => {
		await save(reqSave, res);

		expect(res.redirect)
			.toHaveBeenCalledWith(`/project/${reqSave.project.entityKey.id}`);
	});

	it('should throw error if failed', async () => {
		ProjectModel.update.mockImplementationOnce(() => { throw new Error(); });

		// Siccome `save` è un async/Promise, controlliamo il reject
		await expect(save(reqSave, res)).rejects.toThrow();
		expect(res.redirect).not.toHaveBeenCalled();
	});
});
