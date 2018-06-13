/**
 * @file Bucket di Google Cloud Storage dei recording/standup.
 * Data Creazione: 2018-04-07.
 *
 * @version 0.0.1
 * @author	Tommaso Sotte
 */

const env = require('../../env');
const StorageBucket = require('./StorageBucket');

module.exports = new StorageBucket(env.gcp.buckets.standups);
