import { useLoginData } from "./hooks/useLoginData";
import { LoginHero } from "./components/LoginHero";
import { LoginFeatureList } from "./components/LoginFeatureList";
import { LoginOptions } from "./components/LoginOptions";
import { LoginFeatures } from "./components/LoginFeatures";

export default function LoginPage() {
  const { actions } = useLoginData();

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-background shadow-[0_18px_70px_rgba(0,0,0,0.1)]">
        <LoginHero />

        <div className="flex-1">
          <LoginFeatureList />

          <LoginOptions onGoogleSignIn={actions.handleGoogleSignIn} />
        </div>

        <LoginFeatures />
      </div>
    </main>
  );
}
