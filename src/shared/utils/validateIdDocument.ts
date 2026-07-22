// Validación en el CLIENTE de la imagen de la cédula. Es SOLO un filtro de
// calidad/UX (formato, nitidez, y cross-check OCR del número tecleado). NO prueba
// autenticidad y es trivial de saltar: la verificación real debe ser server-side.
// Se corre sobre la imagen ya comprimida/normalizada (ver compressImage), por eso
// el tipo esperado es jpeg/png/webp aunque el original haya sido HEIC del iPhone.

export interface IdDocumentValidationResult {
  ok: boolean;
  reason?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const MIN_BYTES = 30 * 1024; // 30KB
const MIN_LONG_EDGE = 600; // px — rechaza thumbnails
const BLUR_VARIANCE_THRESHOLD = 8; // varianza del Laplaciano; solo caza fotos casi planas/muy borrosas
const BLUR_SAMPLE_EDGE = 512; // px para el cálculo de nitidez
const OCR_MAX_EDGE = 1500; // px para acelerar/afinar el OCR

export async function validateIdDocument(
  file: File,
  expectedDocNumber: string,
): Promise<IdDocumentValidationResult> {
  // 1. Formato y tamaño del archivo
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, reason: "Formato no permitido. Usa JPEG, PNG o WEBP" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, reason: "La imagen es demasiado grande (máx. 5MB)" };
  }
  if (file.size < MIN_BYTES) {
    return {
      ok: false,
      reason: "La imagen es demasiado pequeña para ser un documento válido",
    };
  }

  // 2. Cargar la imagen
  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    return { ok: false, reason: "No se pudo leer la imagen" };
  }

  try {
    // 3. Dimensiones mínimas
    const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
    if (longEdge < MIN_LONG_EDGE) {
      return {
        ok: false,
        reason: "La imagen tiene muy baja resolución. Toma una foto más nítida",
      };
    }

    // 4. Nitidez (varianza del Laplaciano)
    const variance = laplacianVariance(img);
    if (variance < BLUR_VARIANCE_THRESHOLD) {
      return {
        ok: false,
        reason: "La imagen se ve borrosa. Toma una foto más clara y enfocada",
      };
    }

    // 5. Cross-check OCR: el número de cédula tecleado debe aparecer en la foto.
    // El OCR casi nunca lee los dígitos perfectos (brillo, ruido, confusiones
    // O↔0, I↔1, S↔5...). Por eso normalizamos esas confusiones y hacemos un match
    // DIFUSO (tolera 1-2 errores de sustitución/inserción/borrado) en vez de exigir
    // el substring exacto.
    const expectedDigits = expectedDocNumber.replace(/\D/g, "");
    if (expectedDigits.length >= 6) {
      let ocrText: string | null = null;
      try {
        ocrText = await runOcr(img);
      } catch (error) {
        // Si el motor OCR no pudo cargar/correr (CDN, red, WASM), NO bloqueamos:
        // omitimos el cross-check y dejamos pasar con la heurística. El gate real
        // es server-side de todas formas.
        console.warn(
          "[validateIdDocument] OCR no disponible, se omite el cross-check",
          error,
        );
      }

      if (ocrText !== null) {
        const ocrDigits = normalizeToDigits(ocrText);
        const tolerance = expectedDigits.length <= 6 ? 1 : 2;
        if (!fuzzyDigitMatch(ocrDigits, expectedDigits, tolerance)) {
          return {
            ok: false,
            reason:
              "No pudimos leer el número de tu cédula en la foto. Asegúrate de que se vea completo, nítido y sin reflejos",
          };
        }
      }
    }

    return { ok: true };
  } finally {
    if (img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = URL.createObjectURL(file);
  });
}

// Dibuja la imagen reducida a escala de grises y mide la varianza de la respuesta
// de un kernel Laplaciano 3x3. Imágenes nítidas → varianza alta; borrosas/planas → baja.
function laplacianVariance(img: HTMLImageElement): number {
  const scale = Math.min(1, BLUR_SAMPLE_EDGE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Number.POSITIVE_INFINITY; // sin canvas, no bloqueamos por nitidez
  ctx.drawImage(img, 0, 0, w, h);

  const { data } = ctx.getImageData(0, 0, w, h);
  const gray = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const responses: number[] = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const lap =
        gray[idx - w] +
        gray[idx + w] +
        gray[idx - 1] +
        gray[idx + 1] -
        4 * gray[idx];
      responses.push(lap);
    }
  }
  if (responses.length === 0) return Number.POSITIVE_INFINITY;

  const mean = responses.reduce((a, v) => a + v, 0) / responses.length;
  const variance =
    responses.reduce((a, v) => a + (v - mean) * (v - mean), 0) /
    responses.length;
  return variance;
}

// OCR perezoso: tesseract.js se carga solo al validar (dynamic import) para no
// inflar el bundle inicial. Corre sobre un canvas reducido para acelerar.
async function runOcr(img: HTMLImageElement): Promise<string> {
  const scale = Math.min(1, OCR_MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(img, 0, 0, w, h);

  const { recognize } = await import("tesseract.js");
  const result = await recognize(canvas, "spa");
  return result.data.text ?? "";
}

// Mapea confusiones OCR frecuentes letra→dígito y deja solo dígitos. Así "l408O727"
// se convierte en "1408 0727" → "14080727" antes de comparar.
const OCR_CONFUSIONS: Record<string, string> = {
  O: "0",
  Q: "0",
  D: "0",
  I: "1",
  L: "1",
  "|": "1",
  Z: "2",
  S: "5",
  B: "8",
  G: "6",
};

function normalizeToDigits(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => OCR_CONFUSIONS[ch] ?? ch)
    .join("")
    .replace(/\D/g, "");
}

// ¿Aparece `needle` dentro de `haystack` permitiendo hasta `maxDist` errores
// (sustitución/inserción/borrado)? Prueba ventanas de longitud needle.length ±1.
function fuzzyDigitMatch(
  haystack: string,
  needle: string,
  maxDist: number,
): boolean {
  if (needle.length === 0) return true;
  const lengths = [needle.length - 1, needle.length, needle.length + 1];
  for (const len of lengths) {
    if (len <= 0) continue;
    for (let i = 0; i + len <= haystack.length; i++) {
      if (levenshtein(haystack.slice(i, i + len), needle) <= maxDist) {
        return true;
      }
    }
  }
  return false;
}

function levenshtein(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[b.length];
}
