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
import { X, Scale, Calendar as CalendarIcon, Loader2, Save } from "lucide-react";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { format } from "date-fns";
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
        className="h-[95vh] rounded-t-[2.5rem] bg-background/95 backdrop-blur-xl border-t border-white/20 p-0 overflow-hidden"
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

        <div className="overflow-y-auto h-full pb-32">
          <div className="px-6 py-8">
            <form id="weight-form" onSubmit={handleSubmit} className="space-y-8">
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

              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <X className="w-3.5 h-3.5 rotate-45" /> 時間
                  </Label>
                  <TimePickerInput
                    time={format(date, "HH:mm")}
                    setTime={(t) => {
                      const [h, m] = t.split(":").map(Number);
                      const newDate = new Date(date);
                      newDate.setHours(h);
                      newDate.setMinutes(m);
                      setDate(newDate);
                    }}
                    className="w-full h-14 rounded-2xl bg-white/50 border-white/20 text-lg font-bold justify-start px-4"
                  />
                </div>
              </div>
            </form>

          </div>
        </div>

        {/* Sticky Submit Button */}
        <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center pointer-events-none z-50">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const form = document.querySelector("#weight-form") as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            disabled={isSubmitting || !value}
            className="pointer-events-auto w-full max-w-sm h-14 text-lg font-bold gradient-primary shadow-xl rounded-full hover:scale-105 transition-transform"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {weightItem ? "更新する" : "記録する"}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
