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
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import { ensureDate, getAgeString } from "@/lib/utils/date-utils";
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

  return (
    <AppLayout>
      <div className="relative min-h-screen pb-32">
        {/* Global Header Gradient */}
        <HeaderGradient className="h-[30vh] rounded-b-[3rem] from-blue-500/10 via-blue-400/5 to-transparent" />

        <div className="px-4 pt-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <span className="text-3xl">🤝</span>
                お友達一覧
              </h1>
              <p className="text-sm text-muted-foreground mt-1 ml-1">
                出会った仲間たちの記録
              </p>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] bg-muted/20 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredFriends.map((friend: Friend, index: number) => (
                <div
                  key={friend.id}
                  onClick={() => {
                    setSelectedFriend(friend);
                    setIsDetailOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden glass border-[var(--glass-border)] shadow-sm hover:shadow-2xl transition-all duration-500"
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
                            width={80}
                            height={80}
                            className="opacity-20 grayscale"
                          />
                        </div>
                      )}
                    </div>

                    {/* Status Badges (Top) */}
                    <div className="absolute top-4 inset-x-4 flex justify-between items-start pointer-events-none z-10">
                      <div className="flex flex-col gap-2">
                        {friend.location && (
                          <div className="bg-black/40 backdrop-blur-md text-white p-2 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform border border-white/20">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {friend.weight && (
                        <div className="bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black border border-white/20 flex items-center gap-1.5 shadow-lg">
                          <Scale className="w-3.5 h-3.5 text-blue-300" />
                          {friend.weight}
                          <span className="text-[8px] opacity-70">
                            {friend.weightUnit || "kg"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Overlay Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white/90">
                          {friend.breed ||
                            (friend.species === "Canis lupus familiaris"
                              ? "犬"
                              : friend.species === "Felis catus"
                                ? "猫"
                                : friend.species) ||
                            "未設定"}
                        </span>
                        {friend.gender && friend.gender !== "unknown" && (
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

                      <h3 className="font-black text-2xl leading-tight mb-2 truncate group-hover:translate-x-1 transition-transform duration-300">
                        {friend.name}
                      </h3>

                      <div className="flex items-center gap-3 text-[10px] font-bold text-white/70">
                        <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                          <Heart className="w-3.5 h-3.5 text-pink-400" />
                          {friend.birthday
                            ? getAgeString(
                                ensureDate(friend.birthday) ?? undefined,
                              )
                            : "年齢不明"}
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                          <Calendar className="w-3.5 h-3.5 text-blue-300" />
                          {format(
                            ensureDate(friend.metAt) || new Date(),
                            "M/d",
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
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
