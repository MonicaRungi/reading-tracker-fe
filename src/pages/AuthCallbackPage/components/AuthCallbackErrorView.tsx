export function AuthCallbackErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-7 text-center">
      <p className="text-[15px] text-[#938C84]">Qualcosa è andato storto. Riprova.</p>
      <button onClick={onRetry} className="text-[14px] font-medium text-[#E0644A]">
        Torna al login
      </button>
    </div>
  );
}
