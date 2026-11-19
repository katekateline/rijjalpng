// Centralised procedural audio. One AudioContext for the whole app, created
// only after a user gesture. Everything is synthesised; no files are fetched.

type Listener = (on: boolean) => void;

const STORE_ON = "sv.sound";
const STORE_VOL = "sv.volume";

function read(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* storage may be blocked; sound still works for this page */
  }
}

class Synth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private listeners = new Set<Listener>();
  private _on = true;
  private _volume = 0.55;
  private lastTone = 0;
  private lastVisit = 0;
  private lastAmbient = 0;

  constructor() {
    if (typeof window === "undefined") return;
    this._on = read(STORE_ON) !== "off";
    const stored = Number(read(STORE_VOL));
    if (Number.isFinite(stored) && stored >= 0 && stored <= 1) this._volume = stored;

    // Sound defaults on, but browsers require a gesture before audio can start.
    if (this._on) {
      const unlock = () => {
        if (this._on) void this.enable();
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }
  }

  get on() {
    return this._on;
  }

  get volume() {
    return this._volume;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn(this._on);
  }

  private init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    const limiter = this.ctx.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.ratio.value = 8;
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(limiter).connect(this.ctx.destination);
  }

  async toggle() {
    if (this._on) {
      this.disable();
      return false;
    }
    await this.enable();
    return true;
  }

  async enable() {
    this.init();
    if (!this.ctx || !this.master) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this._on = true;
    this.master.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.04);
    write(STORE_ON, "on");
    this.emit();
  }

  disable() {
    this._on = false;
    write(STORE_ON, "off");
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
      // Release the hardware while muted; resumed on the next gesture.
      window.setTimeout(() => {
        if (!this._on) this.ctx?.suspend().catch(() => {});
      }, 120);
    }
    this.emit();
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    write(STORE_VOL, String(this._volume));
    if (this.ctx && this.master && this._on) {
      this.master.gain.setTargetAtTime(this._volume, this.ctx.currentTime, 0.02);
    }
  }

  private ready() {
    return this._on && this.ctx !== null && this.ctx.state === "running" && !document.hidden;
  }

  /** Single enveloped oscillator. Frequencies are clamped to a musical band. */
  tone(freq: number, opts: { dur?: number; gain?: number; type?: OscillatorType; slide?: number; delay?: number } = {}) {
    if (!this.ready()) return;
    const ctx = this.ctx as AudioContext;
    const master = this.master as GainNode;
    const now = ctx.currentTime + (opts.delay ?? 0);
    const dur = opts.dur ?? 0.09;
    const freqSafe = Math.max(40, Math.min(4200, freq));
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2600;
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(freqSafe, now);
    if (opts.slide) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqSafe * opts.slide), now + dur);
    }
    const peak = Math.max(0.0002, opts.gain ?? 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(filter).connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + dur + 0.03);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  /** Short rising phrase, used for completion states. */
  arp(semitones: number[], base = 220, gap = 0.075, gain = 0.06) {
    semitones.forEach((semi, i) => {
      const freq = base * Math.pow(2, semi / 12);
      this.tone(freq, { gain, dur: 0.22, type: "triangle", delay: i * gap });
    });
  }

  /** Throttled high tick, used by pathfinding / cellular loops. */
  pulse(freq: number, gain = 0.035, dur = 0.05) {
    if (!this.ready()) return;
    const now = performance.now();
    if (now - this.lastVisit < 70) return;
    this.lastVisit = now;
    this.tone(freq, { gain, dur, type: "triangle" });
  }

  /** Throttled low note for generative / ambient experiments. */
  ambient(freq: number, gain = 0.04, dur = 0.4) {
    if (!this.ready()) return;
    const now = performance.now();
    if (now - this.lastAmbient < 380) return;
    this.lastAmbient = now;
    this.tone(freq, { gain, dur, type: "sine" });
  }

  /** Sorting vocabulary. value is the active element's normalised height (0..1). */
  sortStep(kind: string, value: number) {
    if (!this.ready()) return;
    const now = performance.now();
    if (now - this.lastTone < 22) return;
    this.lastTone = now;
    const freq = 180 + Math.pow(value, 1.15) * 520;
    switch (kind) {
      case "compare":
        this.tone(freq, { gain: 0.035, dur: 0.05, type: "sine" });
        break;
      case "swap":
        this.tone(freq, { gain: 0.06, dur: 0.07, type: "triangle", slide: 1.12 });
        break;
      case "write":
        this.tone(freq * 1.6, { gain: 0.03, dur: 0.03, type: "square" });
        break;
      case "pivot":
        this.tone(freq * 1.5, { gain: 0.055, dur: 0.12, type: "triangle" });
        break;
      case "sorted":
        this.tone(freq * 2, { gain: 0.025, dur: 0.06, type: "sine" });
        break;
      case "done":
        this.arp([0, 4, 7, 12], 220, 0.07, 0.05);
        break;
    }
  }
}

export const audio = new Synth();
