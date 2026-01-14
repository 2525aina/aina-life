"use client";

import { AppLayout } from "@/components/features/AppLayout";
import { usePets } from "@/hooks/usePets";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { PetNewSheet } from "@/components/features/PetNewSheet";
import { PetDetailSheet } from "@/components/features/PetDetailSheet";
import { PetEditSheet } from "@/components/features/PetEditSheet";
import { Pet } from "@/lib/types";
import { differenceInYears, differenceInMonths } from "date-fns";

export default function PetsPage() {
  const { pets, loading } = usePets();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false);

  // Helper to calculate age string
  const getAgeString = (birthday?: string) => {
    if (!birthday) return "";
    const birthDate = new Date(birthday);
    const now = new Date();
    const years = differenceInYears(now, birthDate);
    if (years > 0) return `${years}歳`;
    const months = differenceInMonths(now, birthDate);
    return `${months}ヶ月`;
  };

  const handlePetClick = (pet: Pet) => {
    setSelectedPet(pet);
    setIsDetailOpen(true);
  };

  return (
    <AppLayout>
      <div className="pb-32 min-h-screen">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-primary/10 via-orange-400/5 to-transparent -z-10 rounded-b-[3rem]" />

          <div className="pt-8 px-4 max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                  <PawPrint className="w-8 h-8 text-primary" />
                  家族一覧
                </h1>
                <p className="text-sm text-muted-foreground mt-1 ml-1">
                  大切な家族の管理
                </p>
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-[2rem] bg-muted/40 animate-pulse border border-[var(--glass-border)]"
                  />
                ))
              ) : pets.length === 0 ? (
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
              ) : (
                pets.map((pet, index) => (
                  <motion.div
                    key={pet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handlePetClick(pet)}
                    className="group relative overflow-hidden bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] p-4 rounded-[2.5rem] flex items-center gap-5 cursor-pointer hover:bg-[var(--glass-highlight)] transition-all shadow-sm hover:shadow-lg"
                  >
                    {/* Avatar */}
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-muted flex-shrink-0 shadow-md">
                      {pet.avatarUrl ? (
                        <Image
                          src={pet.avatarUrl}
                          alt={pet.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <Image
                            src="/ogp.webp"
                            alt="No Image"
                            width={40}
                            height={40}
                            className="opacity-30 grayscale"
                          />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold truncate">
                          {pet.name}
                        </h3>
                        {pet.gender && (
                          <span
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-[var(--glass-border)]",
                              pet.gender === "male"
                                ? "bg-blue-100 text-blue-600"
                                : pet.gender === "female"
                                  ? "bg-pink-100 text-pink-600"
                                  : "bg-gray-100/50",
                            )}
                          >
                            {pet.gender === "male"
                              ? "♂"
                              : pet.gender === "female"
                                ? "♀"
                                : "?"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span className="bg-[var(--glass-bg)] px-2 py-0.5 rounded-md border border-[var(--glass-border)]">
                          {pet.breed || "種類未設定"}
                        </span>
                        {pet.birthday && (
                          <span>{getAgeString(pet.birthday)}</span>
                        )}
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center text-muted-foreground/50 group-hover:bg-primary group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <div className="sticky bottom-24 z-20 flex justify-center px-4 pt-6">
        <motion.button
          onClick={() => setIsNewSheetOpen(true)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-8 h-14 rounded-full bg-gradient-to-r from-primary to-orange-500 shadow-xl shadow-primary/30 text-white font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/50 hover:brightness-110"
        >
          <Plus className="w-5 h-5" />
          <span>家族を追加</span>
        </motion.button>
      </div>

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
          setTimeout(() => setIsEditOpen(true), 100); // Short delay for smooth transition
        }}
      />
      <PetEditSheet
        pet={selectedPet}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </AppLayout>
  );
}
