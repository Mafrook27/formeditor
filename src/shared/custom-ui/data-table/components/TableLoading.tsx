/**
 * Loading skeleton for DataTable
 */
export function TableLoading() {
  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border bg-card">
        <div className="p-4 space-y-3">
          <div className="h-8 w-full bg-muted animate-pulse rounded" />
          {[...Array(240)].map((_, i) => (
            <div
              key={i}
              className="h-12 w-full bg-muted/50 animate-pulse rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
