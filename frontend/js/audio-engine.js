/**
 * Pulse High-Precision, Super-Loud Audio Engine
 * Supports 4/4, 2/4, 3/4, 5/4, 6/8 + Click, Woodblock, Cowbell, Clap
 * With Fletcher-Munson presence EQ and Tanh saturation for extreme guitar cut.
 */
class MetronomeAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.presenceFilter = null;
    this.saturator = null;
    this.compressor = null;

    // Metronome state
    this.bpm = 90;
    this.beatsPerBar = 4;
    this.volume = 3.0; // 300% default boost
    this.soundType = 'click'; // 'click' | 'woodblock' | 'cowbell' | 'clap'
    this.isAccentEnabled = false;

    this.isPlaying = false;
    this.currentBeatIndex = 0;
    this.nextNoteTime = 0.0;
    this.timerId = null;
    this.timerWorker = null;
    this.lookahead = 25.0; // scheduler interval (ms)
    this.scheduleAheadTime = 0.12; // lookahead window (seconds)

    // Visual synchronization callback: (beatNumber, isAccent, audioTime, totalBeats)
    this.onBeat = null;

    this.setupWorker();
    this.setupVisibilityListener();
  }

  setupWorker() {
    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            timer = setInterval(() => self.postMessage('tick'), 25);
          } else if (e.data === 'stop') {
            if (timer) clearInterval(timer);
            timer = null;
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.timerWorker = new Worker(URL.createObjectURL(blob));
      this.timerWorker.onmessage = (e) => {
        if (e.data === 'tick') {
          this.scheduler();
        }
      };
    } catch (err) {
      this.timerWorker = null;
    }
  }

  setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.scheduleAheadTime = 0.25;
        } else {
          this.scheduleAheadTime = 0.12;
        }
      });
    }
  }

  initAudioContext() {
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    // 1. Fletcher-Munson 3.5 kHz Presence Peaking Filter (Cuts through guitar sound)
    this.presenceFilter = this.audioCtx.createBiquadFilter();
    this.presenceFilter.type = 'peaking';
    this.presenceFilter.frequency.value = 3500;
    this.presenceFilter.Q.value = 1.6;
    this.presenceFilter.gain.value = 7.5;

    // 2. Tanh WaveShaper Saturation (Produces upper harmonics for maximum RMS loudness)
    this.saturator = this.audioCtx.createWaveShaper();
    this.saturator.curve = this.makeSaturationCurve(25);
    this.saturator.oversample = '4x';

    // 3. Peak Limiter / Brickwall Compressor
    this.compressor = this.audioCtx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-5.0, this.audioCtx.currentTime);
    this.compressor.knee.setValueAtTime(2.0, this.audioCtx.currentTime);
    this.compressor.ratio.setValueAtTime(16.0, this.audioCtx.currentTime);
    this.compressor.attack.setValueAtTime(0.001, this.audioCtx.currentTime);
    this.compressor.release.setValueAtTime(0.035, this.audioCtx.currentTime);

    // 4. Master Boost Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

    // Connect audio chain
    this.presenceFilter.connect(this.saturator);
    this.saturator.connect(this.compressor);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.audioCtx.destination);
  }

  makeSaturationCurve(amount = 25) {
    const n = 44100;
    const curve = new Float32Array(n);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; ++i) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  setVolume(percent) {
    this.volume = percent / 100;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.015);
    }
  }

  setBpm(newBpm) {
    this.bpm = Math.max(30, Math.min(300, newBpm));
  }

  setTimeSignature(beats) {
    this.beatsPerBar = beats;
    this.currentBeatIndex = 0;
  }

  setSoundType(sound) {
    this.soundType = sound;
  }

  setAccentEnabled(enabled) {
    this.isAccentEnabled = enabled;
  }

  start() {
    this.initAudioContext();
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentBeatIndex = 0;
    this.nextNoteTime = this.audioCtx.currentTime + 0.05;

    if (this.timerWorker) {
      this.timerWorker.postMessage('start');
    } else {
      this.scheduler();
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timerWorker) {
      this.timerWorker.postMessage('stop');
    }
    clearTimeout(this.timerId);
  }

  scheduler() {
    if (!this.isPlaying) return;

    if (this.nextNoteTime < this.audioCtx.currentTime - 0.25) {
      this.nextNoteTime = this.audioCtx.currentTime + 0.05;
    }

    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleBeat(this.nextNoteTime, this.currentBeatIndex);
      this.advanceBeat();
    }

    if (!this.timerWorker) {
      this.timerId = setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  advanceBeat() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += secondsPerBeat;
    this.currentBeatIndex = (this.currentBeatIndex + 1) % this.beatsPerBar;
  }

  scheduleBeat(time, beatIdx) {
    const beatNumber = beatIdx + 1; // 1 to beatsPerBar
    const isAccent = (beatNumber === 1) && this.isAccentEnabled;

    if (this.onBeat) {
      this.onBeat(beatNumber, isAccent, time, this.beatsPerBar);
    }

    this.synthesizeSound(time, isAccent);
  }

  synthesizeSound(time, isAccent) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    switch (this.soundType) {
      case 'woodblock':
        this.synthWoodblock(ctx, time, isAccent);
        break;
      case 'cowbell':
        this.synthCowbell(ctx, time, isAccent);
        break;
      case 'clap':
        this.synthClap(ctx, time, isAccent);
        break;
      case 'click':
      default:
        this.synthClick(ctx, time, isAccent);
        break;
    }
  }

  /**
   * 1. Click (High-Penetration Boss DB-90 Style)
   */
  synthClick(ctx, time, isAccent) {
    const freq = isAccent ? 3800 : 2700;
    const gainLevel = isAccent ? 1.4 : 0.95;
    const duration = isAccent ? 0.045 : 0.032;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const env = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.5, time);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.4, time);
    osc2.connect(osc2Gain);
    osc2Gain.connect(env);
    osc1.connect(env);

    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(gainLevel, time + 0.001);
    env.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    env.connect(this.presenceFilter);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration + 0.01);
    osc2.stop(time + duration + 0.01);
  }

  /**
   * 2. Woodblock (Tuned Resonant Hollow Block)
   */
  synthWoodblock(ctx, time, isAccent) {
    const freq = isAccent ? 2400 : 1800;
    const gainVal = isAccent ? 1.3 : 0.9;
    const dur = 0.04;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, time + dur);

    env.gain.setValueAtTime(0.001, time);
    env.gain.linearRampToValueAtTime(gainVal, time + 0.001);
    env.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(env);
    env.connect(this.presenceFilter);

    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  /**
   * 3. Cowbell (Dense Detuned Metallic Clank)
   */
  synthCowbell(ctx, time, isAccent) {
    const f1 = isAccent ? 740 : 587;
    const f2 = isAccent ? 1046 : 845;
    const dur = isAccent ? 0.065 : 0.05;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'square';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(f1, time);
    osc2.frequency.setValueAtTime(f2, time);

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(isAccent ? 950 : 800, time);
    bp.Q.value = 3.0;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.001, time);
    env.gain.linearRampToValueAtTime(isAccent ? 1.2 : 0.85, time + 0.001);
    env.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc1.connect(bp);
    osc2.connect(bp);
    bp.connect(env);
    env.connect(this.presenceFilter);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + dur + 0.01);
    osc2.stop(time + dur + 0.01);
  }

  /**
   * 4. Clap (Burst Noise Transient)
   */
  synthClap(ctx, time, isAccent) {
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isAccent ? 1400 : 1000, time);
    filter.Q.value = 2.0;

    const env = ctx.createGain();
    const dur = 0.045;
    env.gain.setValueAtTime(0.001, time);
    env.gain.linearRampToValueAtTime(isAccent ? 1.4 : 1.0, time + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    noise.connect(filter);
    filter.connect(env);
    env.connect(this.presenceFilter);

    noise.start(time);
    noise.stop(time + dur + 0.01);
  }
}

window.MetronomeAudioEngine = MetronomeAudioEngine;
