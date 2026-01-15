import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface StickyFabProps {
  onClick: () => void;
  label: string;
  icon?: ReactNode;
  className?: string; // Allow custom class overrides if needed
}

export function StickyFab({
  onClick,
  label,
  icon = <Plus className="w-5 h-5" />,
  className,
}: StickyFabProps) {
  return (
    <div
      className={`sticky bottom-24 z-20 flex justify-center px-4 pt-6 ${className || ""}`}
    >
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        className="flex items-center gap-2 px-8 h-14 rounded-full bg-gradient-to-r from-primary to-orange-500 shadow-xl shadow-primary/30 text-white font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/50 hover:brightness-110"
      >
        {icon}
        <span>{label}</span>
      </motion.button>
    </div>
  );
}
