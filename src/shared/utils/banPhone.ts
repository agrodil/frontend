// --- Normalización de dígitos unicode ---

// Dígitos fullwidth (０-９) y árabe-índicos (٠-٩) -> ASCII.
const normalizeDigits = (input: string): string =>
  input
    .normalize("NFKC")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[０-９]/g, (d) => String(d.charCodeAt(0) - 0xff10));

// --- Mapas de palabras a dígitos ---

// Decenas compuestas: "noventa y nueve/nueva" → "99"
// Se aplican ANTES que palabras simples para evitar match parcial.
const COMPOUND_TENS_REGEX =
  /(treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s+y\s+(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|nueva)/gi;

const TENS_UNIT_VALUES: Record<string, number> = {
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
  setenta: 70,
  ochenta: 80,
  noventa: 90,
};
const UNIT_VALUES: Record<string, number> = {
  uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4,
  cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, nueva: 9,
};

// Palabras de 2 dígitos (10-29).
const TWO_DIGIT_WORDS: Record<string, string> = {
  diez: "10", once: "11", doce: "12", trece: "13", catorce: "14",
  quince: "15", dieciseis: "16", dieciséis: "16", diecisiete: "17",
  dieciocho: "18", diecinueve: "19", veinte: "20", veintiuno: "21",
  veintidós: "22", veintidos: "22", veintitrés: "23", veintitres: "23",
  veinticuatro: "24", veinticinco: "25", veintiséis: "26", veintiseis: "26",
  veintisiete: "27", veintiocho: "28", veintinueve: "29",
};

// Decenas exactas sin unidad (treinta, cuarenta... también como 2 dígitos).
const EXACT_TENS: Record<string, string> = {
  treinta: "30", cuarenta: "40", cincuenta: "50", sesenta: "60",
  setenta: "70", ochenta: "80", noventa: "90",
};

// Dígitos simples (incluye "nueva" → typo común de "nueve").
const SINGLE_DIGIT_WORDS: Record<string, string> = {
  cero: "0", zero: "0",
  uno: "1", una: "1", dos: "2", tres: "3", cuatro: "4",
  cinco: "5", seis: "6", siete: "7", ocho: "8",
  nueve: "9", nueva: "9",
};

const wordsToDigits = (input: string): string => {
  let result = input;

  // 1) Decenas compuestas: "noventa y nueve" → "99"
  result = result.replace(COMPOUND_TENS_REGEX, (_, ten, unit) => {
    const val =
      (TENS_UNIT_VALUES[ten.toLowerCase()] ?? 0) +
      (UNIT_VALUES[unit.toLowerCase()] ?? 0);
    return String(val);
  });

  // 2) Palabras de 2 dígitos exactos (doce, once, veinte...)
  const twoDigitPattern = new RegExp(
    `\\b(${Object.keys({ ...TWO_DIGIT_WORDS, ...EXACT_TENS }).join("|")})\\b`,
    "gi",
  );
  result = result.replace(
    twoDigitPattern,
    (w) =>
      TWO_DIGIT_WORDS[w.toLowerCase()] ??
      EXACT_TENS[w.toLowerCase()] ??
      w,
  );

  // 3) Dígitos simples
  const singlePattern = new RegExp(
    `\\b(${Object.keys(SINGLE_DIGIT_WORDS).join("|")})\\b`,
    "gi",
  );
  result = result.replace(
    singlePattern,
    (w) => SINGLE_DIGIT_WORDS[w.toLowerCase()] ?? w,
  );

  return result;
};

// Prefijos de operadora móvil venezolanos (sin el 0 inicial).
const MOBILE_PREFIXES = ["412", "424", "414", "426", "416", "422"];

/**
 * Detecta y censura números de teléfono venezolanos en un mensaje, incluso
 * evadidos con separadores (0.4.1.2), letras (cero cuatro uno...),
 * palabras compuestas (doce, noventa y nueva), typos (nueva=nueve),
 * o dígitos unicode (０４１２ / ٤١٢).
 *
 * Devuelve "*" * length si detecta un teléfono; si no, mensaje original.
 *
 * NOTA: defensa client-side = solo UX/disuasión. No reemplaza validación
 * en backend; un POST directo evade esta función.
 */
export const banPhone = (message: string): string => {
  // 1) Normalizar unicode, luego palabras → dígitos.
  const normalized = wordsToDigits(normalizeDigits(message));

  // 2) Colapsar dígitos separados por hasta 3 chars no alfanuméricos
  //    para reconstruir secuencias troceadas (0.4.1.2 → 0412).
  const collapsed = normalized.replace(/(\d)[\s.\-_/|·•]{0,3}(?=\d)/g, "$1");

  // 3) Prefijo VE (+58 / 0 opcional) + operadora móvil + 7 dígitos finales.
  const phoneRegex = new RegExp(
    `(?:\\+?58)?0?4(?:${MOBILE_PREFIXES.map((p) => p.slice(1)).join("|")})\\d{7}`,
  );

  // 4) Respaldo: corrida de 11+ dígitos pegados sin importar formato.
  const hasPhone = phoneRegex.test(collapsed) || /\d{11,}/.test(collapsed);

  return hasPhone ? "*".repeat(message.length) : message;
};
