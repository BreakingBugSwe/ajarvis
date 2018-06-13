/**
 * @file Step dello Speech to text
 * Data Creazione: 2018-04-05.
 *
 * @version 0.0.3
 * @author  Giacomo Del Moro
 * @author  Alessandro Zangari
 * @author	Tommaso Sotte
 * @author	Paolo Rizzardo
 */

const logger = require('../utility/logger');
const speech = require('../gcp/SpeechToText');
// NOTE: RecordingStorage serve per avere il link al file su Storage
const recordingBucket = require('../gcp/RecordingBucket');
const Step = require('./Step');
const ProcessStateSetting = require('../model/enum/ProcessStateSetting');

// const EMPTY_AUDIO_TIMEOUT = 10 * 1e3;

const baseSpeechRequest = {
	audio: {
		uri: '',
	},
	config: {
		encoding: 'LINEAR16',
		languageCode: 'it-IT',
	},
};

class SpeechToTextStep extends Step {
	constructor(recording, project) {
		super(ProcessStateSetting.TRANSCRIPTED, recording);
		this.project = project;
	}

	/**
	 * Transcrive dal file audio del recording utilizzando Google Cloud Speech.
	 * @return {String}
	 */
	async run() {
		const speechRequest = {
			...baseSpeechRequest,
			audio: {
				uri: recordingBucket.getLink(this.recording.filename),
			},
			config: {
				...baseSpeechRequest.config,
				speechContexts: [
					{
						phrases: this.project.keywords || [],
					},
				],
			},
		};

		try {
			// => [operation, initialApiResponse]
			// operation ha cancel() per fermare il processo; per attendere
			// la risposta useremo promise() invece.
			const response = await speech.longRunningRecognize(speechRequest);
			const [operation] = response;

			// FIXME: se l'audio è senza testo attende indefinitivamente
			// const emptyTimeout = setTimeout(() => operation.cancel(), EMPTY_AUDIO_TIMEOUT);

			// => [{ results }, metadata, finalApiResponse]
			const finalResponse = await operation.promise();

			// clearTimeout(emptyTimeout);

			const transcript = finalResponse[0].results
				.map(r => r.alternatives[0].transcript)
				.join(' ');
			logger.debug(`SpeechToTextStep completed: ${transcript.substr(0, 20)}...`);
			this.recording.transcript = transcript;
		} catch (err) {
			logger.error('Failed SpeechToTextStep:', err, speechRequest);
			throw new Error('Failed SpeechToTextStep.');
		}
	}
}

module.exports = SpeechToTextStep;
