"use client";

import { useState, useMemo } from "react";
import { useMembers } from "@/hooks/useMembers";
import { useEntries } from "@/hooks/useEntries";
import { usePetContext } from "@/contexts/PetContext";
import { useTimeFormat } from "@/hooks/useTimeFormat";
import { useFriends } from "@/hooks/useFriends";
import { useCustomTasks } from "@/hooks/useCustomTasks";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfDay,
  isWithinInterval,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Entry } from "@/lib/types";
import { EntryCard } from "./EntryCard";
import { EntryDetailSheet } from "@/components/features/EntryDetailSheet";
import { EntryEditSheet } from "@/components/features/EntryEditSheet";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function CalendarView() {
  const { selectedPet } = usePetContext();
  const { canEdit } = useMembers(selectedPet?.id || null);
  const { entries, loading, updateEntry, deleteEntry } = useEntries(
    selectedPet?.id || null,
  );
  const { friends } = useFriends(selectedPet?.id || null);
  const { tasks } = useCustomTasks(selectedPet?.id || null);
  const { formatTime } = useTimeFormat();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Entry detail/edit sheet states
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [sheetMode, setSheetMode] = useState<"detail" | "edit" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate calendar grid (always 6 weeks for consistency)
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Map entries to dates for dot indicators
  const entriesByDate = useMemo(() => {
    const grouped: Record<string, Entry[]> = {};
    entries.forEach((entry) => {
      const startDate = startOfDay(entry.date.toDate());
      const endDate =
        entry.timeType === "range" && entry.endDate
          ? startOfDay(entry.endDate.toDate())
          : startDate;

      eachDayOfInterval({ start: startDate, end: endDate }).forEach((day) => {
        const key = format(day, "yyyy-MM-dd");
        if (!grouped[key]) grouped[key] = [];
        // Avoid duplicates
        if (!grouped[key].find((e) => e.id === entry.id)) {
          grouped[key].push(entry);
        }
      });
    });
    return grouped;
  }, [entries]);

  // Get entries for the selected date
  const selectedDateEntries = useMemo(() => {
    if (!selectedDate) return [];
    const target = startOfDay(selectedDate);
    return entries
      .filter((entry) => {
        const start = startOfDay(entry.date.toDate());
        const end =
          entry.timeType === "range" && entry.endDate
            ? startOfDay(entry.endDate.toDate())
            : start;
        return isWithinInterval(target, { start, end });
      })
      .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());
  }, [selectedDate, entries]);

  const navigateMonth = (dir: "prev" | "next") => {
    setDirection(dir === "next" ? 1 : -1);
    setCurrentMonth((prev) =>
      dir === "prev" ? subMonths(prev, 1) : addMonths(prev, 1),
    );
  };

  const goToToday = () => {
    const today = new Date();
    setDirection(today > currentMonth ? 1 : -1);
    setCurrentMonth(today);
  };

  const handleToggleComplete = async (
    e: React.MouseEvent,
    entryId: string,
    isCompleted: boolean,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateEntry(entryId, { isCompleted: !isCompleted });
      toast.success(isCompleted ? "未完了にしました" : "完了しました");
    } catch {
      toast.error("エラーが発生しました");
    }
  };

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  const today = new Date();

  return (
    <div className="space-y-4 px-2">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-2">
        <motion.h2
          key={format(currentMonth, "yyyy-MM")}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
        >
          {format(currentMonth, "yyyy年M月", { locale: ja })}
        </motion.h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="rounded-full px-4 font-bold text-primary hover:bg-primary/10 hover:text-primary bg-primary/5 border border-primary/20 backdrop-blur-sm transition-all active:scale-95"
          >
            今日
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("prev")}
            className="rounded-full w-10 h-10 hover:bg-[var(--glass-border)] text-foreground/80 hover:text-foreground transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("next")}
            className="rounded-full w-10 h-10 hover:bg-[var(--glass-border)] text-foreground/80 hover:text-foreground transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <motion.div
        key={format(currentMonth, "yyyy-MM")}
        initial={{ opacity: 0, x: direction * 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass rounded-3xl p-4 overflow-hidden"
      >
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-3">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs font-bold py-2",
                i === 0 && "text-red-500",
                i === 6 && "text-blue-500",
                i !== 0 && i !== 6 && "text-muted-foreground",
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const dayOfWeek = day.getDay();
            const dayEntries = entriesByDate[dateKey] || [];
            const hasEntries = dayEntries.length > 0;

            // Categorize entries for dot display
            const isPastDay = day < today && !isSameDay(day, today);

            // Overdue: past incomplete schedules
            const overdueCount = dayEntries.filter(
              (e) => e.type === "schedule" && !e.isCompleted && isPastDay,
            ).length;
            // Pending schedules: incomplete schedules (today or future)
            const pendingScheduleCount = dayEntries.filter(
              (e) => e.type === "schedule" && !e.isCompleted && !isPastDay,
            ).length;
            // Completed schedules
            const completedCount = dayEntries.filter(
              (e) => e.type === "schedule" && e.isCompleted,
            ).length;
            // Diary entries
            const diaryCount = dayEntries.filter(
              (e) => e.type === "diary",
            ).length;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative flex flex-col items-center justify-start p-1 min-h-[52px] rounded-xl transition-all duration-200",
                  "hover:bg-primary/10 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  !isCurrentMonth && "opacity-40",
                )}
              >
                {/* Date Number */}
                <span
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all",
                    isToday
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                      : "text-foreground",
                    dayOfWeek === 0 && !isToday && "text-red-500",
                    dayOfWeek === 6 && !isToday && "text-blue-500",
                  )}
                >
                  {format(day, "d")}
                </span>

                {/* Event Dot Indicators (max 4 types) */}
                {hasEntries && (
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {/* Overdue dot (red) */}
                    {overdueCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                    {/* Pending schedule dot (blue) */}
                    {pendingScheduleCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                    {/* Completed dot (green) */}
                    {completedCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    )}
                    {/* Diary dot (orange) */}
                    {diaryCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </motion.div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>期限切れ</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>予定</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span>完了</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span>記録</span>
        </div>
      </div>

      {/* Day Detail Sheet */}
      <Sheet
        open={!!selectedDate}
        onOpenChange={(open) => !open && setSelectedDate(null)}
      >
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] px-4">
          <SheetHeader className="pb-4 pt-2">
            <SheetTitle className="text-xl font-bold">
              {selectedDate &&
                format(selectedDate, "M月d日 (E)", { locale: ja })}
            </SheetTitle>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "yyyy年", { locale: ja })}
              </p>
            )}
          </SheetHeader>

          <div className="overflow-y-auto max-h-[60vh] pb-8 space-y-3 px-1">
            <AnimatePresence mode="wait">
              {selectedDateEntries.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <p className="text-muted-foreground">
                    この日の記録はありません
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {selectedDateEntries.map((entry) => {
                    const isPastDate = Boolean(
                      selectedDate &&
                      selectedDate < today &&
                      !isSameDay(selectedDate, today),
                    );
                    const isOverdue =
                      entry.type === "schedule" &&
                      !entry.isCompleted &&
                      isPastDate;

                    return (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        tasks={tasks}
                        friends={friends}
                        formatTime={formatTime}
                        onToggleComplete={handleToggleComplete}
                        onClick={() => {
                          setSelectedEntry(entry);
                          setSheetMode("detail");
                        }}
                        isOverdue={isOverdue}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>

      {/* Entry Detail Sheet */}
      <EntryDetailSheet
        entry={selectedEntry}
        open={sheetMode === "detail"}
        onClose={() => {
          setSelectedEntry(null);
          setSheetMode(null);
        }}
        onEdit={() => setSheetMode("edit")}
        onDelete={async (id) => {
          await deleteEntry(id);
        }}
        tasks={tasks}
        friends={friends}
        canEdit={canEdit}
      />

      {/* Entry Edit Sheet */}
      <EntryEditSheet
        entry={selectedEntry}
        open={sheetMode === "edit"}
        onClose={() => {
          setSelectedEntry(null);
          setSheetMode(null);
        }}
        onSave={async (id, data) => {
          setIsSubmitting(true);
          try {
            await updateEntry(id, data);
            toast.success("保存しました");
          } finally {
            setIsSubmitting(false);
          }
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
