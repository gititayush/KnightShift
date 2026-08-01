// Authentic Wood & Organic Sound Synthesizer (Chess.com Calibrated)

class ChessSoundManager {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Move Sound: Authentic Soft Wooden Knock (Chess.com style)
  public playMove() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Low frequency body knock
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);

      // Noise click transient for wooden contact
      const bufferSize = ctx.sampleRate * 0.015; // 15ms noise tap
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.Q.setValueAtTime(2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);

      // Master output
      gain.connect(ctx.destination);
      noiseGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
      noise.start(now);
    } catch (e) {}
  }

  // 2. Capture Sound (The punchy wooden impact user liked!)
  public playCapture() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  // 3. Check Sound: Double Wooden Tap (Tap-Tap alert)
  public playCheck() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Two quick wooden taps 40ms apart
      [0, 0.05].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, now + delay);
        osc.frequency.exponentialRampToValueAtTime(140, now + delay + 0.04);

        gain.gain.setValueAtTime(0.3, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.04);
      });
    } catch (e) {}
  }

  // 4. Game Start Sound: Soft Warm Double Wood Chime
  public playStart() {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      [261.63, 392.00].forEach((freq, idx) => { // C4, G4 warm notes
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    } catch (e) {}
  }

  // 5. Game End Sound: Deep Resonant Wooden Chord
  public playEnd(isVictory: boolean) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const freqs = isVictory ? [329.63, 440.00, 523.25] : [220.00, 261.63, 311.13];

      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
      });
    } catch (e) {}
  }
}

export const chessSound = new ChessSoundManager();
