import { compressImage } from "./compressImage";

// Enrutador de compresión de media. Imágenes → compresión real. Videos → passthrough
// por ahora (suben directo a S3 vía presigned, sin límite de 4.5MB del proxy).
//
// Para agregar compresión de video después: importar un util compressVideo
// (ffmpeg.wasm) y rutear aquí los `video/*`. El resto del flujo no cambia.
export async function compressMedia(files: File[]): Promise<File[]> {
  return Promise.all(
    files.map((file) =>
      file.type.startsWith("image/")
        ? compressImage(file)
        : Promise.resolve(file),
    ),
  );
}
