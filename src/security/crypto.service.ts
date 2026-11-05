import crypto from "node:crypto";
import { EncryptInputSchema, DecryptInputSchema } from "./crypto.schema";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV (rekomendasi NIST SP 800-38D)
const AUTH_TAG_LENGTH = 16; // 128-bit Authentication Tag

export interface CryptoBundle {
  /** Format gabungan: iv:authTag:ciphertext (Base64) */
  ciphertext: string;
  ivHex: string;
}

export class CryptoService {
  private key: Buffer;

  /**
   * Menginisialisasi CryptoService dengan kunci 256-bit (32 bytes).
   * Jika parameter `keyHex` tidak diberikan, akan membaca dari environment variable `DATA_ENCRYPTION_KEY`.
   */
  constructor(keyHex?: string) {
    const rawKey = keyHex || process.env.DATA_ENCRYPTION_KEY;

    if (!rawKey) {
      throw new Error(
        "CryptoServiceError: DATA_ENCRYPTION_KEY tidak ditemukan di environment variable atau parameter."
      );
    }

    const parsedKey = Buffer.from(rawKey, "hex");
    if (parsedKey.length !== 32) {
      throw new Error(
        `CryptoServiceError: Kunci enkripsi harus berukuran 256-bit (32 bytes / 64 hex characters), diterima ${parsedKey.length} bytes.`
      );
    }

    this.key = parsedKey;
  }

  /**
   * Menghasilkan kunci 256-bit acak menggunakan CSPRNG OS.
   */
  public static generateKeyHex(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Mengenkripsi data teks menggunakan AES-256-GCM dengan Associated Data (AAD) opsional.
   *
   * @param input Objek berisi plaintext dan opsional associatedData
   * @returns Bundle string Base64 dalam format "iv:authTag:ciphertext"
   */
  public encrypt(input: { plaintext: string; associatedData?: string }): CryptoBundle {
    // 1. Validasi masukan dengan Zod (K3)
    const validated = EncryptInputSchema.safeParse(input);
    if (!validated.success) {
      throw new Error(`ValidationError: ${validated.error.issues[0]?.message}`);
    }

    const { plaintext, associatedData } = validated.data;

    // 2. Nonce/IV unik 96-bit dari CSPRNG (K2)
    const iv = crypto.randomBytes(IV_LENGTH);

    // 3. Inisialisasi Cipher
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    // 4. Tambahkan AAD jika tersedia
    if (associatedData) {
      cipher.setAAD(Buffer.from(associatedData, "utf8"));
    }

    // 5. Enkripsi teks
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);

    // 6. Dapatkan Auth Tag 128-bit
    const authTag = cipher.getAuthTag();

    // 7. Format bundle serialisasi (Base64)
    const bundleString = [
      iv.toString("base64"),
      authTag.toString("base64"),
      encrypted.toString("base64"),
    ].join(":");

    return {
      ciphertext: bundleString,
      ivHex: iv.toString("hex"),
    };
  }

  /**
   * Mendekripsi ciphertext bundle menggunakan AES-256-GCM.
   * Bersifat fail-closed: jika data/tag/kunci tidak cocok, tolak total tanpa membocorkan plaintext parsial.
   *
   * @param input Objek berisi ciphertext bundle dan opsional associatedData
   * @returns Plaintext string asli
   */
  public decrypt(input: { ciphertext: string; associatedData?: string }): string {
    // 1. Validasi masukan dengan Zod (K3)
    const validated = DecryptInputSchema.safeParse(input);
    if (!validated.success) {
      throw new Error(`ValidationError: ${validated.error.issues[0]?.message}`);
    }

    const { ciphertext, associatedData } = validated.data;
    const parts = ciphertext.split(":");

    if (parts.length !== 3) {
      throw new Error(
        "AuthenticationFailed: Format bundle enkripsi tidak valid. Harus 'iv:authTag:ciphertext'."
      );
    }

    try {
      const iv = Buffer.from(parts[0], "base64");
      const authTag = Buffer.from(parts[1], "base64");
      const encrypted = Buffer.from(parts[2], "base64");

      if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
        throw new Error("Invalid IV or AuthTag length");
      }

      const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
      });

      if (associatedData) {
        decipher.setAAD(Buffer.from(associatedData, "utf8"));
      }

      decipher.setAuthTag(authTag);

      // Fail-closed execution: jika authTag tidak cocok, decipher.final() akan melempar exception
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString("utf8");
    } catch {
      // Fail-closed: jangan bocorkan error internal atau potongan data
      throw new Error("AuthenticationFailed: Data integrity check failed or invalid key.");
    }
  }
}

