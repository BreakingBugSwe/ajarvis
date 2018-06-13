const Trash = require('../../../lib/model/Trash');

const mockCurrentDate = new Date('2018-01-15');
const mockGetCurrentDate = jest.fn().mockReturnValue(mockCurrentDate);

// Mock gstore#Model
const mockModelUpdate = jest.fn();
const mockModelDelete = jest.fn();
const MockModelQuery = jest.fn().mockImplementation(() => ({
	filter: () => new MockModelQuery(),
	run: () => ({ entities: [] }),
}));
const MockModel = jest.fn().mockImplementation(() => ({
	update: mockModelUpdate,
	delete: mockModelDelete,
	query: () => new MockModelQuery(),
}));

Trash.getCurrentDate = mockGetCurrentDate;

describe('static', () => {
	describe('calculateOlderThan', () => {
		it('should subtract N days from current date', () => {
			const days = 40;

			const olderThan = Trash.calculateOlderThan(days);
			expect(olderThan).toEqual(new Date('2017-12-06'));
		});
	});
});

describe('instance', () => {
	const model = new MockModel();
	const trash = new Trash(model);

	beforeEach(() => {
		mockModelUpdate.mockClear();
		mockModelDelete.mockClear();
	});

	describe('moveToTrash', () => {
		it('should set deleted to current date', async () => {
			const id = 101;
			await trash.moveToTrash(id);

			// id
			expect(mockModelUpdate.mock.calls[0][0]).toEqual(id);
			// { deleted }
			expect(mockModelUpdate.mock.calls[0][1]).toHaveProperty('deleted');
			expect(mockModelUpdate.mock.calls[0][1].deleted).toEqual(mockCurrentDate);
		});
	});

	describe('restoreFromTrash', () => {
		it('should set deleted to false', async () => {
			const id = 101;
			await trash.restoreFromTrash(id);

			// id
			expect(mockModelUpdate.mock.calls[0][0]).toEqual(id);
			// { deleted }
			expect(mockModelUpdate.mock.calls[0][1]).toHaveProperty('deleted');
			expect(mockModelUpdate.mock.calls[0][1].deleted).toEqual(false);
		});
	});

	describe('emptyTrash', () => {
		it('should delete from model', async () => {
			const olderThan = new Date();
			await trash.emptyTrash(olderThan);

			expect(mockModelDelete).toHaveBeenCalled();
		});
	});
});
