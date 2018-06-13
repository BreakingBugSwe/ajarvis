const logger = require('../../../lib/utility/logger');
const ProcessStateSetting = require('../../../lib/model/enum/ProcessStateSetting');
const Step = require('../../../lib/processing/Step');

jest.mock('../../../lib/utility/logger');

beforeEach(() => {
	jest.clearAllMocks();
});

class CStep extends Step { // mock di classe concreta per controllare execute()
	/* eslint-disable class-methods-use-this, no-empty-function */
	async run() {}
}

const recordingMock = {
	entityKey: {
		id: 123,
	},
	save: jest.fn(),
};

describe('constructor', () => {
	it('Should throw cause of invalid state', async () => {
		expect(() => {
			const ul = new Step();
		}).toThrow();
	});
});

describe('execute', () => {
	const step = new Step(ProcessStateSetting.TRANSCRIPTED, recordingMock);

	it('Should throw error because run() is abstract', async () => {
		await expect(step.execute())
			.rejects
			.toThrow(/^abstract$/);
	});

	const cstep = new CStep(ProcessStateSetting.INITIAL, recordingMock);

	it('Should call recording.save()', async () => {
		await cstep.execute();
		expect(recordingMock.save).toBeCalled();
	});
});
