// Synthesized audio utility using the Web Audio API
// Generates a warm, organic, tactile celebration chime without needing external audio files.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  return audioCtx;
}

/**
 * Plays a warm, celebratory acoustic-style chime chord with a tactile haptic thump
 * designed to harmonize with the terracotta/sage aesthetic.
 */
export function playCompletionSound() {
  try {
    const raw = localStorage.getItem('the_three_things_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.soundEnabled === false) return;
    }
  } catch {
    // ignore parse error and proceed
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master volume control
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, now);
    masterGain.connect(ctx.destination);

    // 1. Tactile sub-bass "stamp" thump (simulates physical notepad stamp/click)
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(130, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    thumpGain.gain.setValueAtTime(0.3, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(masterGain);
    thumpOsc.start(now);
    thumpOsc.stop(now + 0.1);

    // 2. Harmonic warm arpeggiated chime (Pentatonic: C5, E5, G5, C6, E6)
    const notes = [
      { freq: 523.25, delay: 0.0, duration: 0.85, vol: 0.3 },   // C5
      { freq: 659.25, delay: 0.05, duration: 0.9, vol: 0.28 },  // E5
      { freq: 783.99, delay: 0.11, duration: 0.95, vol: 0.26 }, // G5
      { freq: 1046.50, delay: 0.17, duration: 1.1, vol: 0.28 }, // C6
      { freq: 1318.51, delay: 0.23, duration: 1.25, vol: 0.22 },// E6
    ];

    notes.forEach(({ freq, delay, duration, vol }) => {
      const startTime = now + delay;

      // Primary warm tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Subtle upper harmonic for bell sparkle
      const harmonicOsc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(freq * 2, startTime);

      // Fast attack, smooth acoustic exponential decay
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0005, startTime + duration);

      harmonicGain.gain.setValueAtTime(0, startTime);
      harmonicGain.gain.linearRampToValueAtTime(vol * 0.25, startTime + 0.01);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0005, startTime + duration * 0.5);

      osc.connect(gain);
      harmonicOsc.connect(harmonicGain);
      gain.connect(masterGain);
      harmonicGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
      harmonicOsc.start(startTime);
      harmonicOsc.stop(startTime + duration * 0.5);
    });

    // Optional physical haptic vibration if supported on device
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 25]);
    }
  } catch (err) {
    console.warn('Unable to play completion sound:', err);
  }
}
