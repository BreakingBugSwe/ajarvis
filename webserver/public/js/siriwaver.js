/**
 * @file Create a wave similar to the Siri apple assistant (on iOS 9-10)
 * Data creazione: 2018-05-10
 * @version 0.0.1
 * @author	Tommaso Sotte
 */

/**
 * Originale:
 * @fileoverview Waver.js - a Siri like waver library.
 * @version 0.1.0
 *
 * @license MIT, see https://github.com/unixzii/Waver.js/LICENSE
 * @copyright 2016 Cyandev <unixzii@gmail.com>
 */

/**
 * Modifiche rispetto all'originale
 * - aggiunti controlli start/stop
 * - => classe es6
 * - migliorata gestione della config
 * - parametri di default cambiati
 */
/* eslint-env browser */

// default 0.05
const DEBOUNCE_SPEED = 0.5;
const MAX_AMPLITUDE = 1.0;
const DEFAULT_AMPL_CB = () => 0.5;

class SiriWaver {
	constructor(elem, config) {
		this.config = {
			width: 400,
			height: 200,
			frequency: 1.2,
			idleAmplitude: 0.05,
			debounceSpeed: DEBOUNCE_SPEED,
			maxAmplitude: MAX_AMPLITUDE,
			waveCount: 5,
			// speed
			phaseShift: -0.2,
			color: '#ffffff',
			primaryLineWidth: 3.0,
			otherLineWidth: 1.0,
			...config,
		};

		this.elem = elem;
		this.config.height = elem.height;
		this.config.width = elem.width;
		this.ctx = elem.getContext('2d');
		this.ctx.strokeStyle = this.config.color;

		this.phase = 0;
		this.amplitude = 0.1;
		this.targetAmplitude = 0;

		// Function that returns a number, from 0.0 to 1.0, that sets the amplitude
		// dynamically. es. from microphone
		this.amplitudeCb = null;

		this.renderFn = this.render.bind(this);
		this.renderingId = null;
		this.stopped = false;
	}

	update() {
		// Moves the wave horizontally
		this.phase += this.config.phaseShift;

		this.updateAmplitude();
	}

	updateAmplitude() {
		const { idleAmplitude, debounceSpeed, maxAmplitude } = this.config;
		const { amplitude, targetAmplitude } = this;

		if (typeof this.amplitudeCb === 'function') {
			const nextAmplitude = this.amplitudeCb();
			this.targetAmplitude = Math.max(Math.min(nextAmplitude, maxAmplitude), idleAmplitude);

			// Debounce the level changing.
			this.amplitude -= (amplitude - targetAmplitude)
				* debounceSpeed
				* Math.abs(targetAmplitude - amplitude);
		} else {
			this.amplitude = this.config.idleAmplitude;
		}
	}

	render() {
		this.update();

		this.ctx.strokeStyle = this.config.color;
		this.ctx.clearRect(0, 0, this.config.width, this.config.height);

		for (let i = 0; i < this.config.waveCount; i += 1) {
			this.renderWave(i);
		}

		window.requestAnimationFrame(this.renderFn);
	}

	renderWave(i) {
		/* eslint-disable-next-line object-curly-newline */
		const { width, height, waveCount, frequency } = this.config;
		const { amplitude, phase } = this;

		// Progress is a value between 1.0 and -0.5, determined by the current wave idx,
		// which is used to alter the wave's amplitude.
		const progress = 1.0 - (i / waveCount);
		// Shift the last wave's amplitude to make it lower than current level.
		const normalizedAmplitude = ((1.5 * progress) - 0.5) * amplitude;

		this.ctx.beginPath();

		for (let x = 0; x <= width; x += 1) {
			// Core algorithm from "https://github.com/kevinzhow/Waver/".
			// We use a parable to scale the sinus wave, that has its peak in
			// the middle of the view.
			const waveMid = width / 2.0;
			const scaling = -(((x / waveMid) - 1) ** 2) + 1;

			// base factor
			// let y = normalizedAmplitude
			// 	* Math.sin((2 * Math.PI * (x / width) * frequency) + phase);

			const y = (1
				// Scale it to proper height.
				* scaling * (height * 0.6)
				// Define wave height in current x
				* normalizedAmplitude * Math.sin((2 * Math.PI * (x / width) * frequency) + phase))
				// Translate it to vertical center.
				+ (height / 2.0);

			if (x === 0) {
				this.ctx.moveTo(x, y);
			} else {
				this.ctx.lineTo(x, y);
			}
		}

		this.ctx.lineWidth = i === 0
			? this.config.primaryLineWidth
			: this.config.otherLineWidth;

		this.ctx.globalAlpha = 1.0 - ((i / waveCount) ** 2);
		this.ctx.stroke();
	}

	setConfig(newConfig) {
		this.config = {
			...this.config,
			...newConfig,
		};
	}

	start(amplitudeCb = null) {
		this.setConfig({
			maxAmplitude: MAX_AMPLITUDE,
			debounceSpeed: DEBOUNCE_SPEED,
			phaseShift: -0.2,
		});
		this.amplitudeCb = amplitudeCb || DEFAULT_AMPL_CB;

		// Start the animation once
		if (this.renderingId) return;
		this.renderingId = window.requestAnimationFrame(this.renderFn);
	}

	stop() {
		this.setConfig({
			maxAmplitude: this.config.idleAmplitude,
			// Faster debounce speed, to make it stop faster
			debounceSpeed: 0.5,
			phaseShift: -0.15,
		});
	}
}

window.SiriWaver = SiriWaver;
