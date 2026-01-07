"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerDropdown } from "@/components/ui/date-picker-dropdown";
import { X, Scale, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type WeightItem } from "@/lib/types";

interface WeightFormSheetProps {
  weightItem?: WeightItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    value: number;
    unit: "kg" | "g";
    date: Date;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function WeightFormSheet({
  weightItem,
  open,
  onClose,
  onSave,
  isSubmitting,
}: WeightFormSheetProps) {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<"kg" | "g">("kg");
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setTimeout(() => {
      if (weightItem) {
        setValue(weightItem.value.toString());
        setUnit(weightItem.unit);
        setDate(weightItem.date.toDate());
      } else {
        setValue("");
        setUnit("kg");
        setDate(new Date());
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [weightItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      toast.error("正しい体重を入力してください");
      return;
    }
    await onSave({ value: numValue, unit, date });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[70vh] rounded-t-3xl bg-background/95 backdrop-blur-xl border-t border-white/20 p-0 overflow-hidden"
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
              {weightItem ? "体重を編集" : "体重を記録"}
            </SheetTitle>
            <div className="w-9" />
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-full px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Value & Unit */}
            <div className="space-y-4">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-3.5 h-3.5" /> 体重
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="h-14 text-2xl font-black rounded-2xl bg-white/50 border-white/20 focus:bg-white transition-all pl-4"
                  />
                </div>
                <Select
                  value={unit}
                  onValueChange={(v: "kg" | "g") => setUnit(v)}
                >
                  <SelectTrigger className="w-24 h-14 rounded-2xl bg-white/50 border-white/20 text-lg font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-4">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5" /> 日付
              </Label>
              <DatePickerDropdown
                date={date}
                setDate={(d) => d && setDate(d)}
                className="w-full h-14 rounded-2xl bg-white/50 border-white/20 text-lg font-bold justify-start px-4"
              />
            </div>

            <div className="pt-8 px-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl gradient-primary text-lg font-black shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "保存する"
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
