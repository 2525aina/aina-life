"use client";

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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format, differenceInYears } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trash2,
  Edit,
  Cake,
  X,
  PawPrint,
  Heart,
  Users,
  ListTodo,
  Shield,
  LogOut,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { Pet, Member, MEMBER_ROLES } from "@/lib/types";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import { usePets } from "@/hooks/usePets";
import { useCustomTasks } from "@/hooks/useCustomTasks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PetDetailSheetProps {
  pet: Pet | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function PetDetailSheet({
  pet,
  open,
  onClose,
  onEdit,
}: PetDetailSheetProps) {
  const { deletePet } = usePets();
  const { isOwner, members, leaveTeam } = useMembers(pet?.id || null);
  const { tasks } = useCustomTasks(pet?.id || null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const activeOwnersCount = members.filter(
    (m) => m.role === "owner" && m.status === "active",
  ).length;
  const canOwnerLeave = activeOwnersCount > 1;

  const getRoleLabel = (role: string) =>
    MEMBER_ROLES.find((r) => r.value === role)?.label || role;

  if (!pet) return null;

  const age = pet.birthday
    ? differenceInYears(new Date(), new Date(pet.birthday))
    : null;

  const handleDelete = async () => {
    if (!pet) return;
    setIsDeleting(true);
    try {
      await deletePet(pet.id);
      toast.success("ペットを削除しました");
      onClose();
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-[2.5rem] bg-background/95 backdrop-blur-xl border-t border-[var(--glass-border)] p-0 overflow-hidden"
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
            <SheetTitle className="text-sm font-bold">家族の詳細</SheetTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-4 h-4" />
              </Button>
              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-9 h-9 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass border-white/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle>ペットを削除</AlertDialogTitle>
                      <AlertDialogDescription>
                        本当に{pet.name}
                        を削除しますか？この操作は取り消せません。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">
                        キャンセル
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="h-full px-4 py-4">
          <Tabs defaultValue="general" className="h-full flex flex-col">
            <TabsList className="glass-capsule w-full p-1 rounded-full mb-6 shadow-sm bg-muted/20">
              <TabsTrigger
                value="general"
                className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-9"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                基本
              </TabsTrigger>
              <TabsTrigger
                value="task"
                className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-9"
              >
                <ListTodo className="w-3.5 h-3.5 mr-1.5" />
                タスク
              </TabsTrigger>
              <TabsTrigger
                value="member"
                className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all h-9"
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                共有
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="flex-1 rounded-full text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-red-500 transition-all h-9"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                高度
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pb-20 space-y-6 scrollbar-hide">
              <TabsContent
                value="general"
                className="mt-0 space-y-6 focus-visible:ring-0 outline-none"
              >
                {/* Hero Section */}
                <div className="relative aspect-square w-full bg-muted overflow-hidden rounded-[2.5rem] shadow-xl ring-1 ring-[var(--glass-border)]">
                  {pet.avatarUrl ? (
                    <Image
                      src={pet.avatarUrl}
                      alt={pet.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Image
                        src="/ogp.webp"
                        alt="No image"
                        width={128}
                        height={128}
                        className="object-contain opacity-20 grayscale"
                      />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold border border-[var(--glass-border)] uppercase tracking-wider">
                        {pet.breed || "犬種未設定"}
                      </span>
                      {pet.gender && (
                        <span
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            pet.gender === "male"
                              ? "bg-blue-500/80"
                              : pet.gender === "female"
                                ? "bg-pink-500/80"
                                : "bg-gray-500/80",
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
                    <h1 className="text-4xl font-black tracking-tight">
                      {pet.name}
                    </h1>
                  </div>
                </div>

                {/* Basic Info Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                      <PawPrint className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        種類
                      </p>
                      <p className="font-bold text-sm">
                        {pet.species || "未設定"}
                      </p>
                    </div>
                  </div>

                  {(age !== null || pet.birthday) && (
                    <div className="glass p-4 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-600">
                        <Cake className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          年齢
                        </p>
                        <p className="font-bold">
                          {age !== null ? `${age}歳` : "不明"}
                        </p>
                        {pet.birthday && (
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(pet.birthday), "yyyy/M/d")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                {(pet.color ||
                  pet.medicalNotes ||
                  (pet.vetInfo && pet.vetInfo.length > 0)) && (
                  <div className="glass rounded-[2rem] p-6 shadow-lg border-[var(--glass-border)] space-y-4">
                    {pet.color && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Heart className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                            毛色
                          </p>
                          <p className="font-bold">{pet.color}</p>
                        </div>
                      </div>
                    )}
                    {pet.medicalNotes && (
                      <div className="pt-2 border-t border-dashed border-[var(--glass-border)]">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
                          メモ・医療情報
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {pet.medicalNotes}
                        </p>
                      </div>
                    )}
                    {pet.vetInfo && pet.vetInfo.length > 0 && (
                      <div className="pt-2 border-t border-dashed border-[var(--glass-border)]">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
                          かかりつけ医
                        </p>
                        <div className="space-y-2">
                          {pet.vetInfo.map((vet, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="font-bold">{vet.name}</span>
                              <span className="text-muted-foreground">
                                {vet.phone}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="px-2 pt-4">
                  <Button
                    onClick={onEdit}
                    className="w-full h-14 rounded-full gradient-primary text-lg font-bold shadow-lg"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    詳細設定・編集
                  </Button>
                </div>
              </TabsContent>

              <TabsContent
                value="task"
                className="mt-0 focus-visible:ring-0 outline-none"
              >
                <div className="glass rounded-[2rem] p-5 border-[var(--glass-border)]">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                    <ListTodo className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      カスタムタスク
                    </h3>
                  </div>
                  {tasks.length > 0 ? (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                        >
                          <span className="text-lg">{task.emoji}</span>
                          <span className="text-sm font-medium">
                            {task.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">なし</span>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="member"
                className="mt-0 focus-visible:ring-0 outline-none"
              >
                <div className="glass rounded-[2rem] p-5 border-[var(--glass-border)]">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      共有メンバー
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    {members
                      .filter((m) => m.status === "active")
                      .map((member) => (
                        <div
                          key={member.id}
                          onClick={() => setSelectedMember(member)}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer active:scale-95"
                        >
                          <Avatar className="w-10 h-10 border-2 border-background ring-1 ring-white/10 shrink-0">
                            <AvatarImage src={member.userProfile?.avatarUrl} />
                            <AvatarFallback className="text-[10px]">
                              {(member.userProfile?.nickname || "U").slice(
                                0,
                                2,
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm truncate">
                                {member.userProfile?.nickname || "ユーザー"}
                              </span>
                              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">
                                {getRoleLabel(member.role)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {member.inviteEmail}
                            </p>
                          </div>
                        </div>
                      ))}
                    {members.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        なし
                      </span>
                    )}
                  </div>
                </div>
              </TabsContent>

              <Dialog
                open={!!selectedMember}
                onOpenChange={(open) => !open && setSelectedMember(null)}
              >
                <DialogContent className="glass border-[var(--glass-border)] rounded-[2rem] p-0 overflow-hidden max-w-sm mx-auto w-[90%] sm:w-full">
                  <div className="bg-muted h-24 w-full relative">
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                      <Avatar className="w-20 h-20 border-4 border-background shadow-xl">
                        <AvatarImage
                          src={selectedMember?.userProfile?.avatarUrl}
                        />
                        <AvatarFallback>
                          {(selectedMember?.userProfile?.nickname || "U").slice(
                            0,
                            2,
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="pt-12 pb-6 px-6 text-center space-y-4">
                    <div>
                      <h3 className="font-exbold text-xl">
                        {selectedMember?.userProfile?.nickname || "ユーザー"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedMember?.inviteEmail}
                      </p>
                    </div>

                    <div className="bg-[var(--glass-bg)] p-4 rounded-2xl border border-[var(--glass-border)] text-left space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                          権限
                        </span>
                        <span className="font-bold text-primary flex items-center gap-1">
                          {getRoleLabel(selectedMember?.role || "")}
                        </span>
                      </div>
                      <div className="h-px bg-[var(--glass-border)]" />
                      <div>
                        <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider block mb-1">
                          説明
                        </span>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed">
                          {
                            MEMBER_ROLES.find(
                              (r) => r.value === selectedMember?.role,
                            )?.description
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <TabsContent
                value="danger"
                className="mt-0 focus-visible:ring-0 outline-none"
              >
                <div className="glass rounded-[2rem] p-6 border-red-500/20 bg-red-500/5 space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <Shield className="w-5 h-5" />
                    <h3 className="font-bold">高度な操作</h3>
                  </div>

                  {!isOwner || canOwnerLeave ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        チームから脱退すると、再度招待されるまでこのペットの情報にはアクセスできなくなります。
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full rounded-full font-bold gap-2 text-destructive border-destructive/50 hover:bg-destructive/10"
                          >
                            <LogOut className="w-4 h-4" /> 脱退する
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass border-white/20 rounded-[2rem]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              チームから脱退しますか？
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              脱退すると、再度招待されるまでこのペットの情報にはアクセスできなくなります。
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
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      あなたは唯一のオーナーであるため、脱退できません。脱退するには、先に他のメンバーをオーナーに設定してください。
                      または、編集画面からペットを削除してください。
                    </p>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
