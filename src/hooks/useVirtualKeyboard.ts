import { useEffect, useState } from "react";

/** Sotto questa differenza è una barra del browser che cambia, non una tastiera. */
const KEYBOARD_MIN_HEIGHT = 150;

/**
 * true mentre la tastiera virtuale è aperta: l'area visibile (visualViewport)
 * si riduce rispetto alla pagina. Lo zoom (scale > 1) non conta come tastiera.
 * Su desktop resta sempre false.
 */
export function useVirtualKeyboard(): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      const covered = window.innerHeight - viewport.height * viewport.scale;
      setIsOpen(covered > KEYBOARD_MIN_HEIGHT);
    };
    update();
    viewport.addEventListener("resize", update);
    return () => viewport.removeEventListener("resize", update);
  }, []);

  return isOpen;
}
