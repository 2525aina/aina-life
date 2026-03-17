"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ListViewTableProps {
  headers: { key: string; label: string; width?: string }[];
  children: ReactNode;
  className?: string;
}

export function ListViewTable({ headers, children, className }: ListViewTableProps) {
  return (
    <div className={cn("relative overflow-hidden glass rounded-[2rem] border border-[var(--glass-border)]", className)}>
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead>
            <tr className="border-b border-[var(--glass-border)] bg-muted/30 backdrop-blur-md">
              {headers.map((header, i) => (
                <th
                  key={header.key}
                  className={cn(
                    "px-4 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground",
                    i === 0 && "sticky left-0 z-20 bg-muted/80 backdrop-blur-md shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]",
                    header.width
                  )}
                >
                  {header.label}
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

export function ListViewRow({ children, onClick, className }: ListViewRowProps) {
  return (
    <tr 
      onClick={onClick}
      className={cn(
        "group transition-colors hover:bg-white/5",
        onClick && "cursor-pointer",
        className
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

export function ListViewCell({ children, isSticky, className }: ListViewCellProps) {
  return (
    <td 
      className={cn(
        "px-4 py-4 text-sm font-medium whitespace-nowrap",
        isSticky && "sticky left-0 z-10 bg-background/80 backdrop-blur-xl group-hover:bg-muted/50 transition-colors shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      {children}
    </td>
  );
}
