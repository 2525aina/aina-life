/**
 * Date utility functions
 */
import { differenceInYears, differenceInMonths } from "date-fns";
/**
 * Calculate age from birthday and return as formatted string
 * @param birthday - Birthday as string (YYYY-MM-DD) or Date object
 * @returns Age string like "3歳" or "6ヶ月"
 */
export function getAgeString(birthday: string | Date | undefined): string {
  if (!birthday) return "";

  const birthDate =
    typeof birthday === "string" ? new Date(birthday) : birthday;
  const now = new Date();

  const years = differenceInYears(now, birthDate);
  if (years > 0) return `${years}歳`;

  const months = differenceInMonths(now, birthDate);
  return `${months}ヶ月`;
}

/**
 * Calculate age in years from birthday
 * @param birthday - Birthday as string (YYYY-MM-DD) or Date object
 * @returns Age in years
 */
export function calculateAge(birthday: string | Date): number {
  const birthDate =
    typeof birthday === "string" ? new Date(birthday) : birthday;
  return differenceInYears(new Date(), birthDate);
}

/**
 * Safely convert various date-like objects to a Date object
 */
export function ensureDate(date: unknown): Date | null {
  if (!date) return null;
  if (date instanceof Date) return date;

  // Type guard/check for Timestamp-like objects
  if (typeof date === "object" && date !== null) {
    // Firestore Timestamp
    const ts = date as { toDate?: () => Date; seconds?: number };
    if (typeof ts.toDate === "function") {
      return ts.toDate();
    }
    // Serializable Timestamp { seconds, nanoseconds }
    if (typeof ts.seconds === "number" && "nanoseconds" in date) {
      return new Date(ts.seconds * 1000);
    }
  }

  // ISO String or other date string
  if (typeof date === "string" || typeof date === "number") {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Calculate days until the next birthday
 */
export function getDaysUntilNextBirthday(birthday: string | Date | undefined): number {
  if (!birthday) return Infinity;
  const birthDate = typeof birthday === "string" ? new Date(birthday) : birthday;
  const now = new Date();
  
  const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBirthday < now && 
      !(nextBirthday.getMonth() === now.getMonth() && nextBirthday.getDate() === now.getDate())) {
    nextBirthday.setFullYear(now.getFullYear() + 1);
  }
  
  // Reset hours for accurate day difference
  nextBirthday.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  return Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get detailed age string (Years and Months)
 */
export function getAgeDetailString(birthday: string | Date | undefined): string {
  if (!birthday) return "";
  const birthDate = typeof birthday === "string" ? new Date(birthday) : birthday;
  const now = new Date();
  
  const years = differenceInYears(now, birthDate);
  const totalMonths = differenceInMonths(now, birthDate);
  const months = totalMonths % 12;
  
  if (years > 0) {
    return months > 0 ? `${years}歳${months}ヶ月` : `${years}歳`;
  }
  return `${months}ヶ月`;
}
