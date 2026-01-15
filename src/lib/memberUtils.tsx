import { Crown, Edit, Eye } from "lucide-react";
import { MEMBER_ROLES } from "@/lib/types";

/**
 * メンバーのロールに応じたラベル（日本語）を取得します
 */
export const getRoleLabel = (role: string) =>
  MEMBER_ROLES.find((r) => r.value === role)?.label || role;

/**
 * メンバーのロールに応じたアイコンを取得します
 */
export const getRoleIcon = (role: string) => {
  switch (role) {
    case "owner":
      return <Crown className="w-4 h-4 text-amber-500" />;
    case "editor":
      return <Edit className="w-4 h-4 text-blue-500" />;
    case "viewer":
      return <Eye className="w-4 h-4 text-gray-500" />;
    default:
      return null;
  }
};
