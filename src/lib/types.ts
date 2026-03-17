import type { Timestamp } from "firebase/firestore";

// ============================================
// 共通フィールド（監査カラム）
// ============================================
export interface BaseDocument {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AuditDocument extends BaseDocument {
  createdBy: string;
  updatedBy: string;
}

// ============================================
// ユーザープロフィール
// ============================================
export interface User extends BaseDocument {
  uid: string;
  email: string;
  authEmail?: string;
  authName?: string;
  displayName: string;
  nickname?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  birthday?: string;
  gender?: "male" | "female" | "other";
  introduction?: string;
  primaryPetId?: string;
  lastLoginAt?: Timestamp;
  authProvider?: string | null;
  settings: UserSettings;
}

export interface UserSettings {
  theme: "system" | "light" | "dark";
  notifications?: {
    dailySummary: boolean;
  };
  timeFormat?: "HH:mm:ss" | "H:m:s" | "HH:mm" | "H:m";
  toastPosition?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

// ============================================
// ペット
// ============================================
export interface VetInfo {
  name: string;
  phone?: string;
}

export interface Pet extends AuditDocument {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  color?: string;
  birthday?: string;
  gender?: "male" | "female" | "other";
  avatarUrl?: string;
  adoptionDate?: string;
  microchipId?: string;
  medicalNotes?: string;
  vetInfo?: VetInfo[];
  memberUids: string[];
}

// ============================================
// ペットメンバー（共有）
// ============================================
export type MemberRole = "owner" | "editor" | "viewer";
export type MemberStatus = "pending" | "active" | "removed" | "declined";

export interface Member extends AuditDocument {
  id: string;
  userId: string;
  inviteEmail: string;
  role: MemberRole;
  status: MemberStatus;
  invitedBy: string;
  invitedAt: Timestamp;
  // 表示用（非正規化）
  petName?: string;
  petAvatarUrl?: string;
  userProfile?: {
    displayName: string;
    nickname?: string;
    avatarUrl?: string;
  };
}

export const MEMBER_ROLES: {
  value: MemberRole;
  label: string;
  description: string;
}[] = [
  {
    value: "owner",
    label: "オーナー",
    description: "すべての権限（メンバー管理・削除可能）",
  },
  { value: "editor", label: "編集者", description: "記録の追加・編集が可能" },
  { value: "viewer", label: "閲覧者", description: "閲覧のみ" },
];

// ============================================
// 日記エントリー
// ============================================
export type EntryType = "diary" | "schedule";
export type TimeType = "point" | "range";

// 日記詳細（個別ドキュメント: pets/{petId}/entries/{entryId}）
// 閲覧時のみ取得
export interface Entry extends AuditDocument {
  id: string;
  type: EntryType;
  timeType: TimeType;
  date: Timestamp;
  endDate?: Timestamp;
  title?: string;
  body?: string;
  tags: string[];
  imageUrls: string[];
  isCompleted?: boolean;
  friendIds?: string[];
}
// フォーム入力用データ
export interface EntryFormData {
  type: EntryType;
  timeType: TimeType;
  title?: string;
  body?: string;
  tags: string[];
  imageUrls: string[];
  friendIds?: string[];
  date: Date;
  endDate?: Date;
  isCompleted?: boolean;
}
// 月次集約日記（pets/{petId}/entry_months/{YYYY-MM}）
// カレンダー表示用
export interface EntrySummary {
  id: string;
  date: Timestamp; // 日付比較用
  endDate?: Timestamp;
  title?: string;
  body?: string; // カレンダー下部リスト表示用
  type: EntryType;
  timeType: TimeType;
  tags: string[];
  firstImageUrl?: string; // サムネイル用（1枚目のみ）
  isCompleted?: boolean;
}

export interface MonthlyEntries {
  id: string; // YYYY-MM
  entries: EntrySummary[];
}

export type EntryTag =
  | "ごはん"
  | "散歩"
  | "お薬"
  | "通院"
  | "体調不良"
  | "睡眠"
  | "排泄"
  | "トリミング"
  | "予防接種"
  | "その他";

export const ENTRY_TAGS: { value: EntryTag; label: string; emoji: string }[] = [
  { value: "ごはん", label: "ごはん", emoji: "🍚" },
  { value: "散歩", label: "おさんぽ", emoji: "🚶" },
  { value: "お薬", label: "お薬", emoji: "💊" },
  { value: "通院", label: "通院", emoji: "🏥" },
  { value: "体調不良", label: "体調不良", emoji: "😷" },
  { value: "睡眠", label: "睡眠", emoji: "💤" },
  { value: "排泄", label: "排泄", emoji: "💩" },
  { value: "トリミング", label: "トリミング", emoji: "✂️" },
  { value: "予防接種", label: "予防接種", emoji: "💉" },
  { value: "その他", label: "その他", emoji: "📝" },
];

// ============================================
// 体重記録
// ============================================
// 年次集約体重（pets/{petId}/weight_years/{YYYY}）
// グラフ表示用
export interface WeightItem {
  id: string; // UUID or Timestamp string
  value: number;
  unit: "kg" | "g";
  date: Timestamp;
  createdAt?: Timestamp; // ソート・監査用
}

export interface YearlyWeights extends AuditDocument {
  id: string; // YYYY
  year: number;
  weights: WeightItem[];
}

// 旧・個別ドキュメント型（移行期間または詳細編集用）
export interface Weight extends AuditDocument {
  id: string;
  value: number;
  unit: "kg" | "g";
  date: Timestamp;
}

// ============================================
// カスタムタスク
// ============================================
export interface CustomTask extends AuditDocument {
  id: string;
  name: string;
  emoji: string;
  order: number;
}

// ============================================
// お散歩友達
// ============================================
export interface Friend extends AuditDocument {
  id: string;
  name: string;
  nickname?: string;
  species: string; // e.g. "Canis lupus familiaris"
  breed?: string; // e.g. "柴犬"
  gender?: "male" | "female" | "unknown";
  color?: string; // e.g. "赤柴" or Color ID
  birthday?: Timestamp;
  weight?: number;
  weightUnit?: "kg" | "g";
  ageOrBirthday?: string; // deprecated in favor of birthday
  features?: string;
  location?: string;
  ownerName?: string;
  ownerDetails?: string;
  contact?: string;
  address?: string;
  images: string[];
  metAt: Timestamp;
  lastMetAt?: Timestamp;
}

export type FriendSortOption = "metAt_desc" | "metAt_asc" | "name_asc" | "lastMetAt_desc";

// ============================================
// 遭遇記録 (deprecated in favor of Friends metAt or separate Encounter logs if needed)
// Phase 2ではFriendに集約
// ============================================
export interface Encounter {
  id: string;
  date: Timestamp;
  note?: string;
  imageUrl?: string;
  createdAt: Timestamp;
}
