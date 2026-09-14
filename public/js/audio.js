/**
 * Audio Engine for Vinayaka Donation Announcer
 * Provides Temple Bell, Shankham, Loudspeaker Echo Effect, and Devotional Drone
 */

class PandalAudioEngine {
  constructor() {
    this.ctx = null;
    this.echoEnabled = true;
    this.bellEnabled = true;
    this.shankhEnabled = false;
    this.bgmEnabled = false;
    this.bgmOscillators = [];
    this.bgmGain = null;
    this.activeAudioElement = null;
    this.echoNode = null;
    this.feedbackNode = null;
    this.filterNode = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Synthesizes an authentic multi-harmonic brass temple bell (గంట నాదం)
   */
  playTempleBell() {
    this.init();
    const now = this.ctx.currentTime;
    
    // Frequencies simulating brass pooja bell harmonics
    const freqs = [587.33, 880.0, 1318.51, 1760.0, 2637.0];
    const gains = [0.45, 0.35, 0.25, 0.15, 0.08];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      // Slight detune for brass bell shimmer
      osc.detune.setValueAtTime((idx - 2) * 5, now);

      gain.gain.setValueAtTime(gains[idx], now);
      // Exponential realistic decay
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.3);
    });
  }

  /**
   * Synthesizes a sacred conch horn blow (శంఖ ధ్వని)
   */
  playShankham() {
    this.init();
    const now = this.ctx.currentTime;
    const duration = 2.8;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Sacred conch characteristic pitch curve
    osc.type = 'sawtooth';
    subOsc.type = 'sine';

    // Pitch rises, holds, and tapers off
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(295, now + 0.5);
    osc.frequency.setValueAtTime(295, now + duration - 0.7);
    osc.frequency.exponentialRampToValueAtTime(230, now + duration);

    subOsc.frequency.setValueAtTime(105, now);
    subOsc.frequency.exponentialRampToValueAtTime(147.5, now + 0.5);

    // Warm resonant bandpass filter
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.6);
    filter.Q.setValueAtTime(3.5, now);

    // Smooth envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.4);
    gain.gain.setValueAtTime(0.4, now + duration - 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + duration + 0.1);
    subOsc.stop(now + duration + 0.1);
  }

  /**
   * Connects an HTML5 Audio element through a PA loudspeaker echo effect
   */
  attachLoudspeakerEcho(audioElement) {
    if (!this.echoEnabled) return;
    try {
      this.init();
      if (audioElement._sourceNode) return; // already connected

      const source = this.ctx.createMediaElementSource(audioElement);
      audioElement._sourceNode = source;

      // Echo Delay node
      const delay = this.ctx.createDelay();
      delay.delayTime.value = 0.18; // 180ms pandal horn echo

      const feedback = this.ctx.createGain();
      feedback.gain.value = 0.35; // 35% reverberation

      // Pandal Horn frequency filter (simulates horn speaker band)
      const hornFilter = this.ctx.createBiquadFilter();
      hornFilter.type = 'bandpass';
      hornFilter.frequency.value = 1400;
      hornFilter.Q.value = 0.8;

      // Direct + Echo mix
      source.connect(this.ctx.destination);
      source.connect(delay);
      delay.connect(hornFilter);
      hornFilter.connect(feedback);
      feedback.connect(delay);
      hornFilter.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Loudspeaker echo connection notice:", e);
    }
  }

  /**
   * Starts devotional ambient drone (Mohanam / Bhoopali devotional scale)
   */
  startDevotionalBGM() {
    if (!this.bgmEnabled) return;
    this.init();
    if (this.bgmGain) return;

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);

    // Sacred Tanpura root & fifth notes (C# / D: 140Hz, 210Hz, 280Hz)
    const tones = [138.59, 207.65, 277.18];
    tones.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(this.bgmGain);
      osc.start();
      this.bgmOscillators.push(osc);
    });
  }

  stopDevotionalBGM() {
    if (this.bgmGain) {
      this.bgmGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        this.bgmOscillators.forEach(osc => osc.stop());
        this.bgmOscillators = [];
        this.bgmGain = null;
      }, 600);
    }
  }

  duckBGM(duck = true) {
    if (this.bgmGain) {
      const targetGain = duck ? 0.02 : 0.08;
      this.bgmGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }
  }
}

window.pandalAudio = new PandalAudioEngine();
