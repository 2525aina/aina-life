"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import type { Pet } from "@/lib/types";
import { usePets } from "@/hooks/usePets";

interface PetContextType {
  selectedPet: Pet | null;
  setSelectedPet: (pet: Pet | null) => void;
  isPetLoading: boolean;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: ReactNode }) {
  const [selectedPet, setSelectedPetState] = useState<Pet | null>(null);
  const { pets, loading: petsLoading, hasFetchedIds, allPetIds } = usePets();
  const [isInitialized, setIsInitialized] = useState(false);

  const setSelectedPet = useCallback((pet: Pet | null) => {
    setSelectedPetState(pet);
    if (pet) {
      localStorage.setItem("selectedPetId", pet.id);
    } else {
      localStorage.removeItem("selectedPetId");
    }
  }, []);

  useEffect(() => {
    // 1. まずメンバー情報（IDのリスト）が引けるまで待つ
    if (!hasFetchedIds) return;

    const storedPetId = localStorage.getItem("selectedPetId");

    // 2. まだ何も選択されていない初期状態の場合
    if (!isInitialized && !selectedPet) {
      if (storedPetId) {
        // LocalStorageに保存されているIDがある場合、それが pets リストに現れるのを待つ
        const found = pets.find((p) => p.id === storedPetId);
        if (found) {
          setTimeout(() => {
            setSelectedPet(found);
            setIsInitialized(true);
          }, 0);
        } else {
          // もし ID リスト(allPetIds)の中に保存されたIDがもう存在しない場合は、Fallbackする
          if (allPetIds.length > 0 && !allPetIds.includes(storedPetId)) {
            setTimeout(() => {
              setSelectedPet(pets[0] || null);
              if (pets.length > 0) setIsInitialized(true);
            }, 0);
          }
        }
      } else {
        // 保存されたIDがない場合は初回のペットを選択
        if (allPetIds.length > 0) {
          if (pets.length > 0) {
            setTimeout(() => {
              setSelectedPet(pets[0]);
              setIsInitialized(true);
            }, 0);
          }
        } else {
          // ペットが一人もいない場合
          setTimeout(() => setIsInitialized(true), 0);
        }
      }
      return;
    }

    // 3. すでに初期化済みの場合は、データの同期のみ行う
    if (isInitialized && selectedPet) {
      const updated = pets.find((p) => p.id === selectedPet.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedPet)) {
        setTimeout(() => setSelectedPetState(updated), 0);
      } else if (!updated && allPetIds.length > 0) {
        // 万が一選択中のペットがリストから消えた場合（削除など）
        const fallback = pets.find((p) => allPetIds.includes(p.id)) || pets[0];
        if (fallback) {
          setTimeout(() => setSelectedPet(fallback), 0);
        }
      }
    }
  }, [
    pets,
    petsLoading,
    hasFetchedIds,
    allPetIds,
    selectedPet,
    setSelectedPet,
    isInitialized,
  ]);

  return (
    <PetContext.Provider
      value={{
        selectedPet,
        setSelectedPet,
        isPetLoading: !isInitialized,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}

export function usePetContext() {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error("usePetContext must be used within a PetProvider");
  }
  return context;
}
