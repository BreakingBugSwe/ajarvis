/**
 * @file Google Cloud Speech To Text (singleton)
 * Data Creazione: 2018-04-05.
 *
 * @version 0.0.1
 * @author  Giacomo Del Moro
 * @author	Alessandro Zangari
 */

const env = require('../../env');
const speech = require('@google-cloud/speech');

const { keyFilename } = env.gcp;

/**
 * Unique instance of a Speech To Text client.
 * The credetials are specified in the env.js file.
 *
 * @type {GCSpeechToText}
 */
const SpeechToText = new speech.SpeechClient({ keyFilename });

module.exports = SpeechToText;
