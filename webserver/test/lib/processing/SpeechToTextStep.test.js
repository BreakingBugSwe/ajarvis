const SpeechToText = require('../../../lib/gcp/SpeechToText');
const recordingBucket = require('../../../lib/gcp/RecordingBucket');
const logger = require('../../../lib/utility/logger');

jest.mock('../../../lib/utility/logger');

// => torna un risultato nel formato di recognize()
const mockRecognize = jest.fn().mockReturnValue([
	{
		results: 'testo di prova'.split(' ').map(word => (
			{ alternatives: [{ transcript: word }] }
		)),
	},
]);

// Mock di Google Speech
SpeechToText.recognize = mockRecognize;
SpeechToText.longRunningRecognize = jest.fn().mockReturnValue([
	{ promise: mockRecognize },
]);

recordingBucket.getLink = jest.fn().mockReturnValue('gs://bucket/filename');

const SpeechToTextStep = require('../../../lib/processing/SpeechToTextStep');

describe('SpeechToTextStep', async () => {
	const filename = 'mockfile123.wav';
	let recording;
	let step;
	const project = {
		keywords: [],
	};

	beforeEach(() => {
		mockRecognize.mockClear();
		// NOTE: va re-istanziata perchè SpeechToTextStep#run modifica
		// la proprietà `transcript`.
		recording = { filename };
		step = new SpeechToTextStep(recording, project);
	});

	it('should request to STT a file in the storage', async () => {
		await step.run();

		expect(recordingBucket.getLink).toHaveBeenCalled();
	});

	it('should format correctly the STT request', async () => {
		await step.run();

		// `request` created internally by `SpeechToTextStep#transcribe`
		// and passed to `Speech#recognize`
		const request = SpeechToText.longRunningRecognize.mock.calls[0][0];
		expect(request).toHaveProperty('audio.uri');
		expect(request).toHaveProperty('config.encoding');
		expect(request).toHaveProperty('config.languageCode');
	});

	it('should recognize and set the text in the recording', async () => {
		await step.run();

		expect(mockRecognize).toHaveBeenCalled();
		expect(recording.transcript).toBe('testo di prova');
	});
});
