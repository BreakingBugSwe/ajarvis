// const logger = require('../../../lib/utility/logger');
const settingsFile = require('../../../lib/model/SettingsFile');
const fs = require('fs');

jest.mock('../../../lib/utility/logger', () => ({
	log: jest.fn(),
	debug: jest.fn(),
	error: jest.fn(),
}));
jest.mock('js-yaml');
jest.mock('fs');
jest.mock('path');

describe('singleton', () => {
	it('should have initial settings set', () => {
		expect(settingsFile.getData()).toBeDefined();
	});
});

describe('getData', () => {
	it('should return an object with the settings', () => {
		expect(typeof settingsFile.getData() === 'object').toBeTruthy();
	});
});

describe('setData', () => {
	const mockWriteData = jest.fn();
	const { writeData } = settingsFile;
	const invalidNewSettings = {
		min_recording_length: settingsFile.MIN_REC_LENGTH - 1,
	};
	const validNewSettings = {};

	beforeAll(() => {
		// replace SettingsFile#writeData with a mock
		settingsFile.writeData = mockWriteData;
	});

	beforeEach(() => {
		mockWriteData.mockClear();
	});

	it('should write in the settings file, if valid', () => {
		settingsFile.setData(validNewSettings);
		expect(mockWriteData).toHaveBeenCalled();
	});

	it('shouldn\'t write and throw, if new settings are invalid', () => {
		expect(() => settingsFile.setData(invalidNewSettings)).toThrow();
		expect(mockWriteData).not.toHaveBeenCalled();
	});

	afterAll(() => {
		// restore SettingsFile#writeData with a mock
		settingsFile.writeData = writeData;
	});
});

describe('readData', () => {
	const mockFsExistsTrue = jest.fn().mockReturnValue(true);
	const mockFsExistsFalse = jest.fn().mockReturnValue(false);
	const mockFsReadFile = jest.fn().mockReturnValue('');
	const { writeData } = settingsFile;
	const mockWriteData = jest.fn();

	beforeAll(() => {
		// replace SettingsFile#writeData with a mock
		settingsFile.writeData = mockWriteData;
		fs.existsSync = mockFsExistsTrue;
		fs.readFileSync = mockFsReadFile;
	});

	beforeEach(() => {
		mockWriteData.mockClear();
		mockFsExistsTrue.mockClear();
		mockFsExistsFalse.mockClear();
		mockFsReadFile.mockClear();
	});

	it('should read the settings from the file, if exists', () => {
		settingsFile.readData();

		expect(mockFsExistsTrue).toHaveBeenCalled();
		expect(mockFsReadFile).toHaveBeenCalled();
	});

	it('should write a new file with the current data if not exists', () => {
		fs.existsSync = mockFsExistsFalse;

		settingsFile.readData();

		expect(mockFsExistsFalse).toHaveBeenCalled();
		expect(mockFsReadFile).not.toHaveBeenCalled();
		expect(mockWriteData).toHaveBeenCalled();
	});

	afterEach(() => {
		fs.existsSync = mockFsExistsTrue;
	});

	afterAll(() => {
		// restore SettingsFile#writeData with a mock
		settingsFile.writeData = writeData;
	});
});
