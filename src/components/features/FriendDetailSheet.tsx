"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { calculateAge } from "@/lib/utils/date-utils";
import { DEFAULT_FALLBACK_IMAGE } from "@/lib/constants/assets";
import {
  Trash2,
  Edit,
  MapPin,
  Calendar,
  Scale,
  Cake,
  User,
  Phone,
  Home,
  X,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Friend } from "@/lib/types";
import Image from "next/image";

interface FriendDetailSheetProps {
  friend: Friend | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  canEdit: boolean;
}

export function FriendDetailSheet({
  friend,
  open,
  onClose,
  onEdit,
  onDelete,
  canEdit,
}: FriendDetailSheetProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!friend) return null;

  const age = friend.birthday
    ? calculateAge(friend.birthday.toDate())
    : null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(friend.id);
      toast.success("削除しました");
      onClose();
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-3xl bg-background/95 backdrop-blur-xl border-t border-[var(--glass-border)] p-0 overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-[var(--glass-border)] px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full w-9 h-9"
            >
              <X className="w-5 h-5" />
            </Button>
            <SheetTitle className="text-sm font-bold">お友達の詳細</SheetTitle>
            <div className="flex gap-1">
              {canEdit && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEdit}
                    className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-9 h-9 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass border-[var(--glass-border)]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>お友達を削除</AlertDialogTitle>
                        <AlertDialogDescription>
                          本当にこのお友達を削除しますか？この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">
                          キャンセル
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                          削除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-20 px-4 py-6 space-y-6">
          {/* Hero Section */}
          <div className="relative aspect-square w-full bg-muted overflow-hidden rounded-3xl shadow-lg ring-1 ring-[var(--glass-border)]">
            {friend.images?.[0] ? (
              <Image
                src={friend.images[0]}
                alt={friend.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Image
                  src={DEFAULT_FALLBACK_IMAGE}
                  alt="No image"
                  width={128}
                  height={128}
                  className="object-contain opacity-20 grayscale"
                />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold border border-[var(--glass-border)] uppercase tracking-wider">
                  {friend.breed || "犬種不明"}
                </span>
                {friend.gender !== "unknown" && (
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${friend.gender === "male" ? "bg-blue-500/80" : "bg-red-500/80"}`}
                  >
                    {friend.gender === "male" ? "♂" : "♀"}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black tracking-tight">
                {friend.name}
              </h1>
            </div>
          </div>

          {/* Basic Info Stats */}
          <div className="grid grid-cols-2 gap-3">
            {friend.weight && (
              <div className="glass p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    体重
                  </p>
                  <p className="font-bold">
                    {friend.weight}
                    {friend.weightUnit}
                  </p>
                </div>
              </div>
            )}
            {(age !== null || friend.birthday) && (
              <div className="glass p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    年齢
                  </p>
                  <p className="font-bold">
                    {age !== null ? `${age}歳` : "不明"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Encounter Info */}
          <div className="glass rounded-3xl p-6 shadow-xl border-[var(--glass-border)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  出会った日
                </p>
                <p className="font-bold">
                  {format(
                    friend.metAt instanceof Timestamp
                      ? friend.metAt.toDate()
                      : new Date(friend.metAt),
                    "yyyy年M月d日 (E)",
                    {
                      locale: ja,
                    },
                  )}
                </p>
              </div>
            </div>

            {friend.location && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                    出会った場所
                  </p>
                  <p className="font-bold">{friend.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Owner Info */}
          {(friend.ownerName ||
            friend.ownerDetails ||
            friend.contact ||
            friend.address) && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-muted-foreground flex items-center gap-2 px-2 uppercase tracking-widest">
                  <User className="w-4 h-4" /> 飼い主情報
                </h3>
                <div className="glass rounded-2xl p-5 text-sm leading-relaxed border-[var(--glass-border)] space-y-3 shadow-lg">
                  {friend.ownerName && (
                    <div className="flex items-start gap-3">
                      <span className="font-bold min-w-[4rem] text-muted-foreground">
                        お名前
                      </span>
                      <span className="font-medium text-foreground">
                        {friend.ownerName}
                      </span>
                    </div>
                  )}
                  {friend.ownerDetails && (
                    <div className="flex items-start gap-3">
                      <span className="font-bold min-w-[4rem] text-muted-foreground">
                        特徴
                      </span>
                      <span className="font-medium text-foreground">
                        {friend.ownerDetails}
                      </span>
                    </div>
                  )}
                  {friend.contact && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-foreground">
                        {friend.contact}
                      </span>
                    </div>
                  )}
                  {friend.address && (
                    <div className="flex items-start gap-3">
                      <Home className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-foreground">
                        {friend.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Features/Memo */}
          {friend.features && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-muted-foreground px-2 uppercase tracking-widest">
                メモ・特徴
              </h3>
              <div className="glass rounded-2xl p-5 text-sm leading-relaxed border-[var(--glass-border)] shadow-lg whitespace-pre-wrap font-medium">
                {friend.features}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
