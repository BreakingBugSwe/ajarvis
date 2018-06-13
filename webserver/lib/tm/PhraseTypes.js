/**
 * @file Tipi di frasi del text-mining
 * Data Creazione:  2018-04-05
 *
 * @version 0.0.1
 * @author  Tommaso Loss
 * @author  Tommaso Sotte
 */

const PhraseTypes = {
	// task completed (?)
	TASK: 'tc',
	// problem
	PROBLEM: 'p',
	// problem completed (?)
	SOLUTION: 'pc',
	// continuation problem (?)
	CONTINUATION: 'cp',
	IGNORE: 'no',
};

module.exports = PhraseTypes;
