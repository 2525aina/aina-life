"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  PetBasicInfoForm,
  type PetBasicInfoData,
} from "@/components/features/pet-basic-info-form";
import { PetAvatarEditor } from "@/components/features/pet-avatar-editor";
import { usePets } from "@/hooks/usePets";
import { useImageUpload } from "@/hooks/useImageUpload";
import { usePetContext } from "@/contexts/PetContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

interface PetNewSheetProps {
  open: boolean;
  onClose: () => void;
}

export function PetNewSheet({ open, onClose }: PetNewSheetProps) {
  const { user } = useAuth();
  const { addPet, updatePet } = usePets();
  const { setSelectedPet } = usePetContext();
  const { uploadPetAvatar, uploading } = useImageUpload();

  // 基本情報
  const [formData, setFormData] = useState<PetBasicInfoData>({
    name: "",
    species: "",
    breed: "",
    color: "",
    gender: "",
    birthday: undefined,
    adoptionDate: undefined,
    microchipId: "",
  });

  // 画像
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("名前を入力してください");
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. まずペットを作成（画像なしで）
      const petData = {
        name: formData.name.trim(),
        species: formData.species || undefined,
        breed: formData.breed.trim() || undefined,
        color: formData.color || undefined,
        birthday: formData.birthday
          ? format(formData.birthday, "yyyy-MM-dd")
          : undefined,
        gender: formData.gender || undefined,
        adoptionDate: formData.adoptionDate
          ? format(formData.adoptionDate, "yyyy-MM-dd")
          : undefined,
        microchipId: formData.microchipId.trim() || undefined,
        avatarUrl: undefined as string | undefined, // まずはundefined
      };

      const petId = await addPet(petData);
      let finalAvatarUrl: string | undefined = undefined;

      // 2. 画像があればアップロードして更新
      if (avatarFile) {
        try {
          finalAvatarUrl = await uploadPetAvatar(avatarFile, petId);
          await updatePet(petId, { avatarUrl: finalAvatarUrl });
        } catch (error) {
          console.error("Image upload failed:", error);
          toast.error(
            "画像のアップロードに失敗しました（ペットは登録されました）",
          );
        }
      }

      toast.success(`${formData.name}を登録しました！`);
      setSelectedPet({
        id: petId,
        ...petData,
        avatarUrl: finalAvatarUrl,
        memberUids: user ? [user.uid] : [],
        createdBy: "",
        updatedBy: "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      // フォームリセット
      setFormData({
        name: "",
        species: "",
        breed: "",
        color: "",
        gender: "",
        birthday: undefined,
        adoptionDate: undefined,
        microchipId: "",
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
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
            <SheetTitle className="text-sm font-bold">ペットを登録</SheetTitle>
            <div className="w-9" />
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-32">
          <form
            id="pet-new-form"
            onSubmit={handleSubmit}
            className="px-6 py-8 space-y-8"
          >
            {/* Avatar Editor */}
            <div className="flex justify-center mb-6">
              <PetAvatarEditor
                imageUrl={avatarPreview}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                disabled={isSubmitting || uploading}
              />
            </div>

            {/* Basic Info Form */}
            <PetBasicInfoForm
              data={formData}
              onChange={setFormData}
              disabled={isSubmitting || uploading}
            />
          </form>
        </div>

        {/* Sticky Submit Button */}
        <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center pointer-events-none z-50">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const form = document.querySelector(
                "#pet-new-form",
              ) as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            disabled={isSubmitting || !formData.name.trim() || uploading}
            className="pointer-events-auto w-full max-w-sm h-14 text-lg font-bold gradient-primary shadow-xl rounded-full hover:scale-105 transition-transform"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                登録する
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
