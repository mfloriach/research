/**
 * YouTube URL parsing.
 *
 * Content stores whatever URL a contributor pasted, so the embed needs the
 * video ID extracted from any of YouTube's shapes. Anything unrecognised
 * returns `null` so the UI can fall back to a link instead of rendering an
 * empty frame.
 */

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const WATCH_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
]);

const SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

/**
 * Extracts the 11-character video ID from a YouTube URL.
 *
 * Handles `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/` and `/v/` paths on
 * both `youtube.com` and `youtu.be` hosts. Returns `null` for non-YouTube
 * hosts, unrelated paths, or IDs of the wrong length.
 */
export function youtubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (trimmed === "") {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const segments = parsed.pathname.split("/").filter(Boolean);

  // Path shapes first: `/embed`, `/shorts`, `/v` and `/live` live on the same
  // host as `/watch`, so the host cannot disambiguate them.
  const [prefix, id] = segments;
  if (
    prefix === "embed" ||
    prefix === "shorts" ||
    prefix === "v" ||
    prefix === "live"
  ) {
    return id && ID_PATTERN.test(id) ? id : null;
  }

  if (WATCH_HOSTS.has(host)) {
    const fromQuery = parsed.searchParams.get("v");
    return fromQuery && ID_PATTERN.test(fromQuery) ? fromQuery : null;
  }

  if (SHORT_HOSTS.has(host)) {
    return prefix && ID_PATTERN.test(prefix) ? prefix : null;
  }

  return null;
}

/** Embed URL for a video ID, on the no-cookie host. */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}