const logger = require('../../../lib/utility/logger');
const recordingBucket = require('../../../lib/gcp/RecordingBucket');
const RecordingModel = require('../../../lib/model/RecordingModel');
const StandupViewer = require('../../../lib/model/viewer/StandupViewer');
const PhraseTypes = require('../../../lib/tm/PhraseTypes');
const CommandQueue = require('../../../lib/processing/MainQueue');
const NewRecordingCommand = require('../../../lib/processing/NewRecordingCommand');
const RedoTranscriptionCommand = require('../../../lib/processing/RedoTranscriptionCommand');
const TextMiningCommand = require('../../../lib/processing/TextMiningCommand');
const recordingTrash = require('../../../lib/model/RecordingTrash');
const notFound = require('../../../routes/controllers/notFound');

const recording = require('../../../routes/controllers/recording');

const mockStatus = {
	send: jest.fn(),
};

const res = {
	render: jest.fn(),
	redirect: jest.fn(),
	status: jest.fn(() => mockStatus),
};

const req = {
	query: {
		page: 0,
	},
	project: {},
	params: {
		recordingId: 1345432,
	},
	body: {
		transcript: 'fakeTranscript',
	},
	recording: {
		entityKey: {
			id: 1112345,
		},
		dateCreation: new Date(),
		save: jest.fn(),
	},
};


jest.mock('../../../lib/utility/logger');
jest.mock('../../../lib/gcp/RecordingBucket');
jest.mock('../../../lib/gcp/RecordingBucket');
jest.mock('../../../lib/model/viewer/StandupViewer', () => jest.fn()
	.mockImplementation(() => ({
		filterPhrases: jest.fn(() => []),
		getUniqueAuthors: jest.fn(() => []),
	})));
jest.mock('../../../lib/tm/PhraseTypes');
jest.mock('../../../lib/processing/MainQueue', () => ({
	add: jest.fn(),
}));
jest.mock('../../../lib/processing/NewRecordingCommand');
jest.mock('../../../lib/processing/RedoTranscriptionCommand');
jest.mock('../../../lib/processing/TextMiningCommand');
jest.mock('../../../lib/model/RecordingTrash', () => ({
	moveToTrash: jest.fn(),
}));


beforeEach(() => {
	jest.clearAllMocks();
});


describe('load', async () => {
	const next = jest.fn();
	it('Should call next route', async () => {
		await recording.load[0](req, res, next);
		expect(next).toHaveBeenCalled();
	});
});

describe('get', async () => {
	it('Should call res.render with correct params', async () => {
		await recording.get(req, res);
		expect(res.render).toHaveBeenCalled();
		const [viewName, data] = res.render.mock.calls[0];
		expect(viewName).toBe('standup');
		expect(data).toHaveProperty('project');
		expect(typeof data.title).toBe('string');
		expect(Array.isArray(data.others)).toBeTruthy();
		expect(data).toHaveProperty('audio');
		expect(data).toHaveProperty('project');
	});
});

describe('editTranscription', async () => {
	it('Should editTranscription correctly', async () => {
		await recording.editTranscription(req, res);
		expect(req.recording.save).toBeCalled();
		expect(CommandQueue.add).toBeCalled();
		expect(res.redirect).toBeCalled();
		const [elem] = res.redirect.mock.calls[0];
		expect(elem).toBe(`../${req.recording.entityKey.id}`);
	});
});

describe('redoUpload', async () => {
	it('Should redo the upload correctly', async () => {
		await recording.redoUpload(req, res);
		expect(res.redirect).toBeCalled();
		expect(CommandQueue.add).toBeCalled();
		const [elem] = res.redirect.mock.calls[0];
		expect(elem).toBe(`../${req.recording.entityKey.id}`);
	});
});

describe('redoTranscription', async () => {
	it('Should redo the transcription correctly', async () => {
		await recording.redoTranscription(req, res);
		expect(res.redirect).toBeCalled();
		expect(CommandQueue.add).toBeCalled();
		const [elem] = res.redirect.mock.calls[0];
		expect(elem).toBe(`../${req.recording.entityKey.id}`);
	});
});

describe('redoTextMining', async () => {
	it('Should redo the transcription correctly', async () => {
		await recording.redoTranscription(req, res);
		expect(res.redirect).toBeCalled();
		expect(CommandQueue.add).toBeCalled();
		const [elem] = res.redirect.mock.calls[0];
		expect(elem).toBe(`../${req.recording.entityKey.id}`);
	});
});

describe('delete', async () => {
	it('Should move to trash one stand-up', async () => {
		await recording.delete(req, res);
		expect(res.redirect).toBeCalled();
		expect(recordingTrash.moveToTrash).toBeCalled();
		const [elem] = recordingTrash.moveToTrash.mock.calls[0];
		expect(elem).toBe(req.recording.entityKey.id);
		const [redir] = res.redirect.mock.calls[0];
		expect(redir).toBe('../../');
	});
});
