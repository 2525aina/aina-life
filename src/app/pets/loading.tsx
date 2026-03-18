export default function PetsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="w-24 h-6 bg-muted/30 rounded animate-pulse" />
          <div className="w-10 h-10 bg-muted/30 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-14 h-14 bg-muted/30 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="w-24 h-5 bg-muted/30 rounded" />
              <div className="w-36 h-3 bg-muted/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
