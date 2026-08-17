export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-6 w-40 animate-pulse rounded bg-border" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-card bg-border/60" />
      ))}
    </div>
  );
}
