"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import { ENTRY_TAGS, Entry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import { DEFAULT_FALLBACK_IMAGE } from "@/lib/constants/assets";

interface EntryCardProps {
  entry: Entry;
  tasks: { name: string; emoji: string }[];
  friends: { id: string; name: string; images?: string[] }[];
  formatTime: (date: Date) => string;
  onToggleComplete: (
    e: React.MouseEvent,
    entryId: string,
    isCompleted: boolean,
  ) => void;
  onClick: () => void;
  isCompact?: boolean;
  isOverdue?: boolean;
}

export function EntryCard({
  entry,
  tasks,
  friends,
  formatTime,
  onToggleComplete,
  onClick,
  isCompact = false,
  isOverdue = false,
}: EntryCardProps) {
  const isSchedule = entry.type === "schedule";
  const firstTag = entry.tags[0];
  const tagInfo =
    tasks.find((t) => t.name === firstTag) ||
    ENTRY_TAGS.find((t) => t.value === firstTag);
  const mainEmoji = tagInfo?.emoji || "📝";
  const displayName =
    entry.title ||
    (tagInfo && ("label" in tagInfo ? tagInfo.label : tagInfo.name)) ||
    firstTag;

  // Time display logic
  const renderTime = () => {
    const startDate = entry.date.toDate();

    if (entry.timeType === "range" && entry.endDate) {
      const endDateTime = entry.endDate.toDate();
      const isSameDayRange =
        startDate.toDateString() === endDateTime.toDateString();

      if (isSameDayRange) {
        return (
          <span className="text-[10px] font-bold font-mono text-muted-foreground">
            {formatTime(startDate)} ~ {formatTime(endDateTime)}
          </span>
        );
      } else {
        return (
          <div className="flex flex-col items-end text-[9px] font-bold font-mono text-muted-foreground leading-tight">
            <span>
              {format(startDate, "M/d")} {formatTime(startDate)}
            </span>
            <span className="text-primary/50">~</span>
            <span>
              {format(endDateTime, "M/d")} {formatTime(endDateTime)}
            </span>
          </div>
        );
      }
    }

    return (
      <span className="text-xs font-bold font-mono text-muted-foreground">
        {formatTime(startDate)}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group"
    >
      <div onClick={onClick} className="cursor-pointer">
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300",
            "hover:scale-[1.02] active:scale-[0.98]",
            // Priority: overdue > completed > schedule > diary
            isOverdue
              ? "bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-800/40"
              : entry.isCompleted
                ? "bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-800/40 opacity-75"
                : isSchedule
                  ? "bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800/40"
                  : "bg-orange-100 dark:bg-orange-950/50 border-orange-300 dark:border-orange-800/40",
          )}
        >
          {/* Time */}
          <div className="w-14 sm:w-16 flex-shrink-0 text-right">
            {renderTime()}
          </div>

          {/* Emoji */}
          <div
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              "bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5",
              "shadow-sm border border-[var(--glass-border)]",
            )}
          >
            <span className="text-lg sm:text-xl">{mainEmoji}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5">
              {entry.tags.length > 1 && (
                <div className="flex -space-x-1 opacity-70 flex-shrink-0">
                  {entry.tags.slice(1, 3).map((tag) => {
                    const t =
                      tasks.find((x) => x.name === tag) ||
                      ENTRY_TAGS.find((x) => x.value === tag);
                    return (
                      <span key={tag} className="text-xs">
                        {t?.emoji}
                      </span>
                    );
                  })}
                </div>
              )}
              <h3
                className={cn(
                  "font-bold text-sm truncate",
                  entry.isCompleted && "line-through",
                )}
              >
                {displayName}
              </h3>
            </div>
            {!isCompact && entry.body && (
              <p
                className={cn(
                  "text-xs text-muted-foreground truncate mt-0.5",
                  entry.isCompleted && "line-through",
                )}
              >
                {entry.body}
              </p>
            )}
          </div>

          {/* Images - scrollable on mobile */}
          {entry.imageUrls.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="flex -space-x-2 overflow-hidden">
                {entry.imageUrls.slice(0, 2).map((url, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden ring-2 ring-background flex-shrink-0 relative"
                  >
                    <Image src={url} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
              {entry.imageUrls.length > 2 && (
                <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    +{entry.imageUrls.length - 2}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Friends */}
          {entry.friendIds && entry.friendIds.length > 0 && (
            <div className="flex -space-x-1.5 flex-shrink-0 ml-1">
              {entry.friendIds.slice(0, 3).map((fid) => {
                const friend = friends.find((f) => f.id === fid);
                if (!friend) return null;
                return (
                  <div
                    key={fid}
                    className="w-6 h-6 rounded-full ring-1 ring-background overflow-hidden relative"
                    title={friend.name}
                  >
                    {friend.images?.[0] ? (
                      <Image
                        src={friend.images[0]}
                        alt={friend.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center relative">
                        <Image
                          src={DEFAULT_FALLBACK_IMAGE}
                          alt="No image"
                          fill
                          className="object-cover opacity-50 grayscale"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Complete toggle */}
          {isSchedule && (
            <button
              onClick={(e) =>
                onToggleComplete(e, entry.id, entry.isCompleted || false)
              }
              className="flex-shrink-0 text-muted-foreground hover:text-green-500 transition-colors z-20"
            >
              {entry.isCompleted ? (
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
