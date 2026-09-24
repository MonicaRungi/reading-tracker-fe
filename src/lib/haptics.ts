/**
 * Feedback aptico breve.
 * - Android: Vibration API.
 * - iOS 18+: Safari non espone la Vibration API, ma il toggle nativo
 *   `<input type="checkbox" switch>` produce un tick aptico quando viene
 *   attivato: lo clicchiamo tramite una label nascosta.
 * - Altrove (desktop, iOS < 18) è un no-op.
 */
export function hapticFeedback(pattern: number | number[] = 50): void {
  try {
    if (typeof navigator === "undefined") return;

    if ("vibrate" in navigator && navigator.vibrate(pattern)) return;

    iosSwitchHaptic();
  } catch {
    // Alcuni browser lanciano se la vibrazione è bloccata: ignoriamo.
  }
}

function iosSwitchHaptic(): void {
  if (typeof document === "undefined") return;

  const label = document.createElement("label");
  label.ariaHidden = "true";
  label.style.display = "none";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.appendChild(input);

  document.body.appendChild(label);
  label.click();
  label.remove();
}
