// Removes all newlines and collapses multiple spaces into a single space
export function cleanTextContent(text: string): string {
  return text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}
