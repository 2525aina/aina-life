"use client";

import { AppLayout } from "@/components/features/AppLayout";
import { usePetContext } from "@/contexts/PetContext";
import { useMembers } from "@/hooks/useMembers";
import { useFriends } from "@/hooks/useFriends";
import {
  MapPin,
  Calendar,
  Search,
  Heart,
  Scale,
  PawPrint,
  Users,
  LayoutGrid,
  ChevronRight,
  Clock,
  Cake,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import { ensureDate, getAgeString } from "@/lib/utils/date-utils";
import { getSpeciesLabel } from "@/lib/utils/pet-utils";
import { FriendDetailSheet } from "@/components/features/FriendDetailSheet";
import { FriendFormSheet } from "@/components/features/FriendFormSheet";
import { toast } from "sonner";
import { Friend } from "@/lib/types";
import { DEFAULT_FALLBACK_IMAGE } from "@/lib/constants/assets";
import { StickyFab } from "@/components/ui/sticky-fab";
import { HeaderGradient } from "@/components/ui/header-gradient";
import { cn } from "@/lib/utils";

interface FriendFormData {
  name: string;
  species: string;
  breed: string;
  gender: "male" | "female" | "unknown";
  color: string;
  location: string;
  features: string;
  images: string[];
  metAt: Date;
  birthday?: Timestamp;
  weight?: number;
  weightUnit?: "kg" | "g";
  ownerName: string;
  ownerDetails: string;
  contact: string;
  address: string;
}

function FriendCard({
  friend,
  index,
  onClick,
  columns = 3,
}: {
  friend: Friend;
  index: number;
  onClick: (friend: Friend) => void;
  columns?: number;
}) {
  const isCompact = columns >= 3;
  const isSuperCompact = columns >= 5;

  return (
    <div onClick={() => onClick(friend)} className="cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          "group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden glass border-[var(--glass-border)] shadow-sm hover:shadow-2xl transition-all duration-500",
          isCompact && "rounded-[1.5rem]",
        )}
      >
        {/* Image */}
        <div className="absolute inset-0 bg-muted">
          {friend.images?.[0] ? (
            <Image
              src={friend.images[0]}
              alt={friend.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Image
                src={DEFAULT_FALLBACK_IMAGE}
                alt="画像なし"
                width={isSuperCompact ? 40 : 80}
                height={isSuperCompact ? 40 : 80}
                className="opacity-20 grayscale"
              />
            </div>
          )}
        </div>

        {/* Status Badges (Top) */}
        <div
          className={cn(
            "absolute top-4 inset-x-4 flex justify-between items-start pointer-events-none z-10",
            isCompact && "top-3 inset-x-3",
          )}
        >
          <div className="flex flex-col gap-2">
            {friend.location && (
              <div
                className={cn(
                  "bg-black/40 backdrop-blur-md text-white p-2 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform border border-white/20",
                  isCompact && "p-1.5",
                )}
              >
                <MapPin className={cn("w-3.5 h-3.5", isCompact && "w-3 h-3")} />
              </div>
            )}
          </div>

          {friend.weight && (
            <div
              className={cn(
                "bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black border border-white/20 flex items-center gap-1.5 shadow-lg",
                isCompact && "px-2 py-1 text-[9px]",
                isSuperCompact && "px-1.5 py-0.5",
              )}
            >
              <Scale
                className={cn(
                  "w-3.5 h-3.5 text-blue-300",
                  isCompact && "w-3 h-3",
                )}
              />
              {friend.weight}
              {!isSuperCompact && (
                <span className="text-[8px] opacity-70">
                  {friend.weightUnit || "kg"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {/* Content */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 p-5 text-white",
            isCompact && "p-3",
            isSuperCompact && "p-2",
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "px-2 py-0.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white/90",
                isSuperCompact && "text-[8px] px-1",
              )}
            >
              {friend.breed || getSpeciesLabel(friend.species)}
            </span>
            {friend.gender &&
              friend.gender !== "unknown" &&
              !isSuperCompact && (
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-white/20",
                    friend.gender === "male"
                      ? "bg-blue-500/80 text-white"
                      : "bg-pink-500/80 text-white",
                  )}
                >
                  {friend.gender === "male" ? "♂" : "♀"}
                </span>
              )}
          </div>

          <h3
            className={cn(
              "font-black text-2xl leading-tight mb-2 truncate group-hover:translate-x-1 transition-transform duration-300",
              columns >= 2 && "text-xl",
              isCompact && "text-lg",
              isSuperCompact && "text-sm mb-1",
            )}
          >
            {friend.name}
          </h3>

          <div
            className={cn(
              "flex items-center gap-3 text-[10px] font-bold text-white/70",
              isCompact && "gap-1.5",
              isSuperCompact && "flex-wrap",
            )}
          >
            <span
              className={cn(
                "flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10",
                isCompact && "px-2 py-0.5 text-[9px]",
                isSuperCompact && "gap-1 px-1.5",
              )}
            >
              <Heart
                className={cn(
                  "w-3.5 h-3.5 text-pink-400",
                  isCompact && "w-3 h-3",
                )}
              />
              {friend.birthday
                ? getAgeString(ensureDate(friend.birthday) ?? undefined)
                : "年齢不明"}
            </span>
            <span
              className={cn(
                "flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10",
                isCompact && "px-2 py-0.5 text-[9px]",
                isSuperCompact && "gap-1 px-1.5",
              )}
            >
              <Calendar
                className={cn(
                  "w-3.5 h-3.5 text-blue-300",
                  isCompact && "w-3 h-3",
                )}
              />
              {format(ensureDate(friend.metAt) || new Date(), "M/d")}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function FriendsPage() {
  const { selectedPet } = usePetContext();
  const { canEdit } = useMembers(selectedPet?.id || null);
  const { friends, loading, addFriend, updateFriend, deleteFriend } =
    useFriends(selectedPet?.id || null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sheet States
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [gridCols, setGridCols] = useState(3);
  const [maxCols, setMaxCols] = useState(6);

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

  useEffect(() => {
    const saved = localStorage.getItem("friends_grid_cols");
    if (saved) setGridCols(parseInt(saved, 10));
  }, []);

  const updateCols = (cols: number) => {
    setGridCols(cols);
    localStorage.setItem("friends_grid_cols", cols.toString());
  };

  const displayCols = Math.min(gridCols, maxCols);

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

  const filteredFriends = friends.filter(
    (friend: Friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSaveFriend = async (data: FriendFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedFriend) {
        await updateFriend(selectedFriend.id, data);
        toast.success("更新しました");
      } else {
        await addFriend(data);
        toast.success("登録しました");
      }
      setIsFormOpen(false);
      setSelectedFriend(null);
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFriendClick = (friend: Friend) => {
    setSelectedFriend(friend);
    setIsDetailOpen(true);
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen pb-32">
        {/* Global Header Gradient */}
        <HeaderGradient className="h-[30vh] rounded-b-[3rem] from-blue-500/10 via-blue-400/5 to-transparent" />

        <div className="px-4 pt-6 space-y-6">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <span className="text-3xl">🤝</span>
                お友達一覧
              </h1>
              <p className="text-sm text-muted-foreground mt-1 ml-1">
                出会った仲間たちの記録
              </p>
            </div>

            {/* Compact Grid Slider - Responsive Steps */}
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

              {/* Invisible range input for interaction */}
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
          </div>

          {/* Search - 友達が5人以上の場合のみ表示 */}
          {friends.length >= 5 && (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="名前、犬種、飼い主名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-[var(--glass-bg)] backdrop-blur-sm border-[var(--glass-border)] shadow-sm rounded-xl focus:bg-white transition-all"
              />
            </div>
          )}

          {/* Friends Grid */}
          {loading ? (
            <div className={cn("grid gap-3", getGridClass(displayCols))}>
              {[...Array(displayCols * 2)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] bg-muted/20 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className={cn("grid gap-4", getGridClass(displayCols))}>
              {filteredFriends.map((friend: Friend, index: number) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  index={index}
                  onClick={handleFriendClick}
                  columns={displayCols}
                />
              ))}
            </div>
          )}
        </div>

        {/* FAB - sticky above footer */}
        {canEdit && (
          <StickyFab
            onClick={() => {
              setSelectedFriend(null);
              setIsFormOpen(true);
            }}
            label="友達を追加"
          />
        )}

        {/* Friend Summary Sheets */}
        <FriendDetailSheet
          friend={selectedFriend}
          open={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedFriend(null);
          }}
          onEdit={() => {
            setIsDetailOpen(false);
            setIsFormOpen(true);
          }}
          onDelete={async (id) => {
            await deleteFriend(id);
          }}
          canEdit={canEdit}
        />

        <FriendFormSheet
          open={isFormOpen}
          friend={selectedFriend}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedFriend(null);
          }}
          onSave={handleSaveFriend}
          isSubmitting={isSubmitting}
          petId={selectedPet?.id || ""}
        />
      </div>
    </AppLayout>
  );
}
