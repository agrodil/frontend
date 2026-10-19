import imageCompression from "browser-image-compression";

// Comprime una imagen en el navegador (web worker) antes de subirla a S3.
// Reduce fotos de iPhone de 3-12MB a ~1MB y las normaliza a JPEG.
//
// Nota HEIC: en Safari (iPhone) el canvas decodifica HEIC nativamente, así que
// la salida sale como JPEG sin librería extra. En navegadores que NO decodifican
// HEIC (Chrome/Firefox desktop), imageCompression lanza y devolvemos el original.
const OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/jpeg",
  initialQuality: 0.8,
};

function withJpgExtension(name: string): string {
  return name.replace(/\.[^./\\]+$/, "") + ".jpg";
}

export async function compressImage(file: File): Promise<File> {
  try {
    const compressed = await imageCompression(file, OPTIONS);

    // Si la "compresión" no achicó nada (imagen ya pequeña), conserva el original.
    if (compressed.size >= file.size) return file;

    return new File([compressed], withJpgExtension(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn(
      "[compressImage] Falló la compresión, se sube el original",
      { name: file.name, error },
    );
    return file;
  }
}
