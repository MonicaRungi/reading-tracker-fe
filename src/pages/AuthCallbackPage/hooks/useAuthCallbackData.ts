import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const TIMEOUT_MS = 10000;

export function useAuthCallbackData() {
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Supabase legge automaticamente il code dalla URL e lo scambia
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/library", { replace: true });
      } else if (event === "SIGNED_OUT") {
        navigate("/login", { replace: true });
      }
    });

    // Timeout di sicurezza: se dopo 10 secondi non è successo nulla, errore
    const timeout = setTimeout(() => setHasError(true), TIMEOUT_MS);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return {
    ui: { hasError },
    actions: {
      goToLogin: () => navigate("/login", { replace: true }),
    },
  };
}
