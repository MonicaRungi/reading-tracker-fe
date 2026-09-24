import { Lock } from "lucide-react";

export function LockNotice({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
      <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <p className="text-[13px] leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
