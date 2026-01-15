"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerDropdown } from "@/components/ui/date-picker-dropdown";
import {
  StyledInput,
  SpeciesBreedSelector,
  GenderSelect,
  ColorSelect,
} from "@/components/ui/styled-form-fields";
import { PetAvatarEditor } from "@/components/features/pet-avatar-editor";
import {
  X,
  Loader2,
  MapPin,
  User,
  Phone,
  Home,
  Calendar as CalendarIcon,
  Heart,
  Save,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { ensureDate } from "@/lib/utils/date-utils";
import { format } from "date-fns";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Friend } from "@/lib/types";
import { toast } from "sonner";

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

interface FriendFormSheetProps {
  friend?: Friend | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: FriendFormData) => Promise<void>;
  isSubmitting: boolean;
  petId: string;
}

export function FriendFormSheet({
  friend,
  open,
  onClose,
  onSave,
  isSubmitting: isExternalSubmitting,
  petId,
}: FriendFormSheetProps) {
  const { uploadImage, uploading } = useImageUpload();

  // Basic Info
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Canis lupus familiaris");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unknown">(
    "unknown",
  );
  const [color, setColor] = useState("");

  // Age/Birthday Logic
  const [birthdayMode, setBirthdayMode] = useState<"birthday" | "age">(
    "birthday",
  );
  const [birthday, setBirthday] = useState<Date | undefined>(undefined);
  const [ageYears, setAgeYears] = useState("");
  const [ageMonths, setAgeMonths] = useState("");

  const calculatedBirthday = useMemo(() => {
    if (birthdayMode !== "age") return undefined;
    if (!ageYears && !ageMonths) return undefined;
    const now = new Date();
    const years = parseInt(ageYears || "0");
    const months = parseInt(ageMonths || "0");
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - years);
    d.setMonth(d.getMonth() - months);
    return d;
  }, [birthdayMode, ageYears, ageMonths]);

  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "g">("kg");

  // Meeting Info
  const [metAt, setMetAt] = useState<Date>(new Date());
  const [location, setLocation] = useState("");
  const [memo, setMemo] = useState("");

  // Owner Info
  const [ownerName, setOwnerName] = useState("");
  const [ownerDetails, setOwnerDetails] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");

  // Image state
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (friend && open) {
        setName(friend.name);
        setSpecies(friend.species || "Canis lupus familiaris");
        setBreed(friend.breed || "");
        setGender(friend.gender || "unknown");
        setColor(friend.color || "");
        setBirthday(ensureDate(friend.birthday) || undefined);
        setBirthdayMode("birthday");
        setWeight(friend.weight?.toString() || "");
        setWeightUnit(friend.weightUnit || "kg");
        setMetAt(ensureDate(friend.metAt) || new Date());
        setLocation(friend.location || "");
        setMemo(friend.features || "");
        setOwnerName(friend.ownerName || "");
        setOwnerDetails(friend.ownerDetails || "");
        setContact(friend.contact || "");
        setAddress(friend.address || "");
        setPreviewUrl(friend.images?.[0] || null);
        setPendingImageFile(null);
      } else if (open) {
        // Reset for new friend
        setName("");
        setSpecies("Canis lupus familiaris");
        setBreed("");
        setGender("unknown");
        setColor("");
        setBirthday(undefined);
        setBirthdayMode("birthday");
        setWeight("");
        setWeightUnit("kg");
        setMetAt(new Date());
        setLocation("");
        setMemo("");
        setOwnerName("");
        setOwnerDetails("");
        setContact("");
        setAddress("");
        setPreviewUrl(null);
        setPendingImageFile(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [friend, open]);

  const handleImageChange = (file: File) => {
    setPendingImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setPendingImageFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("お名前を入力してください");
      return;
    }

    try {
      let finalImageUrl = previewUrl || "";
      if (pendingImageFile) {
        finalImageUrl = await uploadImage(
          pendingImageFile,
          `pets/${petId}/friends`,
          {
            maxSizeMB: 1,
            maxWidthOrHeight: 1200,
            fileType: "image/webp",
          },
        );
      }

      const data = {
        name,
        species,
        breed,
        gender,
        color,
        location,
        features: memo,
        images: finalImageUrl ? [finalImageUrl] : [],
        metAt: metAt,
        birthday:
          birthdayMode === "age"
            ? calculatedBirthday
              ? Timestamp.fromDate(calculatedBirthday)
              : undefined
            : birthday
              ? Timestamp.fromDate(birthday)
              : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        weightUnit: weight ? weightUnit : undefined,
        ownerName,
        ownerDetails,
        contact,
        address,
      };

      await onSave(data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("エラーが発生しました");
    }
  };

  const isSubmitting = isExternalSubmitting || uploading;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[95vh] rounded-t-3xl bg-background/95 backdrop-blur-xl border-t border-[var(--glass-border)] p-0 overflow-hidden"
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
            <SheetTitle className="text-sm font-bold">
              {friend ? "お友達を編集" : "お友達を登録"}
            </SheetTitle>
            <div className="w-9" />
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-32">
          <form
            id="friend-form"
            onSubmit={handleSubmit}
            className="px-6 py-8 space-y-10"
          >
            {/* Image Upload */}
            <div className="flex justify-center">
              <PetAvatarEditor
                imageUrl={previewUrl}
                onImageChange={handleImageChange}
                onImageRemove={handleRemoveImage}
                onSampleImageSelect={(url) => {
                  setPreviewUrl(url);
                  setPendingImageFile(null);
                }}
                onBreedSelect={(selectedBreed, selectedSpecies, imageUrl) => {
                  setSpecies(selectedSpecies);
                  setBreed(selectedBreed);
                  setPreviewUrl(imageUrl);
                  setPendingImageFile(null);
                }}
                breed={breed}
                disabled={isSubmitting}
              />
            </div>

            {/* Basic Info Section */}
            <section className="space-y-6">
              <h2 className="text-xs font-bold text-muted-foreground border-b pb-2 flex items-center gap-2 uppercase tracking-widest">
                <Heart className="w-3.5 h-3.5" /> 基本情報
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold ml-1">
                    お名前 <span className="text-red-500">*</span>
                  </Label>
                  <StyledInput
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ポチ"
                    className="h-14 text-xl font-bold rounded-2xl"
                  />
                </div>

                <SpeciesBreedSelector
                  species={species}
                  breed={breed}
                  onChangeSpecies={(val) => {
                    setSpecies(val);
                    setBreed("");
                  }}
                  onChangeBreed={setBreed}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold ml-1">性別</Label>
                    <GenderSelect
                      value={gender}
                      onChange={(v) =>
                        setGender(v as "male" | "female" | "unknown")
                      }
                      type="friend"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold ml-1">毛色</Label>
                    <ColorSelect value={color} onChange={setColor} />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <Label className="text-xs font-bold ml-1">年齢・誕生日</Label>
                  <div className="space-y-6">
                    <div className="flex bg-muted/30 p-1.5 rounded-2xl glass border border-[var(--glass-border)]">
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm rounded-xl transition-all ${birthdayMode === "birthday" ? "bg-background shadow-lg font-bold text-primary border border-[var(--glass-border)]" : "text-muted-foreground"}`}
                        onClick={() => setBirthdayMode("birthday")}
                      >
                        誕生日
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm rounded-xl transition-all ${birthdayMode === "age" ? "bg-background shadow-lg font-bold text-primary border border-[var(--glass-border)]" : "text-muted-foreground"}`}
                        onClick={() => setBirthdayMode("age")}
                      >
                        年齢から
                      </button>
                    </div>

                    {birthdayMode === "birthday" ? (
                      <DatePickerDropdown
                        date={birthday}
                        setDate={setBirthday}
                        className="w-full"
                        toDate={new Date()}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                              何歳？
                            </Label>
                            <div className="relative">
                              <StyledInput
                                type="number"
                                min="0"
                                value={ageYears}
                                onChange={(e) => setAgeYears(e.target.value)}
                                className="h-12 pr-10 rounded-xl"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                                歳
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                              何ヶ月？
                            </Label>
                            <div className="relative">
                              <StyledInput
                                type="number"
                                min="0"
                                max="11"
                                value={ageMonths}
                                onChange={(e) => setAgeMonths(e.target.value)}
                                className="h-12 pr-14 rounded-xl"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                                ヶ月
                              </span>
                            </div>
                          </div>
                        </div>
                        {calculatedBirthday && (
                          <p className="text-[10px] text-center text-muted-foreground font-medium bg-primary/5 py-2 rounded-lg">
                            推定誕生日: {format(calculatedBirthday, "yyyy/M/d")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold ml-1">体重</Label>
                  <div className="flex gap-3">
                    <StyledInput
                      type="number"
                      step="0.01"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0.00"
                      className="h-14 flex-1 rounded-2xl"
                    />
                    <Select
                      value={weightUnit}
                      onValueChange={(v: "kg" | "g") => setWeightUnit(v)}
                    >
                      <SelectTrigger className="w-24 h-14 rounded-2xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-lg font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </section>

            {/* Encounter Info Section */}
            <section className="space-y-6">
              <h2 className="text-xs font-bold text-muted-foreground border-b pb-2 flex items-center gap-2 uppercase tracking-widest">
                <CalendarIcon className="w-3.5 h-3.5" /> 出会いの記録
              </h2>
              <div className="space-y-4">
                <DatePickerDropdown
                  date={metAt}
                  setDate={(d) => d && setMetAt(d)}
                  label="出会った日"
                  className="w-full"
                  toDate={new Date()}
                />

                <div className="space-y-2">
                  <Label className="text-xs font-bold ml-1">出会った場所</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <StyledInput
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="公園、ドッグランなど"
                      className="pl-11 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold ml-1">特徴・メモ</Label>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="フレンドリー、おやつが好き、など"
                    className="w-full bg-[var(--glass-bg)] min-h-[120px] rounded-2xl border border-[var(--glass-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Owner Info Section */}
            <section className="space-y-6">
              <h2 className="text-xs font-bold text-muted-foreground border-b pb-2 flex items-center gap-2 uppercase tracking-widest">
                <User className="w-3.5 h-3.5" /> 飼い主情報
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold ml-1">飼い主名</Label>
                  <StyledInput
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="○○さん"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold ml-1">特徴</Label>
                  <StyledInput
                    value={ownerDetails}
                    onChange={(e) => setOwnerDetails(e.target.value)}
                    placeholder="いつも帽子を被っている、など"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold ml-1">連絡先</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <StyledInput
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="pl-11 h-12 rounded-xl"
                      placeholder="電話番号やLINEなど"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold ml-1">住所・地域</Label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <StyledInput
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-11 h-12 rounded-xl"
                      placeholder="○○区○○町"
                    />
                  </div>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Sticky Submit Button */}
        <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center pointer-events-none z-50">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const form = document.querySelector(
                "#friend-form",
              ) as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            disabled={isSubmitting}
            className="pointer-events-auto w-full max-w-sm h-14 text-lg font-bold gradient-primary shadow-xl rounded-full hover:scale-105 transition-transform"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {friend ? "更新する" : "登録する"}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
