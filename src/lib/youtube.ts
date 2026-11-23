const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Aceita um ID de vídeo ou uma URL do YouTube e devolve apenas o ID.
 * Retorna null quando não é possível identificar um ID válido.
 */
export function parseYouTubeId(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }

  const value = input.trim();
  if (!value) {
    return null;
  }

  if (YOUTUBE_ID.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && YOUTUBE_ID.test(id) ? id : null;
    }

    if (url.hostname.endsWith("youtube.com")) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && YOUTUBE_ID.test(fromQuery)) {
        return fromQuery;
      }

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      const fromPath = embedIndex >= 0 ? parts[embedIndex + 1] : undefined;
      if (fromPath && YOUTUBE_ID.test(fromPath)) {
        return fromPath;
      }
    }
  } catch {
    return null;
  }

  return null;
}
