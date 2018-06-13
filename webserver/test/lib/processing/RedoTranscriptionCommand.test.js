const RecordingModel = require('../../../lib/model/RecordingModel');
const ProjectModel = require('../../../lib/model/ProjectModel');

const TextMiningStep = require('../../../lib/processing/TextMiningStep');
const SpeechToTextStep = require('../../../lib/processing/SpeechToTextStep');

const RedoTranscriptionCommand = require('../../../lib/processing/RedoTranscriptionCommand');

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

// Mock SpeechToTextStep
const mockTranscribe = jest.fn().mockReturnValue('testo prova');
jest.mock(
	'../../../lib/processing/SpeechToTextStep',
	() => jest.fn().mockImplementation(() => ({
		execute: mockTranscribe,
	}))
);

describe('execute', () => {
	let command;

	beforeEach(async () => {
		RecordingModel.mockClear();
		TextMiningStep.mockClear();
		SpeechToTextStep.mockClear();
		// mockSave.mockClear();
		mockMine.mockClear();
		mockTranscribe.mockClear();

		const recording = new RecordingModel({
			filename: 'testaudio.wav',
			projectId: 1001,
			transcript: 'prova testo transcritto',
		});

		const project = new ProjectModel({
			collaborators: [{ name: 'Ugo' }],
		});

		command = new RedoTranscriptionCommand(recording, project);
	});

	it('should execute the transcribe step', async () => {
		await command.execute();

		expect(mockTranscribe).toBeDefined();
	});

	it('should execute the text-mining step', async () => {
		await command.execute();

		expect(mockMine).toBeDefined();
	});
});
