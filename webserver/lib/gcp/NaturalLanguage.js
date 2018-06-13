/**
 * @file Google Cloud Nautral Language (singleton)
 * Data Creazione: 2018-04-05.
 *
 * @version 0.0.1
 * @author  Giacomo Del Moro
 * @author	Alessandro Zangari
 */

const env = require('../../env');
const language = require('@google-cloud/language');

const { keyFilename } = env.gcp;

/**
 * Unique instance of a Natural Language client.
 * The credetials are specified in the env.js file.
 *
 * @type {GCNaturalLanguage}
 */
const NaturalLanguage = new language.LanguageServiceClient({ keyFilename });

module.exports = NaturalLanguage;
