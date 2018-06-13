const logger = require('../../../lib/utility/logger');
const CommandQueue = require('../../../lib/processing/CommandQueue');
const States = require('../../../lib/processing/CommandQueueStates');

jest.mock('../../../lib/utility/logger');

const mockExecute = jest.fn().mockReturnValue(Promise.resolve());
const mockStart = jest.fn();
const mockRun = jest.fn();

jest.fn('../../../lib/utility/logger');

class ThrowingCommand {
	/* eslint-disable class-methods-use-this */
	async execute() {
		throw new Error();
	}
}

const failedCmd = new ThrowingCommand();

const createMockCommand = () => ({ execute: mockExecute });

beforeEach(() => {
	mockExecute.mockClear();
	mockStart.mockClear();
	mockRun.mockClear();
});

describe('add', () => {
	it('should add a command to the queue', () => {
		const queue = new CommandQueue();
		// NOTE prevents the queue to start after adding
		queue.start = mockStart;

		expect(queue.hasCommandInQueue()).toBeFalsy();

		queue.add(createMockCommand());
		queue.add(createMockCommand());

		expect(queue.hasCommandInQueue()).toBeTruthy();
	});

	it('should start the queue after adding', () => {
		const queue = new CommandQueue();
		queue.start = mockStart;
		queue.add(createMockCommand());

		expect(mockStart).toHaveBeenCalled();
	});
});

describe('start', () => {
	let queue;
	beforeEach(() => {
		queue = new CommandQueue();
		queue.queue = [createMockCommand()];
		queue.run = mockRun;
	});

	it('should not start if already running', () => {
		queue.state = States.RUNNING;
		queue.start();

		expect(queue.run).not.toHaveBeenCalled();
	});

	it('should not start if empty queue', () => {
		queue.queue = [];
		queue.start();

		expect(queue.run).not.toHaveBeenCalled();
	});

	it('should start if the queue is not empty or not already running', () => {
		queue.start();

		expect(queue.queue.length).toBeTruthy();
		expect(queue.state).not.toEqual(States.RUNNING);
		expect(queue.run).toHaveBeenCalled();
	});
});

describe('stop', () => {
	it('should set the state to stopped', () => {
		const queue = new CommandQueue();
		queue.stop();

		expect(queue.state).toEqual(States.STOPPED);
	});
});

describe('run', async () => {
	let queue;

	beforeEach(() => {
		queue = new CommandQueue();
		queue.queue = [1, 2, 3].map(x => createMockCommand(x));
	});

	it('should execute all commands until empty queue', async () => {
		await queue.run();

		expect(mockExecute).toHaveBeenCalledTimes(3);
		expect(queue.hasCommandInQueue()).toBeFalsy();
	});

	it('should call failed.push()', async () => {
		queue.add(failedCmd);
		queue.failed = [];
		await queue.run();

		expect(queue.failed.length).toBe(1);
		expect(queue.failed[0]).toBe(failedCmd);
	});

	it('should do nothing', async () => {
		queue.run = mockRun;
		queue.add(failedCmd);
		queue.state = States.RUNNING;

		await queue.start();
		expect(queue.run).toHaveBeenCalledTimes(1);
		// deve essere chiamata una volta sola
	});
});
