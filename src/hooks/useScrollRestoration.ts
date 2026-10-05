import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/** Per quanto si riprova a ripristinare lo scroll mentre la pagina si riempie (dati in cache). */
const RESTORE_TIMEOUT_MS = 1000;

/** Posizione di scroll per ogni voce della cronologia (location.key), solo in memoria. */
const positions = new Map<string, number>();

/**
 * Scroll della finestra fra le rotte, come in un sito tradizionale: con
 * BrowserRouter lo scroll resterebbe quello della pagina precedente.
 * - navigazione in avanti (link, tab, navigate): la nuova pagina parte dall'alto;
 * - indietro/avanti del browser (POP): si torna alla posizione lasciata.
 * Riguarda solo lo scroll della finestra: le aree con scroll proprio (la
 * mensola, gli sheet) si gestiscono da sole.
 */
export function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  // lo scroll lo gestiamo noi: il browser non deve ripristinarlo a modo suo
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  // ricorda la posizione della voce corrente mentre si scorre
  useEffect(() => {
    const key = location.key;
    const save = () => positions.set(key, window.scrollY);
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [location.key]);

  // layout effect: prima del paint, così la nuova pagina non appare scrollata nemmeno per un frame
  useLayoutEffect(() => {
    const target = navigationType === "POP" ? (positions.get(location.key) ?? 0) : 0;
    if (target === 0) {
      window.scrollTo(0, 0);
      return;
    }

    // tornando indietro la pagina può non essere ancora alta abbastanza
    // (immagini, liste dalla cache): si riprova finché ci si arriva
    let frame = 0;
    const start = performance.now();
    const restore = () => {
      window.scrollTo(0, target);
      const reached = Math.abs(window.scrollY - target) < 2;
      if (!reached && performance.now() - start < RESTORE_TIMEOUT_MS) {
        frame = requestAnimationFrame(restore);
      }
    };
    restore();
    return () => cancelAnimationFrame(frame);
  }, [location.key, navigationType]);
}
