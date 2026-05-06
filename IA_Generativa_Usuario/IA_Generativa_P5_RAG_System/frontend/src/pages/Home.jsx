import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Monitor, Users, BarChart2, Bot, Download } from 'lucide-react';
import api, { ingestTextDocument } from '../lib/api';
import './Home.css';

const TEMPLATES = [
  {
    id: 'legal',
    Icon: Scale,
    name: 'Asesor Legal',
    description: 'Consulta contratos, normativas y documentos jurídicos con precisión.',
    instructions:
      'Eres un asistente legal experto. Responde exclusivamente con base en los documentos proporcionados. Cita siempre el fragmento relevante. Si no encuentras información suficiente, indícalo claramente. No des consejos jurídicos que no estén respaldados por los documentos disponibles. Usa un tono formal y preciso.',
    sampleDocs: [
      {
        filename: 'Contrato de Servicios Profesionales.txt',
        content: `CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES

Entre las partes: EMPRESA CONTRATANTE S.L. (en adelante "el Cliente") y CONSULTORÍA JURÍDICA NEXUS S.L. (en adelante "el Proveedor").

CLÁUSULA 1 – OBJETO DEL CONTRATO
El Proveedor se compromete a prestar servicios de asesoría legal en materia mercantil, laboral y fiscal durante el período comprendido entre el 1 de enero de 2024 y el 31 de diciembre de 2024.

CLÁUSULA 2 – HONORARIOS Y FORMA DE PAGO
Los honorarios mensuales acordados son de 2.500 € más IVA (21%), pagaderos dentro de los primeros 5 días hábiles de cada mes mediante transferencia bancaria. Pasado dicho plazo, se aplicará un interés de demora del 1,5% mensual sobre el importe pendiente.

CLÁUSULA 3 – CONFIDENCIALIDAD
El Proveedor se obliga a mantener estricta confidencialidad sobre toda la información a la que tenga acceso en el ejercicio de sus funciones. Esta obligación permanecerá vigente durante 5 años tras la finalización del contrato. El incumplimiento de esta cláusula facultará al Cliente a reclamar daños y perjuicios.

CLÁUSULA 4 – PROPIEDAD INTELECTUAL
Todos los informes, dictámenes y documentos elaborados por el Proveedor en el marco de este contrato serán propiedad exclusiva del Cliente una vez abonados los honorarios correspondientes.

CLÁUSULA 5 – RESOLUCIÓN DEL CONTRATO
Cualquiera de las partes podrá resolver el contrato con un preaviso mínimo de 30 días naturales mediante comunicación escrita. En caso de incumplimiento grave, la parte perjudicada podrá resolver el contrato de forma inmediata, con derecho a reclamar daños y perjuicios.

CLÁUSULA 6 – RESPONSABILIDAD
La responsabilidad máxima del Proveedor por cualquier reclamación derivada de este contrato quedará limitada al importe total de los honorarios abonados en los últimos 12 meses anteriores al evento causante del daño.

CLÁUSULA 7 – JURISDICCIÓN Y LEY APLICABLE
Las partes se someten expresamente a los Juzgados y Tribunales de Madrid para resolver cualquier controversia derivada de este contrato. El contrato se regirá por la legislación española.

Firmado en Madrid, a 1 de enero de 2024.`,
      },
      {
        filename: 'Política de Protección de Datos.txt',
        content: `POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES
Versión 2.0 | Enero 2024

1. RESPONSABLE DEL TRATAMIENTO
NEXUS GROUP S.L., con CIF B-12345678 y domicilio en Calle Alcalá 100, 28009 Madrid, es el responsable del tratamiento de los datos personales recogidos a través de sus servicios.

2. DATOS QUE SE TRATAN
Tratamos los siguientes categorías de datos: datos identificativos (nombre, apellidos, DNI/NIF), datos de contacto (email, teléfono, dirección postal), datos profesionales (empresa, cargo, sector) y datos de navegación (IP, cookies, logs de acceso).

3. FINALIDAD Y BASE LEGAL
Los datos se tratan para las siguientes finalidades:
- Gestión de la relación contractual (base legal: ejecución del contrato)
- Envío de comunicaciones comerciales propias (base legal: interés legítimo o consentimiento)
- Cumplimiento de obligaciones legales (base legal: obligación legal)
- Mejora de servicios mediante análisis estadístico (base legal: interés legítimo)

4. CONSERVACIÓN DE DATOS
Los datos se conservarán durante la vigencia de la relación contractual y, una vez finalizada, durante los plazos legalmente exigidos: 6 años para datos fiscales y contables (Ley General Tributaria), 4 años para datos laborales (Estatuto de los Trabajadores) y 3 años para datos de comunicaciones comerciales.

5. DERECHOS DE LOS INTERESADOS
Los interesados pueden ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad enviando solicitud a privacidad@nexusgroup.com o por correo postal, adjuntando copia del DNI.

6. TRANSFERENCIAS INTERNACIONALES
No se realizan transferencias de datos a terceros países fuera del Espacio Económico Europeo, salvo cuando sea necesario para la prestación del servicio contratado y con las garantías adecuadas previstas en el RGPD.

7. DELEGADO DE PROTECCIÓN DE DATOS
Puede contactar con nuestro DPD en: dpo@nexusgroup.com`,
      },
    ],
  },
  {
    id: 'it',
    Icon: Monitor,
    name: 'Soporte IT',
    description: 'Resuelve dudas técnicas a partir de manuales y guías de producto.',
    instructions:
      'Eres un técnico de soporte IT experto. Responde únicamente con información extraída de los documentos del asistente. Proporciona pasos claros y numerados cuando des instrucciones. Si el problema no aparece en la documentación, indícalo y sugiere escalar el caso. Sé conciso y directo.',
    sampleDocs: [
      {
        filename: 'Manual VPN Corporativa.txt',
        content: `MANUAL DE USUARIO – ACCESO VPN CORPORATIVA
Versión 3.2 | Departamento TI | Actualización: Febrero 2024

1. INTRODUCCIÓN
La VPN corporativa permite a los empleados acceder de forma segura a los recursos internos de la empresa desde cualquier ubicación. El cliente VPN utilizado es GlobalProtect de Palo Alto Networks.

2. INSTALACIÓN

2.1 Windows
- Descarga el instalador desde el portal interno: intranet.empresa.com/vpn
- Ejecuta el archivo GlobalProtect.msi con permisos de administrador
- Introduce el portal: vpn.empresa.com cuando se solicite
- Reinicia el equipo tras la instalación

2.2 macOS
- Descarga el paquete .pkg desde el portal interno
- Instala siguiendo el asistente de instalación
- En Preferencias del Sistema > Seguridad, permite la extensión del sistema si se solicita

3. CONEXIÓN
1. Abre la aplicación GlobalProtect
2. Haz clic en "Conectar"
3. Introduce tu usuario corporativo (sin @empresa.com)
4. Introduce tu contraseña de Active Directory
5. Si está habilitado el MFA, acepta la solicitud en tu móvil (app Microsoft Authenticator)

4. SOLUCIÓN DE PROBLEMAS

Error "No se puede conectar al portal":
- Verifica tu conexión a internet
- Comprueba que ningún firewall local bloquea el puerto 443
- Desactiva temporalmente el antivirus y vuelve a intentarlo
- Contacta con HelpDesk si el error persiste: helpdesk@empresa.com / Ext. 1234

Error "Credenciales incorrectas":
- Usa el usuario sin el dominio (sin @empresa.com)
- Comprueba que tu contraseña no ha caducado en el portal de autoservicio: password.empresa.com
- Tras 5 intentos fallidos la cuenta queda bloqueada; contacta con HelpDesk

Velocidad lenta:
- Selecciona el servidor más cercano en Configuración > Servidor preferido
- Cierra aplicaciones que consuman mucho ancho de banda durante la sesión
- Para trabajo intensivo con archivos grandes, conéctate desde la oficina

5. POLÍTICA DE USO
- La VPN debe desconectarse al finalizar la jornada laboral
- Está prohibido el uso de la VPN para actividades no relacionadas con el trabajo
- Todo el tráfico a través de la VPN es monitoreado según la política de seguridad corporativa

6. CONTACTO Y SOPORTE
HelpDesk TI: helpdesk@empresa.com | Teléfono: Ext. 1234
Horario de soporte: Lunes a Viernes, 8:00 – 20:00`,
      },
      {
        filename: 'Guía de Configuración de Email Corporativo.txt',
        content: `GUÍA DE CONFIGURACIÓN – EMAIL CORPORATIVO
Departamento TI | Versión 2.1 | Marzo 2024

1. DATOS DE CONFIGURACIÓN
Servidor entrante (IMAP): mail.empresa.com | Puerto: 993 | SSL: Activado
Servidor saliente (SMTP): smtp.empresa.com | Puerto: 587 | TLS: Activado
Tu dirección de email: nombre.apellido@empresa.com
Contraseña: la misma que usas para acceder al ordenador (Active Directory)

2. CONFIGURACIÓN EN OUTLOOK (Windows)
1. Abre Outlook y ve a Archivo > Agregar cuenta
2. Introduce tu email corporativo y pulsa Conectar
3. Selecciona IMAP cuando se solicite el tipo de cuenta
4. Introduce los datos del servidor indicados en el apartado 1
5. Pulsa Conectar e introduce tu contraseña cuando se solicite
6. Activa la autenticación en dos pasos si el sistema lo requiere

3. CONFIGURACIÓN EN APPLE MAIL (macOS/iOS)
1. Ve a Configuración > Mail > Cuentas > Agregar cuenta > Otra
2. Introduce nombre, email y contraseña
3. Configura el servidor IMAP con los datos del apartado 1
4. Configura el servidor SMTP con los datos del apartado 1

4. LÍMITES Y POLÍTICAS
- Tamaño máximo de adjunto por email: 25 MB
- Cuota de buzón: 50 GB por usuario
- Los emails se archivan automáticamente tras 2 años en la carpeta "Archivo"
- Está prohibido usar el email corporativo para comunicaciones personales o comerciales no autorizadas

5. PROBLEMAS FRECUENTES
No puedo enviar emails: Verifica que el servidor SMTP y el puerto son correctos. Asegúrate de que TLS está activado.
No recibo emails: Comprueba la carpeta de spam. Verifica que el servidor IMAP es correcto.
Contraseña incorrecta: Usa el portal de autoservicio password.empresa.com para restablecerla.

6. SOPORTE
Para cualquier incidencia: helpdesk@empresa.com o Ext. 1234`,
      },
    ],
  },
  {
    id: 'rrhh',
    Icon: Users,
    name: 'Políticas RRHH',
    description: 'Responde sobre políticas internas, onboarding y normativa laboral.',
    instructions:
      'Eres un asistente de recursos humanos. Responde sobre políticas internas, beneficios, normativa laboral y procesos de la empresa, basándote estrictamente en los documentos disponibles. Si una política no está documentada, indícalo. Mantén un tono cercano y profesional.',
    sampleDocs: [
      {
        filename: 'Política de Teletrabajo.txt',
        content: `POLÍTICA DE TELETRABAJO
Vigente desde: 1 de marzo de 2024 | Versión: 2.1

1. OBJETO Y ÁMBITO
Esta política regula el trabajo a distancia en la empresa, aplicable a todos los empleados con contrato indefinido o temporal superior a 6 meses que hayan superado el período de prueba.

2. ELEGIBILIDAD
Pueden acogerse al teletrabajo los empleados que cumplan:
- Mínimo 6 meses de antigüedad en la empresa
- Haber superado satisfactoriamente la última evaluación de desempeño
- Disponer de un espacio de trabajo adecuado en el domicilio
- Contar con la aprobación explícita de su responsable directo
Los puestos de atención presencial, producción y almacén quedan excluidos.

3. MODALIDADES
- Teletrabajo parcial: hasta 3 días por semana, con mínimo 2 días de presencia en oficina
- Teletrabajo total temporal: hasta 4 semanas al año, previa solicitud y aprobación

4. PROCEDIMIENTO DE SOLICITUD
1. Completa el formulario FO-RRHH-047 disponible en el portal del empleado
2. El responsable directo aprueba o deniega en un máximo de 5 días hábiles
3. RRHH valida y formaliza el acuerdo de teletrabajo
4. El acuerdo tiene validez de 12 meses y debe renovarse anualmente

5. EQUIPAMIENTO Y COMPENSACIÓN
La empresa proporciona: portátil corporativo, licencias de software y acceso VPN.
El empleado asume: conexión a internet, luz y climatización.
Compensación mensual por gastos: 30 €, sujeta a revisión anual.

6. DISPONIBILIDAD
El empleado en teletrabajo debe:
- Estar disponible en el horario laboral pactado
- Responder comunicaciones en máximo 30 minutos durante horario laboral
- Asistir presencialmente con preaviso mínimo de 24 horas cuando el responsable lo requiera

7. SEGURIDAD
- Usar siempre la VPN corporativa para acceder a recursos internos
- Prohibido trabajar desde redes WiFi públicas sin VPN
- Los documentos confidenciales no pueden imprimirse en el domicilio

8. REVOCACIÓN
La empresa puede revocar el acuerdo con preaviso de 15 días por: incumplimiento de esta política, necesidades organizativas o rendimiento insuficiente.`,
      },
      {
        filename: 'Plan de Onboarding Nuevos Empleados.txt',
        content: `PLAN DE ONBOARDING – NUEVOS EMPLEADOS
Departamento de RRHH | Versión 3.0 | Enero 2024

1. ANTES DEL PRIMER DÍA
- RRHH envía email de bienvenida con información práctica (horario, lugar, persona de contacto) 3 días antes de la incorporación
- TI prepara el equipo informático, credenciales de acceso y licencias de software
- El responsable directo asigna un compañero mentor para las primeras 4 semanas

2. SEMANA 1 – INTEGRACIÓN
Día 1:
- Recepción por parte de RRHH: firma de contrato, entrega de equipamiento, alta en sistemas
- Tour por las instalaciones y presentación al equipo
- Reunión inicial con el responsable directo: objetivos del período de prueba y expectativas

Días 2-5:
- Formación sobre herramientas corporativas (email, VPN, intranet, plataformas internas)
- Lectura y firma de las políticas internas obligatorias (seguridad, protección de datos, código de conducta)
- Reuniones de presentación con los equipos con los que colaborará habitualmente

3. SEMANAS 2-4 – INMERSIÓN
- Incorporación progresiva a las tareas del puesto con supervisión del mentor
- Reunión semanal de seguimiento con el responsable directo (30 min.)
- Acceso completo a todos los sistemas y herramientas necesarias

4. MES 2-3 – AUTONOMÍA
- Trabajo autónomo con disponibilidad del mentor para consultas puntuales
- Evaluación de desempeño al finalizar el mes 3 (previa a confirmación del período de prueba)
- Encuesta de satisfacción sobre el proceso de onboarding

5. BENEFICIOS DESDE EL PRIMER DÍA
- Seguro médico privado (cobertura individual, extensible a familia con coste adicional)
- Ticket restaurante: 11 € por día trabajado
- Acceso a plataforma de formación online (más de 5.000 cursos disponibles)
- Descuentos en gimnasios colaboradores

6. CONTACTO RRHH
Portal del empleado: intranet.empresa.com/rrhh
Email: rrhh@empresa.com | Ext. 2000`,
      },
    ],
  },
  {
    id: 'finance',
    Icon: BarChart2,
    name: 'Analista Financiero',
    description: 'Analiza informes, balances y documentos contables.',
    instructions:
      'Eres un analista financiero. Responde preguntas sobre informes financieros, balances, KPIs y documentos contables usando exclusivamente la información disponible. Proporciona cifras concretas cuando las encuentres. Si no tienes datos suficientes, indícalo claramente. Usa un tono técnico y preciso.',
    sampleDocs: [
      {
        filename: 'Informe Financiero Q1 2024.txt',
        content: `INFORME FINANCIERO TRIMESTRAL – Q1 2024
Empresa: NEXO TECHNOLOGIES S.A. | Período: Enero – Marzo 2024

RESUMEN EJECUTIVO
El primer trimestre de 2024 muestra resultados positivos, con un crecimiento de ingresos del 18% respecto al mismo período del año anterior. El EBITDA ajustado alcanzó los 3,2 M€, situando el margen EBITDA en el 22%, en línea con los objetivos anuales.

CUENTA DE RESULTADOS (en miles de €)
Ingresos totales: 14.800 (vs 12.542 Q1 2023, +18,0%)
  - Licencias de software: 8.200 (55% del total)
  - Servicios profesionales: 4.100 (28% del total)
  - Soporte y mantenimiento: 2.500 (17% del total)

Costes operativos: 11.600
  - Personal: 7.200 (49% sobre ingresos)
  - Infraestructura cloud: 1.800
  - Marketing y ventas: 1.400
  - Gastos generales y administración: 1.200

EBITDA: 3.200 | Margen EBITDA: 21,6%
Amortizaciones y depreciaciones: 480
EBIT: 2.720 | Margen EBIT: 18,4%
Resultado financiero neto: -120
Beneficio antes de impuestos (BAI): 2.600
Impuesto sobre beneficios (25%): 650
Beneficio neto: 1.950 | Margen neto: 13,2%

BALANCE DE SITUACIÓN A 31/03/2024 (en miles de €)
ACTIVO
  Activo corriente: 12.400
    - Tesorería y equivalentes: 6.800
    - Clientes y deudores comerciales: 4.200
    - Otros activos corrientes: 1.400
  Activo no corriente: 8.600
    - Inmovilizado intangible (software capitalizado): 5.200
    - Inmovilizado material neto: 2.100
    - Activos por derecho de uso (NIIF 16): 1.300
  TOTAL ACTIVO: 21.000

PASIVO Y PATRIMONIO NETO
  Pasivo corriente: 5.800
    - Proveedores y acreedores: 2.100
    - Deuda financiera a corto plazo: 1.500
    - Otras deudas y provisiones: 2.200
  Pasivo no corriente: 4.200
    - Deuda financiera a largo plazo: 3.500
    - Otros pasivos no corrientes: 700
  Patrimonio neto: 11.000
    - Capital social: 3.000
    - Reservas acumuladas: 6.050
    - Resultado del ejercicio: 1.950
  TOTAL PASIVO Y PATRIMONIO NETO: 21.000

KPIs DE NEGOCIO
  - ARR (Annual Recurring Revenue): 52,4 M€ (+22% YoY)
  - NRR (Net Revenue Retention): 118%
  - CAC (Coste de Adquisición de Cliente): 8.200 €
  - LTV (Lifetime Value medio): 42.000 €
  - Ratio LTV/CAC: 5,1x
  - Churn rate mensual: 0,8%
  - Clientes activos: 1.247 (+187 vs Q1 2023)
  - Plantilla: 312 empleados (vs 265 Q1 2023, +18%)
  - Ingresos por empleado (anualizado): 189.700 €

PERSPECTIVAS Q2 2024
Se espera un crecimiento de ingresos del 15-20% respecto a Q2 2023, impulsado por el lanzamiento del módulo de IA previsto para mayo. El pipeline de ventas se sitúa en 18,5 M€, con tasa de conversión histórica del 28%.`,
      },
      {
        filename: 'Presupuesto Anual 2024.txt',
        content: `PRESUPUESTO ANUAL 2024
NEXO TECHNOLOGIES S.A. | Aprobado por el Consejo de Administración el 15/12/2023

OBJETIVOS ESTRATÉGICOS 2024
1. Alcanzar un ARR de 65 M€ (+24% vs cierre 2023)
2. Mantener el margen EBITDA por encima del 20%
3. Lanzar el módulo de IA en Q2 y captar 150 nuevos clientes con este producto
4. Reducir el churn mensual de 1,1% a 0,7%
5. Expandirse a mercados de Francia e Italia (apertura de oficinas en Q3)

INGRESOS PRESUPUESTADOS 2024 (en miles de €)
Total ingresos: 62.000
  - Licencias de software: 34.100 (55%)
  - Servicios profesionales: 17.360 (28%)
  - Soporte y mantenimiento: 10.540 (17%)
Crecimiento esperado vs 2023: +22%

GASTOS PRESUPUESTADOS 2024 (en miles de €)
Total gastos operativos: 49.600
  - Personal (incluyendo 47 nuevas contrataciones): 30.440 (49% s/ ingresos)
  - Infraestructura cloud y licencias tecnológicas: 7.440
  - Marketing y ventas: 6.200
  - I+D (desarrollo módulo IA): 3.720
  - Gastos generales y administración: 1.800

EBITDA presupuestado: 12.400 | Margen: 20,0%
Inversiones (CAPEX): 4.200
  - Desarrollo de software capitalizable: 2.800
  - Equipamiento oficinas Francia e Italia: 900
  - Otros: 500

HITOS FINANCIEROS CLAVE
Q1: Ingresos >14,5 M€ | EBITDA >3,0 M€
Q2: Lanzamiento módulo IA | Ingresos >15,5 M€
Q3: Apertura oficinas internacionales | Ingresos >15,8 M€
Q4: Ingresos >16,2 M€ | Cierre ARR >65 M€

POLÍTICA DE DIVIDENDOS
El Consejo ha aprobado no distribuir dividendos en 2024 y destinar el beneficio neto a reservas para financiar la expansión internacional.`,
      },
    ],
  },
];

