const PhraseTypes = require('../../../../lib/tm/PhraseTypes');
const StandupViewer = require('../../../../lib/model/viewer/StandupViewer');

const recording = {
	id: 12345,
	textMining: { results: [] },
};

const standupViewer = new StandupViewer(recording);

describe('constructor', () => {
	it('Should throw TypeError', () => {
		expect(() => {
			const useless = new StandupViewer(undefined);
		}).toThrow();
	});

	it('Should create new StandupViewer with correct fields', () => {
		const rec = new StandupViewer(recording);
		expect(rec.id).toBe(recording.id);
		expect(rec.recording).toBe(recording);
		expect(rec.textMining).toBe(recording.textMining);
	});
});

describe('filterPhrases', () => {
	it('Should return empty array', () => {
		expect(Array.isArray(standupViewer.filterPhrases(PhraseTypes.SOLUTION))).toBeTruthy();
		expect(standupViewer.filterPhrases(PhraseTypes.SOLUTION).length === 0).toBeTruthy();
	});
});

describe('getUniqueAuthors', () => {
	it('Should return an object with the settings', () => {
		expect(Array.isArray(standupViewer.getUniqueAuthors())).toBeTruthy();
	});

	it('Should test local functions', () => {
		const pr = standupViewer.phrases
			.filter(frase => !!frase.name)
			.map(frase => frase.name);
		expect(Array.isArray(pr)).toBeTruthy();
	});
});
