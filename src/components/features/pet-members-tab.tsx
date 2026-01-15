"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Trash2, X, Mail } from "lucide-react";
import { toast } from "sonner";
import { MEMBER_ROLES, MemberRole, Member, Pet } from "@/lib/types";
import { getRoleLabel, getRoleIcon } from "@/lib/memberUtils";
import Image from "next/image";
import { motion } from "framer-motion";
import { DEFAULT_FALLBACK_IMAGE } from "@/lib/constants/assets";
import { cn } from "@/lib/utils";

interface PetMembersTabProps {
  pet: Pet;
  members: Member[];
  canManageMembers: boolean;
  inviteMember: (
    email: string,
    role: MemberRole,
    petInfo: { name: string; avatarUrl?: string },
  ) => Promise<void>;
  updateMemberRole: (memberId: string, role: MemberRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}

export function PetMembersTab({
  pet,
  members,
  canManageMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
}: PetMembersTabProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("editor");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const sortedMembers = [...members].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") return -1;
    if (a.status !== "active" && b.status === "active") return 1;
    if (a.role === "owner" && b.role !== "owner") return -1;
    if (a.role !== "owner" && b.role === "owner") return 1;
    return 0;
  });

  const activeOwnersCount = members.filter(
    (m) => m.role === "owner" && m.status === "active",
  ).length;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await inviteMember(inviteEmail.trim(), inviteRole, {
        name: pet.name,
        avatarUrl: pet.avatarUrl,
      });
      toast.success("招待を送信しました");
      setInviteEmail("");
      setInviteRole("editor");
      setIsInviteDialogOpen(false);
    } catch (error) {
      // Error handling logic moved here or kept simple
      toast.error(
        error instanceof Error ? error.message : "招待に失敗しました",
      );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">共有メンバー</h3>
        {canManageMembers && (
          <Dialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-1 rounded-full gradient-primary h-8 text-xs"
              >
                <UserPlus className="w-3 h-3" />
                招待
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-[var(--glass-border)] rounded-[2rem]">
              <DialogHeader>
                <DialogTitle>メンバー招待</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 pt-4">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                />
                <Button
                  type="submit"
                  className="w-full rounded-full gradient-primary"
                >
                  招待送信
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sortedMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative aspect-[4/5] rounded-2xl overflow-hidden glass border-[var(--glass-border)] shadow-sm"
          >
            {/* Background Image / Avatar */}
            <div className="absolute inset-0 bg-muted">
              {member.userProfile?.avatarUrl || member.petAvatarUrl ? (
                <Image
                  src={member.userProfile?.avatarUrl || member.petAvatarUrl!}
                  alt={member.userProfile?.nickname || "User"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                  <Image
                    src={DEFAULT_FALLBACK_IMAGE}
                    alt="No image"
                    width={48}
                    height={48}
                    className="opacity-20 grayscale"
                  />
                </div>
              )}
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Management Controls (Top Right Overlay) */}
            {canManageMembers && (
              <div className="absolute top-2 right-2 flex gap-1 z-10">
                {member.status !== "pending" ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-black/20 hover:bg-red-500/80 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass border-[var(--glass-border)] rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>メンバー削除</AlertDialogTitle>
                        <AlertDialogDescription>
                          {member.userProfile?.nickname || "このメンバー"}
                          を削除しますか？
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">
                          キャンセル
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeMember(member.id)}
                          className="bg-destructive rounded-full"
                        >
                          削除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-black/20 hover:bg-red-500/80 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass border-[var(--glass-border)] rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>招待を取り消し</AlertDialogTitle>
                        <AlertDialogDescription>
                          招待を取り消しますか？
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-full">
                          キャンセル
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeMember(member.id)}
                          className="bg-destructive rounded-full"
                        >
                          取り消し
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-bold text-sm truncate max-w-[100px]">
                    {member.userProfile?.nickname ||
                      member.petName ||
                      "ユーザー"}
                  </h4>
                  {member.status === "pending" && (
                    <span className="text-[8px] bg-yellow-500/80 text-white px-1.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-md font-bold">
                      <Mail className="w-2.5 h-2.5" />
                      招待中
                    </span>
                  )}
                  {member.status === "active" && (
                    <span className="text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded-full backdrop-blur-md font-bold flex items-center gap-0.5 border border-white/10 uppercase tracking-wider">
                      {getRoleIcon(member.role)}
                      {getRoleLabel(member.role)}
                    </span>
                  )}
                </div>

                {/* Role Select in card overlay if managing */}
                {canManageMembers && member.status !== "pending" && (
                  <div className="mt-1">
                    <Select
                      value={member.role}
                      disabled={
                        member.role === "owner" && activeOwnersCount <= 1
                      }
                      onValueChange={(val) =>
                        updateMemberRole(member.id, val as MemberRole).catch(
                          () => toast.error("権限変更に失敗しました"),
                        )
                      }
                    >
                      <SelectTrigger className="h-6 w-full text-[9px] bg-white/20 border-white/20 text-white font-bold rounded-lg px-2 backdrop-blur-md hover:bg-white/30 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-[var(--glass-border)]">
                        {MEMBER_ROLES.map((role) => (
                          <SelectItem
                            key={role.value}
                            value={role.value}
                            className="text-[10px]"
                          >
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
