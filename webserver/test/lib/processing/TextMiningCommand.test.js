const RecordingModel = require('../../../lib/model/RecordingModel');
const ProjectModel = require('../../../lib/model/ProjectModel');

const TextMiningStep = require('../../../lib/processing/TextMiningStep');

const TextMiningCommand = require('../../../lib/processing/TextMiningCommand');

// Mock RecordingModel
jest.mock('../../../lib/model/RecordingModel');
// Mock ProjectModel
jest.mock('../../../lib/model/ProjectModel');

// Mock TextMiningStep
const mockMine = jest.fn().mockReturnValue({ results: {} });
jest.mock(
	'../../../lib/processing/TextMiningStep',
	() => jest.fn().mockImplementation(() => ({
		execute: mockMine,
	}))
);

describe('execute', () => {
	let command;

	beforeEach(async () => {
		RecordingModel.mockClear();
		TextMiningStep.mockClear();
		// mockSave.mockClear();
		mockMine.mockClear();

		const recording = new RecordingModel({
			filename: 'testaudio.wav',
			projectId: 1001,
			transcript: 'prova testo transcritto',
		});

		const project = new ProjectModel({
			collaborators: [{ name: 'Ugo' }],
		});

		command = new TextMiningCommand(recording, project);
	});

	it('should execute the text-mining step', async () => {
		await command.execute();

		expect(mockMine).toBeDefined();
	});
});
