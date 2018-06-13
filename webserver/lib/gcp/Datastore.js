/**
 * @file Google Cloud Datastore client (singleton)
 * Data Creazione:  2018-02-28
 *
 * @version 0.0.2
 * @author  Tommaso Sotte
 */

const env = require('../../env');
const GCDatastore = require('@google-cloud/datastore');

const { keyFilename } = env.gcp;

/**
 * Unique instance of a Datastore client.
 * The credetials are specified in the env.js file.
 *
 * @see {@link https://stackoverflow.com/a/48580499}
 * @see {@link https://github.com/googleapis/nodejs-datastore/blob/master/src/index.js}
 * @see {@link https://github.com/googleapis/nodejs-datastore/blob/master/src/v1/datastore_client.js}
 * @type {GCDatastore}
 */
const datastore = new GCDatastore({ keyFilename });

module.exports = datastore;