export default function Home() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/assistants', { name, description, instructions });
      window.location.href = `/assistant/${res.data.id}`;
    } catch (err) {
      console.error(err);
      alert('Error creando asistente');
    } finally {
      setLoading(false);
    }
  };

  const importTemplate = async (template) => {
    setImportingId(template.id);
    try {
      const res = await api.post('/assistants', {
        name: template.name,
        description: template.description,
        instructions: template.instructions,
      });
      const assistantId = res.data.id;
      for (const doc of template.sampleDocs) {
        await ingestTextDocument(assistantId, doc.filename, doc.content);
      }
      window.location.href = `/assistant/${assistantId}`;
    } catch (err) {
      console.error(err);
      alert('Error importando plantilla. Asegúrate de que el backend y las API keys están configuradas.');
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <span className="section-eyebrow">⚡ Inicio rápido</span>
        <p className="section-title">Plantillas de asistente</p>
        <p className="section-subtitle">
          Preconfigurados con instrucciones y documentos de muestra. Importa, sube tus docs y listo.
        </p>
        <div className="templates-grid">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="template-card">
              <div className="template-icon">
                <t.Icon size={20} />
              </div>
              <p className="template-name">{t.name}</p>
              <p className="template-desc">{t.description}</p>
              <p className="template-docs-hint">{t.sampleDocs.length} doc{t.sampleDocs.length > 1 ? 's' : ''} incluidos</p>
              <button
                className="btn btn-primary import-btn"
                onClick={() => importTemplate(t)}
                disabled={importingId === t.id}
              >
                {importingId === t.id ? (
                  'Importando...'
                ) : (
                  <><Download size={13} /> Importar</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider">o crea uno desde cero</div>

      <div className="form-container glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del asistente</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Asesor Legal Autónomos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción breve</label>
            <input
              type="text"
              className="input"
              placeholder="¿Qué hace este asistente?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Instrucciones (system prompt)</label>
            <textarea
              className="textarea"
              rows="5"
              placeholder="Eres un experto legal. Responde formalmente y con precisión..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Creando...' : <><Bot size={18} /> Crear asistente</>}
          </button>
        </form>
      </div>
    </div>
  );
}
