export function matchesRequestedLength(text: string, unit: 'sentences' | 'paragraphs', count: number): boolean {
  if (unit === 'paragraphs') {
    return text.split(/\r?\n\s*\r?\n/).filter((paragraph) => paragraph.trim()).length === count;
  }

  const sentencePattern = /[^.!?]+[.!?]+["')\]]*/g;
  let sentenceCount = 0;
  let coveredUntil = 0;
  let match: RegExpExecArray | null;
  while ((match = sentencePattern.exec(text)) !== null) {
    if (text.slice(coveredUntil, match.index).trim()) return false;
    sentenceCount += 1;
    coveredUntil = match.index + match[0].length;
  }
  return sentenceCount === count && !text.slice(coveredUntil).trim();
}

export function hasUnsupportedAcknowledgementClaims(text: string, evidence: string): boolean {
  const claims = [
    /\b(?:thank(?:s|ed)?|gratitude|grateful)\b/i,
    /\bappreciat(?:e|es|ed|ing|ion)\b/i,
    /\b(?:support|guidance|assistance|help(?:ed)?)\b/i,
    /\b(?:opportunit(?:y|ies)|growth|learn(?:ed|ing)?)\b/i,
  ];
  return claims.some((claim) => claim.test(text) && !claim.test(evidence));
}
