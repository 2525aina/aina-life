"use client";

import { AppLayout } from "@/components/features/AppLayout";
import { usePets } from "@/hooks/usePets";
import { Button } from "@/components/ui/button";
import {
  PawPrint,
  Users,
  Scale,
  AlertCircle,
  CheckCircle2,
  Heart,
  LayoutGrid,
  Calendar,
  MapPin,
  Clock,
  Cake,
  ListTodo,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PetNewSheet } from "@/components/features/PetNewSheet";
import { PetDetailSheet } from "@/components/features/PetDetailSheet";
import { PetEditSheet } from "@/components/features/PetEditSheet";
import { Pet, Entry } from "@/lib/types";
import { getAgeString } from "@/lib/utils/date-utils";
import { getSpeciesLabel } from "@/lib/utils/pet-utils";
import { DEFAULT_FALLBACK_IMAGE } from "@/lib/constants/assets";
import { StickyFab } from "@/components/ui/sticky-fab";
import { HeaderGradient } from "@/components/ui/header-gradient";
import { useWeights } from "@/hooks/useWeights";
import { useMembers } from "@/hooks/useMembers";
import { isSameDay, startOfDay, endOfDay, format } from "date-fns";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePetContext } from "@/contexts/PetContext";
import { useMemo } from "react";
import { getDaysUntilNextBirthday, getAgeDetailString } from "@/lib/utils/date-utils";
import { ListViewTable, ListViewRow, ListViewCell } from "@/components/ui/list-view-table";
import { 
  Columns,
  List as ListIcon,
} from "lucide-react";

