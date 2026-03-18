export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="w-24 h-6 bg-muted/30 rounded animate-pulse" />
          <div className="w-10 h-10 bg-muted/30 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Pet switcher skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted/30 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="w-28 h-5 bg-muted/30 rounded animate-pulse" />
            <div className="w-20 h-3 bg-muted/20 rounded animate-pulse" />
          </div>
        </div>

        {/* Quick actions skeleton */}
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex-1 h-16 bg-muted/20 rounded-2xl animate-pulse"
            />
          ))}
        </div>

        {/* Timeline skeleton */}
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-muted/20 rounded-2xl animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
