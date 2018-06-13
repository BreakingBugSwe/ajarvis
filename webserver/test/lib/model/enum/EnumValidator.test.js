const enumValidator = require('../../../../lib/model/enum/EnumValidator');

const validator = {
	isString: () => true,
};

const validatorNotString = {
	isString: () => false,
};

const mockEnum = {
	A: 'A',
	BB: 'abba',
};

describe('validate', () => {
	it('should return false if not a string', () => {
		const a = 'A';
		expect(enumValidator(a, validatorNotString, mockEnum)).toBeFalsy();
	});

	it('should validate if in enum', () => {
		const a = 'A';
		expect(enumValidator(a, validator, mockEnum)).toBeTruthy();
	});

	it('should not validate if not in enum', () => {
		const b = 'B';
		expect(enumValidator(b, validator, mockEnum)).toBeFalsy();
	});
});
