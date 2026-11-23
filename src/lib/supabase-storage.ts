import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getEnv() {
  return {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: process.env.SUPABASE_STORAGE_BUCKET,
  };
}

export function isStorageConfigured(): boolean {
  const { url, serviceRoleKey, bucket } = getEnv();
  return Boolean(url && serviceRoleKey && bucket);
}

function getClient(): SupabaseClient | null {
  const { url, serviceRoleKey } = getEnv();
  if (!url || !serviceRoleKey) {
    return null;
  }

  client ??= createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}

function safeFileName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function uploadFile(file: File, prefix: string): Promise<string> {
  const { bucket } = getEnv();
  const supabase = getClient();

  if (!supabase || !bucket) {
    throw new Error("Supabase Storage não configurado.");
  }

  const fileName = safeFileName(file.name || "arquivo");
  const path = `${prefix}/${crypto.randomUUID()}-${fileName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function createSignedUrl(
  path: string,
  expiresIn = 60 * 60,
): Promise<string | null> {
  const { bucket } = getEnv();
  const supabase = getClient();

  if (!supabase || !bucket) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    return null;
  }

  return data.signedUrl;
}
