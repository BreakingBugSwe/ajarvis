const NaturalLanguage = require('../../../lib/gcp/NaturalLanguage');
const logger = require('../../../lib/utility/logger');

jest.mock('../../../lib/utility/logger');

// Mock di Google Natural Language
jest.mock('../../../lib/gcp/NaturalLanguage', () => ({
	analyzeSyntax: jest.fn().mockReturnValue([
		{
			tokens: 'NOUN VERB NOUN VERB VERB'.split(' ').map(tag => ({
				partOfSpeech: [{ tag }],
				text: { content: 'capra' },
				dependencyEdge: { headTokenIndex: 3, label: [{ tag }] },
			})),
		},
	]),
}));

const TextMiningStep = require('../../../lib/processing/TextMiningStep');

describe('execute', async () => {
	const transcription = 'test transcription';
	const project = {
		collaborators: [],
		openProblems: [],
		keywords: [],
		save: jest.fn(),
	};
	let recording;
	let step;

	beforeEach(() => {
		recording = { transcription };
		project.openProblems = [];
		project.save.mockClear();
		step = new TextMiningStep(recording, project);
	});

	it('should format correctly the NL request', async () => {
		const prevOpenProblems = project.openProblems;

		await step.run();

		const mockAnalyze = NaturalLanguage.analyzeSyntax;
		// `request` created internally by `SpeechToTextStep#transcribe`
		// and passed to `Speech#recognize`
		const request = mockAnalyze.mock.calls[0][0];
		expect(request).toHaveProperty('document.content');
		expect(request).toHaveProperty('document.type');
		expect(request).toHaveProperty('encodingType');
		expect(project.openProblems).not.toBe(prevOpenProblems);
		expect(project.save).toHaveBeenCalled();
	});

	it('should set the mining results in the recording', async () => {
		await step.run();

		expect(recording.textMining).toBeDefined();
	});
});
