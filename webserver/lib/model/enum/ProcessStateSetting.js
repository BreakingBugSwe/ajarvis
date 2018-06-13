/**
 * @file Stati del processo del recording.
 * Data creazione: 2018-04-24.
 * @version 0.0.1
 * @author	Tommaso Sotte
 */

const ProcessStateSetting = {
	// Appena creata, il file dev'essere ancora uploadato.
	INITIAL: 'INITIAL',
	// Caricata nello Storage.
	UPLOADED: 'UPLOADED',
	// Testo transcritto da Speech.
	TRANSCRIPTED: 'TRANSCRIPTED',
	// Il testo è stato minato.
	TEXTMINED: 'TEXTMINED',
	ERROR: 'ERROR',
};

module.exports = ProcessStateSetting;
