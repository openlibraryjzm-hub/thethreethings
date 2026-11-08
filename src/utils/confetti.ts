import confetti from 'canvas-confetti';

/**
 * Fires celebration confetti respecting user settings and reduced-motion preferences
 */
export function fireCelebrationConfetti(options?: confetti.Options) {
  try {
    const raw = localStorage.getItem('the_three_things_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.confettiEnabled === false) return;
    }
  } catch {
    // proceed
  }

  confetti({
    particleCount: 50,
    spread: 65,
    origin: { y: 0.6 },
    colors: ['#DA7756', '#6E8B74', '#F5F0E8', '#C86446'],
    disableForReducedMotion: true,
    ...options,
  });
}
