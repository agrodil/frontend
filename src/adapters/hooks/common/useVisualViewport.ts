import { useEffect, useState } from "react";

export interface VisualViewportSize {
  height: number;
  offsetTop: number;
}

// Sigue el visual viewport real (lo que el usuario efectivamente ve) en vez
// del layout viewport, que no encoge cuando se abre el teclado virtual en
// móvil. Sin esto, un contenedor `fixed inset-0` queda más alto que el área
// visible: el navegador desplaza la página para mantener el input enfocado
// a la vista, y ese desplazamiento se lleva por delante el resto del layout
// (header, footer) que dependía de esa altura fija.
export function useVisualViewport(): VisualViewportSize | null {
  const [size, setSize] = useState<VisualViewportSize | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => setSize({ height: vv.height, offsetTop: vv.offsetTop });

    update();
    vv.addEventListener("resize", update);
    // iOS desplaza el visual viewport (no solo lo encoge) al abrir el
    // teclado; sin este listener el offsetTop queda desactualizado.
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return size;
}
