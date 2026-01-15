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

      <div className="space-y-3">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-2xl glass border-[var(--glass-border)]"
          >
            <Avatar className="w-10 h-10 border border-[var(--glass-border)]">
              <AvatarImage
                src={member.userProfile?.avatarUrl || member.petAvatarUrl}
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm truncate">
                  {member.userProfile?.nickname || member.petName || "ユーザー"}
                </span>
                {member.status === "pending" && (
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    招待中
                  </span>
                )}
                {member.status === "active" && getRoleIcon(member.role)}
                {member.status === "active" && (
                  <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full text-primary">
                    {getRoleLabel(member.role)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {member.inviteEmail}
              </p>
            </div>

            {/* Role Select & Delete */}
            {canManageMembers && member.status !== "pending" && (
              <div className="flex items-center gap-1">
                <Select
                  value={member.role}
                  disabled={member.role === "owner" && activeOwnersCount <= 1}
                  onValueChange={(val) =>
                    updateMemberRole(member.id, val as MemberRole).catch(() =>
                      toast.error("権限変更に失敗しました"),
                    )
                  }
                >
                  <SelectTrigger className="h-7 w-[70px] text-[10px] border-[var(--glass-border)] bg-[var(--glass-bg)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBER_ROLES.map((role) => (
                      <SelectItem
                        key={role.value}
                        value={role.value}
                        className="text-xs"
                      >
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
              </div>
            )}

            {/* Cancel Invite */}
            {canManageMembers && member.status === "pending" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
        ))}
      </div>
    </div>
  );
}
