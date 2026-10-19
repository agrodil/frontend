// Contenido del Manual de usuario.
//
// CÓMO AGREGAR UNA GUÍA NUEVA:
//   1. Agrega un objeto a `guides` (abajo). El resto de la página se arma sola:
//      índice, sección, pasos y botón de acción.
//   2. `id` debe ser único y sin espacios (se usa como ancla: /manual#id).
//   3. `iconKey` debe existir en el registro de íconos de GuideCard. Si
//      necesitas un ícono nuevo, agrégalo ahí y a `GuideIconKey`.
//   4. Escribe frases cortas: un paso = una sola acción. En textos se soporta
//      **negrita**.
//   5. Actualiza `manualLastUpdated` (AAAA-MM-DD) cuando cambie el contenido.

export type GuideIconKey = "publish" | "wallet" | "buy";

export interface GuideStep {
  title: string;
  description: string;
  // Recomendación opcional que se muestra resaltada bajo el paso.
  hint?: string;
}

export interface Guide {
  id: string;
  title: string;
  summary: string;
  iconKey: GuideIconKey;
  // Requisitos o aviso importante antes de empezar (opcional).
  intro?: string;
  steps: GuideStep[];
  // Consejos finales (opcional).
  tips?: string[];
  // Botón de acción al final de la guía (ruta interna).
  cta: { label: string; to: string };
}

export const manualTitle = "Manual de usuario";
export const manualSubtitle =
  "Guías paso a paso, en palabras simples, para usar AGRODIL.";
export const manualLastUpdated = "2026-10-08";

export const guides: Guide[] = [
  {
    id: "publicar-y-vender",
    title: "Cómo publicar y vender",
    summary: "Crea tu publicación y cierra la venta.",
    iconKey: "publish",
    intro: "Necesitas una cuenta con la sesión iniciada.",
    steps: [
      {
        title: "Entra a Publicar",
        description: 'Toca **"Publicar"** en el menú.',
      },
      {
        title: "Cuéntanos qué vendes",
        description:
          "Elige la categoría, escribe un título corto e indica el estado y el municipio. Si vendes ganado, elige también el rubro y si vendes por peso o por unidad.",
      },
      {
        title: "Agrega los detalles",
        description:
          "Escribe el precio y las características. Sube de 1 a 10 fotos o videos.",
        hint: "Las fotos claras y con buena luz ayudan a vender más rápido.",
      },
      {
        title: "Elige cuánto tiempo estará activa",
        description:
          "Selecciona el plan de duración. El costo del plan se descuenta de tu saldo.",
      },
      {
        title: "Revisa y publica",
        description:
          'Mira el resumen y toca **"Publicar"**. Si tu saldo no alcanza, primero haz un depósito (guía "Cómo depositar dinero").',
      },
      {
        title: "Responde a los interesados",
        description:
          'Cuando alguien quiera comprar, te llega una notificación. Abre el chat y toca **"Confirmar venta"** o **"Rechazar"**.',
      },
      {
        title: "Cierra la venta",
        description:
          'Al confirmar, toca **"Desactivar publicación"**. Así nadie más te escribe por ese producto.',
      },
    ],
    tips: [
      'Si tu publicación vence, ábrela desde tu perfil y toca **"Renovar"**.',
    ],
    cta: { label: "Ir a Publicar", to: "/new-post" },
  },
  {
    id: "depositar-dinero",
    title: "Cómo depositar dinero",
    summary: "Carga saldo en tu billetera con pago móvil.",
    iconKey: "wallet",
    intro:
      "Tu saldo sirve para pagar tus publicaciones. Depositas en bolívares (Bs) por pago móvil.",
    steps: [
      {
        title: "Abre Mi Billetera",
        description:
          'Toca **"Mi Billetera"** en el menú y luego **"Depositar"**.',
      },
      {
        title: "Elige una cuenta",
        description:
          "Verás las cuentas de pago móvil disponibles. Toca la que vayas a usar.",
      },
      {
        title: "Haz el pago",
        description:
          "Copia los datos con los botones de copiar y paga desde la app de tu banco.",
        hint: "Guarda la captura del comprobante. La necesitas en el paso 5.",
      },
      {
        title: 'Toca "Ya hice el pago"',
        description: "Esto te lleva al formulario para registrar tu pago.",
      },
      {
        title: "Registra tu pago",
        description:
          "Escribe el **número de referencia**, el **monto exacto** que pagaste en Bs y sube la captura del comprobante.",
        hint: "Escribe el monto y la referencia tal como aparecen en el comprobante. La captura debe verse completa y nítida.",
      },
      {
        title: "Mira el resultado",
        description:
          '**"Depósito acreditado"**: tu saldo ya está disponible. **"En revisión"**: estamos verificando tu pago y, cuando se acredite, tu saldo se actualizará. Puedes verlo en Mi Billetera.',
      },
    ],
    cta: { label: "Ir a Mi Billetera", to: "/wallet" },
  },
  {
    id: "comprar",
    title: "Cómo comprar",
    summary: "Encuentra un producto y contacta al vendedor.",
    iconKey: "buy",
    intro:
      "AGRODIL conecta compradores y vendedores. El pago y la entrega los acuerdas directamente con el vendedor.",
    steps: [
      {
        title: "Busca lo que necesitas",
        description: 'Entra a **"Publicaciones"** y usa los filtros.',
      },
      {
        title: "Abre una publicación",
        description: "Mira las fotos, el precio y los detalles.",
      },
      {
        title: "Inicia sesión o crea tu cuenta",
        description:
          "Si aún no lo has hecho, la página te lo pedirá antes de continuar.",
      },
      {
        title: 'Toca "Solicitar compra"',
        description: "Se envía tu solicitud al vendedor y se abre el chat.",
      },
      {
        title: "Habla con el vendedor",
        description:
          "Pregunta lo que necesites y acuerden el pago y la entrega.",
        hint: "Antes de pagar, pide los documentos sanitarios y de propiedad.",
      },
      {
        title: "Espera su respuesta",
        description:
          'Verás si tu solicitud fue confirmada o rechazada. Si cambias de opinión, toca **"Cancelar solicitud"**.',
      },
    ],
    cta: { label: "Ver publicaciones", to: "/posts" },
  },
];
