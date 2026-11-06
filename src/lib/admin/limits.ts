// Shared photo limits for the admin (client-side check, server-side check and hint text use the same numbers).
// Keep MAX_IMAGE_BYTES comfortably below experimental.serverActions.bodySizeLimit in next.config.ts (10 MB),
// so an oversize photo gets the friendly message instead of a raw 413.
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
export const MAX_IMAGE_LABEL = "6 MB";
export const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
export const IMAGE_ACCEPT = Object.keys(IMAGE_TYPES).join(",");