function PetCard({
  pet,
  index,
  onClick,
  columns,
}: {
  pet: Pet;
  index: number;
  onClick: (pet: Pet) => void;
  columns: number;
}) {
  const isCompact = columns >= 3;
  const isSuperCompact = columns >= 5;
  const { weights } = useWeights(pet.id);
  const { members } = useMembers(pet.id);
  const [todaySummary, setTodaySummary] = useState({
    remaining: 0,
    completed: 0,
    total: 0,
    journals: 0,
    overdue: 0,
  });
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  useEffect(() => {
    const todayBegin = startOfDay(new Date());
    const todayEnd = endOfDay(todayBegin);

    const q = query(
      collection(db, "pets", pet.id, "entries"),
      where("date", "<=", Timestamp.fromDate(todayEnd)),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map((doc) => doc.data() as Entry);

      const todaySchedules = entries.filter(
        (e) => e.type === "schedule" && isSameDay(e.date.toDate(), todayBegin),
      );
      const todayDiaries = entries.filter(
        (e) => e.type === "diary" && isSameDay(e.date.toDate(), todayBegin),
      );

      const overdueSchedules = entries.filter(
        (e) =>
          e.type === "schedule" &&
          !e.isCompleted &&
          e.date.toDate() < todayBegin,
      );

      setTodaySummary({
        remaining:
          todaySchedules.filter((s) => !s.isCompleted).length +
          overdueSchedules.length,
        completed: todaySchedules.filter((s) => s.isCompleted).length,
        total: todaySchedules.length,
        journals: todayDiaries.length,
        overdue: overdueSchedules.length,
      });
    });

    return () => unsubscribe();
  }, [pet.id]);

  const latestWeight = weights[0];
  const activeMembersCount = members.filter(
    (m) => m.status === "active",
  ).length;
  const hasMedicalInfo =
    !!pet.medicalNotes || (pet.vetInfo && pet.vetInfo.length > 0);

  const [showBirthday, setShowBirthday] = useState(false);
  const [isMedicalOpen, setIsMedicalOpen] = useState(false);
  const [isBreedOpen, setIsBreedOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isWeightOpen, setIsWeightOpen] = useState(false);

  return (
    <div onClick={() => onClick(pet)} className="cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden glass border-[var(--glass-border)] shadow-sm hover:shadow-2xl transition-all duration-500"
      >
        {/* Image */}
        <div className="absolute inset-0 bg-muted">
          {pet.avatarUrl ? (
            <Image
              src={pet.avatarUrl}
              alt={pet.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Image
                src={DEFAULT_FALLBACK_IMAGE}
                alt="画像なし"
                width={80}
                height={80}
                className="opacity-20 grayscale"
              />
            </div>
          )}
        </div>

        {/* Status Badges (Top) */}
        <div
          className={cn(
            "absolute inset-x-4 flex justify-between items-start z-10",
            isCompact ? "top-3" : "top-4",
          )}
        >
          <div className="flex flex-col gap-2 pointer-events-auto">
            {hasMedicalInfo && (
              <Popover open={isMedicalOpen} onOpenChange={setIsMedicalOpen}>
                <PopoverTrigger asChild>
                  <button
                    onMouseEnter={() => setIsMedicalOpen(true)}
                    onMouseLeave={() => setIsMedicalOpen(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMedicalOpen(!isMedicalOpen);
                    }}
                    className={cn(
                      "bg-red-500/80 backdrop-blur-md text-white rounded-full shadow-lg border border-white/20 active:scale-95 transition-all hover:scale-110",
                      isCompact ? "p-1.5" : "p-2",
                    )}
                  >
                    <AlertCircle
                      className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  onMouseEnter={() => setIsMedicalOpen(true)}
                  onMouseLeave={() => setIsMedicalOpen(false)}
                  className="glass border-[var(--glass-border)] rounded-2xl p-4 w-64 space-y-3 z-[100] pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {pet.medicalNotes && (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 text-red-500 font-bold text-xs uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5" />
                        医療情報・メモ
                      </div>
                      <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed px-0.5">
                        {pet.medicalNotes}
                      </p>
                    </div>
                  )}

                  {pet.medicalNotes &&
                    pet.vetInfo &&
                    pet.vetInfo.length > 0 && (
                      <div className="border-t border-dashed border-[var(--glass-border)]" />
                    )}

                  {pet.vetInfo && pet.vetInfo.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 text-blue-500 font-bold text-xs uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5" />
                        かかりつけ医
                      </div>
                      <div className="space-y-1.5 px-0.5">
                        {pet.vetInfo!.map((vet, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start text-xs gap-2"
                          >
                            <span className="font-bold shrink-0">
                              {vet.name}
                            </span>
                            <span className="text-muted-foreground tabular-nums text-[10px] break-all text-right leading-tight">
                              {vet.phone}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
            {latestWeight && (
              <Popover open={isWeightOpen} onOpenChange={setIsWeightOpen}>
                <PopoverTrigger asChild>
                  <button
                    onMouseEnter={() => setIsWeightOpen(true)}
                    onMouseLeave={() => setIsWeightOpen(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsWeightOpen(!isWeightOpen);
                    }}
                    className={cn(
                      "bg-black/40 backdrop-blur-md text-white rounded-full font-black border border-white/20 flex items-center gap-1 shadow-lg transition-all hover:bg-black/60 active:scale-95 group/weight",
                      isCompact
                        ? "px-2 py-1 text-[9px]"
                        : "px-3 py-1.5 text-[10px]",
                    )}
                  >
                    <Scale
                      className={cn(
                        "text-orange-300 group-hover/weight:rotate-12 transition-transform",
                        isCompact ? "w-3 h-3" : "w-3.5 h-3.5",
                      )}
                    />
                    {latestWeight.value}
                    {!isSuperCompact && (
                      <span className="text-[8px] opacity-70">
                        {latestWeight.unit}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  onMouseEnter={() => setIsWeightOpen(true)}
                  onMouseLeave={() => setIsWeightOpen(false)}
                  className="glass border-[var(--glass-border)] rounded-2xl p-4 w-52 space-y-3 z-[100] pointer-events-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between text-yellow-500 font-bold text-xs uppercase tracking-wider mb-1">
                    <div className="flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5" />
                      最新の体重
                    </div>
                    {weights.length > 1 && (
                      <div
                        className={cn(
                          "flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-md",
                          latestWeight.value > weights[1].value
                            ? "bg-red-500/10 text-red-500"
                            : latestWeight.value < weights[1].value
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-gray-500/10 text-gray-500",
                        )}
                      >
                        {latestWeight.value > weights[1].value ? (
                          <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                        ) : latestWeight.value < weights[1].value ? (
                          <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                        ) : (
                          <Minus className="w-2.5 h-2.5 mr-0.5" />
                        )}
                        {Math.abs(
                          latestWeight.value - weights[1].value,
                        ).toFixed(2)}
                        <span className="text-[8px] ml-0.5">
                          {latestWeight.unit}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                    <p className="text-xl font-black tabular-nums">
                      {latestWeight.value}
                      <span className="text-xs font-bold opacity-40 ml-1">
                        {latestWeight.unit}
                      </span>
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      測定日: {format(latestWeight.date.toDate(), "yyyy/MM/dd")}
                    </p>
                  </div>

                  {weights.length > 1 && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest pl-1">
                        記録履歴
                      </p>
                      <div className="space-y-1">
                        {weights.slice(1, 4).map((w, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center text-[10px] px-2 py-1 rounded-lg bg-white/5 border border-white/5"
                          >
                            <span className="text-muted-foreground tabular-nums">
                              {format(w.date.toDate(), "MM/dd")}
                            </span>
                            <span className="font-bold tabular-nums">
                              {w.value}
                              <span className="text-[8px] font-normal opacity-40 ml-0.5">
                                {w.unit}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            )}

            {(todaySummary.total > 0 || todaySummary.journals > 0) && (
              <Popover open={isActivityOpen} onOpenChange={setIsActivityOpen}>
                <PopoverTrigger asChild>
                  <button
                    onMouseEnter={() => setIsActivityOpen(true)}
                    onMouseLeave={() => setIsActivityOpen(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsActivityOpen(!isActivityOpen);
                    }}
                    className={cn(
                      "backdrop-blur-md text-white rounded-full font-black border border-white/20 flex items-center gap-1 shadow-lg shadow-black/20 transition-all active:scale-95 group/activity",
                      isCompact
                        ? "px-2 py-1 text-[9px]"
                        : "px-3 py-1.5 text-[10px]",
                      todaySummary.overdue > 0
                        ? "bg-red-500/80 animate-pulse hover:bg-red-600"
                        : todaySummary.remaining > 0
                          ? "bg-primary/80 animate-pulse hover:bg-primary"
                          : "bg-emerald-500/80 hover:bg-emerald-600",
                    )}
                  >
                    {todaySummary.overdue > 0 ? (
                      <>
                        <AlertCircle
                          className={cn(
                            "text-white/90 group-hover/activity:rotate-12 transition-transform",
                            isCompact ? "w-3 h-3" : "w-3.5 h-3.5",
                          )}
                        />
                        {!isSuperCompact && "期限切れ"} {todaySummary.overdue}
                      </>
                    ) : todaySummary.remaining > 0 ? (
                      <>
                        <Clock
                          className={cn(
                            "text-white/90 group-hover/activity:rotate-12 transition-transform",
                            isCompact ? "w-3 h-3" : "w-3.5 h-3.5",
                          )}
                        />
                        {!isSuperCompact && "残"} {todaySummary.remaining}
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          className={cn(
                            "text-white/90 group-hover/activity:scale-110 transition-transform",
                            isCompact ? "w-3 h-3" : "w-3.5 h-3.5",
                          )}
                        />
                        {!isSuperCompact && "完了"}
                      </>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  onMouseEnter={() => setIsActivityOpen(true)}
                  onMouseLeave={() => setIsActivityOpen(false)}
                  className="glass border-[var(--glass-border)] rounded-2xl p-4 w-52 space-y-3 z-[100] pointer-events-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 mb-1 text-foreground/60 font-black text-[10px] uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    今日のアクティビティ
                  </div>

                  <div className="space-y-2.5">
                    {todaySummary.overdue > 0 && (
                      <div className="flex items-center justify-between bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs font-bold text-red-600">
                            期限切れ
                          </span>
                        </div>
                        <span className="text-xs font-black text-red-600">
                          {todaySummary.overdue}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <ListTodo className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold">今日の予定</span>
                      </div>
                      <span className="text-xs font-black">
                        {todaySummary.completed}
                        <span className="text-[10px] opacity-40 mx-0.5">/</span>
                        {todaySummary.total}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-bold">
                          完了したタスク
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-500">
                        {todaySummary.completed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-bold">今日の日記</span>
                      </div>
                      <span className="text-xs font-black text-blue-400">
                        {todaySummary.journals}
                      </span>
                    </div>
                  </div>

                  {todaySummary.total > 0 && todaySummary.remaining === 0 && (
                    <p className="text-[9px] text-emerald-500 font-bold text-center pt-1 animate-bounce">
                      ✨ 今日の予定をすべて完了しました！
                    </p>
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {/* Content */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 text-white transition-all duration-300",
            isCompact ? "p-3 pb-4" : "p-5",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 relative z-30 pointer-events-auto",
              isCompact ? "mb-1" : "mb-2",
            )}
          >
            <Popover open={isBreedOpen} onOpenChange={setIsBreedOpen}>
              <PopoverTrigger asChild>
                <button
                  onMouseEnter={() => setIsBreedOpen(true)}
                  onMouseLeave={() => setIsBreedOpen(false)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBreedOpen(!isBreedOpen);
                  }}
                  className={cn(
                    "rounded-lg bg-white/10 backdrop-blur-md border border-white/10 font-bold uppercase tracking-wider text-white/90 hover:bg-white/20 transition-all active:scale-95 truncate",
                    isCompact
                      ? "px-1.5 py-0.5 text-[8px] max-w-[80px]"
                      : "px-2 py-0.5 text-[9px]",
                  )}
                >
                  {pet.breed || getSpeciesLabel(pet.species)}
                </button>
              </PopoverTrigger>
              <PopoverContent
                onMouseEnter={() => setIsBreedOpen(true)}
                onMouseLeave={() => setIsBreedOpen(false)}
                className="glass border-[var(--glass-border)] rounded-2xl p-4 w-56 z-[100] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <PawPrint className="w-3.5 h-3.5" />
                  種類・品種
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-muted-foreground">種類</span>
                    <span className="font-bold">
                      {getSpeciesLabel(pet.species)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">品種</span>
                    <span className="font-bold">{pet.breed || "未設定"}</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {pet.gender && (
              <span
                className={cn(
                  "rounded-full flex items-center justify-center font-black border border-white/20",
                  isCompact ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[10px]",
                  pet.gender === "male"
                    ? "bg-blue-500/80 text-white"
                    : "bg-pink-500/80 text-white",
                )}
              >
                {pet.gender === "male" ? "♂" : "♀"}
              </span>
            )}
          </div>

          <h3
            className={cn(
              "font-black leading-tight truncate group-hover:translate-x-1 transition-transform duration-300",
              isSuperCompact
                ? "text-base mb-1"
                : isCompact
                  ? "text-lg mb-1"
                  : "text-2xl mb-2",
            )}
          >
            {pet.name}
          </h3>

          <div
            className={cn(
              "flex items-center text-white/70 relative z-30 pointer-events-auto",
              isCompact ? "gap-2 text-[9px]" : "gap-3 text-[10px] font-bold",
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (pet.birthday) setShowBirthday(!showBirthday);
              }}
              className={cn(
                "group/age flex items-center gap-1.5 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/30 active:scale-95 transition-all cursor-pointer",
                isCompact ? "py-0.5 px-2" : "py-1 px-2.5",
              )}
            >
              {showBirthday ? (
                <>
                  <Cake
                    className={cn(
                      "text-pink-400 group-hover/age:scale-110 transition-transform",
                      isCompact ? "w-3 h-3" : "w-3.5 h-3.5",
                    )}
                  />
                  <span className="text-white drop-shadow-sm">
                    {format(
                      new Date(pet.birthday!),
                      isSuperCompact ? "MM/dd" : "yyyy/MM/dd",
                    )}
                  </span>
                </>
              ) : (
                <>
                  <Heart
                    className={cn(
                      "text-pink-400 group-hover/age:scale-110 transition-transform",
                      isCompact ? "w-3 h-3" : "w-3.5 h-3.5",
                    )}
                  />
                  <span className="text-white/90">
                    {pet.birthday ? getAgeString(pet.birthday) : "年齢不明"}
                  </span>
                </>
              )}
            </button>
            {activeMembersCount > 1 && (
              <Popover open={isMembersOpen} onOpenChange={setIsMembersOpen}>
                <PopoverTrigger asChild>
                  <button
                    onMouseEnter={() => setIsMembersOpen(true)}
                    onMouseLeave={() => setIsMembersOpen(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMembersOpen(!isMembersOpen);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-white/70",
                      isCompact ? "px-2 py-0.5" : "px-2.5 py-1",
                    )}
                  >
                    <Users
                      className={cn(
                        "text-blue-300",
                        isCompact ? "w-3 h-3" : "w-3.5 h-3.5",
                      )}
                    />
                    {activeMembersCount}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  onMouseEnter={() => setIsMembersOpen(true)}
                  onMouseLeave={() => setIsMembersOpen(false)}
                  className="glass border-[var(--glass-border)] rounded-2xl p-4 w-60 z-[100] pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 mb-3 text-blue-500 font-bold text-xs uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    家族メンバー
                  </div>
                  <div className="space-y-2">
                    {members
                      .filter((m) => m.status === "active")
                      .map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600">
                            {member.userProfile?.displayName?.[0] || "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate">
                              {member.userProfile?.displayName ||
                                member.inviteEmail}
                            </p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">
                              {member.role === "owner"
                                ? "オーナー"
                                : member.role === "editor"
                                  ? "編集者"
                                  : "閲覧者"}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PetsPageContent() {
  const { pets, loading } = usePets();
  const { selectedPet: currentSelectedPet } = usePetContext();
  const searchParams = useSearchParams();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);
  const [handledPetId, setHandledPetId] = useState<string | null>(null);
  const [gridCols, setGridCols] = useState(3);
  const [maxCols, setMaxCols] = useState(6);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const sortedPets = useMemo(() => {
    return [...pets].sort((a, b) => {
      if (a.id === currentSelectedPet?.id) return -1;
      if (b.id === currentSelectedPet?.id) return 1;

      const daysA = getDaysUntilNextBirthday(a.birthday);
      const daysB = getDaysUntilNextBirthday(b.birthday);
      
      if (daysA !== daysB) return daysA - daysB;
      return a.name.localeCompare(b.name, "ja");
    });
  }, [pets, currentSelectedPet]);

  useEffect(() => {
    const savedView = localStorage.getItem("pets_view_mode");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedView === "list") setViewMode("list");
  }, []);

  const toggleViewMode = () => {
    const next = viewMode === "grid" ? "list" : "grid";
    setViewMode(next);
    localStorage.setItem("pets_view_mode", next);
  };

  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth < 768) setMaxCols(3);
      else if (window.innerWidth < 1280) setMaxCols(4);
      else setMaxCols(6);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Load view mode from local storage
  useEffect(() => {
    const saved = localStorage.getItem("pets_grid_cols");
    if (saved) {
      setTimeout(() => setGridCols(parseInt(saved, 10)), 0);
    }
  }, []);

  const updateCols = (cols: number) => {
    setGridCols(cols);
    localStorage.setItem("pets_grid_cols", cols.toString());
  };

  const displayCols = Math.min(gridCols, maxCols);

  // Helper to get grid classes that perfectly match the value
  const getGridClass = (cols: number) => {
    switch (cols) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      case 6:
        return "grid-cols-6";
      default:
        return "grid-cols-2";
    }
  };

  // Handle petId query param to auto-open detail sheet
  useEffect(() => {
    if (loading) return;
    const petId = searchParams.get("petId");
    if (petId && pets.length > 0 && petId !== handledPetId) {
      const pet = pets.find((p) => p.id === petId);
      if (pet) {
        setTimeout(() => {
          setHandledPetId(petId);
          requestAnimationFrame(() => {
            setSelectedPet(pet);
            setIsDetailOpen(true);
          });
        }, 0);
      }
    }
  }, [searchParams, pets, loading, handledPetId]);

  const handlePetClick = (pet: Pet) => {
    setSelectedPet(pet);
    setIsDetailOpen(true);
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen pb-32">
        {/* Global Header Gradient */}
        <HeaderGradient className="h-[30vh] rounded-b-[3rem]" />

        <div className="px-4 pt-6 space-y-6">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <span className="text-3xl">🐾</span>
                家族一覧
              </h1>
              <p className="text-sm text-muted-foreground mt-1 ml-1">
                大切な家族の管理
              </p>
            </div>
          </div>

          {/* List/Grid Choice */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex bg-muted/20 p-1 rounded-2xl glass-capsule border border-white/5">
              <button
                onClick={() => toggleViewMode()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                  viewMode === "grid" 
                    ? "bg-white/80 backdrop-blur-md shadow-lg text-primary border border-white/40" 
                    : "text-muted-foreground opacity-60"
                )}
              >
                <Columns className="w-3.5 h-3.5" />
                グリッド
              </button>
              <button
                onClick={() => toggleViewMode()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                  viewMode === "list" 
                    ? "bg-white/80 backdrop-blur-md shadow-lg text-primary border border-white/40" 
                    : "text-muted-foreground opacity-60"
                )}
              >
                <ListIcon className="w-3.5 h-3.5" />
                リスト
              </button>
            </div>

            {viewMode === "grid" && (
              <div
                className="relative h-8 flex items-center group/slider select-none"
                style={{ width: maxCols * 24 + "px" }}
              >
                <div className="absolute -top-4 right-0 flex items-center gap-1.5 opacity-40 group-hover/slider:opacity-100 transition-opacity">
                  <LayoutGrid className="w-3 h-3" />
                  <span className="text-[9px] font-black tracking-tight">
                    {displayCols}
                  </span>
                </div>

                {/* Track */}
                <div className="absolute inset-x-2 h-1 bg-muted/20 backdrop-blur-sm rounded-full">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    animate={{
                      width: `${((displayCols - 1) / (maxCols - 1 || 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Interaction Dots */}
                <div className="absolute inset-x-2 flex justify-between pointer-events-none">
                  {Array.from({ length: maxCols }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 h-1 rounded-full transition-all duration-300",
                        i + 1 <= displayCols
                          ? "bg-primary/60"
                          : "bg-muted-foreground/20",
                      )}
                    />
                  ))}
                </div>

                {/* Slider Thumb */}
                <div className="absolute inset-x-2 h-0 flex items-center pointer-events-none">
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full shadow-lg border-2 border-primary z-30"
                    animate={{
                      marginLeft: `calc(${((displayCols - 1) / (maxCols - 1 || 1)) * 100}% - 8px)`,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>

                <input
                  type="range"
                  min="1"
                  max={maxCols}
                  step="1"
                  value={displayCols}
                  onChange={(e) => updateCols(parseInt(e.target.value, 10))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer z-40"
                />
              </div>
            )}
          </div>

          {/* List Content */}
          {loading ? (
            <div className={cn("grid gap-3", getGridClass(displayCols))}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] bg-muted/20 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : sortedPets.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-[3rem]">
              <p className="text-muted-foreground font-medium">
                登録されている家族はいません
              </p>
              <Button
                variant="link"
                onClick={() => setIsNewSheetOpen(true)}
                className="mt-2 text-primary"
              >
                はじめての登録はこちら
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className={cn("grid gap-4", getGridClass(displayCols))}>
              {sortedPets.map((pet, index) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  index={index}
                  onClick={handlePetClick}
                  columns={displayCols}
                />
              ))}
            </div>
          ) : (
            <div className="px-1">
              <ListViewTable
                headers={[
                  { key: "name", label: "名前", width: "w-40" },
                  { key: "species", label: "種類" },
                  { key: "breed", label: "品種" },
                  { key: "gender", label: "性別" },
                  { key: "color", label: "毛色" },
                  { key: "age", label: "年齢" },
                  { key: "birthday", label: "誕生日" },
                  { key: "adoption", label: "記念日" },
                  { key: "chip", label: "チップID" },
                  { key: "medical", label: "医療メモ" },
                  { key: "vet", label: "かかりつけ医" }
                ]}
              >
                {sortedPets.map((pet) => (
                  <ListViewRow key={pet.id} onClick={() => handlePetClick(pet)}>
                    <ListViewCell isSticky className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--glass-border)] shrink-0">
                        {pet.avatarUrl ? (
                          <Image src={pet.avatarUrl} alt={pet.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <PawPrint className="w-5 h-5 opacity-20" />
                          </div>
                        )}
                      </div>
                      <span className="font-black text-sm">{pet.name}</span>
                    </ListViewCell>
                    <ListViewCell className="text-xs font-bold text-muted-foreground">
                      {getSpeciesLabel(pet.species)}
                    </ListViewCell>
                    <ListViewCell className="text-xs font-black">
                      {pet.breed || "---"}
                    </ListViewCell>
                    <ListViewCell>
                      {pet.gender ? (
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black border border-white/10",
                          pet.gender === "male" ? "bg-blue-500/10 text-blue-500" : "bg-pink-500/10 text-pink-500"
                        )}>
                          {pet.gender === "male" ? "♂ オス" : "♀ メス"}
                        </span>
                      ) : "---"}
                    </ListViewCell>
                    <ListViewCell className="text-xs font-bold">
                      {pet.color || "---"}
                    </ListViewCell>
                    <ListViewCell className="text-xs font-black">
                      {getAgeDetailString(pet.birthday) || "---"}
                    </ListViewCell>
                    <ListViewCell className="text-xs font-bold font-mono">
                      {pet.birthday || "---"}
                    </ListViewCell>
                    <ListViewCell className="text-xs font-bold font-mono text-emerald-600">
                      {pet.adoptionDate || "---"}
                    </ListViewCell>
                    <ListViewCell className="text-xs font-mono font-medium text-muted-foreground">
                      {pet.microchipId || "---"}
                    </ListViewCell>
                    <ListViewCell className="text-[10px] leading-tight text-red-500 max-w-[200px] whitespace-normal">
                      {pet.medicalNotes || "---"}
                    </ListViewCell>
                    <ListViewCell className="text-[10px] leading-tight max-w-[200px] whitespace-normal">
                      {pet.vetInfo && pet.vetInfo.length > 0 
                        ? pet.vetInfo.map(v => `${v.name}${v.phone ? `(${v.phone})` : ""}`).join(", ") 
                        : "---"}
                    </ListViewCell>
                  </ListViewRow>
                ))}
              </ListViewTable>
            </div>
          )}
        </div>

        {/* FAB */}
        <StickyFab onClick={() => setIsNewSheetOpen(true)} label="家族を追加" />

        <PetNewSheet
          open={isNewSheetOpen}
          onClose={() => setIsNewSheetOpen(false)}
        />
        <PetDetailSheet
          pet={selectedPet}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            setTimeout(() => setIsEditOpen(true), 100);
          }}
        />
        <PetEditSheet
          pet={selectedPet}
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      </div>
    </AppLayout>
  );
}

export default function PetsPage() {
  return (
    <Suspense fallback={null}>
      <PetsPageContent />
    </Suspense>
  );
}
