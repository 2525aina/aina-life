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
