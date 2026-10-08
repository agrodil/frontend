// Contenido de los documentos legales.
//
// CÓMO PEGAR TU TEXTO:
//   - Pega cada documento entre las comillas invertidas (`) donde dice "PEGA AQUÍ".
//   - Separa los bloques con una línea en blanco.
//   - Se soporta Markdown básico (ver LegalPage): "## Título", listas con "- " o
//     "1. ", **negrita** y tablas con "| a | b |". Un bloque de una sola línea corta
//     en MAYÚSCULAS o numerado también se muestra como subtítulo.
//   - Actualiza "lastUpdated" (formato AAAA-MM-DD) cuando cambie el documento.

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  content: string;
}

export const termsDocument: LegalDocument = {
  title: "Términos y Condiciones de Uso — AGRODIL",
  lastUpdated: "2026-10-08",
  content: `El presente documento constituye un acuerdo de voluntades de carácter vinculante y obligatorio (en adelante, los "Términos y Condiciones") que rige el acceso, registro, publicación y uso de la plataforma digital AGRODIL (en adelante, "la Plataforma"), accesible a través de su portal web oficial. La navegación, registro, contratación de publicaciones, pauta publicitaria o interactividad dentro de la Plataforma atribuye la condición de usuario (en adelante, el "Usuario") e implica la manifestación expresa, libre e inequívoca de su voluntad de aceptación, adhesión y sometimiento a la totalidad de las disposiciones aquí contenidas. Si el Usuario no está de acuerdo con estos términos, deberá abstenerse de acceder y utilizar la Plataforma.

## Cláusula Primera: Capacidad Civil y Deber de Representación

Los servicios de vitrina comercial y de intermediación tecnológica provistos por la Plataforma están dirigidos exclusivamente a:

- Personas naturales que gocen de plena capacidad civil de ejercicio para contratar y obligarse de conformidad con la legislación de la República Bolivariana de Venezuela.
- Personas jurídicas debidamente constituidas, representadas por personas naturales que cuenten con las facultades, mandatos o poderes suficientes y vigentes para obligar a sus representadas.

Queda prohibido el uso de la Plataforma por parte de menores de edad, personas declaradas judicialmente inhabilitadas o entredichas, o aquellos Usuarios cuyas cuentas hayan sido previamente suspendidas, canceladas o inhabilitadas de forma temporal o definitiva por la administración de la Plataforma.

## Cláusula Segunda: Registro, Identificación y Seguridad de la Cuenta

Para interactuar activamente y publicar en la Plataforma, el Usuario deberá completar el formulario de registro correspondiente de forma verídica, exacta, actual y comprobable.

- **Debida Diligencia (KYC):** Como parte de las políticas de prevención de fraudes y seguridad operativa, la Plataforma exigirá al Usuario la carga digital de un documento de identidad oficial vigente (Cédula de Identidad) y, en caso de personas jurídicas, el Registro de Información Fiscal (RIF).
- **Carácter de la Cuenta:** Toda cuenta creada es estrictamente personal, única e intransferible. Queda prohibida la venta, cesión o transferencia de la misma bajo cualquier título.
- **Custodia de Credenciales:** El Usuario es el único responsable de preservar la confidencialidad de sus claves de acceso. En consecuencia, todas las publicaciones, ofertas y transacciones realizadas desde su perfil se presumirán de su exclusiva autoría y responsabilidad legal.

## Cláusula Tercera: Facultad de Modificación Unilateral

La administración de la Plataforma se reserva el derecho de modificar, adicionar, actualizar o reestructurar los presentes Términos y Condiciones en cualquier momento, con el fin de adecuarlos a reformas legales, directrices de autoridades competentes, ajustes tarifarios o nuevas políticas comerciales y operativas.

Toda modificación sustancial será informada a los Usuarios a través de los canales internos de la Plataforma o mediante el correo electrónico registrado. Las modificaciones entrarán en vigor transcurridos cinco (5) días continuos contados a partir de su publicación digital. La utilización continua de los servicios tras dicho lapso constituirá una aceptación tácita y vinculante de las nuevas condiciones.

## Cláusula Cuarta: Naturaleza de la Plataforma y Alcance de las Publicaciones

La Plataforma opera bajo la modalidad técnica de alojamiento de contenidos (hosting) y vitrina comercial digital especializada en el sector agropecuario integral. Su propósito principal es facilitar el acercamiento, exposición y comunicación entre Vendedores y Compradores de la comunidad agrotecnológica, ganadera e industrial.

- **Amplitud de Categorías Agropecuarias:** La Plataforma permite la publicación de toda clase de bienes, insumos, maquinarias, equipos, semovientes, predios agrícolas, fincas, productos primarios, derivados agroindustriales y servicios vinculados directa o indirectamente al sector agropecuario, siempre que su comercialización cumpla con el marco legal vigente.
- **Inexistencia de Relación de Mandato o Representación:** La Plataforma no actúa como agente, comisionista, mandatario, socio, distribuidor, intermediario financiero ni garante de ninguna de las operaciones comerciales que se gesten entre los Usuarios.
- **Ausencia de Propiedad e Intervención:** La Plataforma no ostenta la propiedad, posesión física o jurídica de los bienes publicados, ni interviene en la fijación final de precios de venta, condiciones de entrega, medios de pago ni en el perfeccionamiento del contrato de compraventa entre particulares.

## Cláusula Quinta: Esquema Comercial, Tarifas de Publicación y Publicidad

El modelo operativo de la Plataforma se fundamenta en los siguientes esquemas comerciales:

| Modalidad | Condiciones Comerciales |
|---|---|
| Cobro por Publicación y Vigencia Temporal | La inserción, mantenimiento y exposición de anuncios comerciales en la Plataforma estará sujeta al pago previo de tarifas comerciales calculadas en función de la categoría del bien y del tiempo de permanencia/duración del anuncio contratado. Las tarifas aplicables y planes de permanencia estarán detallados en la sección tarifaria del portal al momento de la carga. |
| Servicios de Publicidad y Destacados | La Plataforma ofrece espacios de pauta publicitaria (banners, promociones institucionales y anuncios destacados). Los montos, plazos, condiciones y especificaciones técnicas de dichos acuerdos publicitarios no están predeterminados en una tarifa única general, sino que se pactarán mediante acuerdo directo y particular suscrito entre la Administración de la Plataforma y la parte anunciante. |

## Cláusula Sexta: Relación con Gremios, Asociaciones e Instituciones del Sector

La Plataforma exhibe dentro de su entorno digital logotipos, marcas e insignias de diversos gremios, asociaciones e instituciones representativas del sector agropecuario.

- **Inexistencia de Sociedad o Alianza Comercial:** Se aclara expresamente que la Plataforma no mantiene relación de sociedad mercantil, joint venture, subordinación ni vínculo corporativo o accionario con dichos gremios o instituciones.
- **Uso Autorizado de Imagen y Respaldo Institucional:** La presencia de la imagen institucional de los gremios obedece única y exclusivamente a acuerdos previos de cooperación y respaldo, mediante los cuales dichas entidades han otorgado su consentimiento expreso para el uso de su marca como aliados institucionales.
- **Deslinde de Responsabilidad Gremial:** Dichos gremios y asociaciones carecen de injerencia u obligación legal respecto a la gestión operativa de la Plataforma, las publicaciones realizadas por los Vendedores o las negociaciones celebradas entre los Usuarios.

## Cláusula Séptima: Política de Canales de Comunicación Interna y Moderación

A los fines de garantizar la trazabilidad y mitigar riesgos de fraude, los Usuarios deberán canalizar sus consultas y ofertas iniciales a través del sistema de mensajería interna provisto por la Plataforma.

- **Facultades de Control Operativo:** La Plataforma se reserva la facultad discrecional de supervisar, auditar y remover publicaciones o comunicaciones que violen el orden público, la moral, las normas sanitarias o que sugieran la comisión de actividades ilícitas.
- **Medidas Sancionatorias:** Ante sospechas fundadas de fraude, falta de pago de las tarifas de publicación o incumplimiento de los presentes Términos, la Plataforma podrá suspender temporalmente o inhabilitar definitivamente la cuenta del Usuario, sin reembolso de las tarifas abonadas por publicación.

## Cláusula Octava: Declaraciones y Garantías Exclusivas del Vendedor

El Usuario que actúe en calidad de Vendedor asume la responsabilidad civil, penal y administrativa directa y exclusiva de toda publicación realizada. Al contratar una publicación, el Vendedor declara y garantiza bajo fe de juramento lo siguiente:

1. **Titularidad y Dominio:** Ser el propietario legítimo de los bienes, semovientes, maquinarias o predios ofrecidos, o contar con la debida autorización legal para su enajenación.
2. **Origen Lícito:** Garantizar que los bienes no provienen de actividades ilícitas, hurto, robo, contrabando ni legitimación de capitales.
3. **Cumplimiento Regulatorio y Sanitario:** Cumplir con toda la normativa fitosanitaria, zoosanitaria, ambiental y administrativa exigida por las autoridades competentes (incluyendo guías de movilización, permisos, certificados de vacunación, títulos de propiedad aplicables, entre otros).

**Deslinde Administrativo:** La Plataforma no realiza inspecciones físicas veterinarias ni comprobaciones de dominio sobre los bienes publicados. Toda contingencia legal, aduanera o sanitaria será de la exclusiva cuenta, cargo y riesgo del Vendedor.

## Cláusula Novena: Obligaciones y Deber de Diligencia del Comprador

El Usuario que actúe en calidad de Comprador se obliga a conducirse bajo los principios de buena fe y seriedad comercial, comprometiéndose a:

- **Debido Cuidado (Due Diligence):** Realizar la verificación previa del estado físico, mecánico o sanitario de los bienes, así como exigir copia de la documentación legal y sanitaria al Vendedor antes de concretar desembolsos económicos.
- **Seriedad de Oferta:** Abstenerse de realizar ofertas simuladas o especulativas que entorpezcan la dinámica comercial del sitio.

## Cláusula Décima: Sistema de Valoración y Reputación

La Plataforma pone a disposición un mecanismo de calificación y comentarios para ponderar el nivel de cumplimiento de los Usuarios. La Plataforma se reserva el derecho de auditar, modificar o retirar comentarios falsos, extorsivos o que constituyan competencia desleal.

## Cláusula Décimo Primera: Propiedad Intelectual y Derechos Reservados

La arquitectura tecnológica, código fuente, desarrollos de software, marcas, lemas comerciales y logotipos propios de AGRODIL son de su exclusiva propiedad. Se prohíbe su reproducción, ingeniería inversa o explotación no autorizada.

## Cláusula Décimo Segunda: Canal de Comunicación y Soporte Operativo

Para la atención de consultas, soporte técnico o solicitudes comerciales, se establece como canal oficial de comunicación el correo electrónico: **admin@agrodilmarket.com**

## Cláusula Décimo Tercera: Jurisdicción, Solución de Controversias y Ley Aplicable

La validez, interpretación y ejecución del presente contrato se regirán por las leyes de la República Bolivariana de Venezuela. Para la resolución de cualquier controversia, las partes eligen como domicilio especial, único y excluyente a la ciudad de Maracaibo, Estado Zulia, sometiéndose a la jurisdicción de sus tribunales competentes.
`,
};

