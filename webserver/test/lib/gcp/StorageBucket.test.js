const Storage = require('./Storage.mock');
const logger = require('../../../lib/utility/logger');

jest.mock('../../../lib/utility/logger', () => ({
	error: jest.fn(),
	debug: jest.fn(),
}));

const StorageBucket = require('../../../lib/gcp/StorageBucket');

beforeAll(() => {
	// Il prossimo bucket che verrà creato sarà già esistente
	// così da evitare altri controlli
	Storage.mockNextBucket(true);
});

describe('constructor', () => {
	const name = 'testbucket';

	it('should create a bucket with the name choosen', () => {
		const bucket = new StorageBucket(name);

		expect(Storage.bucket).toHaveBeenCalled();
		expect(bucket).toHaveProperty('bucketName');
	});

	it('should create a bucket if not exists', () => {
		Storage.mockNextBucket(false, true);
		const bucket = new StorageBucket(name);

		expect(Storage.bucket).toHaveBeenCalled();
	});

	it('should throw and log error if not exists and cannot create', () => {
		Storage.mockNextBucket(false, false);
		const bucket = new StorageBucket(name);

		expect(Storage.bucket).toHaveBeenCalled();
	});
});

describe('upload', async () => {
	const filename = 'mockfile123.wav';
	let bucket;

	beforeEach(() => {
		bucket = new StorageBucket('testbucket');
		Storage.bucket().upload.mockClear();
	});

	it('should upload a file to storage', async () => {
		await bucket.upload(filename);

		const mockBucketUpload = bucket.bucket.upload;
		expect(mockBucketUpload).toHaveBeenCalled();
	});

	it('should format the request for Storage', async () => {
		await bucket.upload(filename);

		const mockBucketUpload = bucket.bucket.upload;

		const filepath = mockBucketUpload.mock.calls[0][0];
		const request = mockBucketUpload.mock.calls[0][1];
		expect(filepath).toBeDefined();
		expect(request).toHaveProperty('destination');
	});
});

describe('download', async () => {
	const filename = 'mockfile123.wav';
	let bucket;

	beforeEach(() => {
		bucket = new StorageBucket('testbucket');
		Storage.bucket().file().download.mockClear();
		Storage.bucket().file.mockClear();
	});

	it('should download a file from storage', async () => {
		await bucket.download(filename);

		const mockBucketFile = bucket.bucket.file;
		const mockFileDownload = bucket.bucket.file().download;
		expect(mockBucketFile).toHaveBeenCalled();
		expect(mockFileDownload).toHaveBeenCalled();
	});

	it('should format the request for Storage', async () => {
		await bucket.download(filename);

		const mockFileDownload = bucket.bucket.file().download;
		const request = mockFileDownload.mock.calls[0][0];
		expect(mockFileDownload).toHaveBeenCalled();
		expect(request).toHaveProperty('destination');
	});
});

describe('delete', async () => {
	const filename = 'mockfile123.wav';
	let bucket;

	beforeEach(() => {
		bucket = new StorageBucket('testbucket');
		Storage.bucket().file().delete.mockClear();
		Storage.bucket().file.mockClear();
	});

	it('should delete a file from storage', async () => {
		await bucket.delete(filename);

		const mockBucketFile = bucket.bucket.file;
		const mockFileDelete = bucket.bucket.file().delete;
		expect(mockBucketFile).toHaveBeenCalled();
		expect(mockFileDelete).toHaveBeenCalled();
	});

	it('should format the request for Storage', async () => {
		await bucket.delete(filename);

		const mockFileDelete = bucket.bucket.file().delete;
		expect(mockFileDelete).toHaveBeenCalled();
	});
});

describe('getLink', () => {
	it('should get a correct Google Storage link to the file', () => {
		const filename = 'mockfile123.wav';
		const name = 'testbucket';
		const bucket = new StorageBucket(name);

		const link = bucket.getLink(filename);

		// https://cloud.google.com/nodejs/docs/reference/speech/1.1.x/google.cloud.speech.v1.html?hl=it#.RecognitionAudio
		expect(link).toBe(`gs://${name}/${filename}`);
	});
});

describe('getPublicLink', () => {
	it('should get a correct public link to the file', async () => {
		const filename = 'mockfile123.wav';
		const name = 'testbucket';
		const bucket = new StorageBucket(name);

		const mockBucketFile = bucket.bucket.file;
		const mockFileSignedUrl = bucket.bucket.file().getSignedUrl;
		await bucket.getPublicLink(filename);

		expect(mockBucketFile).toHaveBeenCalled();
		expect(mockFileSignedUrl).toHaveBeenCalled();
	});
});
