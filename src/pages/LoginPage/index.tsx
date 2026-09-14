import { useLoginData } from "./hooks/useLoginData";
import { LoginHero } from "./components/LoginHero";
import { LoginOptions } from "./components/LoginOptions";
import { MagicLinkSentPanel } from "./components/MagicLinkSentPanel";
import { LoginFeatures } from "./components/LoginFeatures";

export default function LoginPage() {
  const { data, ui, actions } = useLoginData();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <LoginHero />

      <div className="flex flex-1 flex-col gap-5 bg-background px-7 py-8">
        {!ui.sent ? (
          <LoginOptions
            email={data.email}
            isSending={ui.isSending}
            onEmailChange={actions.setEmail}
            onSubmit={actions.handleMagicLinkSubmit}
            onGoogleSignIn={actions.handleGoogleSignIn}
          />
        ) : (
          <MagicLinkSentPanel email={data.email} onChangeEmail={actions.resetSent} />
        )}
      </div>

      <LoginFeatures />
    </div>
  );
}
