export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="w-24 h-6 bg-muted/30 rounded animate-pulse" />
          <div className="w-10 h-10 bg-muted/30 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-muted/30 rounded-full animate-pulse" />
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="w-16 h-4 bg-muted/30 rounded animate-pulse" />
              <div
                className="w-full h-10 bg-muted/20 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
