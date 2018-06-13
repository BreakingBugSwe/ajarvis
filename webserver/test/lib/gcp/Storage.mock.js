const Storage = require('../../../lib/gcp/Storage');

// Factory di bucket file
const mockBucketFile = jest.fn().mockReturnValue({
	download: jest.fn(),
	delete: jest.fn(),
	getSignedUrl: jest.fn().mockReturnValue(['url']),
});

// Factory di bucket
const createBucket = (exists, create = true) => ({
	upload: jest.fn(),
	file: mockBucketFile,
	exists: jest.fn()
		.mockReturnValue(exists ? Promise.resolve([true]) : Promise.resolve([false])),
	create: jest.fn().mockReturnValue(create ? Promise.resolve() : Promise.reject()),
});

// Factory di factory di bucket, che possono esistere o meno, costruiti
// correttamente o meno
Storage.mockNextBucket = (exists, create = true) => {
	Storage.bucket = jest.fn().mockReturnValue(createBucket(exists, create));
};

// Mock static/singleton function `bucket`
// Default: factory di bucket che esistono e vengono creati correttamente
Storage.bucket = jest.fn().mockReturnValue(createBucket(true, true));

module.exports = Storage;
