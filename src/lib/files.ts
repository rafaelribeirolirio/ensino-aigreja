import "server-only";

import { createSignedUrl, isStorageConfigured } from "./supabase-storage";

/**
 * Um material pode ser:
 * - uma URL externa (http/https), usada como está;
 * - uma chave de arquivo no Supabase Storage, que vira uma URL assinada.
 */
export async function resolveFileUrl(
  filePath: string | null | undefined,
): Promise<string | null> {
  if (!filePath) {
    return null;
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  if (!isStorageConfigured()) {
    return null;
  }

  return createSignedUrl(filePath);
}
