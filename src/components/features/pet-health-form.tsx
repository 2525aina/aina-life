"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { VetInfo } from "@/lib/types";

interface PetHealthFormProps {
  medicalNotes: string;
  onMedicalNotesChange: (val: string) => void;
  vetInfo: VetInfo[];
  onVetInfoChange: (val: VetInfo[]) => void;
  disabled?: boolean;
}

export function PetHealthForm({
  medicalNotes,
  onMedicalNotesChange,
  vetInfo,
  onVetInfoChange,
  disabled,
}: PetHealthFormProps) {
  const addVetInfo = () =>
    onVetInfoChange([...vetInfo, { name: "", phone: "" }]);

  const updateVetInfo = (
    index: number,
    field: "name" | "phone",
    value: string,
  ) => {
    const updated = [...vetInfo];
    updated[index] = { ...updated[index], [field]: value };
    onVetInfoChange(updated);
  };

  const removeVetInfo = (index: number) =>
    onVetInfoChange(vetInfo.filter((_, i) => i !== index));

  return (
    <div className="glass rounded-[2rem] p-6 shadow-sm border-[var(--glass-border)] space-y-6">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-primary rounded-full" />
        <h3 className="font-bold text-sm text-foreground/80">医療・その他</h3>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground ml-1">
          医療メモ
        </Label>
        <textarea
          value={medicalNotes}
          onChange={(e) => onMedicalNotesChange(e.target.value)}
          placeholder="アレルギー、持病など..."
          rows={3}
          disabled={disabled}
          className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-muted-foreground ml-1">
            かかりつけ動物病院
          </Label>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addVetInfo}
              className="h-7 text-xs text-primary rounded-full bg-primary/10"
            >
              <Plus className="w-3 h-3 mr-1" />
              追加
            </Button>
          )}
        </div>

        {vetInfo.length === 0 ? (
          <div className="text-xs text-center py-4 border-2 border-dashed border-[var(--glass-border)] rounded-xl text-muted-foreground">
            なし
          </div>
        ) : (
          vetInfo.map((vet, idx) => (
            <div
              key={idx}
              className="flex gap-2 items-start p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]"
            >
              <div className="grid gap-2 flex-1">
                <Input
                  value={vet.name}
                  onChange={(e) => updateVetInfo(idx, "name", e.target.value)}
                  placeholder="病院名"
                  className="h-8 text-xs bg-transparent"
                  disabled={disabled}
                />
                <Input
                  value={vet.phone || ""}
                  onChange={(e) => updateVetInfo(idx, "phone", e.target.value)}
                  placeholder="電話番号"
                  className="h-8 text-xs bg-transparent"
                  disabled={disabled}
                />
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVetInfo(idx)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
