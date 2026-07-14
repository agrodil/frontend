// --- Normalización de evasión textual ---

// "arroba"/"at"/"(at)"/"[at]" -> "@"
const AT_WORD_REGEX = /\s*[[(]?\s*\b(?:arroba|at)\b\s*[\])]?\s*/gi;
// "punto"/"dot"/"(dot)"/"[dot]" -> "."
const DOT_WORD_REGEX = /\s*[[(]?\s*\b(?:punto|dot)\b\s*[\])]?\s*/gi;

const normalizeEmailEvasion = (input: string): string =>
  input.replace(AT_WORD_REGEX, "@").replace(DOT_WORD_REGEX, ".");

// Colapsa espacios pegados a "@" o "." (ej: "usuario @ gmail . com").
const collapseSymbolSpacing = (input: string): string =>
  input.replace(/\s*@\s*/g, "@").replace(/\s*\.\s*/g, ".");

const EMAIL_REGEX = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

/**
 * Detecta y censura direcciones de correo electrónico en un mensaje, incluso
 * evadidas con espacios ("usuario @ gmail . com") o palabras
 * ("usuario arroba gmail punto com" / "user at gmail dot com").
 *
 * Devuelve "*" * length si detecta un correo; si no, mensaje original.
 *
 * NOTA: defensa client-side = solo UX/disuasión, igual que banPhone. No
 * reemplaza validación en backend; un POST directo evade esta función.
 */
export const banEmail = (message: string): string => {
  const normalized = collapseSymbolSpacing(normalizeEmailEvasion(message));
  return EMAIL_REGEX.test(normalized) ? "*".repeat(message.length) : message;
};
