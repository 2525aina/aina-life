"use client";

import { usePets } from "@/hooks/usePets";
import { usePetContext } from "@/contexts/PetContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Plus, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PetNewSheet } from "@/components/features/PetNewSheet";
import { useState } from "react";

import { getPetDetailUrl } from "@/lib/utils/pet-urls";
import { DEFAULT_FALLBACK_IMAGE } from "@/lib/constants/assets";

export function PetSwitcher() {
  const { pets, loading } = usePets();
  const { selectedPet, setSelectedPet } = usePetContext();
  const [isNewPetSheetOpen, setIsNewPetSheetOpen] = useState(false);

  // We no longer manage selectedPet logic here. It's handled by PetContext.
  // This avoids double-triggers and resets during navigation.

  if (loading)
    return <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />;

  if (pets.length === 0) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setIsNewPetSheetOpen(true)}
        >
          <Plus className="w-4 h-4" />
          ペットを登録
        </Button>
        <PetNewSheet
          open={isNewPetSheetOpen}
          onClose={() => setIsNewPetSheetOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 h-10 px-3">
            <Avatar className="w-7 h-7">
              <AvatarImage
                src={selectedPet?.avatarUrl}
                alt={selectedPet?.name}
              />
              <AvatarFallback className="bg-primary/10 flex items-center justify-center overflow-hidden relative">
                <Image
                  src={DEFAULT_FALLBACK_IMAGE}
                  alt="Pet"
                  fill
                  className="object-cover opacity-50 grayscale"
                />
              </AvatarFallback>
            </Avatar>
            <span className="font-medium max-w-[100px] truncate">
              {selectedPet?.name || "ペットを選択"}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {pets.map((pet) => (
            <DropdownMenuItem
              key={pet.id}
              onClick={() => setSelectedPet(pet)}
              className="gap-3 cursor-pointer"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={pet.avatarUrl} alt={pet.name} />
                <AvatarFallback className="bg-primary/10 flex items-center justify-center overflow-hidden relative">
                  <Image
                    src={DEFAULT_FALLBACK_IMAGE}
                    alt="Pet"
                    fill
                    className="object-cover opacity-50 grayscale"
                  />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{pet.name}</p>
                {pet.breed && (
                  <p className="text-xs text-muted-foreground truncate">
                    {pet.breed}
                  </p>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {selectedPet && (
            <DropdownMenuItem asChild>
              <Link
                href={getPetDetailUrl(selectedPet.id)}
                className="gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <span>{selectedPet.name}の設定</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="gap-3 cursor-pointer"
            onClick={() => setIsNewPetSheetOpen(true)}
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span>新しいペットを追加</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PetNewSheet
        open={isNewPetSheetOpen}
        onClose={() => setIsNewPetSheetOpen(false)}
      />
    </>
  );
}
