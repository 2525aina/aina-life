"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-background to-muted/50">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>

      <h2 className="text-2xl font-bold mb-2 text-foreground">
        エラーが発生しました
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        予期しないエラーが発生しました。もう一度お試しいただくか、しばらくしてからアクセスしてください。
      </p>

      <Button
        onClick={reset}
        className="rounded-full gradient-primary shadow-lg h-12 px-8 text-lg hover:scale-105 transition-transform"
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        もう一度試す
      </Button>
    </div>
  );
}
