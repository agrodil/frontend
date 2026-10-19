// Contenido de la página de Preguntas Frecuentes.
//
// Cada item se muestra como un acordeón. En "answer" se soporta **negrita**.
// Actualiza "lastUpdated" (formato AAAA-MM-DD) cuando cambie el contenido.

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqDocument {
  title: string;
  subtitle: string;
  lastUpdated: string;
  contactEmail: string;
  items: FaqItem[];
}

export const faqDocument: FaqDocument = {
  title: "Preguntas Frecuentes",
  subtitle: "Resolvemos las dudas más comunes sobre cómo funciona AGRODIL.",
  lastUpdated: "2026-10-08",
  contactEmail: "admin@agrodilmarket.com",
  items: [
    {
      question:
        "¿Qué es AGRODIL y qué tipo de bienes o servicios se pueden publicar?",
      answer:
        "AGRODIL es una vitrina comercial y de intermediación tecnológica especializada en el sector agropecuario integral. La plataforma permite la publicación de toda clase de bienes, productos y servicios vinculados al campo, tales como semovientes, maquinaria agrícola, herramientas, predios, fincas, insumos, productos primarios, derivados agroindustriales y servicios técnicos o profesionales especializados.",
    },
    {
      question: "¿Publicar en AGRODIL es gratuito o tiene algún costo?",
      answer:
        "La inserción y exposición de anuncios comerciales en la plataforma está sujeta al pago previo de tarifas de publicación. El monto varía en función de la categoría del bien o servicio publicado y del tiempo de permanencia o vigencia contratado para el anuncio.",
    },
    {
      question:
        "¿Cómo funciona la vigencia o tiempo de permanencia de los anuncios?",
      answer:
        "Al momento de realizar tu publicación, seleccionas el plan tarifario con el tiempo de permanencia en línea de tu preferencia. Transcurrido dicho plazo, el anuncio vencerá automáticamente y dejará de estar visible en la vitrina pública hasta que el Usuario proceda a su renovación.",
    },
    {
      question:
        "¿Cómo puedo contratar espacios publicitarios o destacar mi marca en el portal?",
      answer:
        "Ofrecemos opciones de pauta publicitaria especial (banners, menciones institucionales y anuncios destacados). Los costos, plazos de exposición y especificaciones técnicas para estos servicios no poseen una tarifa general predeterminada, sino que se acuerdan de forma directa e individualizada entre la parte anunciante y la Administración de AGRODIL.",
    },
    {
      question:
        "¿AGRODIL pertenece a alguna asociación o gremio del sector agropecuario?",
      answer:
        "No. AGRODIL es una plataforma digital tecnológicamente independiente. La presencia de logotipos e insignias de gremios e instituciones en el portal obedece exclusivamente a acuerdos previos de cooperación y respaldo institucional, mediante los cuales dichas entidades han otorgado su consentimiento para el uso de su imagen. No existe relación de sociedad mercantil, representación corporativa ni responsabilidad compartida entre los gremios y la plataforma.",
    },
    {
      question:
        "¿Puedo intercambiar datos de contacto directo (teléfono o correo electrónico) con la otra parte?",
      answer:
        "Sí. La plataforma pone a disposición un sistema de mensajería interna para facilitar la comunicación inicial entre Vendedores y Compradores. No obstante, los Usuarios tienen plena libertad de intercambiar sus números telefónicos, correos electrónicos u otros canales de contacto directo si así lo desean para avanzar y concretar sus negociaciones.",
    },
    {
      question:
        "¿AGRODIL cobra comisiones por las ventas o transacciones concretadas?",
      answer:
        "No. AGRODIL opera exclusivamente bajo la figura de vitrina comercial y alojamiento de contenidos. La plataforma no interviene en la negociación final, fijación de precios, cobros, pagos ni en la entrega de los bienes, por lo que no cobra ni percibe comisiones sobre las ventas o acuerdos alcanzados entre particulares.",
    },
    {
      question:
        "¿Qué requisitos legales, sanitarios o administrativos debo cumplir para publicar cualquier bien o servicio del agro?",
      answer:
        "El Vendedor asume la responsabilidad legal total de los bienes o servicios que publique en la plataforma. Debe ostentar el dominio legítimo sobre el bien, predio, maquinaria, insumo o semoviente (o contar con la debida autorización legal para su enajenación) y cumplir de forma estricta con todas las normativas legales, ambientales, sanitarias, fitosanitarias, zoosanitarias y administrativas exigidas por las autoridades competentes según el rubro (títulos de propiedad, licencias, permisos de movilización, certificados sanitarios, entre otros).",
    },
    {
      question:
        "¿Cómo se resguardan mis datos personales y documentos cargados en el sitio?",
      answer:
        "Toda la información suministrada durante el registro o proceso de verificación de cuenta (KYC) se procesa bajo rigurosas medidas de seguridad digital y en estricto apego a la Constitución de la República Bolivariana de Venezuela (Artículo 60). Tus datos son tratados de forma confidencial y no son comercializados con terceros ajenos a la plataforma.",
    },
    {
      question:
        "¿Cuál es el canal oficial para soporte técnico o consultas sobre publicaciones?",
      answer:
        "Para cualquier requerimiento operativo, dudas sobre planes tarifarios, reportes de fallas o asistencia técnica, el canal oficial e institucional de comunicación es el correo electrónico: **admin@agrodilmarket.com**.",
    },
  ],
};
