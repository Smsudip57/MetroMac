export function formatProjectCode(text: string): string {
  return text
    .replace(/\s+/g, "") // Remove all spaces
    .replace(/[^A-Za-z0-9_\/-]/g, "") // Allow only A-Z, a-z, 0-9, _, /, -
    .toUpperCase(); // Capitalize all letters
}
