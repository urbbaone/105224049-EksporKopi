import { z } from "zod";

/**
 * Skema validasi untuk input enkripsi
 */
export const EncryptInputSchema = z.object({
  plaintext: z.string().min(1, "Plaintext tidak boleh kosong"),
  associatedData: z.string().optional(),
});

/**
 * Skema validasi untuk input bundle dekripsi
 */
export const DecryptInputSchema = z.object({
  ciphertext: z.string().min(1, "Ciphertext bundle tidak boleh kosong"),
  associatedData: z.string().optional(),
});

export type EncryptInput = z.infer<typeof EncryptInputSchema>;
export type DecryptInput = z.infer<typeof DecryptInputSchema>;

