/** Single source of truth for language-block syntax patterns. */

export const COMMENT_OPEN_PREFIX = "[//]: # (lang ";
export const COMMENT_CLOSE_MARKER = "[//]: # (endlang)";

/** Open-marker patterns. Capture group 1 = one or more space-separated language codes. */
export const OPEN_PATTERNS: RegExp[] = [
  /^:::\s*lang\s+([\w-]+(?:\s+[\w-]+)*)\s*$/,
  /^\{%-?\s*lang\s+([\w-]+(?:\s+[\w-]+)*)\s*-?%\}$/i,
  /^\[\/\/\]:\s*#\s*\(lang\s+([\w-]+(?:\s+[\w-]+)*)\)\s*$/i,
  /^%%\s*lang\s+([\w-]+(?:\s+[\w-]+)*)\s*%%$/i,
];

/** Close-marker patterns (canonical + legacy aliases). */
export const CLOSE_PATTERNS: RegExp[] = [
  /^:::\s*$/,
  /^\{%-?\s*endlang\s*-?%\}$/i,
  /^\[\/\/\]:\s*#\s*\(\s*endlang\s*\)\s*$/i,
  /^\[\/\/\]:\s*#\s*\(\s*:::\s*\)\s*$/i,
  /^%%\s*endlang\s*%%$/i,
  /^%%\s*:::\s*%%$/i,
];

export function matchLanguageBlockOpen(line: string): string | null {
  const text = line.trim();
  for (const re of OPEN_PATTERNS) {
    const match = re.exec(text);
    if (match) return match[1].trim();
  }
  return null;
}

export function isLanguageBlockClose(line: string): boolean {
  const text = line.trim();
  return CLOSE_PATTERNS.some((re) => re.test(text));
}

export function buildCommentLangBlock(langCode: string, body = ""): string {
  const content = body.length > 0 ? `\n${body}\n` : "\n\n";
  return `${COMMENT_OPEN_PREFIX}${langCode})${content}\n${COMMENT_CLOSE_MARKER}`;
}

/** Case-insensitive check whether `active` is one of `blockLang`'s space-separated codes. */
export function langCodeIncludes(blockLang: string, active: string): boolean {
  const activeNorm = active.toLowerCase();
  return blockLang.split(/\s+/).some((code) => code.toLowerCase() === activeNorm);
}
