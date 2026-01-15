/**
 * Pet related URL utilities
 */

/**
 * Generate URL to pet detail page with auto-open detail sheet
 * @param petId - The pet's document ID
 * @returns URL path to /pets page with petId query param
 */
export function getPetDetailUrl(petId: string): string {
  return `/pets?petId=${petId}`;
}
