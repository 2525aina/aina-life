"use client";

import { useState, useEffect } from "react";
// Duplicate import removed
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Save,
  Loader2,
  Settings,
  ListTodo,
  Users,
  Shield,
  LogOut,
} from "lucide-react";

import {
  PetBasicInfoForm,
  type PetBasicInfoData,
} from "@/components/features/pet-basic-info-form";
import { PetAvatarEditor } from "@/components/features/pet-avatar-editor";
import { CustomTaskEditor } from "@/components/features/CustomTaskEditor";
import { PetHealthForm } from "@/components/features/pet-health-form";
import { PetMembersTab } from "@/components/features/pet-members-tab";
import { usePets } from "@/hooks/usePets";
import { useMembers } from "@/hooks/useMembers";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "sonner";
import { format, parse } from "date-fns";
import { deleteField } from "firebase/firestore";
import { handleError } from "@/lib/errorHandler";
import { type VetInfo, Pet } from "@/lib/types";

interface PetEditSheetProps {
  pet: Pet | null;
  open: boolean;
  onClose: () => void;
}

export function PetEditSheet({ pet, open, onClose }: PetEditSheetProps) {
  // const { user } = useAuth(); // Unused
  const { updatePet, deletePet } = usePets();
  const {
    members,
    isOwner,
    canEdit,
    canManageMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveTeam,
  } = useMembers(pet?.id || null);
  const { uploadPetAvatar, uploading } = useImageUpload();

  // Basic Info State
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

  // Details State
  const [petMedicalNotes, setPetMedicalNotes] = useState("");
  const [petVetInfo, setPetVetInfo] = useState<VetInfo[]>([]);

  // Avatar State
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  // Confirm dialog unused
  // const [confirmDeleteAvatarOpen, setConfirmDeleteAvatarOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (pet && open) {
      setFormData({
        name: pet.name,
        species: pet.species || "",
        breed: pet.breed || "",
        color: pet.color || "",
        gender: pet.gender || "",
        birthday: pet.birthday
          ? parse(pet.birthday, "yyyy-MM-dd", new Date())
          : undefined,
        adoptionDate: pet.adoptionDate
          ? parse(pet.adoptionDate, "yyyy-MM-dd", new Date())
          : undefined,
        microchipId: pet.microchipId || "",
      });
      setPetMedicalNotes(pet.medicalNotes || "");
      setPetVetInfo(pet.vetInfo || []);
      setPendingAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);
      setActiveTab("general");
    }
  }, [pet, open]);

  if (!pet) return null;

  const handleImageChange = (file: File) => {
    setPendingAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error("名前を入力してください");
      return;
    }
    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let avatarUrl: any = pet.avatarUrl;

      if (removeAvatar) {
        avatarUrl = deleteField();
      } else if (pendingAvatarFile) {
        avatarUrl = await uploadPetAvatar(pendingAvatarFile, pet.id);
      }

      await updatePet(pet.id, {
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
        medicalNotes: petMedicalNotes.trim() || undefined,
        vetInfo: petVetInfo.length > 0 ? petVetInfo : undefined,
        avatarUrl,
      });

      setPendingAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);

      toast.success("更新しました");
      // Don't close immediately to allow further edits? Or close? Use close for standard save.
      // But maybe they want to edit multiple tabs.
      // Let's create a "Save" button for the General tab specifically?
      // Or a global save?
      // The page had a "Save" button at the bottom of General tab.
      // The custom tasks save individually.
      // Members save individually.
      // So this save is mainly for General + Details.
    } catch (error) {
      handleError(error, {
        context: "PetEdit.update",
        fallbackMessage: "更新に失敗しました",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePet = async () => {
    try {
      await deletePet(pet.id);
      toast.success("削除しました");
      onClose(); // Close sheet
    } catch (error) {
      handleError(error, {
        context: "PetEdit.delete",
        fallbackMessage: "削除失敗",
      });
    }
  };

  const displayAvatar = removeAvatar ? null : avatarPreview || pet.avatarUrl;

  const activeOwnersCount = members.filter(
    (m) => m.role === "owner" && m.status === "active",
  ).length;
  const canOwnerLeave = activeOwnersCount > 1;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[95vh] rounded-t-[2.5rem] bg-background/95 backdrop-blur-xl border-t border-[var(--glass-border)] p-0 overflow-hidden"
      >
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
              家族設定・編集
            </SheetTitle>
            <div className="w-9" />
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-32 px-4 py-6">
          {/* Avatar Editor (Always visible or in General?) In Page it was at top. Let's keep it at top. */}
          <div className="flex justify-center mb-6">
            <PetAvatarEditor
              imageUrl={displayAvatar}
              onImageChange={handleImageChange}
              onImageRemove={() => setRemoveAvatar(true)}
              onSampleImageSelect={(url) => {
                setAvatarPreview(url);
                setPendingAvatarFile(null);
                setRemoveAvatar(false);
              }}
              onBreedSelect={(breed, species, imageUrl) => {
                setFormData((prev) => ({
                  ...prev,
                  species,
                  breed,
                }));
                setAvatarPreview(imageUrl);
                setPendingAvatarFile(null);
                setRemoveAvatar(false);
              }}
              breed={formData.breed}
              disabled={!canEdit || uploading}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="glass-capsule w-full p-1 rounded-full mb-6 shadow-sm bg-muted/20">
              <TabsTrigger
                value="general"
                className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-9"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                基本
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-9"
              >
                <ListTodo className="w-3.5 h-3.5 mr-1.5" />
                タスク
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-9"
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                共有
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-rose-500 data-[state=active]:text-white transition-all h-9"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                高度
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 pb-20">
              <PetBasicInfoForm
                data={formData}
                onChange={setFormData}
                disabled={!canEdit || isSubmitting}
              />

              {/* Medical & Vet - Copied logic from page */}
              <PetHealthForm
                medicalNotes={petMedicalNotes}
                onMedicalNotesChange={setPetMedicalNotes}
                vetInfo={petVetInfo}
                onVetInfoChange={setPetVetInfo}
                disabled={!canEdit || isSubmitting}
              />

              {/* Save Button for General */}
              {canEdit && (
                <Button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-full gradient-primary font-bold shadow-lg text-lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      保存する
                    </>
                  )}
                </Button>
              )}
            </TabsContent>

            <TabsContent value="members" className="space-y-6 pb-20">
              <PetMembersTab
                pet={pet}
                members={members}
                canManageMembers={canManageMembers}
                inviteMember={inviteMember}
                updateMemberRole={updateMemberRole}
                removeMember={removeMember}
              />
            </TabsContent>

            <TabsContent value="custom" className="pb-20">
              <CustomTaskEditor petId={pet.id} canEdit={canEdit} />
            </TabsContent>

            <TabsContent value="danger" className="space-y-6 pb-20">
              <div className="glass rounded-[2rem] p-6 border-red-500/20 bg-red-500/5 space-y-4">
                <div className="flex items-center gap-2 text-destructive">
                  <Shield className="w-5 h-5" />
                  <h3 className="font-bold">危険な操作</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  これらの操作は取り消すことができません。慎重に操作してください。
                </p>
                {isOwner ? (
                  <div className="space-y-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full rounded-full font-bold"
                        >
                          削除する
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass border-[var(--glass-border)] rounded-[2rem]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            本当に{pet.name}
                            を削除しますか？この操作は取り消せません。
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            すべてのデータが永久に削除されます。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full">
                            キャンセル
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeletePet}
                            className="bg-destructive rounded-full"
                          >
                            削除実行
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {canOwnerLeave && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full rounded-full font-bold gap-2 text-destructive border-destructive/50 hover:bg-destructive/10"
                          >
                            <LogOut className="w-4 h-4" /> 脱退する
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass border-[var(--glass-border)] rounded-[2rem]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              本当にこのペットのチームから脱退しますか？
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              このペットの共有メンバーから抜けます。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full">
                              キャンセル
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => leaveTeam().then(onClose)}
                              className="bg-destructive rounded-full"
                            >
                              脱退実行
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full rounded-full font-bold gap-2"
                      >
                        <LogOut className="w-4 h-4" /> 脱退する
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass border-[var(--glass-border)] rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          チームから脱退しますか？
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          このペットの共有メンバーから抜けます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">
                          キャンセル
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => leaveTeam().then(onClose)}
                          className="bg-destructive rounded-full"
                        >
                          脱退実行
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
