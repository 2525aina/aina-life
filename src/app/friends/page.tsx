"use client";

import { AppLayout } from "@/components/features/AppLayout";
import { usePetContext } from "@/contexts/PetContext";
import { useMembers } from "@/hooks/useMembers";
import { useFriends } from "@/hooks/useFriends";
import { MapPin, Calendar, Search } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";
import { ensureDate } from "@/lib/utils/date-utils";
import { FriendDetailSheet } from "@/components/features/FriendDetailSheet";
import { FriendFormSheet } from "@/components/features/FriendFormSheet";
import { toast } from "sonner";
import { Friend } from "@/lib/types";
import { DEFAULT_FALLBACK_IMAGE } from "@/lib/constants/assets";
import { StickyFab } from "@/components/ui/sticky-fab";

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

import { HeaderGradient } from "@/components/ui/header-gradient";

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
        <HeaderGradient className="h-[30vh] rounded-b-[3rem]" />

        <div className="px-4 pt-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <span className="text-3xl">🐾</span>
                お散歩友達
              </h1>
              <p className="text-xs font-bold text-muted-foreground ml-1">
                {selectedPet?.name}の友達リスト
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
                    className="group relative aspect-[4/5] rounded-2xl overflow-hidden glass border-[var(--glass-border)] shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="absolute inset-0 bg-muted">
                      {friend.images?.[0] ? (
                        <Image
                          src={friend.images[0]}
                          alt={friend.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Image
                            src={DEFAULT_FALLBACK_IMAGE}
                            alt="No image"
                            width={64}
                            height={64}
                            className="opacity-20 grayscale"
                          />
                        </div>
                      )}
                    </div>

                    {/* Overlay Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="text-[10px] font-medium text-white/70 mb-0.5 flex items-center gap-1">
                        {friend.breed || "犬種不明"}
                        {friend.gender === "male" && (
                          <span className="text-blue-300">♂</span>
                        )}
                        {friend.gender === "female" && (
                          <span className="text-red-300">♀</span>
                        )}
                      </p>
                      <h3 className="font-bold text-lg leading-tight mb-1 truncate">
                        {friend.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-2 text-[10px] font-medium text-white/60">
                        {ensureDate(friend.metAt) && (
                          <span className="flex items-center gap-0.5 bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                            <Calendar className="w-3 h-3" />
                            {format(ensureDate(friend.metAt)!, "M/d")}
                          </span>
                        )}
                        {friend.location && (
                          <span className="flex items-center gap-0.5 bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm truncate max-w-[80px]">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{friend.location}</span>
                          </span>
                        )}
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
