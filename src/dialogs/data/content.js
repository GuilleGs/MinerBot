// src/dialogs/data/content.js
/**
 * Centraliza todas las respuestas informativas estáticas para MinerBot Global.
 * Las respuestas están organizadas temáticamente, donde cada clave corresponde a una opción de menú
 * (en minúsculas y sin acentos para la coincidencia de entrada).
 */
module.exports = {
    // ======================================================================================
    // RESPUESTAS GENERALES Y MENÚ PRINCIPAL
    // ======================================================================================
    'menu': 'Ha solicitado el menú principal de MinerBot Asistente. ¿En qué le puedo asistir hoy?',

    // ======================================================================================
    // 1. Vacaciones, Licencias y Permisos
    // ======================================================================================
    'vacaciones, licencias y permisos': 'Bienvenido a la sección de Vacaciones, Licencias y Permisos de MinerBot Global. Aquí encontrará información relevante sobre sus derechos y los procedimientos aplicables tanto para faena como para oficina.',
    'solicitar vacaciones': 'Para gestionar su solicitud de vacaciones, por favor, acceda a la plataforma de Autogestión de Personal "MinePortal" a través de la Intranet Corporativa. Allí podrá verificar su saldo de días disponibles y gestionar su solicitud, la cual debe ser aprobada por su jefatura directa y RRHH. Recomendamos solicitar con al menos 30 días de anticipación, especialmente para turnos de faena. [Acceso MinePortal](https://intranet.minerbot.com/mineportal/vacaciones)',
    'consultar saldo de vacaciones': 'Su saldo de vacaciones puede ser consultado en cualquier momento iniciando sesión en "MinePortal" (módulo de Autogestión). El sistema refleja los días acumulados según su tipo de contrato y régimen de jornada. Para cualquier discrepancia, contacte a su Gestor de RRHH.',
    'procedimiento de licencia médica': 'En caso de licencia médica, es fundamental notificar a su supervisor directo y al departamento de Recursos Humanos (RRHH) en un plazo máximo de 24 horas. La licencia médica original o su copia electrónica validada debe ser presentada en RRHH en un plazo no mayor a 3 días hábiles desde el inicio de la licencia. Puede revisar la política completa en nuestro SharePoint de RRHH: [Política de Licencias Médicas](https://minerbot.sharepoint.com/sitios/RRHH/politicas/licencias)',
    'tipos de permisos legales': 'Dentro de los permisos legales, MinerBot Global reconoce varias categorías conforme a la legislación vigente y nuestras políticas internas. Por favor, seleccione la opción que le interese para obtener más detalles.', // Mensaje introductorio al sub-menú

    // --- Sub-menú: Tipos de Permisos Legales ---
    'permiso por matrimonio': 'Se otorgan 5 días hábiles consecutivos de permiso por matrimonio o unión civil. Este permiso debe ser solicitado a su jefatura con un mínimo de 30 días de anticipación, adjuntando el certificado de matrimonio o unión civil. Aplicable a todo el personal, incluyendo rotaciones en faena.',
    'permiso por fallecimiento': 'En caso de fallecimiento de un familiar directo (cónyuge, hijos, padres), se conceden 3 días hábiles de permiso. Para otros familiares (hermanos, abuelos), se otorgan 1 día hábil. Favor contactar a su Gestor de RRHH para coordinar y conocer los requisitos específicos de documentación.',
    'permiso por estudios': 'Los permisos por estudios se otorgan para asistir a exámenes académicos o eventos educativos directamente relacionados con su desarrollo profesional y el core business de MinerBot. La solicitud debe realizarse con al menos 7 días de antelación, adjuntando comprobantes de la institución educativa. Se evalúa caso a caso por la jefatura y RRHH.',
    'otros permisos legales': 'Existen otros permisos legales regulados por la legislación laboral chilena y las políticas internas de MinerBot Global, como permisos por nacimiento, cuidado de hijos menores o situaciones de fuerza mayor. Para consultas específicas o situaciones no contempladas, por favor, contacte directamente al equipo de Recursos Humanos de su sede (Iquique o Santiago).',

    // ======================================================================================
    // 2. Beneficios Económicos
    // ======================================================================================
    'beneficios económicos': 'En esta sección, podrá explorar los diversos beneficios económicos que MinerBot Global ofrece a sus colaboradores, diseñados para complementar su compensación total.',
    'bonos de desempeño': 'Los bonos de desempeño se evalúan anualmente, basados en el cumplimiento de objetivos estratégicos individuales y departamentales, así como en los resultados generales de la compañía. Los criterios y montos específicos se comunican a principios de cada año fiscal a través del comunicado "MinerBot Rewards". Para más información, consulte la Política de Compensaciones en nuestro SharePoint de RRHH.',
    'asignación de escolaridad': 'La asignación de escolaridad es un beneficio dirigido a los empleados con hijos en edad escolar, buscando apoyar la educación de las nuevas generaciones. Los requisitos de postulación, plazos y los montos se publican anualmente. Las solicitudes se gestionan a través del módulo "FamilySupport" en MinePortal.',
    'aguinaldos y gratificaciones': 'MinerBot Global otorga aguinaldos en festividades clave como Fiestas Patrias y Navidad. Las gratificaciones son de carácter anual y su cálculo se basa en los resultados financieros de la compañía. Todos los detalles se informan oportunamente en los comunicados internos de "MinerBot News".',
    'viáticos y reembolsos': 'Para la gestión de viáticos y reembolsos de gastos corporativos, por favor, utilice el sistema de gestión de gastos "ExpenseTrack" disponible en la Intranet de MinerBot Global. Es imprescindible adjuntar todos los comprobantes y seguir rigurosamente la Política de Viáticos y Gastos, disponible en SharePoint. [Acceso ExpenseTrack](https://intranet.minerbot.com/expensetrack)',
    'descuentos corporativos': 'Contamos con convenios y descuentos especiales en una amplia gama de productos y servicios para nuestros colaboradores (salud, educación, comercio minorista, recreación). La lista completa de convenios y cómo acceder a ellos está disponible en el "Portal de Beneficios" dentro de MinePortal. [Portal de Beneficios](https://intranet.minerbot.com/mineportal/beneficios)',

    // ======================================================================================
    // 3. Salud y Seguros
    // ======================================================================================
    'salud y seguros': 'Explore nuestros beneficios y procedimientos relacionados con salud, bienestar ocupacional y seguros, vitales para un entorno minero seguro.',
    'procedimiento de reembolso médico/dental': {
    // Mensaje para Sede 1
    '1': 'Para solicitar reembolsos en su plan con **Aseguradora Andina**, debe usar el portal online de la aseguradora. El procedimiento completo y el enlace directo están en SharePoint. [Formulario Reembolso Sede 1](https://minerbot.sharepoint.com/sitios/Salud/reembolsos-sede1)',
    
    // Mensaje por defecto para todas las demás sedes (2, 3, etc.)
    'default': 'Para solicitar reembolsos en su plan con **Consorcio Salud Minera**, debe presentar las boletas originales y el formulario en la oficina de RRHH de su sede. Acceda al formulario y la política en SharePoint. [Formulario Reembolso General](https://minerbot.sharepoint.com/sitios/Salud/reembolsos-general)'},
    'beneficios de salud mental': 'MinerBot Global se preocupa por su bienestar integral. Ofrecemos acceso a sesiones de apoyo psicológico confidencial a través de nuestra red de proveedores y talleres de manejo de estrés. Contacte a su Gestor de RRHH para conocer las opciones disponibles y coordinar su atención, tanto en faena como en oficina.',
    'seguro de vida y cobertura en accidentes laborales': 'Todos los colaboradores de MinerBot Global cuentan con un seguro de vida colectivo proporcionado por la empresa, además de la cobertura obligatoria de accidentes del trabajo y enfermedades profesionales. Para revisar los detalles de su póliza o iniciar un trámite por accidente laboral (incluyendo trayecto), diríjase a RRHH o consulte la póliza maestra disponible en SharePoint de Seguridad y Salud Ocupacional (SSO).',
    'tipos de seguros de salud': 'Nuestra empresa ofrece diferentes tipos de seguros de salud complementarios para mejorar la cobertura básica de sus colaboradores y sus familias. Seleccione una opción para conocer sus características específicas.', // Mensaje introductorio al sub-menú

    // --- Sub-menú: Tipos de Seguros de Salud ---
    'seguro médico': 'Nuestro seguro médico complementario ofrece cobertura para consultas, exámenes, hospitalización y cirugías, con distintos niveles de copago. Cubre a usted y a sus cargas familiares. Revise los detalles de cobertura y la red de prestadores en el portal de nuestra aseguradora asociada.',
    'seguro dental': 'El seguro dental complementario cubre tratamientos preventivos, restaurativos, periodoncia y, en algunos casos, ortodoncia, con porcentajes de cobertura específicos. Consulte la red de clínicas asociadas y los beneficios en el Portal de Beneficios de MinePortal.',
    'seguro catastrófico': 'El seguro catastrófico brinda protección adicional frente a enfermedades graves o de alto costo no cubiertas totalmente por su seguro base, ofreciendo una mayor tranquilidad económica en situaciones de salud críticas. Detalles y límites de cobertura en SharePoint de RRHH.',

    // ======================================================================================
    // 4. Bienestar y Conciliación
    // ======================================================================================
    'bienestar y conciliación': 'Descubra las iniciativas que fomentan su bienestar integral y facilitan la conciliación entre su vida personal y profesional, considerando los desafíos de la operación minera.',
    'programas de bienestar físico y psicológico': 'Promovemos su salud con programas de actividad física, acceso a gimnasios convenidos (Santiago), espacios de ejercicio en faena, talleres de nutrición, pausas activas y soporte psicológico. Manténgase atento a los comunicados de "Healthy MinerBot" para las próximas actividades.',
    'iniciativas de conciliación vida-trabajo': 'Impulsamos un equilibrio saludable con flexibilidad horaria (sujeto a rol), teletrabajo (para funciones específicas en oficina), y el apoyo en el cuidado familiar. Hable con su supervisor y RRHH para explorar las opciones que se adapten a su rol y ubicación (faena/oficina).',
    'programas internos': 'Conozca los programas e iniciativas internas que enriquecen nuestra comunidad laboral y el ambiente en nuestras distintas sedes. Elija una opción para saber más.', // Mensaje introductorio al sub-menú
    'apoyo familiar': 'MinerBot Global brinda diversas formas de apoyo para usted y su familia, reconociendo la importancia del núcleo familiar para nuestros colaboradores. Seleccione una opción para obtener información detallada.', // Mensaje introductorio al sub-menú

    // --- Sub-menú: Programas Internos ---
    '“vivetarapaca”': 'El programa "ViveTarapacá" es una iniciativa exclusiva para el personal de Faena Cerro Brillante. Busca fomentar la cultura local, el esparcimiento y el bienestar a través de actividades recreativas, deportivas y culturales en la región de Iquique. Consulte la programación mensual en el tablero de anuncios de faena y en el SharePoint del Campamento.',
    'voluntariado corporativo': 'Participe en nuestro programa de Voluntariado Corporativo "MinerBot Solidario". Contribuya a la comunidad local en proyectos sociales y ambientales en las regiones donde operamos. Las inscripciones y eventos se anuncian en la Intranet y por correo electrónico.',
    'club deportivo': 'Únase al Club Deportivo de MinerBot Global. Ofrecemos diversas disciplinas y actividades para fomentar la vida sana y el compañerismo entre los colaboradores de oficina y faena. Contacte a la secretaría del club para inscribirse o al coordinador de Bienestar.',

    // --- Sub-menú: Apoyo Familiar ---
    'apoyo de guardería': 'Ofrecemos un beneficio de apoyo económico para la guardería o jardín infantil de hijos menores de 2 años. Este beneficio busca facilitar la reinserción laboral post-maternal. Consulte los requisitos y el proceso de postulación con su Gestor de RRHH.',
    'becas de estudio para hijos': 'MinerBot Global cuenta con un programa anual de becas de estudio para los hijos de nuestros colaboradores que destacan académicamente en enseñanza básica, media o superior. La convocatoria y bases se publican anualmente en la Intranet Corporativa.',
    'días administrativos por cuidado familiar': 'Se pueden solicitar días administrativos adicionales para atender situaciones urgentes relacionadas con el cuidado de familiares directos dependientes (hijos, padres). La solicitud está sujeta a la aprobación de la jefatura directa y la evaluación de RRHH.',

    // ======================================================================================
    // 5. Cultura y Valores
    // ======================================================================================
    'cultura y valores': 'Aquí encontrará información sobre nuestro Código de Ética, valores corporativos, compromisos y canales de reporte, fundamentales para la cultura de MinerBot Global.',
    'código de ética y conducta': 'Nuestro Código de Ética y Conducta es la piedra angular de MinerBot Global, la guía para actuar con integridad, transparencia y profesionalismo en todas nuestras operaciones, desde la faena hasta la casa matriz en Canadá. Es obligatorio conocerlo y aplicarlo. Puede descargarlo aquí: [Código de Ética MinerBot](https://minerbot.sharepoint.com/sitios/Compliance/CodigoDeEtica.pdf)',
    'valores corporativos y compromisos de diversidad': 'Nuestros valores fundamentales son: Seguridad Primero, Integridad, Excelencia Operacional, Respeto y Sostenibilidad. Estamos comprometidos activamente con la diversidad, la inclusión y la igualdad de oportunidades, reflejando nuestra fuerza de trabajo global.',
    'canales de reporte confidencial': 'Fomentamos un ambiente de confianza y transparencia. Cualquier preocupación, irregularidad, comportamiento contrario al código o inquietud sobre nuestra política "Zero Tolerance" puede ser reportada de forma anónima y confidencial a través de nuestra línea ética externa "IntegrityLine" o el canal interno de denuncias en SharePoint de Compliance.',
    'procedimiento para denuncias': 'Es crucial que sepa cómo actuar en caso de presenciar o ser víctima de una situación inapropiada. Seleccione la opción para ver el procedimiento específico de denuncia en MinerBot Global.', // Mensaje introductorio al sub-menú

    // --- Sub-menú: Procedimiento para Denuncias ---
    'denuncia por acoso': 'El procedimiento para denuncias de acoso (laboral o sexual) en MinerBot Global garantiza la confidencialidad, la protección del denunciante y una investigación imparcial. Puede iniciar una denuncia a través de IntegrityLine (línea externa) o contactando a su Gestor de RRHH o al área de Compliance. La política de acoso cero está en SharePoint.',
    'denuncia por discriminación': 'Si ha sido víctima o testigo de un acto de discriminación, el procedimiento de denuncia asegura un proceso justo y sin represalias. Nuestra política de no discriminación se aplica estrictamente. Presente su denuncia a través de los canales de IntegrityLine o directamente en RRHH.',
    'reporte de conflicto de interés': 'Para mantener la transparencia y la integridad operativa de MinerBot Global, cualquier situación que pudiera implicar un conflicto de interés debe ser reportada inmediatamente a su jefatura, al área de Compliance o a través de IntegrityLine. La política de Conflictos de Interés está disponible en SharePoint de Compliance.',
    'realizar denuncia anónima': 'Por favor, escribe el texto de tu denuncia a continuación. Recuerda que esta denuncia es anónima y no se registrarán tus datos personales. Escribe "volver" para cancelar.', 

    // ======================================================================================
    // 6. Crecimiento y Desarrollo
    // ======================================================================================
    'crecimiento y desarrollo': 'Encuentre oportunidades para su desarrollo profesional y personal dentro de MinerBot Global, potenciando su carrera en la industria minera.',
    'cursos externos financiados por la empresa': 'MinerBot Global apoya su desarrollo profesional financiando cursos y certificaciones externas relevantes para su rol y los objetivos de la compañía. Para postular, debe presentar una propuesta formal a su jefatura y al departamento de Talento y Desarrollo, justificando la pertinencia. [Formulario de Postulación](https://minerbot.sharepoint.com/sitios/Talento/FormularioCursos.docx)',
    'programa de trainees o becas de estudio': 'Contamos con un riguroso programa de trainees para nuevos talentos y becas de estudio para colaboradores con alto potencial que buscan especializarse. Las convocatorias se anuncian anualmente en la sección "Talent Hub" de nuestra Intranet y en los correos corporativos.',
    'evaluación de desempeño y retroalimentación': 'Realizamos evaluaciones de desempeño anuales a través de la plataforma "PerformUp" para identificar fortalezas, áreas de mejora y establecer planes de desarrollo individuales. La retroalimentación continua es clave para su crecimiento profesional. [Acceso PerformUp](https://intranet.minerbot.com/performup)',
    'planes de carrera y movilidad interna': 'Ofrecemos robustas oportunidades de crecimiento a través de planes de carrera definidos y un programa de movilidad interna entre nuestras distintas operaciones (faena Iquique, oficina Santiago, proyectos internacionales e incluso casa matriz en Canadá). Converse con su jefatura y el equipo de Talento y Desarrollo sobre sus aspiraciones.',
    'programas de capacitación interna': 'Participe en nuestros programas de capacitación interna, diseñados para potenciar sus habilidades y conocimientos específicos de la industria minera y nuestro modelo operativo. Seleccione una opción para más detalles.', // Mensaje introductorio al sub-menú
    'solicitar curso': 'Selecciona uno de nuestros cursos disponibles para solicitar tu inscripción o informa si tienes un curso externo de interés para evaluación.',

    // --- Sub-menú: Programas de Capacitación Interna ---
    'capacitación dcl (desarrollo de competencias de liderazgo)': 'Nuestro programa DCL (Desarrollo de Competencias de Liderazgo) está diseñado para potenciar a nuestros líderes y supervisores en todos los niveles, desde la faena hasta la gerencia, a través de módulos presenciales y online enfocados en habilidades blandas y gestión de equipos. [Catálogo DCL](https://minerbot.sharepoint.com/sitios/Talento/DCL)',
    'capacitación en sso (seguridad y salud ocupacional)': 'Ofrecemos capacitación continua en SSO (Seguridad y Salud Ocupacional), fundamental para nuestra operación minera. Estos cursos son obligatorios y aseguran el cumplimiento de normativas y el bienestar de nuestros equipos. Consulte el calendario de inducciones y reinducciones.',
    'cursos técnicos específicos': 'Regularmente programamos cursos técnicos específicos para diversas áreas operacionales (ej. operación de equipos pesados, mantenimiento, geología, procesos metalúrgicos), actualizando conocimientos sobre nuevas tecnologías y metodologías. Consulte el calendario de capacitaciones en el SharePoint de Talento y Desarrollo.',

    // ======================================================================================
    // 7. Consultas Generales y Otros
    // ======================================================================================
    'consultas generales y otros': 'En esta sección encontrará información de interés general sobre MinerBot Global y opciones para consultas no resueltas.',
    'información general de la empresa': 'MinerBot Global se fundó en 1985 en Canadá, expandiendo sus operaciones a Chile en 1998 con la faena "Cerro Brillante" en Iquique. Nuestra misión es [Misión Breve de la empresa minera]. Puede encontrar más detalles sobre nuestra historia, valores, presencia global y estructura organizacional en el sitio web corporativo: [Sitio Web MinerBot Global](http://www.minerbotglobal.com)',
   'no encontré lo que buscaba': 'Lamento no haber encontrado lo que necesitas. Por favor, escribe tu consulta a continuación y me aseguraré de enviarla al equipo de RRHH para que te ayuden. Escribe "volver" para cancelar.'
};