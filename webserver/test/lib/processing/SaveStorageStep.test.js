const recordingBucket = require('../../../lib/gcp/RecordingBucket');
const fs = require('fs');
const logger = require('../../../lib/utility/logger');

jest.mock('../../../lib/utility/logger', () => ({}));

jest.mock('../../../lib/gcp/RecordingBucket', () => ({
	upload: jest.fn(),
}));

jest.mock('fs', () => ({
	unlink: jest.fn(),
}));

const SaveStorageStep = require('../../../lib/processing/SaveStorageStep');

describe('SaveStorageStep', async () => {
	const filename = 'mockfile123.wav';
	const recording = { filename };
	let step;

	beforeEach(() => {
		step = new SaveStorageStep(recording);
	});

	it('should upload the registration to the storage', async () => {
		await step.run();

		expect(recordingBucket.upload).toHaveBeenCalled();
	});

	it('should upload with the same filename', async () => {
		await step.run();

		expect(recordingBucket.upload.mock.calls[0][0]).toEqual(filename);
	});

	it('should delete the file after a correct upload', async () => {
		await step.run();

		expect(fs.unlink).toHaveBeenCalled();
	});
});
