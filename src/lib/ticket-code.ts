import { customAlphabet } from "nanoid";

// Alphabet without confusing characters (0, O, 1, I, L)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const generateCode = customAlphabet(ALPHABET, 6);

/**
 * Generate a unique ticket code
 * Format: IT-XXXXXX (e.g., IT-AB12CD)
 */
export function generateTicketCode(): string {
  const randomPart = generateCode();
  return `IT-${randomPart}`;
}

/**
 * Normalize ticket code for lookup
 */
export function normalizeTicketCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Validate ticket code format
 */
export function isValidTicketCode(code: string): boolean {
  const normalized = normalizeTicketCode(code);
  return /^IT-[A-Z0-9]{6}$/.test(normalized);
}
