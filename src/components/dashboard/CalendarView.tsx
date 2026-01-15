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
    isWithinInterval,
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

    // Calendar view data
    const { entries, loading } = useEntries(selectedPet?.id || null);

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

    // Calculate Layout Slots for consistent vertical alignment
    const slotsByDate = useMemo(() => {
        const slots: Record<string, (Entry | null)[]> = {};
        // Week view can show more rows as it has more vertical space
        const MAX_SLOTS = viewMode === "week" ? 12 : 4;

        // Initialize slots for all visible days
        calendarDays.forEach((day) => {
            slots[format(day, "yyyy-MM-dd")] = Array(MAX_SLOTS).fill(null);
        });

        // Sort entries: earlier start time first, then longer duration
        const sortedEntries = [...entries].sort((a, b) => {
            const startA = a.date.toMillis();
            const startB = b.date.toMillis();
            if (startA !== startB) return startA - startB;
            const endA =
                a.timeType === "range" && a.endDate
                    ? a.endDate.toMillis()
                    : a.date.toMillis();
            const endB =
                b.timeType === "range" && b.endDate
                    ? b.endDate.toMillis()
                    : b.date.toMillis();
            return endB - startB - (endA - startA); // Longer first
        });

        sortedEntries.forEach((entry) => {
            const startDate = startOfDay(entry.date.toDate());
            const endDate =
                entry.timeType === "range" && entry.endDate
                    ? startOfDay(entry.endDate.toDate())
                    : startDate;

            // Find all days this entry spans within the current view
            const spanDays = eachDayOfInterval({
                start: startDate,
                end: endDate,
            }).filter((d) => slots[format(d, "yyyy-MM-dd")] !== undefined);

            if (spanDays.length === 0) return;

            // Find the first available slot index that is free across ALL span days
            let assignedIndex = -1;
            for (let i = 0; i < MAX_SLOTS; i++) {
                const isSlotFree = spanDays.every(
                    (d) => slots[format(d, "yyyy-MM-dd")][i] === null,
                );
                if (isSlotFree) {
                    assignedIndex = i;
                    break;
                }
            }

            // Assign to slot if found
            if (assignedIndex !== -1) {
                spanDays.forEach((d) => {
                    slots[format(d, "yyyy-MM-dd")][assignedIndex] = entry;
                });
            }
        });

        return slots;
    }, [entries, calendarDays]);

    // Simple entries mapping for filtering/counting
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
                if (!grouped[key].find((e) => e.id === entry.id)) push(entry);
                grouped[key].push(entry);
            });
        });
        return grouped;
        function push(e: Entry) { } // Dummy helper for type inference or logic
    }, [entries]);

    // Helper to get raw entries for a specific day (used for "more" count and validation)
    const getDayEntries = (date: Date) => {
        const target = startOfDay(date);
        return entries.filter((entry) => {
            const start = startOfDay(entry.date.toDate());
            const end =
                entry.timeType === "range" && entry.endDate
                    ? startOfDay(entry.endDate.toDate())
                    : start;
            return isWithinInterval(target, { start, end });
        });
    };

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
        () => getDayEntries(selectedDate),
        [selectedDate, entries],
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
                        viewMode === "month"
                            ? "auto-rows-[minmax(120px,1fr)]"
                            : "min-h-[500px] auto-rows-[1fr]",
                    )}
                >
                    {calendarDays.map((day) => {
                        const dateKey = format(day, "yyyy-MM-dd");
                        const isToday = isSameDay(day, new Date());
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const dayOfWeek = day.getDay();

                        // Use calculated slots for layout
                        // Determine max items based on view mode
                        const MAX_DISPLAY = viewMode === "week" ? 12 : 4;
                        const daySlots = slotsByDate[dateKey] || Array(MAX_DISPLAY).fill(null);

                        // For week view, we might want to show more than the pre-calculated 4 slots if possible
                        // But currently slotsByDate is fixed at MAX_SLOTS=4 constant.
                        // Ideally we should increase MAX_SLOTS in the calculation if we want more in week view.
                        // For now, let's keep it consistent but allow the container to stretch.

                        const allDayEntries = getDayEntries(day);
                        // Count hidden items relative to what we actually render
                        // Note: The slot calculation above uses a fixed size.
                        // To properly show more items in week view, we need to update the useMemo calculation logic too.
                        // For this step, we will reuse the logic but just enable the rich view.

                        const renderedSlots = daySlots.slice(0, MAX_DISPLAY);
                        const hiddenCount = Math.max(0, allDayEntries.length - renderedSlots.filter(Boolean).length);

                        // Rich desktop-like calendar cell (Month AND Week)
                        if (viewMode === "month" || viewMode === "week") {
                            return (
                                <div
                                    key={dateKey}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "relative flex flex-col items-stretch justify-start p-1 transition-all duration-200 group outline-none",
                                        viewMode === "month" ? "min-h-[120px]" : "min-h-full border-b last:border-b-0", // Week view takes full height
                                        isSelected
                                            ? "bg-primary/5"
                                            : "bg-[var(--glass-bg)] hover:bg-white/40",
                                        !isCurrentMonth && viewMode === "month" && "opacity-50 bg-muted/10",
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

                                    {/* Render Slots */}
                                    <div className="flex-1 flex flex-col gap-0.5 pt-1">
                                        {renderedSlots.map((entry, idx) => {
                                            if (!entry) {
                                                return <div key={`empty-${idx}`} className="h-[22px]" />;
                                            }

                                            const tagInfo =
                                                tasks.find((t) => t.name === entry.tags[0]) ||
                                                ENTRY_TAGS.find((t) => t.value === entry.tags[0]);
                                            const isSchedule = entry.type === "schedule";
                                            const isCompleted = isSchedule && entry.isCompleted;

                                            const startDate = startOfDay(entry.date.toDate());
                                            const endDate =
                                                entry.timeType === "range" && entry.endDate
                                                    ? startOfDay(entry.endDate.toDate())
                                                    : startDate;
                                            const isMultiDay = !isSameDay(startDate, endDate);
                                            const isStartDay = isSameDay(day, startDate);
                                            const isEndDay = isSameDay(day, endDate);

                                            const startTimeStr = format(entry.date.toDate(), "H:mm");

                                            return (
                                                <button
                                                    key={`${entry.id}-${dateKey}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedEntry(entry);
                                                        setSheetMode("detail");
                                                        setSelectedDate(day);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-1.5 h-[22px] flex items-center text-[10px] font-medium truncate transition-all hover:brightness-95 relative z-10",
                                                        isCompleted
                                                            ? "bg-muted text-muted-foreground line-through opacity-70"
                                                            : isSchedule
                                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                                                                : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200",
                                                        isMultiDay && !isStartDay && "rounded-l-none border-l-0 ml-[-1px]",
                                                        isMultiDay && !isEndDay && "rounded-r-none border-r-0 mr-[-1px]",
                                                        (!isMultiDay || (isStartDay && isEndDay)) && "rounded-md",
                                                        isMultiDay && isStartDay && !isEndDay && "rounded-l-md rounded-r-none",
                                                        isMultiDay && !isStartDay && isEndDay && "rounded-r-md rounded-l-none",
                                                    )}
                                                >
                                                    {(isStartDay || !isMultiDay) && (
                                                        <span className="font-mono font-bold mr-1 opacity-80 text-[9px] leading-none">
                                                            {startTimeStr}
                                                        </span>
                                                    )}
                                                    <span className="mr-1 inline-block leading-none">
                                                        {tagInfo?.emoji}
                                                    </span>
                                                    <span className="font-bold truncate leading-none">
                                                        {entry.title || entry.tags[0]}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        {hiddenCount > 0 && (
                                            <span className="text-[9px] text-center text-muted-foreground font-medium hover:text-primary cursor-pointer mt-0.5 h-[14px]">
                                                他 {hiddenCount} 件
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // Fallback (simple dot view)
                        const dayEntries = getDayEntries(day); // Re-fetch for simple view
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
