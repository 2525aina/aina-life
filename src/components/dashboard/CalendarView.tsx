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
    addWeeks,
    subWeeks,
    addDays,
    subDays,
    startOfDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ENTRY_TAGS, Entry } from "@/lib/types";
import { EntryCard } from "./EntryCard";
import { EntryDetailSheet } from "@/components/features/EntryDetailSheet";
import { EntryEditSheet } from "@/components/features/EntryEditSheet";
import { toast } from "sonner";

type ViewMode = "month" | "week" | "day";

export function CalendarView() {
    const { selectedPet } = usePetContext();
    const { canEdit } = useMembers(selectedPet?.id || null);
    const { updateEntry, deleteEntry } = useEntries(selectedPet?.id || null);
    const { friends } = useFriends(selectedPet?.id || null);
    const { tasks } = useCustomTasks(selectedPet?.id || null);
    const { formatTime } = useTimeFormat();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>("month");
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Sheet states
    const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
    const [sheetMode, setSheetMode] = useState<"detail" | "edit" | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calendar view data - Fetch all entries to ensure full data availability and consistency
    const { entries, loading } = useEntries(selectedPet?.id || null);

    // Group entries by date
    const entriesByDate = useMemo(() => {
        const grouped: Record<string, typeof entries> = {};

        entries.forEach((entry) => {
            const startDate = startOfDay(entry.date.toDate());
            const endDate =
                entry.timeType === "range" && entry.endDate
                    ? startOfDay(entry.endDate.toDate())
                    : startDate;

            const daysToAdd = eachDayOfInterval({ start: startDate, end: endDate });
            daysToAdd.forEach((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                if (!grouped[dateKey]) grouped[dateKey] = [];
                if (!grouped[dateKey].find((e) => e.id === entry.id)) {
                    grouped[dateKey].push(entry);
                }
            });
        });

        return grouped;
    }, [entries]);

    const calendarDays = useMemo(() => {
        if (viewMode === "month") {
            const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
            const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
            return eachDayOfInterval({ start, end });
        }
        if (viewMode === "week") {
            const start = startOfWeek(currentDate, { weekStartsOn: 0 });
            const end = endOfWeek(currentDate, { weekStartsOn: 0 });
            return eachDayOfInterval({ start, end });
        }
        return [currentDate];
    }, [currentDate, viewMode]);

    const navigate = (direction: "prev" | "next") => {
        if (viewMode === "month") {
            setCurrentDate((prev) =>
                direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1),
            );
        } else if (viewMode === "week") {
            const newDate =
                direction === "prev"
                    ? subWeeks(currentDate, 1)
                    : addWeeks(currentDate, 1);
            setCurrentDate(newDate);
            setSelectedDate(newDate);
        } else {
            const newDate =
                direction === "prev"
                    ? subDays(currentDate, 1)
                    : addDays(currentDate, 1);
            setCurrentDate(newDate);
            setSelectedDate(newDate);
        }
    };

    const selectedDateEntries = useMemo(
        () => entriesByDate[format(selectedDate, "yyyy-MM-dd")] || [],
        [selectedDate, entriesByDate],
    );
    const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

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

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between z-10 relative">
                <div className="glass-capsule p-1 flex items-center space-x-1 shadow-lg bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]">
                    {(["month", "week", "day"] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={cn(
                                "px-5 py-2.5 min-h-[44px] rounded-full text-sm font-bold transition-all duration-300",
                                viewMode === mode
                                    ? "bg-primary text-white shadow-md shadow-primary/30"
                                    : "text-muted-foreground hover:text-foreground hover:bg-[var(--glass-border)]",
                            )}
                        >
                            {mode === "month" ? "月" : mode === "week" ? "週" : "日"}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("prev")}
                        className="rounded-full w-10 h-10 hover:bg-[var(--glass-border)] text-foreground/80 hover:text-foreground backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <h2 className="text-2xl font-black tracking-tight min-w-[4rem] text-center pt-1.5 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        {viewMode === "month" &&
                            format(currentDate, "M月", { locale: ja })}
                        {viewMode !== "month" && format(currentDate, "M/d")}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("next")}
                        className="rounded-full w-10 h-10 hover:bg-[var(--glass-border)] text-foreground/80 hover:text-foreground backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid Container */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "glass rounded-[2rem] p-4 overflow-hidden shadow-xl ring-1 ring-[var(--glass-border)]",
                    viewMode === "day" && "hidden",
                )}
            >
                <div className="grid grid-cols-7 mb-2 opacity-60">
                    {weekDays.map((day, i) => (
                        <div
                            key={day}
                            className={cn(
                                "text-center text-[10px] font-bold py-2",
                                i === 0 && "text-red-500",
                                i === 6 && "text-blue-500",
                            )}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div
                    className={cn(
                        "grid grid-cols-7 gap-px bg-[var(--glass-border)] border border-[var(--glass-border)] rounded-2xl overflow-hidden",
                        viewMode === "month" ? "auto-rows-[minmax(120px,1fr)]" : "h-auto",
                    )}
                >
                    {calendarDays.map((day) => {
                        const dateKey = format(day, "yyyy-MM-dd");
                        const dayEntries = entriesByDate[dateKey] || [];
                        const isToday = isSameDay(day, new Date());
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const dayOfWeek = day.getDay();

                        // Month View: Rich desktop-like calendar cell
                        if (viewMode === "month") {
                            return (
                                <div
                                    key={dateKey}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "relative flex flex-col items-stretch justify-start p-1 transition-all duration-200 group outline-none min-h-[120px]",
                                        isSelected
                                            ? "bg-primary/5"
                                            : "bg-[var(--glass-bg)] hover:bg-white/40",
                                        !isCurrentMonth && "opacity-50 bg-muted/10",
                                    )}
                                >
                                    <div className="flex justify-center mb-1">
                                        <span
                                            className={cn(
                                                "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                                                isToday
                                                    ? "bg-primary text-white shadow-md scale-110"
                                                    : "text-muted-foreground",
                                                dayOfWeek === 0 && !isToday && "text-red-400",
                                                dayOfWeek === 6 && !isToday && "text-blue-400",
                                            )}
                                        >
                                            {format(day, "d")}
                                        </span>
                                    </div>

                                    {/* Event Bars */}
                                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden content-start">
                                        {dayEntries.slice(0, 4).map((entry) => {
                                            const tagInfo =
                                                tasks.find((t) => t.name === entry.tags[0]) ||
                                                ENTRY_TAGS.find((t) => t.value === entry.tags[0]);
                                            const isSchedule = entry.type === "schedule";
                                            const isCompleted = isSchedule && entry.isCompleted;

                                            return (
                                                <button
                                                    key={entry.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedEntry(entry);
                                                        setSheetMode("detail");
                                                        setSelectedDate(day);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate transition-all hover:scale-[1.02]",
                                                        isCompleted
                                                            ? "bg-muted text-muted-foreground line-through opacity-70"
                                                            : isSchedule
                                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200/50"
                                                                : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200/50",
                                                    )}
                                                >
                                                    <span className="mr-1 inline-block">
                                                        {tagInfo?.emoji}
                                                    </span>
                                                    {entry.title || entry.tags[0]}
                                                </button>
                                            );
                                        })}
                                        {dayEntries.length > 4 && (
                                            <span className="text-[9px] text-center text-muted-foreground font-medium hover:text-primary cursor-pointer">
                                                他 {dayEntries.length - 4} 件
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // Fallback for other views (week/day - keep simple for now or update later)
                        return (
                            <button
                                key={dateKey}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "relative aspect-[4/5] rounded-xl flex flex-col items-center justify-start pt-2 transition-all duration-300 group outline-none",
                                    isSelected
                                        ? "bg-primary/10 ring-2 ring-primary/30"
                                        : "hover:bg-[var(--glass-border)]",
                                    !isCurrentMonth && "opacity-20",
                                )}
                            >
                                <span
                                    className={cn(
                                        "text-xs font-semibold z-10 w-6 h-6 flex items-center justify-center rounded-full transition-all",
                                        isToday
                                            ? "bg-gradient-to-tr from-primary to-orange-400 text-white shadow-lg shadow-primary/30 scale-110"
                                            : "text-foreground/80",
                                        dayOfWeek === 0 && !isToday && "text-red-400",
                                        dayOfWeek === 6 && !isToday && "text-blue-400",
                                    )}
                                >
                                    {format(day, "d")}
                                </span>

                                {/* Simple Indicators for non-month views */}
                                {dayEntries.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap justify-center gap-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Selected Date Details */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">
                            {format(selectedDate, "yyyy年", { locale: ja })}
                        </p>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            {format(selectedDate, "M月d日 (E)", { locale: ja })}
                        </h3>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(2)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 bg-muted/20 animate-pulse rounded-2xl"
                                />
                            ))}
                        </div>
                    ) : selectedDateEntries.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass-capsule rounded-3xl p-6 text-center py-10 border-dashed"
                        >
                            <p className="text-muted-foreground">記録はありません</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            {selectedDateEntries
                                .sort(
                                    (a, b) =>
                                        a.date.toDate().getTime() - b.date.toDate().getTime(),
                                )
                                .map((entry) => (
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
                                    />
                                ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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
