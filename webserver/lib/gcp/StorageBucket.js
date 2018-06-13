/**
 * @file Bucket di Google Cloud Storage.
 * Data Creazione: 2018-04-06.
 *
 * @version 0.0.3
 * @author  Giacomo Del Moro
 * @author  Alessandro Zangari
 * @author	Tommaso Sotte
 */

const env = require('../../env');
const path = require('path');
const logger = require('../utility/logger');
const Storage = require('../gcp/Storage');

class StorageBucket {
	constructor(bucketName) {
		this.bucketName = bucketName;
		this.bucket = Storage.bucket(bucketName);
		// this.bucket = Storage.bucket('bcu');

		// Se non esiste il bucket lo crea
		this.createBucket();
	}

	async createBucket() {
		try {
			const [exists] = await this.bucket.exists();
			if (exists) return;

			await this.bucket.create();
			logger.debug(`StorageBucket '${this.bucketName}' has been created now.`);
		} catch (err) {
			logger.error(`StorageBucket '${this.bucketName}' failed to be initialized, error`, err);
		}
	}

	/**
	 * Carica il file con il nome specificato su Storage (con lo stesso nome)
	 * Docs: `https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/Bucket#upload`
	 * @param  {String}  filename Nome del file nella cartella locale `upload`
	 * @param  {String}
	 * @return {Promise}
	 */
	async upload(filename, dirpath = env.uploads.dir) {
		const filepath = path.resolve(path.join(dirpath, filename));

		try {
			await this.bucket
				.upload(filepath, {
					destination: filename,
					resumable: true,
				});
			logger.debug(`File ${filename} uploaded in bucket ${this.bucketName}`);
		} catch (err) {
			logger.error('StorageBucket#upload error:', err, filepath);
			throw new Error(`Failed uploading the file ${filename} to the bucket ${this.bucketName}`);
		}
	}

	/**
	 * Recupera il file con il filename specificato dal bucket `uploads` e
	 * lo piazza nella cartella 'upoads' definita in env
	 * Docs: `https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/File#download`
	 * @param  {String}  filename il nome del file da scaricare dal bucket
	 * @return {Promise}
	 */
	async download(filename) {
		try {
			await this.bucket
				.file(filename)
				.download({
					destination: env.uploads.dir,
				});
			logger.debug(`File ${filename} downloaded in bucket ${this.bucketName}`);
			logger.debug(`File in ${env.uploads.dir}/${filename}`);
		} catch (err) {
			logger.error('StorageBucket#download error:', err);
			throw new Error(`Failed downloading the file ${filename} in bucket ${this.bucketName}`);
		}
	}


	/**
	 * Cancella il file con il filename specificato dal bucket `uploads`
	 * Docs: `https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/File#delete`
	 * @param  {String}  filename il nome del file da eliminare dal bucket
	 * @return {Promise}
	 */
	async delete(filename) {
		try {
			await this.bucket
				.file(filename)
				.delete();
			logger.debug(`File ${filename} deleted from bucket ${this.bucketName}`);
		} catch (err) {
			logger.error('StorageBucket#delete error:', err);
			throw new Error(`Failed deleting the file ${filename} in bucket ${this.bucketName}`);
		}
	}

	/**
	 * Ritorna il link al file su Storage, contenuto nel bucket 'uploads' con
	 * il filename indicato, nel formato `gs://bucket_name/object_name`.
	 * Utile per Google Cloud Speech, per riferirsi all'uri di un file senza
	 * doverla scaricare e caricare su Speech.
	 * @see {@link https://cloud.google.com/nodejs/docs/reference/speech/1.1.x/google.cloud.speech.v1.html?hl=it#.RecognitionAudio}
	 * @param  {String} filename Il nome del file così come è nel bucket
	 * @return {String} Il link al file come `gs://bucket_name/object_name`
	 */
	getLink(filename) {
		return `gs://${this.bucketName}/${filename}`;
	}

	/**
	 * Ritorna il link pubblico al file.
	 * Tramite `config` è possibile impostare una durata massima della validità
	 * del link e il livello di accesso al file ('read', 'write', ecc).
	 * @see {@link https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/File?hl=it#getSignedUrl}
	 * @param  {String}  filename
	 * @param  {{ action: 'read', expires: Date }}  config
	 * @return {Promise}          [description]
	 */
	async getPublicLink(filename, config) {
		// Default expiration, un giorno
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);

		try {
			// [0: url]
			const response = await this.bucket
				.file(filename)
				.getSignedUrl({
					action: 'read',
					expires: tomorrow,
					...config,
				});

			return response[0];
		} catch (err) {
			logger.error('StorageBucket#getPublicLink, config:', config, '\nerror:', err);
			throw new Error(`Failed getting the public link for ${filename}`);
		}
	}
}

module.exports = StorageBucket;
