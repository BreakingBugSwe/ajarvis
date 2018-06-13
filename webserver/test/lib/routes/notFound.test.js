const notFound = require('../../../routes/controllers/notFound');

const res = {
	render: jest.fn(),
	redirect: jest.fn(),
};

res.status = jest.fn().mockReturnValue(res);
describe('view', async () => {
	const req = {
		get: jest.fn(),
	};
	it('Should respond with error something', async () => {
		await notFound.view(req, res);
		const [viewName, data] = res.render.mock.calls[0];
		expect(viewName).toBe('notFound');
		expect(data).toHaveProperty('title');
		expect(data).toHaveProperty('url');
		expect(data).toHaveProperty('referer');
	});
});
