export function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-accent px-4 py-4">
      {icon}
      <span className="text-[22px] font-bold text-foreground">{value}</span>
      <span className="text-center text-[11px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
