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
import { format, differenceInYears } from "date-fns";
import {
    Trash2,
    Edit,
    Cake,
    X,
    PawPrint,
    Heart,
} from "lucide-react";
import { toast } from "sonner";
import { Pet } from "@/lib/types";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMembers } from "@/hooks/useMembers";
import { usePets } from "@/hooks/usePets";

interface PetDetailSheetProps {
    pet: Pet | null;
    open: boolean;
    onClose: () => void;
}

export function PetDetailSheet({ pet, open, onClose }: PetDetailSheetProps) {
    const { deletePet } = usePets();
    const { isOwner } = useMembers(pet?.id || null);
    const [isDeleting, setIsDeleting] = useState(false);

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
                className="h-[90vh] rounded-t-[2.5rem] bg-background/95 backdrop-blur-xl border-t border-white/20 p-0 overflow-hidden"
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
                        <SheetTitle className="text-sm font-bold">家族の詳細</SheetTitle>
                        <div className="flex gap-1">
                            <Link href={`/pets/settings?id=${pet.id}`}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground"
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </Link>
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
                                                本当に{pet.name}を削除しますか？この操作は取り消せません。
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

                <div className="overflow-y-auto h-full pb-32 px-4 py-6 space-y-6">
                    {/* Hero Section */}
                    <div className="relative aspect-square w-full bg-muted overflow-hidden rounded-[2.5rem] shadow-xl ring-1 ring-white/20">
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
                                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold border border-white/10 uppercase tracking-wider">
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
                                                    : "bg-gray-500/80"
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
                            <h1 className="text-4xl font-black tracking-tight">{pet.name}</h1>
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
                    {(pet.color || pet.medicalNotes) && (
                        <div className="glass rounded-[2rem] p-6 shadow-lg border-white/20 space-y-4">
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
                                <div className="pt-2 border-t border-dashed border-white/20">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
                                        メモ・医療情報
                                    </p>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {pet.medicalNotes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="px-2">
                        <Link href={`/pets/settings?id=${pet.id}`} className="block w-full">
                            <Button className="w-full h-14 rounded-full gradient-primary text-lg font-bold shadow-lg">
                                <Edit className="w-5 h-5 mr-2" />
                                詳細設定・編集
                            </Button>
                        </Link>
                    </div>

                </div>
            </SheetContent>
        </Sheet>
    );
}
