"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EntryForm } from "@/components/features/EntryForm";
import { type EntryFormData } from "@/lib/types";

interface EntryNewSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: EntryFormData) => Promise<void>;
  isSubmitting: boolean;
  initialType?: "diary" | "schedule";
}

export function EntryNewSheet({
  open,
  onClose,
  onSave,
  isSubmitting,
  initialType = "diary",
}: EntryNewSheetProps) {
  const handleSubmit = async (data: EntryFormData) => {
    await onSave(data);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[95vh] rounded-t-3xl bg-background/95 backdrop-blur-xl border-t border-white/20 p-0 overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full w-9 h-9"
            >
              <X className="w-5 h-5" />
            </Button>
            <SheetTitle className="text-sm font-bold">
              {initialType === "diary" ? "日記を記録" : "予定を追加"}
            </SheetTitle>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </SheetHeader>

        {/* Content - EntryForm */}
        <div className="overflow-y-auto h-full">
          <EntryForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            hideHeader={true}
            title={initialType === "diary" ? "日記を記録" : "予定を追加"}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
