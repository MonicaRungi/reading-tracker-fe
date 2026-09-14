export function ProfileHeader({
  avatarUrl,
  initials,
  displayName,
  email,
}: {
  avatarUrl: string | null;
  initials: string;
  displayName: string;
  email: string;
}) {
  return (
    <div className="flex items-center gap-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent">
          <span className="text-[18px] font-semibold text-primary">
            {initials}
          </span>
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-[17px] font-semibold text-foreground">
          {displayName}
        </p>
        <p className="truncate text-[13px] text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}
