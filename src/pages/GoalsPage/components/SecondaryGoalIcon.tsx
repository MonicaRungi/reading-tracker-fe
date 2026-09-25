import { CalendarDays, FileText } from "lucide-react";

export function SecondaryGoalIcon({ type }: { type: string }) {
  const Icon = type === "days" ? CalendarDays : FileText;
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent">
      <Icon className="size-5 text-primary" aria-hidden="true" />
    </div>
  );
}
