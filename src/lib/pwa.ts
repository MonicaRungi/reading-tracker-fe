/**
 * L'app gira come PWA installata (schermata Home), non in una scheda del browser.
 * iOS usa `navigator.standalone`; gli altri il media query `display-mode`.
 */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const iosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return (
    iosStandalone ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}
