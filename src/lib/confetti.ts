import confetti from "canvas-confetti";

// Toni caldi derivati da --primary (#e0644a).
const COLORS = ["#e0644a", "#ec8d74", "#f4b8a4", "#f2c48d", "#e9a6b5"];

/**
 * Una spolverata per lato, sparata verso l'alto e verso il centro, che poi
 * ricade lenta (~3s). Con "riduci movimento" attivo nel sistema non parte nulla.
 */
export function fireConfetti(): void {
  const defaults = {
    particleCount: 65,
    spread: 55,
    startVelocity: 45,
    gravity: 0.6,
    decay: 0.92,
    ticks: 220,
    colors: COLORS,
    zIndex: 100,
    disableForReducedMotion: true,
  };

  void confetti({ ...defaults, angle: 60, origin: { x: 0, y: 0.7 } });
  void confetti({ ...defaults, angle: 120, origin: { x: 1, y: 0.7 } });
}
