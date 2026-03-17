"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PetSwitcher } from "./PetSwitcher";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { DEFAULT_FALLBACK_IMAGE } from "@/lib/constants/assets";
import { cn } from "@/lib/utils";

export function Header() {
  const { userProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-[var(--glass-bg)] backdrop-blur-xl border-b border-[var(--glass-border)] transition-colors">
      <div className="flex items-center justify-between h-14 px-4 max-w-2xl mx-auto">
        <PetSwitcher />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 relative group"
            onClick={() => {
              if (theme === "light") setTheme("dark");
              else if (theme === "dark") setTheme("system");
              else setTheme("light");
            }}
          >
            <Sun
              className={cn(
                "h-[1.2rem] w-[1.2rem] transition-all duration-300",
                theme === "light"
                  ? "rotate-0 scale-100 opacity-100"
                  : "rotate-90 scale-0 opacity-0",
              )}
            />
            <Moon
              className={cn(
                "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300",
                theme === "dark"
                  ? "rotate-0 scale-100 opacity-100"
                  : "rotate-90 scale-0 opacity-0",
              )}
            />
            <Monitor
              className={cn(
                "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300",
                theme === "system"
                  ? "rotate-0 scale-100 opacity-100"
                  : "rotate-90 scale-0 opacity-0",
              )}
            />
            <span className="sr-only">テーマを切り替え</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={userProfile?.avatarUrl}
                    alt={userProfile?.displayName}
                  />
                  <AvatarFallback className="bg-primary/10 flex items-center justify-center overflow-hidden">
                    <Image
                      src={DEFAULT_FALLBACK_IMAGE}
                      alt="User"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover opacity-50 grayscale"
                    />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="font-medium truncate">
                  {userProfile?.nickname || "ユーザー"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userProfile?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  設定
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="cursor-pointer text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
