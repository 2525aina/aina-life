export default function WeightLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="w-24 h-6 bg-muted/30 rounded animate-pulse" />
          <div className="w-10 h-10 bg-muted/30 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Chart skeleton */}
        <div className="h-64 bg-muted/20 rounded-2xl animate-pulse" />

        {/* Records skeleton */}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-muted/20 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-20 h-4 bg-muted/30 rounded" />
              <div className="w-16 h-5 bg-muted/30 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
