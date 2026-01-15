"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ProfileAlertProps {
  className?: string;
}

export function ProfileAlert({ className }: ProfileAlertProps) {
  const { userProfile } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  // プロフィール未設定（ニックネームがない）のチェック
  const isProfileIncomplete = !userProfile?.nickname;

  if (!isProfileIncomplete || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "p-4 glass border-orange-500/20 bg-orange-500/5 rounded-2xl relative text-left",
          className,
        )}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-2"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-500/10 rounded-full text-orange-500">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">
              プロフィールを完成させましょう
            </h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              ニックネームを設定すると、共有メンバーに分かりやすく表示されます。
            </p>
            <Link href="/profile?edit=true">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs h-8 border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-600"
              >
                設定する
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
