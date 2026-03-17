"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ListViewTableProps {
  headers: { key: string; label: string; width?: string; sticky?: boolean }[];
  children: ReactNode;
  className?: string;
}

export function ListViewTable({
  headers,
  children,
  className,
}: ListViewTableProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden glass rounded-[2rem] border border-[var(--glass-border)]",
        className,
      )}
    >
      <div className="overflow-auto scrollbar-hide max-h-[calc(100vh-250px)]">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead className="sticky top-0 z-30">
            <tr className="border-b border-[var(--glass-border)] bg-muted/95 backdrop-blur-xl">
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={cn(
                    "px-4 py-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap bg-muted/95 backdrop-blur-xl border-b border-[var(--glass-border)]",
                    header.sticky &&
                      "sticky left-0 z-40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                    header.width,
                  )}
                >
                  <div className="flex items-center justify-start min-h-[1.5rem]">
                    {header.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--glass-border)]">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ListViewRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ListViewRow({
  children,
  onClick,
  className,
}: ListViewRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "group transition-colors hover:bg-white/5",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </tr>
  );
}

interface ListViewCellProps {
  children: ReactNode;
  isSticky?: boolean;
  className?: string;
}

export function ListViewCell({
  children,
  isSticky,
  className,
}: ListViewCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-4 text-sm font-medium",
        isSticky &&
          "sticky left-0 z-10 bg-white/80 backdrop-blur-xl group-hover:bg-muted/50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
        className,
      )}
    >
      {children}
    </td>
  );
}
