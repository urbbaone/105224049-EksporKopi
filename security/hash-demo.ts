import { pbkdf2Sync, randomBytes } from "crypto";

/**
 * Simulasi / Wrapper Slow-hashing (PBKDF2 / Argon2-compatible slow hashing)
 * Default cost parameter memadai untuk mitigasi brute force (RSK-AUTH-01)
 */

export interface HashResult {
  algorithm: string;
  iterations: number;
  salt: string;
  hash: string;
  formatted: string;
}

export function generateSlowHash(password: string, iterations = 100000): HashResult {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  const hashHex = derivedKey.toString("hex");
  
  // Format modular crypt: $pbkdf2-sha256$i=100000$<salt>$<hash>
  const formatted = `$pbkdf2-sha256$i=${iterations}$${salt}$${hashHex}`;
  
  return {
    algorithm: "pbkdf2-sha256",
    iterations,
    salt,
    hash: hashHex,
    formatted,
  };
}

export function verifySlowHash(password: string, formattedHash: string): boolean {
  const parts = formattedHash.split("$");
  // ["", "pbkdf2-sha256", "i=100000", "<salt>", "<hash>"]
  if (parts.length < 5) return false;
  
  const iterStr = parts[2].replace("i=", "");
  const iterations = parseInt(iterStr, 10);
  const salt = parts[3];
  const originalHash = parts[4];
  
  const derivedKey = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  return derivedKey.toString("hex") === originalHash;
}

