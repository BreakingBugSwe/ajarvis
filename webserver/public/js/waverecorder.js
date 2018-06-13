/* eslint-env jquery, browser */

// require: https://github.com/kopiro/siriwavejs
// require: https://github.com/chris-rudmin/opus-recorder

/**
 * Facade di un recorder con visualizzazione della waveform.
 */

(function WaveRecorderIIFE(window) {
	const pad = n => (n < 10 ? `0${n}` : n);

	class Chronometer {
		constructor() {
			this.startTime = 0;
			this.totalTime = 0;
			this.interval = null;
			this.intervalPolling = 100;
			this.intervalFn = null;
		}

		start() {
			// prevent starting a new, if already running
			if (this.interval) return;

			this.startTime = this.startTime || Date.now();

			this.interval = setInterval(
				() => this.onUpdate(),
				this.intervalPolling
			);
		}

		stop() {
			this.interval = clearInterval(this.interval);
			this.startTime = 0;
		}

		reset() {
			this.startTime = 0;
			this.totalTime = 0;
		}

		onUpdate() {
			const now = Date.now();
			this.totalTime += (now - this.startTime);
			this.startTime = now;

			if (this.intervalFn) this.intervalFn();
		}

		getTimeString() {
			const t = new Date(this.totalTime);
			// => HH:MM:SS
			// HACK: conta sempre un'ora in più, quindi la sottraiamo
			return `${pad(t.getHours() - 1)}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
		}

		// => ms
		getTime() {
			return this.totalTime;
		}
	}

	class WaveRecorder {
		/**
		 * @param {{ wave: String, recorder: {}, encoding: String }} params
		 */
		constructor(params = {}) {
			// opus-recorder
			// Config API https://github.com/chris-rudmin/opus-recorder#general-config-options
			// API https://github.com/chris-rudmin/opus-recorder#instance-methods
			this.recorder = new window.Recorder({
				leaveStreamOpen: true,
				originalSampleRateOverride: 16000,
				encoderPath: '/js/waveWorker.min.js',
				...params.recorder,
			});

			// siriwaver
			// /public/js/waver.js
			const waveElem = document.querySelector(params.wave || '#waveform');
			this.wave = new window.SiriWaver(waveElem, {
				color: '#555',
			});

			this.state = 'initial';

			// encoding dell'output di opus-recorder
			this.encoding = params.encoding || 'audio/wav';

			this.chronometer = new Chronometer();

			this.lastRecording = {
				audio: null,
				duration: 0,
			};

			this.resetEventsCallbacks();
			this.init();
		}

		init() {
			this.recorder.ondataavailable = this.onRecorderData.bind(this);

			this.chronometer.intervalFn =
				() => this.onrecording({ time: this.chronometer.getTimeString() });

			this.wave.start();
			this.wave.stop();
		}

		// Mostra wave e riprende il recording
		start() {
			if (this.state === 'paused') {
				this.resume();
				return;
			}

			this.recorder.start().then(() => {
				this.chronometer.reset();
				this.chronometer.start();
				this.startWaveWithData();
				this.state = 'recording';

				this.onstart();
			});
		}

		startWaveWithData() {
			const { sourceNode, audioContext } = this.recorder;
			this.analyser = audioContext.createAnalyser();
			this.analyser.fftSize = 256;

			// https://github.com/chris-rudmin/opus-recorder/blob/master/src/recorder.js#L184
			sourceNode.connect(this.analyser);

			this.wave.start(() => {
				if (!this.analyser) return 0;

				const bufferLength = this.analyser.frequencyBinCount;
				const dataArray = new Uint8Array(bufferLength);

				this.analyser.getByteFrequencyData(dataArray);

				// https://github.com/unixzii/Waver.js/blob/master/js/MusicPlayer.js
				const sum = dataArray.reduce((all, val) => all + val, 0);
				const ampl = (sum / bufferLength) / 255;

				return ampl;
			});
		}

		resume() {
			if (['cancelled', 'stopped', 'initial'].includes(this.state)) {
				this.start();
				return;
			}

			// "resume() will append to the current recording"
			this.recorder.resume();
			this.startWaveWithData();
			this.chronometer.start();
			this.state = 'recording';

			this.onresume();
		}

		// Ferma wave e pausa il recording
		pause() {
			this.wave.stop();
			this.recorder.pause();
			this.chronometer.stop();
			this.state = 'paused';

			this.onpause();
		}

		cancel() {
			this.wave.stop();
			this.recorder.stop();
			this.chronometer.stop();
			this.state = 'cancelled';

			this.oncancel();
		}

		// Ferma la registrazione corrente e la rende disponibile
		stop() {
			this.wave.stop();
			this.recorder.stop();
			this.chronometer.stop();
			this.state = 'stopped';

			this.onstop();
		}

		/**
		 * Callback usato per Recorder#ondataavailable.
		 * @param  {[]} array
		 * @private
		 */
		onRecorderData(array) {
			// Se viene cancellata la registrazione, la scarta e non la salva.
			if (this.state !== 'stopped') return;

			const data = new Blob([array], {
				type: this.encoding || 'audio/wav',
			});

			this.lastRecording = {
				audio: data,
				time: this.getTime(),
			};

			this.ondata(data);
		}

		resetEventsCallbacks() {
			const events = ['ondata', 'onrecording', 'onresume', 'onpause', 'onstart', 'onstop', 'oncancel'];
			events.forEach((e) => { this[e] = () => {}; });
		}

		getTime() {
			return this.chronometer.getTime();
		}

		/**
		 * Semplice implementazione dell'observer pattern.
		 * @see {@link https://github.com/katspaugh/wavesurfer.js/blob/master/src/util/observer.js}
		 * @param  {String}   name nome dell'evento
		 * @param  {Function} fn callback(event: {name, source:this}, ...args)
		 */
		// on(name, fn) {
		// 	if (typeof fn !== 'function') throw new Error('callback must be a function');
		//
		// 	if (!this.handlers[name]) this.handlers[name] = [];
		//
		// 	this.handlers[name].push(fn);
		// }
		//
		// notify(name, ...args) {
		// 	if (!this.handlers[name]) return;
		//
		// 	this.handlers[name].forEach(fn =>
		// 		fn.call(null, { name, source: this }, ...args));
		// }
	}

	/* eslint-disable-next-line */
	window.WaveRecorder = WaveRecorder;
}(window));
