// audio.js - Web Audio API procedural soundtrack, sound effects, and narration engine

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.voiceGain = null;
    this.isMuted = false;
    this.voiceEnabled = true;
    this.selectedVoice = null;
    this.voicePitch = 1.0;
    this.voiceRate = 0.98;
    this.activeVoiceLines = null;
    this.mediaStreamDest = null;
    this.triggeredCues = new Set();
    this.bgmOscs = [];
    this.bgmInterval = null;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      this.loadVoices();
    }
  }

  loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural crystal-clear voices
    this.selectedVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')) && v.lang.startsWith('en')) ||
                         voices.find(v => v.lang.startsWith('en')) ||
                         voices[0];
  }

  setVoiceLines(lines) {
    this.activeVoiceLines = lines;
  }

  speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = this.voiceRate;
      utter.pitch = this.voicePitch;
      if (this.selectedVoice) {
        utter.voice = this.selectedVoice;
      }
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("Speech error:", e);
    }
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    this.voiceGain = this.ctx.createGain();
    this.voiceGain.gain.setValueAtTime(0.9, this.ctx.currentTime);

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.voiceGain.connect(this.masterGain);

    this.masterGain.connect(this.ctx.destination);

    // Audio stream for recording
    try {
      this.mediaStreamDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.mediaStreamDest);
    } catch (e) {
      console.warn('MediaStreamDestination not supported', e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, this.ctx.currentTime);
    }
  }

  resetTriggers() {
    this.triggeredCues.clear();
  }

  update(time, isPlaying) {
    if (!this.ctx || this.isMuted || !isPlaying) return;

    // Trigger SFX precisely on beat marks
    this.checkCue('logo_tick', time, 0.05, () => this.playLogoTick());
    this.checkCue('nav_whoosh', time, 1.10, () => this.playNavWhoosh());
    this.checkCue('bike_bell', time, 3.10, () => this.playBikeBell());
    this.checkCue('rain_start', time, 5.40, () => this.playRainSound());
    this.checkCue('arcade_echo', time, 8.80, () => this.playArcadeAcoustic());
    this.checkCue('friends_ping', time, 10.70, () => this.playFriendsPing());
    this.checkCue('sunset_lift', time, 13.30, () => this.playSunsetLift());
    this.checkCue('arrival_chime', time, 16.70, () => this.playArrivalChime());
    this.checkCue('brand_chord', time, 18.80, () => this.playBrandChord());

    // Dynamic music volume & intensity modulation
    if (this.musicGain) {
      const now = this.ctx.currentTime;
      if (time >= 8.8 && time < 10.7) {
        // Soften under arcade
        this.musicGain.gain.setTargetAtTime(0.25, now, 0.2);
      } else if (time >= 13.3 && time < 18.8) {
        // Lift into sunset
        this.musicGain.gain.setTargetAtTime(0.65, now, 0.3);
      } else if (time >= 18.8) {
        // Resolve into brand lock-up
        this.musicGain.gain.setTargetAtTime(0.35, now, 0.5);
      } else {
        this.musicGain.gain.setTargetAtTime(0.5, now, 0.2);
      }
    }

    // Voice-over narration cues
    if (this.voiceEnabled) {
      const lines = this.activeVoiceLines || [
        "A bike around the corner.",
        "Shelter before the rain.",
        "A passage worth taking.",
        "Friends already there.",
        "And a rooftop just in time.",
        "Go like you live here."
      ];
      this.checkCue('vo_1', time, 3.2, () => this.speak(lines[0]));
      this.checkCue('vo_2', time, 5.6, () => this.speak(lines[1]));
      this.checkCue('vo_3', time, 8.9, () => this.speak(lines[2]));
      this.checkCue('vo_4', time, 10.9, () => this.speak(lines[3]));
      this.checkCue('vo_5', time, 13.5, () => this.speak(lines[4]));
      this.checkCue('vo_6', time, 18.9, () => this.speak(lines[5]));
    }

    // Music pulse generator
    this.tickBgmPulse(time);
  }

  checkCue(key, time, targetTime, callback) {
    if (time >= targetTime && !this.triggeredCues.has(key)) {
      this.triggeredCues.add(key);
      callback();
    }
  }

  speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.05;
      utter.pitch = 0.95;
      // Prefer clean English / French accent if available
      const voices = window.speechSynthesis.getVoices();
      const selected = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))) || voices.find(v => v.lang.startsWith('en'));
      if (selected) utter.voice = selected;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("Speech error:", e);
    }
  }

  // Sound Effect Synthesizers
  playLogoTick() {
    this.ensureContext();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.08);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playNavWhoosh() {
    this.ensureContext();
    const t = this.ctx.currentTime;
    // Low whoosh sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.8);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    // High shimmer
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(1046.5, t); // C6
    chime.frequency.setValueAtTime(1318.5, t + 0.15); // E6
    chimeGain.gain.setValueAtTime(0.3, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);

    osc.start(t);
    chime.start(t);
    osc.stop(t + 0.8);
    chime.stop(t + 0.5);
  }

  playBikeBell() {
    this.ensureContext();
    const t = this.ctx.currentTime;
    // Freewheel clicking clicks
    for (let i = 0; i < 6; i++) {
      const clickTime = t + i * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1800, clickTime);
      gain.gain.setValueAtTime(0.08, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(clickTime);
      osc.stop(clickTime + 0.02);
    }
    // Bicycle Bell: Ding - Ding
    [0.15, 0.32].forEach((offset, idx) => {
      const bTime = t + offset;
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(idx === 0 ? 2093 : 2637, bTime); // C7 / E7
      bGain.gain.setValueAtTime(0.35, bTime);
      bGain.gain.exponentialRampToValueAtTime(0.001, bTime + 0.6);
      bOsc.connect(bGain);
      bGain.connect(this.sfxGain);
      bOsc.start(bTime);
      bOsc.stop(bTime + 0.6);
    });
  }

  playRainSound() {
    this.ensureContext();
    const t = this.ctx.currentTime;
    // Gentle pink noise rain wash
    const bufferSize = this.ctx.sampleRate * 3.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.12;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(1.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.5);
    gain.gain.linearRampToValueAtTime(0.2, t + 2.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  playArcadeAcoustic() {
    this.ensureContext();
    const t = this.ctx.currentTime;
    // Warm interior harmonic chord (Fmaj9)
    const freqs = [349.23, 440.0, 523.25, 659.25];
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.8);
    });
  }

  playFriendsPing() {
    this.ensureContext();
    const t = this.ctx.currentTime;
    // Pleasant double bubble notification chime
    [0, 0.12].forEach((offset, i) => {
      const pTime = t + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(i === 0 ? 587.33 : 880.0, pTime); // D5 -> A5
      gain.gain.setValueAtTime(0.4, pTime);
      gain.gain.exponentialRampToValueAtTime(0.001, pTime + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(pTime);
      osc.stop(pTime + 0.4);
    });
  }

  playSunsetLift() {
    this.ensureContext();
    const t = this.ctx.currentTime;
    // Ascending warm cinematic sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 2.5);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 2.8);
  }

  playArrivalChime() {
    this.ensureContext();
    const t = this.ctx.currentTime;
    // Iconic destination reached double chime
    const notes = [
      { f: 523.25, time: 0 },    // C5
      { f: 659.25, time: 0.12 }, // E5
      { f: 783.99, time: 0.24 }, // G5
      { f: 1046.5, time: 0.38 }  // C6
    ];
    notes.forEach(n => {
      const nTime = t + n.time;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, nTime);
      gain.gain.setValueAtTime(0.45, nTime);
      gain.gain.exponentialRampToValueAtTime(0.001, nTime + 0.7);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(nTime);
      osc.stop(nTime + 0.7);
    });
  }

  playBrandChord() {
    this.ensureContext();
    const t = this.ctx.currentTime;
    // Rich, airy brand chord (Google signature warmth: Cmaj9 with soft sub-bass)
    const chord = [130.81, 261.63, 329.63, 392.00, 493.88, 587.33]; // C3, C4, E4, G4, B4, D5
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(idx === 0 ? 0.35 : 0.18, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 2.8);
    });
  }

  // Steady 115 BPM electronic rhythm track
  tickBgmPulse(time) {
    if (time < 1.1 || time > 18.8) return;
    const bpm = 118;
    const beatSec = 60 / bpm;
    const beatIndex = Math.floor(time / (beatSec / 2));
    if (this.lastBeatIndex !== beatIndex) {
      this.lastBeatIndex = beatIndex;
      this.triggerBgmSubPulse(beatIndex);
    }
  }

  triggerBgmSubPulse(step) {
    this.ensureContext();
    const t = this.ctx.currentTime;
    // Forward electronic arpeggiated bass synth
    const scale = [110, 123.47, 130.81, 146.83, 164.81, 174.61, 196.0];
    const pitch = scale[step % scale.length];

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(pitch, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600 + (step % 4) * 200, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.22);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }
}

