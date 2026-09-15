import { GoogleSignInButton } from "./GoogleSignInButton";

export function LoginOptions({
  onGoogleSignIn,
}: {
  onGoogleSignIn: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 bg-background px-7 py-8">
      <GoogleSignInButton onClick={onGoogleSignIn} />
    </div>
  );
}
