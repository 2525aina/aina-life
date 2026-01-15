"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { usePetContext } from "@/contexts/PetContext";
import { useEntries } from "@/hooks/useEntries";
import { useFriends } from "@/hooks/useFriends";
import { useCustomTasks } from "@/hooks/useCustomTasks";
import { useMembers } from "@/hooks/useMembers";
import { Entry } from "@/lib/types";
import {
  Clock,
  ChevronDown,
  Sparkles,
  CalendarCheck,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTimeFormat } from "@/hooks/useTimeFormat";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EntryDetailSheet } from "@/components/features/EntryDetailSheet";
import { EntryEditSheet } from "@/components/features/EntryEditSheet";

// Section Header Component
function SectionHeader({
  icon,
  title,
  count,
  color = "primary",
  isOpen = true,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  color?: "primary" | "blue" | "green" | "red";
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 text-primary",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-500",
    green: "from-green-500/20 to-green-500/5 text-green-500",
    red: "from-red-500/20 to-red-500/5 text-red-600",
  };

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
        `bg-gradient-to-r ${colorClasses[color]}`,
        "cursor-pointer hover:opacity-90 active:scale-[0.99]",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center",
          "bg-[var(--glass-bg)] shadow-sm",
        )}
      >
        {icon}
      </div>
      <span className="font-bold text-sm flex-1 text-left">{title}</span>
      <span className="text-xs font-bold opacity-60 bg-[var(--glass-bg)] px-2.5 py-1 rounded-full">
        {count}
      </span>
      <ChevronDown
        className={cn(
          "w-4 h-4 transition-transform duration-300",
          !isOpen && "-rotate-90",
        )}
      />
    </button>
  );
}

import { EntryCard } from "@/components/dashboard/EntryCard";

export function TimelineView() {
  const { selectedPet } = usePetContext();
  const { entries, loading, updateEntry, deleteEntry } = useEntries(
    selectedPet?.id || null,
  );
  const { friends } = useFriends(selectedPet?.id || null);
  const { tasks } = useCustomTasks(selectedPet?.id || null);
  const { formatTime } = useTimeFormat();
  const { canEdit } = useMembers(selectedPet?.id || null);

  // Collapsible section states
  const [showOverdue, setShowOverdue] = useState(true);
  const [showSchedules, setShowSchedules] = useState(true);
  const [showRecords, setShowRecords] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  // Sheet states
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [sheetMode, setSheetMode] = useState<"detail" | "edit" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Overdue schedules (past incomplete)
  const [overdueSchedules, setOverdueSchedules] = useState<Entry[]>([]);

  // const now = new Date(); // Moved into useMemo to avoid unnecessary dependency refreshes
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  // Fetch overdue schedules (past incomplete)
  useEffect(() => {
    if (!selectedPet?.id) {
      setOverdueSchedules([]);
      return;
    }

    // Index-free query: Filter by date only, then filter type in memory
    const overdueQuery = query(
      collection(db, "pets", selectedPet.id, "entries"),
      where("date", "<", Timestamp.fromDate(today)),
      orderBy("date", "desc"),
      // limit(50) // Optional: restrict fetch size
    );

    const unsubscribe = onSnapshot(overdueQuery, (snapshot) => {
      const overdue = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Entry)
        .filter((entry) => entry.type === "schedule" && !entry.isCompleted);
      setOverdueSchedules(overdue);
    });

    return () => unsubscribe();
  }, [selectedPet?.id, today]);

  // Filter today's entries
  const todayEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const entryStart = entry.date.toDate();
        const entryEnd =
          entry.timeType === "range" && entry.endDate
            ? entry.endDate.toDate()
            : entryStart;

        const startsToday = entryStart >= today && entryStart < tomorrow;
        const todayInRange = entryStart < tomorrow && entryEnd >= today;

        return startsToday || todayInRange;
      }),
    [entries, today, tomorrow],
  );

  // Categorize entries
  const { upcomingSchedules, pastRecords, completedItems } = useMemo(() => {
    const upcoming: Entry[] = [];
    const past: Entry[] = [];
    const completed: Entry[] = [];
    const nowTime = new Date();

    todayEntries.forEach((entry) => {
      const entryTime = entry.date.toDate();
      const isSchedule = entry.type === "schedule";

      if (isSchedule && entry.isCompleted) {
        completed.push(entry);
      } else if (isSchedule && entryTime > nowTime) {
        upcoming.push(entry);
      } else if (isSchedule && !entry.isCompleted) {
        // Overdue incomplete schedule
        upcoming.push(entry);
      } else {
        past.push(entry);
      }
    });

    // Sort
    upcoming.sort(
      (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime(),
    );
    past.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime()); // Recent first
    completed.sort(
      (a, b) => b.date.toDate().getTime() - a.date.toDate().getTime(),
    );

    return {
      upcomingSchedules: upcoming,
      pastRecords: past,
      completedItems: completed,
    };
  }, [todayEntries]);

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

  if (loading) {
    return (
      <div className="space-y-4 px-4 mt-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (todayEntries.length === 0 && overdueSchedules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 flex items-center justify-center">
          <span className="text-4xl filter drop-shadow-sm">✨</span>
        </div>
        <p className="text-lg font-medium text-foreground/80">
          今日はまだ記録がありません
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          すてきな一日を始めましょう！
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="px-4 py-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:items-start space-y-6 md:space-y-0">
        {/* Overdue Schedules */}
        {overdueSchedules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <SectionHeader
              icon={<AlertTriangle className="w-4 h-4" />}
              title="期限切れの予定"
              count={overdueSchedules.length}
              color="red"
              isOpen={showOverdue}
              onToggle={() => setShowOverdue(!showOverdue)}
            />
            <AnimatePresence>
              {showOverdue && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pl-2 overflow-hidden"
                >
                  {overdueSchedules.map((entry) => (
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
                      isOverdue
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Upcoming Schedules */}
        {upcomingSchedules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <SectionHeader
              icon={<Clock className="w-4 h-4" />}
              title="今日の予定"
              count={upcomingSchedules.length}
              color="blue"
              isOpen={showSchedules}
              onToggle={() => setShowSchedules(!showSchedules)}
            />
            <AnimatePresence>
              {showSchedules && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pl-2 overflow-hidden"
                >
                  {upcomingSchedules.map((entry) => (
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
          </motion.div>
        )}

        {/* Today's Records */}
        {pastRecords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <SectionHeader
              icon={<Sparkles className="w-4 h-4" />}
              title="今日の記録"
              count={pastRecords.length}
              color="primary"
              isOpen={showRecords}
              onToggle={() => setShowRecords(!showRecords)}
            />
            <AnimatePresence>
              {showRecords && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pl-2 overflow-hidden"
                >
                  {pastRecords.map((entry) => (
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
          </motion.div>
        )}

        {/* Completed */}
        {completedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <SectionHeader
              icon={<CalendarCheck className="w-4 h-4" />}
              title="完了済み"
              count={completedItems.length}
              color="green"
              isOpen={showCompleted}
              onToggle={() => setShowCompleted(!showCompleted)}
            />
            <AnimatePresence>
              {showCompleted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pl-2 overflow-hidden"
                >
                  {completedItems.map((entry) => (
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
                      isCompact
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Detail Sheet */}
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

      {/* Edit Sheet */}
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
    </>
  );
}
