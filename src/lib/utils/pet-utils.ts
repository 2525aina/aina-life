/**
 * Pet related utility functions
 */

/**
 * Get Japanese label for species
 * @param species - Scientific name or key
 * @returns Japanese label
 */
export function getSpeciesLabel(species: string | undefined): string {
  if (!species) return "未設定";
  switch (species) {
    case "Canis lupus familiaris":
      return "犬";
    case "Felis catus":
      return "猫";
    case "other":
      return "その他";
    default:
      return species;
  }
}
