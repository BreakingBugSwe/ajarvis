/**
 * @file Validatore per enumeration objects
 * Data Creazione: 2018-02-30.
 *
 * @version 0.0.1
 * @author  Tommaso Sotte
 */

/**
 * Valida un valore, rispetto ad una lista di enum
 * @param  {Enum} value     Il valore che si vuole validare
 * @param  {Validator} validator Il validatore da usare
 * @param  {[]} enumObj   I valori accettabili per il valore
 * @return {[type]}           [description]
 */
module.exports = (value, validator, enumObj) => {
	if (!validator.isString(value)) return false;

	// { ONE: 'ONE', TWO: 'TWO' } => ['ONE', 'TWO'] contains value?
	const found = Object.values(enumObj).find(x => x === value);
	return !!found; // cast to bool
};
