"use client";

import { useState } from "react";
import { AppLayout } from "@/components/features/AppLayout";
import { PendingInvitations } from "@/components/features/PendingInvitations";
import { usePetContext } from "@/contexts/PetContext";
import { useMembers } from "@/hooks/useMembers";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, Settings } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TimelineView } from "@/components/dashboard/TimelineView";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";
import { EntryNewSheet } from "@/components/features/EntryNewSheet";
import { useEntries } from "@/hooks/useEntries";
import { toast } from "sonner";
import { EntryFormData } from "@/lib/types";
import { getPetDetailUrl } from "@/lib/utils/pet-urls";
import { DEFAULT_FALLBACK_IMAGE } from "@/lib/constants/assets";
import { ProfileAlert } from "@/components/features/ProfileAlert";
import { StickyFab } from "@/components/ui/sticky-fab";
import { HeaderGradient } from "@/components/ui/header-gradient";
import { cn } from "@/lib/utils";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { List } from "lucide-react";

export default function DashboardPage() {
  const { selectedPet } = usePetContext();
  const { canEdit } = useMembers(selectedPet?.id || null);
  const { addEntry } = useEntries(selectedPet?.id || null);
  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");

  const handleSave = async (data: EntryFormData) => {
    setIsSubmitting(true);
    try {
      await addEntry(data);
      toast.success("記録しました");
      setIsNewSheetOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPet) {
    // ... (No pet state remains same)
    return (
      <AppLayout>
        <div className="p-4 space-y-6 flex flex-col items-center justify-center min-h-[70vh]">
          <PendingInvitations />

          <ProfileAlert className="w-full max-w-sm mx-auto mb-4" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 w-full max-w-sm bg-[var(--glass-bg)] backdrop-blur-xl rounded-3xl border border-[var(--glass-border)] shadow-xl p-8"
          >
            <div className="w-28 h-28 mx-auto rounded-full overflow-hidden mb-6 ring-4 ring-primary/20 shadow-lg">
              <Image
                src={DEFAULT_FALLBACK_IMAGE}
                alt="Welcome"
                width={112}
                height={112}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <h2 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              ようこそ！
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              まずはペットを登録して、
              <br />
              新しい思い出作りを始めましょう。
            </p>
            <Link href="/pets/new" className="block">
              <Button
                size="lg"
                className="w-full rounded-xl gradient-primary shadow-lg hover:shadow-primary/25 transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                ペットを登録する
              </Button>
            </Link>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative min-h-screen pb-24">
        {/* Global Header Gradient */}
        <HeaderGradient />

        <div className="fixed bottom-0 right-0 w-[80%] h-[50%] bg-blue-400/5 rounded-full blur-[100px] -z-20 pointer-events-none" />

        <div className="sticky top-14 z-20 px-4 pt-4 pb-4 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur-sm">
          <PendingInvitations />

          {/* Header */}
          <div className="flex items-end justify-between relative mt-2">
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1 pl-1">
                {format(new Date(), "yyyy年M月d日 (E)", { locale: ja })}
              </p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter filter drop-shadow-sm">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                  {selectedPet.name}
                </span>
              </h1>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <div className="glass-capsule p-1 flex items-center bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)]">
                <button
                  onClick={() => setViewMode("timeline")}
                  className={cn(
                    "p-2 rounded-full transition-all duration-300",
                    viewMode === "timeline"
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-[var(--glass-border)]",
                  )}
                >
                  <List className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={cn(
                    "p-2 rounded-full transition-all duration-300",
                    viewMode === "calendar"
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-[var(--glass-border)]",
                  )}
                >
                  <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <Link href={getPetDetailUrl(selectedPet.id)}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-[var(--glass-bg)] hover:bg-white/50 backdrop-blur-md shadow-sm border border-[var(--glass-border)] transition-all hover:scale-110 active:scale-95"
                >
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-foreground/80" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-2">
          <ProfileAlert className="mb-4 mx-2" />

          {/* View Content */}
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: viewMode === "calendar" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {viewMode === "timeline" ? <TimelineView /> : <CalendarView />}
          </motion.div>
        </div>

        {/* FAB - sticky above footer */}
        {canEdit && (
          <StickyFab
            onClick={() => setIsNewSheetOpen(true)}
            label="日記を記録"
          />
        )}

        <EntryNewSheet
          open={isNewSheetOpen}
          onClose={() => setIsNewSheetOpen(false)}
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />
      </div>
    </AppLayout>
  );
}
