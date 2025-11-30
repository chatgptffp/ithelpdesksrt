import { createHmac, createCipheriv, createDecipheriv, randomBytes } from "crypto";

const HMAC_KEY = process.env.EMPLOYEE_CODE_HMAC_KEY || "default-hmac-key-change-in-production";
const ENC_KEY = process.env.EMPLOYEE_CODE_ENC_KEY; // 32-byte key for AES-256
const ENC_ALGORITHM = "aes-256-gcm";

/**
 * Normalize employee code: trim and uppercase
 */
export function normalizeEmployeeCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Hash employee code using HMAC-SHA256
 */
export function hashEmployeeCode(code: string): string {
  const normalized = normalizeEmployeeCode(code);
  return createHmac("sha256", HMAC_KEY).update(normalized).digest("hex");
}

/**
 * Verify if a plain code matches a hash
 */
export function verifyEmployeeCode(plainCode: string, hash: string): boolean {
  const computedHash = hashEmployeeCode(plainCode);
  return computedHash === hash;
}

/**
 * Mask employee code to show only first 3 and last 2 characters
 * Example: "EMP-000123" -> "EMP***23"
 */
export function maskEmployeeCode(code: string): string {
  const normalized = normalizeEmployeeCode(code);
  if (normalized.length <= 5) {
    return normalized[0] + "***" + normalized.slice(-1);
  }
  return normalized.slice(0, 3) + "***" + normalized.slice(-2);
}

/**
 * Encrypt employee code using AES-256-GCM (optional feature)
 * Returns null if encryption key is not configured
 */
export function encryptEmployeeCode(code: string): string | null {
  if (!ENC_KEY) return null;
  
  const normalized = normalizeEmployeeCode(code);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ENC_ALGORITHM, Buffer.from(ENC_KEY, "hex"), iv);
  
  let encrypted = cipher.update(normalized, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt employee code
 */
export function decryptEmployeeCode(encryptedData: string): string | null {
  if (!ENC_KEY) return null;
  
  try {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    const decipher = createDecipheriv(ENC_ALGORITHM, Buffer.from(ENC_KEY, "hex"), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch {
    return null;
  }
}
