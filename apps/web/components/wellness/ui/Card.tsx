export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-card border border-border bg-surface p-5 shadow-soft ${className}`}>
      {children}
    </div>
  );
}
