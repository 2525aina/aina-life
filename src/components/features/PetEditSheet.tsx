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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Select unused
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
    X,
    Save,
    Loader2,
    Settings,
    ListTodo,
    Users,
    Shield,
    Plus,
    Edit,
    Eye,
    Crown,
    UserPlus,
    LogOut,
    Mail,
    Trash2,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
    PetBasicInfoForm,
    type PetBasicInfoData,
} from "@/components/features/pet-basic-info-form";
import { PetAvatarEditor } from "@/components/features/pet-avatar-editor";
import { CustomTaskEditor } from "@/components/features/CustomTaskEditor";
import { usePets } from "@/hooks/usePets";
import { useMembers } from "@/hooks/useMembers";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "sonner";
import { format, parse } from "date-fns";
import { deleteField } from "firebase/firestore";
import { handleError } from "@/lib/errorHandler";
import { MEMBER_ROLES, type MemberRole, type VetInfo, Pet } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

    // Invite State
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<MemberRole>("editor");
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
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

    // ... (Invite, Role, Member Removal, Leave Team, Delete Pet handlers)
    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        try {
            await inviteMember(inviteEmail.trim(), inviteRole, {
                name: formData.name.trim(),
                avatarUrl: pet.avatarUrl,
            });
            toast.success("招待を送信しました");
            setInviteEmail("");
            setInviteRole("editor");
            setIsInviteDialogOpen(false);
        } catch (error) {
            if (error instanceof Error && error.message === "このメールアドレスは既に招待済みまたはメンバーです") {
                handleError(error, { context: "PetEdit.invite", fallbackMessage: "既にメンバーです", silent: true });
                // We show silent: true error, but maybe we want toast warning?
                // handleError displays toast unless silent? No, toast is displayed by handleError regardless of silent.
                // silent only controls console.error.
                // The user wants "handle the error".
                // If the error message is already "このメールアドレスは既に招待済みまたはメンバーです", toast.error will show it.
                // So no special handling needed for user visibility, just maybe suppress console if it's considered "normal".
            } else {
                handleError(error, { context: "PetEdit.invite", fallbackMessage: "失敗しました" });
            }
        }
    };

    const handleDeletePet = async () => {
        try {
            await deletePet(pet.id);
            toast.success("削除しました");
            onClose(); // Close sheet
        } catch (error) {
            handleError(error, { context: "PetEdit.delete", fallbackMessage: "削除失敗" });
        }
    };

    // Vet Info Helpers
    const addVetInfo = () => setPetVetInfo([...petVetInfo, { name: "", phone: "" }]);
    const updateVetInfo = (index: number, field: "name" | "phone", value: string) => {
        const updated = [...petVetInfo];
        updated[index] = { ...updated[index], [field]: value };
        setPetVetInfo(updated);
    };
    const removeVetInfo = (index: number) => setPetVetInfo(petVetInfo.filter((_, i) => i !== index));

    const displayAvatar = removeAvatar ? null : avatarPreview || pet.avatarUrl;
    // Show all members, sort active first, then pending
    const sortedMembers = [...members].sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        if (a.role === 'owner' && b.role !== 'owner') return -1;
        if (a.role !== 'owner' && b.role === 'owner') return 1;
        return 0;
    });


    const activeOwnersCount = members.filter(m => m.role === 'owner' && m.status === 'active').length;
    const canOwnerLeave = activeOwnersCount > 1;
    const getRoleLabel = (role: string) => MEMBER_ROLES.find(r => r.value === role)?.label || role;
    const getRoleIcon = (role: string) => {
        switch (role) {
            case "owner": return <Crown className="w-4 h-4 text-amber-500" />;
            case "editor": return <Edit className="w-4 h-4 text-blue-500" />;
            case "viewer": return <Eye className="w-4 h-4 text-gray-500" />;
            default: return null;
        }
    };


    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent
                side="bottom"
                className="h-[95vh] rounded-t-[2.5rem] bg-background/95 backdrop-blur-xl border-t border-white/20 p-0 overflow-hidden"
            >
                <SheetHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-9 h-9">
                            <X className="w-5 h-5" />
                        </Button>
                        <SheetTitle className="text-sm font-bold">家族設定・編集</SheetTitle>
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
                            disabled={!canEdit || uploading}
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="glass-capsule w-full p-1 rounded-full mb-6 shadow-sm bg-muted/20">
                            <TabsTrigger value="general" className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-9">
                                <Settings className="w-3.5 h-3.5 mr-1.5" />基本
                            </TabsTrigger>
                            <TabsTrigger value="custom" className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-9">
                                <ListTodo className="w-3.5 h-3.5 mr-1.5" />タスク
                            </TabsTrigger>
                            <TabsTrigger value="members" className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-9">
                                <Users className="w-3.5 h-3.5 mr-1.5" />共有
                            </TabsTrigger>
                            <TabsTrigger value="danger" className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-rose-500 data-[state=active]:text-white transition-all h-9">
                                <Shield className="w-3.5 h-3.5 mr-1.5" />高度
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-6 pb-20">
                            <PetBasicInfoForm
                                data={formData}
                                onChange={setFormData}
                                disabled={!canEdit || isSubmitting}
                            />

                            {/* Medical & Vet - Copied logic from page */}
                            <div className="glass rounded-[2rem] p-6 shadow-sm border-white/20 space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full" />
                                    <h3 className="font-bold text-sm text-foreground/80">医療・その他</h3>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-muted-foreground ml-1">医療メモ</Label>
                                    <textarea
                                        value={petMedicalNotes}
                                        onChange={(e) => setPetMedicalNotes(e.target.value)}
                                        placeholder="アレルギー、持病など..."
                                        rows={3}
                                        disabled={!canEdit}
                                        className="w-full rounded-xl border border-white/20 bg-white/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-muted-foreground ml-1">かかりつけ動物病院</Label>
                                        {canEdit && (
                                            <Button type="button" variant="ghost" size="sm" onClick={addVetInfo} className="h-7 text-xs text-primary rounded-full bg-primary/10">
                                                <Plus className="w-3 h-3 mr-1" />追加
                                            </Button>
                                        )}
                                    </div>
                                    {petVetInfo.length === 0 ? (
                                        <div className="text-xs text-center py-4 border-2 border-dashed border-white/20 rounded-xl text-muted-foreground">なし</div>
                                    ) : (
                                        petVetInfo.map((vet, idx) => (
                                            <div key={idx} className="flex gap-2 items-start p-2 rounded-xl bg-white/40 border border-white/10">
                                                <div className="grid gap-2 flex-1">
                                                    <Input value={vet.name} onChange={(e) => updateVetInfo(idx, "name", e.target.value)} placeholder="病院名" className="h-8 text-xs bg-transparent" disabled={!canEdit} />
                                                    <Input value={vet.phone || ""} onChange={(e) => updateVetInfo(idx, "phone", e.target.value)} placeholder="電話番号" className="h-8 text-xs bg-transparent" disabled={!canEdit} />
                                                </div>
                                                {canEdit && (
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeVetInfo(idx)} className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full">
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Save Button for General */}
                            {canEdit && (
                                <Button onClick={handleUpdate} disabled={isSubmitting} className="w-full h-14 rounded-full gradient-primary font-bold shadow-lg text-lg">
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5 mr-2" />保存する</>}
                                </Button>
                            )}
                        </TabsContent>

                        <TabsContent value="members" className="space-y-6 pb-20">
                            {/* Members List Logic - Simplified from Page */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm">共有メンバー</h3>
                                {canManageMembers && (
                                    <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="gap-1 rounded-full gradient-primary h-8 text-xs"><UserPlus className="w-3 h-3" />招待</Button>
                                        </DialogTrigger>
                                        <DialogContent className="glass border-white/20 rounded-[2rem]">
                                            <DialogHeader><DialogTitle>メンバー招待</DialogTitle></DialogHeader>
                                            <form onSubmit={handleInvite} className="space-y-4 pt-4">
                                                <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@example.com" type="email" />
                                                <Button type="submit" className="w-full rounded-full gradient-primary">招待送信</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            <div className="space-y-3">
                                {sortedMembers.map(member => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-2xl glass border-white/10">
                                        <Avatar className="w-10 h-10 border border-white/20">
                                            <AvatarImage src={member.userProfile?.avatarUrl || member.petAvatarUrl} />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm truncate">{member.userProfile?.displayName || member.petName || "User"}</span>
                                                {member.status === 'pending' && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1"><Mail className="w-3 h-3" />招待中</span>}
                                                {member.status === 'active' && getRoleIcon(member.role)}
                                                {member.status === 'active' && <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full text-primary">{getRoleLabel(member.role)}</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{member.inviteEmail}</p>
                                        </div>
                                        {/* Role Select & Delete */}
                                        {canManageMembers && member.status !== 'pending' && (
                                            <div className="flex items-center gap-1">
                                                <Select
                                                    value={member.role}
                                                    disabled={member.role === 'owner' && activeOwnersCount <= 1 && member.userId === members.find(m => m.role === 'owner')?.userId}
                                                    onValueChange={(val) => updateMemberRole(member.id, val as MemberRole).catch(() => toast.error("権限変更に失敗しました"))}
                                                >
                                                    <SelectTrigger className="h-7 w-[70px] text-[10px] border-white/20 bg-white/20">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MEMBER_ROLES.map(role => (
                                                            <SelectItem key={role.value} value={role.value} className="text-xs">
                                                                {role.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="glass border-white/20 rounded-[2rem]">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>メンバー削除</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {member.userProfile?.displayName || "このメンバー"}を削除しますか？
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="rounded-full">キャンセル</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => removeMember(member.id)} className="bg-destructive rounded-full">削除</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        )}
                                        {/* Cancel Invite */}
                                        {canManageMembers && member.status === 'pending' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="glass border-white/20 rounded-[2rem]">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>招待を取り消し</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            招待を取り消しますか？
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-full">キャンセル</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => removeMember(member.id)} className="bg-destructive rounded-full">取り消し</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                                <p className="text-sm text-muted-foreground">これらの操作は取り消すことができません。慎重に操作してください。</p>
                                {isOwner ? (
                                    <div className="space-y-4">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="w-full rounded-full font-bold">削除する</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="glass border-white/20 rounded-[2rem]">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>本当に{pet.name}を削除しますか？この操作は取り消せません。</AlertDialogTitle>
                                                    <AlertDialogDescription>すべてのデータが永久に削除されます。</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-full">キャンセル</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDeletePet} className="bg-destructive rounded-full">削除実行</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        {canOwnerLeave && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" className="w-full rounded-full font-bold gap-2 text-destructive border-destructive/50 hover:bg-destructive/10">
                                                        <LogOut className="w-4 h-4" /> 脱退する
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="glass border-white/20 rounded-[2rem]">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>本当にこのペットのチームから脱退しますか？</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            このペットの共有メンバーから抜けます。
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-full">キャンセル</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => leaveTeam().then(onClose)} className="bg-destructive rounded-full">脱退実行</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                ) : (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full rounded-full font-bold gap-2">
                                                <LogOut className="w-4 h-4" /> 脱退する
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="glass border-white/20 rounded-[2rem]">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>チームから脱退しますか？</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    このペットの共有メンバーから抜けます。
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-full">キャンセル</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => leaveTeam().then(onClose)} className="bg-destructive rounded-full">脱退実行</AlertDialogAction>
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
