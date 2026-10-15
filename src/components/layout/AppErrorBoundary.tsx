import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AppCrashScreen } from "./AppCrashScreen";

interface State {
  error: Error | null;
  componentStack: string;
}

/**
 * Paracadute dell'app: un errore durante il render, invece di smontare tutto
 * (pagina bianca), mostra la schermata con "Ricarica" e il dettaglio dell'errore.
 */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, componentStack: "" };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Shelfy] errore dell'app", error, info.componentStack);
    this.setState({ componentStack: info.componentStack ?? "" });
  }

  render() {
    const { error, componentStack } = this.state;
    return error ? <AppCrashScreen error={error} componentStack={componentStack} /> : this.props.children;
  }
}