export const privacyDocument: LegalDocument = {
  title: "Política de Privacidad y Tratamiento de Datos Personales — AGRODIL",
  lastUpdated: "2026-10-08",
  content: `La presente Política de Privacidad y Tratamiento de Datos Personales (en adelante, la "Política de Privacidad") tiene como objeto informar de manera transparente, detallada y comprensible a los usuarios (en adelante, el "Usuario" o los "Usuarios") de la plataforma digital AGRODIL (en adelante, "la Plataforma"), acerca de la obtención, almacenamiento, uso, procesamiento, resguardo y transferencia de la información y datos personales que son recabados con ocasión del acceso, registro y operatividad dentro del portal.

## Introducción y Declaración de Compromiso

El tratamiento de los datos personales por parte de la Plataforma se rige estrictamente por los principios de legalidad, consentimiento, finalidad, seguridad y confidencialidad, de conformidad con lo establecido en la Constitución de la República Bolivariana de Venezuela (especialmente su artículo 60 relativo a la protección del honor, vida privada, intimidad, propia imagen, confidencialidad y reputación), las leyes de comercio electrónico y las mejores prácticas en materia de seguridad digital.

Al registrarse, acceder o interactuar en la Plataforma, el Usuario otorga su consentimiento expreso, previo, libre e inequívoco para que sus datos personales sean tratados conforme a los términos aquí descritos.

## Cláusula Primera: Responsable del Tratamiento de los Datos

El responsable de la recopilación, almacenamiento y tratamiento de los datos personales del Usuario es la Administración de la Plataforma AGRODIL (en adelante, "la Administración"), con domicilio en la ciudad de Maracaibo, Estado Zulia, República Bolivariana de Venezuela, y cuyo canal de atención institucional es el correo electrónico: **admin@agrodilmarket.com**.

## Cláusula Segunda: Categorías de Datos Objeto de Tratamiento

Para cumplir con los fines de intermediación tecnológica y vitrina comercial del sector agropecuario, la Plataforma recaba y trata las siguientes categorías de datos:

- **Datos de Registro e Identificación:** Nombres y apellidos completos, denominación o razón social (para personas jurídicas), cédula de identidad, Registro de Información Fiscal (RIF), número de teléfono móvil y dirección de correo electrónico.
- **Datos de Verificación y Soporte (Políticas KYC - "Conozca a su Cliente"):** Copia digital del documento de identidad (Cédula de Identidad) y, en caso de personas jurídicas, del Registro de Información Fiscal (RIF) vigente.
- **Datos de Localización y Logística Agropecuaria:** Ubicación geográfica declarada, dirección física de fincas, fundos o predios agrícolas, y zonas habituales de despacho o recepción de bienes y semovientes.
- **Datos Transaccionales y de Mensajería:** Contenido de los mensajes, consultas, ofertas e interacciones comerciales realizadas a través de la mensajería interna de la Plataforma entre Vendedores y Compradores, así como las calificaciones e históricos de transacciones del Usuario. Los datos de contacto que el Usuario decida compartir voluntariamente dentro del chat forman parte del contenido de sus mensajes.
- **Datos de Pagos y Saldo:** Montos, referencias y comprobantes de pago cargados por el Usuario para recargar su saldo, así como el historial de movimientos asociado al pago de tarifas de publicación.
- **Datos Técnicos y de Navegación:** Dirección IP, tipo de dispositivo de acceso, sistema operativo, datos de inicio de sesión, páginas visitadas dentro de la Plataforma e historial de navegación técnica (recabados mediante cookies u otras tecnologías similares).

## Cláusula Tercera: Finalidades de la Recopilación y Tratamiento

La Plataforma recopila y procesa los datos personales de los Usuarios con el único propósito de garantizar una experiencia segura, transparente y eficiente. El tratamiento se realiza específicamente para las siguientes finalidades esenciales:

| Finalidad | Descripción Operativa |
|---|---|
| Prestación del Servicio | Gestionar el registro de la cuenta, permitir la publicación de ofertas de venta, la búsqueda de productos y semovientes, y la utilización de los canales de comunicación internos. |
| Interacción Comercial y Trazabilidad | Facilitar el contacto entre el Vendedor y el Comprador a través del sistema de mensajería interna de la Plataforma y mantener la trazabilidad de las comunicaciones realizadas dentro del portal. Los datos de contacto (teléfono y correo) registrados por los Usuarios se almacenan en la base de datos de la Plataforma y solo son visibles para sus respectivos titulares. |
| Gestión de Pagos y Saldo | Verificar los pagos reportados por el Usuario, acreditar su saldo y cobrar las tarifas de publicación y vigencia de anuncios contratadas. |
| Mitigación de Fraudes | Ejecutar labores de debida diligencia, verificación de identidad y auditoría de perfiles para prevenir actividades fraudulentas, estafas, usurpación de identidad o conductas que violen las normas de la Plataforma. |
| Soporte y Atención | Procesar solicitudes, reportes de fallas técnicas, reclamos o sugerencias canalizados a través del correo de atención oficial de la Plataforma. |
| Notificaciones Operativas | Enviar alertas sobre el estado de las publicaciones, mensajes recibidos de otros Usuarios, actualizaciones técnicas de la Plataforma o modificaciones a los Términos y Condiciones y a esta Política de Privacidad. |

## Cláusula Cuarta: Base de Legitimación del Tratamiento

El tratamiento de los datos personales por parte de la Plataforma se fundamenta de forma legítima en las siguientes bases jurídicas:

- **El Consentimiento del Usuario:** Otorgado de forma expresa al momento de completar el registro de su cuenta en la Plataforma y aceptar de manera voluntaria las disposiciones de este instrumento.
- **La Ejecución Contractual:** El tratamiento de los datos es estrictamente necesario para dar cumplimiento a la relación jurídica nacida de la aceptación de los Términos y Condiciones (es decir, proveer la vitrina comercial y el servicio de intermediación digital).
- **El Interés Legítimo y Seguridad:** La verificación de identidad de los Usuarios es obligatoria para garantizar un entorno comercial seguro y confiable para toda la comunidad de AGRODIL.

## Cláusula Quinta: Transferencia y Comparticipación de Datos Personales

La Plataforma no vende, alquila, comercializa ni cede bajo ningún título oneroso los datos personales de sus Usuarios a terceras empresas o fines publicitarios ajenos a la actividad de la marca.

Sin perjuicio de lo anterior, el Usuario reconoce y acepta que la Plataforma podrá compartir sus datos exclusivamente en los siguientes escenarios de estricta necesidad operativa y legal:

- **Proveedores de Servicios Tecnológicos:** Empresas terceras que actúan como encargadas del tratamiento, tales como servicios de alojamiento de servidores (hosting), almacenamiento en la nube, envío de correos electrónicos, herramientas de auditoría técnica o análisis de seguridad de datos. Dichas empresas están sujetas a estrictas cláusulas de confidencialidad y prohibición de uso de datos para fines propios.
- **Autoridades Competentes y Órganos de Justicia:** En cumplimiento de mandatos judiciales firmes o solicitudes formales debidamente fundamentadas emanadas de tribunales, fiscalías o entes reguladores del sector agrícola y ganadero (como el INSAI, SICA, entre otros), con el objeto de verificar el origen lícito de bienes, controlar la movilización de semovientes o cooperar con la justicia.

**Comunicación y Datos de Contacto entre Usuarios:** Los datos de contacto directo (números telefónicos y correos electrónicos) registrados por los Usuarios se almacenan en la base de datos de la Plataforma y solo se muestran a sus respectivos titulares; la Plataforma no los revela a otros Usuarios. Los Usuarios son libres de compartir voluntariamente sus datos de contacto a través del chat que ofrece la Plataforma o por cualquier otro medio. Dicha decisión queda a su exclusiva discreción y responsabilidad, por lo que la Plataforma no se hace responsable por el uso que otros Usuarios o terceros den a los datos que el propio Usuario decida compartir.

> **Importante:** AGRODIL nunca vende tus datos personales. Tu teléfono y correo registrados solo son visibles para ti. Si decides compartirlos con otro Usuario a través del chat, es una decisión tuya y bajo tu responsabilidad.

## Cláusula Sexta: Derechos de los Usuarios (Habeas Data)

En consonancia con el artículo 60 de la Constitución de la República Bolivariana de Venezuela, la Plataforma garantiza al Usuario la facultad de ejercer en todo momento sus derechos de acceso, rectificación, cancelación, oposición y limitación del tratamiento (conocidos doctrinariamente como Derechos ARCO o acción de Habeas Data):

- **Acceso:** Derecho a conocer si sus datos personales están siendo tratados y a obtener una copia de los mismos de forma gratuita.
- **Rectificación:** Derecho a solicitar la corrección, actualización o complementación de datos que resulten inexactos, incompletos o desactualizados.
- **Cancelación (Supresión):** Derecho a solicitar la eliminación definitiva de sus datos personales cuando estos ya no sean necesarios para los fines que fueron recabados, o cuando el Usuario decida dar de baja su cuenta.
- **Oposición:** Derecho a oponerse al tratamiento de sus datos para fines específicos que no afecten la ejecución de los servicios esenciales de la Plataforma.

> **Procedimiento de Solicitud:** Para ejercer cualquiera de estos derechos, envía una solicitud por escrito a **admin@agrodilmarket.com**, adjuntando una copia digital de tu Cédula de Identidad o documento oficial de representación, a los fines de validar tu titularidad. La Plataforma dará respuesta y procesará la solicitud en un lapso no mayor a **quince (15) días hábiles**.

## Cláusula Séptima: Medidas de Seguridad y Resguardo de la Información

La Plataforma adopta e implementa medidas de seguridad técnicas, organizativas, físicas y administrativas idóneas para resguardar los datos personales contra accesos no autorizados, pérdida fortuita, alteración, destrucción, divulgación indebida o robo de información.

Entre las medidas adoptadas se encuentran el uso de protocolos de encriptación de datos en tránsito, firewalls comerciales, restricciones de acceso físico y lógico únicamente a personal autorizado de la Administración, y auditorías periódicas de los sistemas de almacenamiento. Sin embargo, el Usuario reconoce y acepta que las medidas de seguridad en el entorno de internet no son absolutamente inexpugnables, por lo que la Administración se compromete a actuar con la debida diligencia y notificar oportunamente al Usuario en caso de detectarse cualquier brecha de seguridad que comprometa la integridad de sus datos.

## Cláusula Octava: Plazo de Conservación de los Datos

Los datos personales del Usuario se conservarán en los servidores de la Plataforma mientras se mantenga vigente su registro y cuenta de Usuario activa.

Una vez que el Usuario solicite la baja de su cuenta, la Plataforma procederá a la supresión o anonimización de los datos de carácter identificable. No obstante, se mantendrán aquellos datos estrictamente necesarios bajo un esquema de bloqueo seguro, con el único fin de atender eventuales responsabilidades legales, contractuales, fiscales o judiciales que pudieren surgir bajo las leyes venezolanas, por el plazo de prescripción que la legislación aplicable establezca para dichas acciones.

## Cláusula Novena: Uso de Cookies y Tecnologías Similares

La Plataforma utiliza "cookies" y tecnologías de seguimiento equivalentes para personalizar la experiencia de navegación del Usuario, recordar sus preferencias de inicio de sesión, recopilar estadísticas anónimas sobre el tráfico en el portal y mejorar las funcionalidades del sistema.

El Usuario tiene la plena libertad de configurar su navegador web para bloquear, restringir o eliminar las cookies en el momento que lo desee. No obstante, el Usuario acepta que la inhabilitación de ciertas cookies técnicas indispensables podría limitar o afectar el correcto funcionamiento de algunas de las herramientas operativas de la Plataforma.

## Cláusula Décima: Modificaciones a la Política de Privacidad

La Plataforma se reserva el derecho de modificar, actualizar o reformar el contenido de esta Política de Privacidad en cualquier momento. Cualquier cambio significativo será notificado a los Usuarios a través de los canales internos de la Plataforma o mediante el envío de un correo electrónico a la dirección registrada por el Usuario.

Toda modificación entrará en plena vigencia una vez transcurridos cinco (5) días continuos desde su publicación digital en el sitio web de la Plataforma. El acceso continuo o uso de los servicios por parte del Usuario tras dicho período constituirá su aceptación expresa y vinculante de la nueva Política de Privacidad.

## Cláusula Décimo Primera: Jurisdicción y Legislación Aplicable

Para todo lo no previsto expresamente en esta Política de Privacidad, se aplicarán de manera supletoria las leyes de la República Bolivariana de Venezuela.

Cualquier disputa, interpretación o controversia legal derivada del alcance, validez, cumplimiento o ejecución de la presente política de privacidad será resuelta de forma definitiva y excluyente por los tribunales ordinarios competentes de la circunscripción judicial de la ciudad de Maracaibo, Estado Zulia, renunciando las partes de forma expresa a cualquier otro fuero que pudiere corresponderles.
`,
};
