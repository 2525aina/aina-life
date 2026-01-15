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
            // "Week" mode is actually "3 Days" mode now
            const start = currentDate; // Start from current selected date
            const end = addDays(currentDate, 2); // Show 3 days
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
                    ? subDays(currentDate, 3)
                    : addDays(currentDate, 3);
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
                            {mode === "month" ? "月" : mode === "week" ? "3日" : "日"}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const today = new Date();
                            setCurrentDate(today);
                            setSelectedDate(today);
                        }}
                        className="rounded-full px-4 font-bold text-primary hover:bg-primary/10 hover:text-primary mr-2 bg-primary/5 border border-primary/20 backdrop-blur-sm transition-all active:scale-95"
                    >
                        今日
                    </Button>
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
                key={viewMode + format(currentDate, "yyyy-MM-dd")}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "glass rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-[var(--glass-border)]",
                    viewMode === "month" ? "p-4" : "p-0 flex flex-col h-[600px]", // Use fixed height for scrollable vertical view
                )}
            >
                {/* === MONTH VIEW RENDERING === */}
                {viewMode === "month" && (
                    <>
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

                        <div className="grid grid-cols-7 gap-px bg-[var(--glass-border)] border border-[var(--glass-border)] rounded-2xl overflow-hidden auto-rows-[minmax(120px,1fr)]">
                            {calendarDays.map((day) => {
                                const dateKey = format(day, "yyyy-MM-dd");
                                const isToday = isSameDay(day, new Date());
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const dayOfWeek = day.getDay();

                                // Slots for month view
                                const daySlots = slotsByDate[dateKey] || Array(4).fill(null);
                                const allDayEntries = getDayEntries(day);
                                const renderedSlots = daySlots.slice(0, 4);
                                const hiddenCount = Math.max(0, allDayEntries.length - renderedSlots.filter(Boolean).length);

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

                                        <div className="flex-1 flex flex-col gap-0.5 pt-1">
                                            {renderedSlots.map((entry, idx) => {
                                                if (!entry) return <div key={`empty-${idx}`} className="h-[22px]" />;

                                                const tagInfo =
                                                    tasks.find((t) => t.name === entry.tags[0]) ||
                                                    ENTRY_TAGS.find((t) => t.value === entry.tags[0]);
                                                const isSchedule = entry.type === "schedule";
                                                const isCompleted = isSchedule && entry.isCompleted;
                                                const startDate = startOfDay(entry.date.toDate());
                                                const endDate = entry.timeType === "range" && entry.endDate ? startOfDay(entry.endDate.toDate()) : startDate;
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
                            })}
                        </div>
                    </>
                )}

                {/* === VERTICAL TIMELINE VIEW (Week/3-Day & Day) === */}
                {viewMode !== "month" && (
                    <div className="flex flex-col h-full bg-[var(--glass-bg)]">
                        {/* 1. Header Row (Dates) */}
                        <div className="flex border-b border-[var(--glass-border)] ml-14 bg-[var(--glass-bg)] z-20 sticky top-0 backdrop-blur-md">
                            {calendarDays.map((day) => {
                                const isToday = isSameDay(day, new Date());
                                const dayOfWeek = day.getDay();
                                return (
                                    <div
                                        key={day.toString()}
                                        className="flex-1 text-center py-3 border-r border-[var(--glass-border)] last:border-r-0"
                                    >
                                        <div className={cn("text-[10px] font-bold",
                                            dayOfWeek === 0 && "text-red-500",
                                            dayOfWeek === 6 && "text-blue-500",
                                            !dayOfWeek && "text-muted-foreground/70"
                                        )}>
                                            {format(day, "E", { locale: ja })}
                                        </div>
                                        <div className={cn(
                                            "text-lg font-bold w-8 h-8 mx-auto flex items-center justify-center rounded-full mt-0.5",
                                            isToday ? "bg-primary text-white shadow-md" : "text-foreground"
                                        )}>
                                            {format(day, "d")}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 2. Scrollable Time Grid */}
                        <div className="flex-1 overflow-y-auto relative scrollbar-hide">
                            <div className="flex min-h-[1440px] relative"> {/* 1440px = 1px per minute */}

                                {/* Time Axis */}
                                <div className="w-14 flex-none border-r border-[var(--glass-border)] bg-[var(--glass-bg)] sticky left-0 z-10">
                                    {Array.from({ length: 24 }).map((_, hour) => (
                                        <div key={hour} className="h-[60px] relative border-b border-transparent"> {/* 60px per hour */}
                                            <span className="absolute -top-2.5 right-2 text-[10px] text-muted-foreground font-mono">
                                                {hour}:00
                                            </span>
                                            <div className="absolute top-0 right-0 w-2 h-px bg-[var(--glass-border)]" />
                                        </div>
                                    ))}
                                </div>

                                {/* Day Columns */}
                                {calendarDays.map((day) => (
                                    <div key={day.toString()} className="flex-1 relative border-r border-[var(--glass-border)] last:border-r-0 bg-white/5">
                                        {/* Horizontal Grid Lines */}
                                        {Array.from({ length: 24 }).map((_, hour) => (
                                            <div key={hour} className="h-[60px] border-b border-[var(--glass-border)] mb-0 box-border" />
                                        ))}

                                        {/* Events with Overlap Handling */}
                                        {(() => {
                                            // 1. Prepare events with basic geometry
                                            const dayRawEntries = entries.filter(entry => isSameDay(entry.date.toDate(), day));

                                            const positionedEntries = dayRawEntries.map(entry => {
                                                const startDate = entry.date.toDate();
                                                const isRange = entry.timeType === "range" && !!entry.endDate;

                                                const endDate = isRange
                                                    ? entry.endDate!.toDate()
                                                    : startDate; // Point events end at the same time conceptually

                                                // Determine visual height
                                                // Range: actual duration (min 30px)
                                                // Point: fixed height for visual chip (e.g. 28px)
                                                const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
                                                let endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

                                                let visualHeight = 28; // Default for point
                                                if (isRange) {
                                                    visualHeight = Math.max(30, endMinutes - startMinutes);
                                                } else {
                                                    // For layout calculation, point events occupy space to avoid overlap
                                                    // We treat them as effectively occupying their visual height in time
                                                    endMinutes = startMinutes + visualHeight;
                                                }

                                                return {
                                                    entry,
                                                    top: startMinutes,
                                                    height: visualHeight,
                                                    end: endMinutes, // Use visual end for collision detection
                                                    colIndex: 0,
                                                    totalCols: 1,
                                                    isRange
                                                };
                                            }).sort((a, b) => a.top - b.top || b.height - a.height);

                                            // 2. Cluster overlapping events (Logic is Same)
                                            const clusters: typeof positionedEntries[] = [];
                                            let currentCluster: typeof positionedEntries = [];

                                            positionedEntries.forEach((item) => {
                                                if (currentCluster.length === 0) {
                                                    currentCluster.push(item);
                                                } else {
                                                    const clusterEnd = Math.max(...currentCluster.map(c => c.end));
                                                    if (item.top < clusterEnd) {
                                                        currentCluster.push(item);
                                                    } else {
                                                        clusters.push(currentCluster);
                                                        currentCluster = [item];
                                                    }
                                                }
                                            });
                                            if (currentCluster.length > 0) clusters.push(currentCluster);

                                            // 3. Assign columns (Logic is Same)
                                            const finalLayout: typeof positionedEntries = [];

                                            clusters.forEach(cluster => {
                                                const columns: number[] = [];
                                                cluster.forEach(item => {
                                                    let placed = false;
                                                    for (let i = 0; i < columns.length; i++) {
                                                        if (columns[i] <= item.top) {
                                                            item.colIndex = i;
                                                            columns[i] = item.end;
                                                            placed = true;
                                                            break;
                                                        }
                                                    }
                                                    if (!placed) {
                                                        item.colIndex = columns.length;
                                                        columns.push(item.end);
                                                    }
                                                });
                                                const maxCols = columns.length;
                                                cluster.forEach(item => {
                                                    item.totalCols = maxCols;
                                                    finalLayout.push(item);
                                                });
                                            });

                                            // 4. Render
                                            return finalLayout.map(({ entry, top, height, colIndex, totalCols, isRange }) => {
                                                const tagInfo =
                                                    tasks.find((t) => t.name === entry.tags[0]) ||
                                                    ENTRY_TAGS.find((t) => t.value === entry.tags[0]);
                                                const isSchedule = entry.type === "schedule";
                                                const isCompleted = isSchedule && entry.isCompleted;

                                                const widthPercent = 100 / totalCols;
                                                const leftPercent = colIndex * widthPercent;

                                                return (
                                                    <button
                                                        key={entry.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEntry(entry);
                                                            setSheetMode("detail");
                                                            setSelectedDate(day);
                                                        }}
                                                        style={{
                                                            top: `${top}px`,
                                                            height: `${height}px`,
                                                            left: `${leftPercent}%`,
                                                            width: `calc(${widthPercent}% - 2px)`,
                                                        }}
                                                        className={cn(
                                                            "absolute px-2 text-left overflow-hidden transition-all hover:brightness-95 hover:z-20 hover:scale-[1.02]",
                                                            isCompleted && "opacity-60 saturate-0",
                                                            // Style differentiation
                                                            isRange
                                                                ? cn(
                                                                    "rounded-md border py-1 shadow-sm",
                                                                    isSchedule
                                                                        ? "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/60 dark:text-blue-100 dark:border-blue-800"
                                                                        : "bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-900/60 dark:text-orange-100 dark:border-orange-800"
                                                                )
                                                                : cn(
                                                                    "rounded-full flex items-center shadow-sm border py-0.5",
                                                                    "bg-white border-gray-200 text-foreground hover:border-primary/50 dark:bg-zinc-800 dark:border-zinc-700"
                                                                )
                                                        )}
                                                    >
                                                        <div className={cn("flex items-center h-full w-full", isRange ? "flex-col items-start" : "flex-row gap-2")}>
                                                            {/* Time & Title */}
                                                            <div className={cn("flex items-center gap-1 text-xs font-bold leading-none truncate w-full", isRange ? "" : "justify-start")}>
                                                                <span className="text-[10px] opacity-70 font-mono shrink-0">
                                                                    {format(entry.date.toDate(), "H:mm")}
                                                                </span>
                                                                {!isRange && <span className="shrink-0 text-sm">{tagInfo?.emoji}</span>}
                                                                <span className="truncate">{entry.title || entry.tags[0]}</span>
                                                            </div>

                                                            {/* Extra info only for large Ranges */}
                                                            {isRange && height > 40 && (
                                                                <div className="text-[10px] opacity-80 mt-0.5 truncate flex items-center gap-1">
                                                                    <span>{tagInfo?.emoji}</span>
                                                                    <span>{entry.tags.join(", ")}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            });
                                        })()}

                                        {/* Current Time Indicator (if today) */}
                                        {isSameDay(day, new Date()) && (
                                            <div
                                                className="absolute w-full h-px bg-red-500 z-10 pointer-events-none"
                                                style={{ top: `${new Date().getHours() * 60 + new Date().getMinutes()}px` }}
                                            >
                                                <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
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
