/**
 * @file Google Cloud Storage client (singleton)
 * Data Creazione: 2018-04-05.
 *
 * @version 0.0.1
 * @author  Giacomo Del Moro
 * @author	Alessandro Zangari
 */

const env = require('../../env');
const GCStorage = require('@google-cloud/storage');

const { keyFilename } = env.gcp;

/**
 * Unique instance of a Storage client.
 * The credetials are specified in the env.js file.
 *
 * @type {GCStorage}
 */
const Storage = new GCStorage({ keyFilename });

module.exports = Storage;
