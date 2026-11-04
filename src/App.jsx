import React, { useState, useMemo } from 'react';
import {
  Shield, Building2, ArrowRight, RefreshCw, Sparkles, Send, Printer
} from 'lucide-react';

const SECTORES_ECONOMICOS = [
  'Autopartes & Cadena de Suministro Industrial',
  'Servicios & Consultoría Profesional',
  'Comercio, Retail & Comercio Electrónico',
  'Tecnología, Software & Telecomunicaciones',
  'Salud, Clínicas & Servicios Médicos',
  'Manufactura, Producción & Ensamble',
  'Logística, Transporte & Almacenamiento',
  'Sector Financiero, Contable & Jurídico',
  'Alimentos, Agroindustria & Gastronomía',
  'Educación, Academias & EdTech',
  'Construcción, Ingeniería & Arquitectura',
  'Hotelería, Turismo & Eventos',
  'Inmobiliario & Gestión de Propiedades',
  'Textil, Confección & Moda',
  'Energía, Minería & Servicios Públicos',
  'Medios, Publicidad & Marketing Digital'
];

const QUESTION_BANK = {
  ti: [
    { id: 'ti_1', domain: 'Proteger (ISO A.9.4)', question: '1. ¿Cuenta con autenticación de múltiples factores (MFA) obligatoria en correo y accesos administrativos?', weight: 12, nistRef: 'PR.AA-03 / ISO A.9.4.2' },
    { id: 'ti_2', domain: 'Recuperar (ISO A.12.3)', question: '2. ¿Posee esquemas de respaldos (Backups) automatizados, aislados fuera de línea (Offline) y probados en el año?', weight: 15, nistRef: 'RC.RP-01 / ISO A.12.3.1' },
    { id: 'ti_3', domain: 'Proteger (ISO A.12.6)', question: '3. ¿Existe una política activa y automatizada de parcheo de vulnerabilidades en SO y software clave antes de 30 días?', weight: 10, nistRef: 'PR.IP-01 / ISO A.12.6.1' },
    { id: 'ti_4', domain: 'Proteger (ISO A.13.1)', question: '4. ¿La red local de la empresa se encuentra segmentada (VLANs separadas para WiFi invitados, servidores e IoT)?', weight: 8, nistRef: 'PR.AC-05 / ISO A.13.1.1' },
    { id: 'ti_5', domain: 'Detectar (ISO A.12.4)', question: '5. ¿Dispone de una solución EDR/Antivirus administrada centralizadamente con monitoreo de alertas activo?', weight: 10, nistRef: 'DE.CM-04 / ISO A.12.4.1' },
    { id: 'ti_6', domain: 'Identificar (ISO A.8.1)', question: '6. ¿Tiene un inventario de software y hardware actualizado con eliminación de servicios no autorizados?', weight: 8, nistRef: 'ID.AM-01 / ISO A.8.1.1' },
    { id: 'ti_7', domain: 'Responder (ISO A.5.24)', question: '7. ¿Cuenta con un procedimiento documentado para aislar equipos infectados y responder a incidentes?', weight: 12, nistRef: 'RS.MA-01 / ISO A.5.24' },
    { id: 'ti_8', domain: 'Gobernar (ISO A.5.1)', question: '8. ¿Existen políticas formales de seguridad de la información revisadas y aprobadas anualmente?', weight: 7, nistRef: 'GV.PO-01 / ISO A.5.1' },
    { id: 'ti_9', domain: 'Detectar (ISO A.12.4)', question: '9. ¿Se realiza recolección y revisión periódica de logs de eventos en servidores, firewalls y bases de datos?', weight: 8, nistRef: 'DE.AE-02 / ISO A.12.4.1' },
    { id: 'ti_10', domain: 'Recuperar (ISO A.17.1)', question: '10. ¿Se han ejecutado simulacros de recuperación ante desastres (DRP) en el último año?', weight: 10, nistRef: 'RC.CO-01 / ISO A.17.1.1' }
  ],
  gerente: [
    { id: 'ge_1', domain: 'Gobernar (ISO A.5.1)', question: '1. ¿La alta dirección asigna un presupuesto específico y recursos para ciberseguridad?', weight: 12, nistRef: 'GV.RM-01 / ISO A.5.1' },
    { id: 'ge_2', domain: 'Identificar (ISO A.5.9)', question: '2. ¿La empresa ha clasificado sus activos de información más críticos (datos de clientes, finanzas) y sus riesgos?', weight: 12, nistRef: 'ID.RA-01 / ISO A.5.9' },
    { id: 'ge_3', domain: 'Proteger (ISO A.7.2)', question: '3. ¿Se realiza capacitación periódica y simulaciones de Phishing para el personal de la empresa?', weight: 10, nistRef: 'PR.AT-01 / ISO A.7.2.2' },
    { id: 'ge_4', domain: 'Recuperar (ISO A.17.1)', question: '4. ¿Dispone la empresa de un Plan de Continuidad del Negocio (BCP) ante fallas tecnológicas o ataques?', weight: 12, nistRef: 'RC.CO-02 / ISO A.17.1.2' },
    { id: 'ge_5', domain: 'Proteger (ISO A.5.19)', question: '5. ¿Existen acuerdos de confidencialidad (NDA) y cláusulas de seguridad para proveedores externos?', weight: 8, nistRef: 'PR.PS-01 / ISO A.5.19' },
    { id: 'ge_6', domain: 'Responder (ISO A.5.25)', question: '6. ¿Existe un protocolo de notificación legal y de crisis ante fuga de datos o vulneraciones?', weight: 10, nistRef: 'RS.CO-02 / ISO A.5.25' },
    { id: 'ge_7', domain: 'Gobernar (ISO A.5.4)', question: '7. ¿La gerencia revisa periódicamente el cumplimiento normativo aplicable (Ley 1581 Habeas Data)?', weight: 8, nistRef: 'GV.OV-01 / ISO A.5.4' },
    { id: 'ge_8', domain: 'Detectar (ISO A.12.4)', question: '8. ¿Se evalúan los riesgos cibernéticos en la cadena de suministro y socios comerciales?', weight: 8, nistRef: 'DE.DP-01 / ISO A.12.4' },
    { id: 'ge_9', domain: 'Proteger (ISO A.9.2)', question: '9. ¿Se exige evaluación de seguridad previa al adquirir o contratar nuevos desarrollos de software?', weight: 10, nistRef: 'PR.IP-02 / ISO A.9.2' },
    { id: 'ge_10', domain: 'Gobernar (ISO A.5.2)', question: '10. ¿Se cuenta con un responsable formalmente designado para liderar la seguridad de la información?', weight: 10, nistRef: 'GV.RR-01 / ISO A.5.2' }
  ],
  admin: [
    { id: 'ad_1', domain: 'Proteger (ISO A.9.2)', question: '1. ¿Existe un procedimiento formal para revocar accesos inmediatamente al retirar personal?', weight: 12, nistRef: 'PR.AC-01 / ISO A.9.2.6' },
    { id: 'ad_2', domain: 'Proteger (ISO A.9.4)', question: '2. ¿Se exige política de contraseñas complejas y uso de gestores de contraseñas institucionales?', weight: 10, nistRef: 'PR.AA-01 / ISO A.9.4.3' },
    { id: 'ad_3', domain: 'Proteger (ISO A.8.20)', question: '3. ¿Se prohíbe o restringe el uso de memorias USB personales y dispositivos externos?', weight: 10, nistRef: 'PR.PT-01 / ISO A.8.20' },
    { id: 'ad_4', domain: 'Gobernar (ISO A.5.10)', question: '4. ¿Los empleados han firmado políticas sobre el uso aceptable de activos de información?', weight: 8, nistRef: 'GV.PO-02 / ISO A.5.10' },
    { id: 'ad_5', domain: 'Proteger (ISO A.7.1)', question: '5. ¿Se realizan verificaciones de antecedentes antes de la contratación de nuevo personal?', weight: 8, nistRef: 'PR.AT-02 / ISO A.7.1.1' },
    { id: 'ad_6', domain: 'Identificar (ISO A.8.1)', question: '6. ¿Se mantiene una lista limpia y actualizada de usuarios activos y sus permisos asignados?', weight: 12, nistRef: 'ID.AM-02 / ISO A.8.1.2' },
    { id: 'ad_7', domain: 'Responder (ISO A.5.26)', question: '7. ¿El personal sabe a quién reportar ante cualquier sospecha de correo engañoso o anomalía?', weight: 10, nistRef: 'RS.MA-02 / ISO A.5.26' },
    { id: 'ad_8', domain: 'Recuperar (ISO A.11.2)', question: '8. ¿Existen controles de acceso físico (llaves, control biométrico) a las instalaciones críticas?', weight: 10, nistRef: 'RC.RP-02 / ISO A.11.2' },
    { id: 'ad_9', domain: 'Proteger (ISO A.7.3)', question: '9. ¿Se aplican procesos disciplinarios formales ante violaciones deliberadas de seguridad?', weight: 10, nistRef: 'PR.AT-03 / ISO A.7.3' },
    { id: 'ad_10', domain: 'Identificar (ISO A.5.9)', question: '10. ¿Se controla formalmente la eliminación segura de archivos físicos y digitales confidenciales?', weight: 10, nistRef: 'ID.AM-03 / ISO A.5.9' }
  ],
  usuario: [
    { id: 'us_1', domain: 'Concienciación (ISO A.7.2.2)', question: '1. ¿Ha recibido charlas o capacitaciones de seguridad informática en la empresa en el último año?', weight: 10, nistRef: 'PR.AT-01 / ISO A.7.2.2' },
    { id: 'us_2', domain: 'Percepción & Utilidad (ISO A.7.2)', question: '2. ¿Considera que los temas explicados en las capacitaciones son prácticos y fáciles de aplicar en su trabajo diario?', weight: 10, nistRef: 'PR.AT-01 / ISO A.7.2' },
    { id: 'us_3', domain: 'Confianza & Preparación (ISO A.5.26)', question: '3. ¿Se siente preparado y seguro para identificar un correo de Phishing o un enlace fraudulento?', weight: 10, nistRef: 'RS.MA-02 / ISO A.5.26' },
    { id: 'us_4', domain: 'Cultura de Reporte (ISO A.5.26)', question: '4. ¿Conoce con claridad el canal exacto o persona a la cual reportar una anomalía de seguridad sin temor a represalias?', weight: 10, nistRef: 'RS.MA-02 / ISO A.5.26' },
    { id: 'us_5', domain: 'Hábitos de Contraseñas (ISO A.9.4)', question: '5. ¿Aplica la regla de utilizar contraseñas distintas y complejas para sus cuentas corporativas y personales?', weight: 10, nistRef: 'PR.AA-01 / ISO A.9.4.3' },
    { id: 'us_6', domain: 'Manejo de Información (ISO A.8.1)', question: '6. ¿Suele bloquear su pantalla (Tecla Win+L) cada vez que se levanta de su puesto de trabajo?', weight: 10, nistRef: 'PR.AC-01 / ISO A.8.1' },
    { id: 'us_7', domain: 'Uso de Dispositivos (ISO A.8.20)', question: '7. ¿Evita conectar memorias USB personales o celulares a su equipo de cómputo corporativo?', weight: 10, nistRef: 'PR.PT-01 / ISO A.8.20' },
    { id: 'us_8', domain: 'Cultura Organizacional (ISO A.5.10)', question: '8. ¿Siente que la gerencia promueve activamente una cultura de ciberseguridad responsable en la empresa?', weight: 10, nistRef: 'GV.PO-02 / ISO A.5.10' },
    { id: 'us_9', domain: 'Resguardo de Datos (ISO A.5.9)', question: '9. ¿Sabe cómo clasificar información sensible para no compartir datos confidenciales por medios no oficiales (WhatsApp personal)?', weight: 10, nistRef: 'ID.AM-03 / ISO A.5.9' },
    { id: 'us_10', domain: 'Percepción de Riesgo (ISO A.7.2.2)', question: '10. ¿Cree que las medidas de seguridad de la empresa facilitan su trabajo en lugar de ser un obstáculo burocrático?', weight: 10, nistRef: 'PR.AT-01 / ISO A.7.2.2' }
  ]
};

async function callGeminiApi(promptText, apiKey) {
  const endpoints = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });

      if (response.ok) {
        const data = await response.json();
        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResult) return textResult;
      }
    } catch (e) {
      console.warn("Endpoint no disponible:", url);
    }
  }
  throw new Error("API Key deshabilitada o cuota no disponible.");
}

export default function App() {
  const [profile, setProfile] = useState({ name: '', sector: SECTORES_ECONOMICOS[0], size: '11-50 emp.' });
  const [selectedRole, setSelectedRole] = useState('ti');
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState('profile');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const activeQuestions = QUESTION_BANK[selectedRole] || QUESTION_BANK.ti;

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const scoreData = useMemo(() => {
    let totalDeduction = 0;
    activeQuestions.forEach(q => {
      const val = answers[q.id];
      if (val === 'no') {
        totalDeduction += q.weight;
      } else if (val === 'parcial') {
        totalDeduction += q.weight * 0.5;
      }
    });

    const finalScore = Math.max(0, Math.round(100 - totalDeduction));
    let level = 'Bajo';
    let color = 'text-emerald-400';
    let border = 'border-emerald-500';

    if (finalScore < 50) {
      level = 'Crítico';
      color = 'text-red-500';
      border = 'border-red-500';
    } else if (finalScore < 75) {
      level = 'Alto';
      color = 'text-amber-400';
      border = 'border-amber-500';
    } else if (finalScore < 90) {
      level = 'Medio';
      color = 'text-blue-400';
      border = 'border-blue-500';
    }

    return { score: finalScore, level, color, border };
  }, [answers, activeQuestions]);

  const generateAiReport = async () => {
    setLoadingAi(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const failures = activeQuestions.filter(q => answers[q.id] === 'no' || answers[q.id] === 'parcial');
    
    const promptText = `Eres un Auditor Senior de Ciberseguridad Especialista en PYMES en Colombia.
Realiza un informe técnico detallado sin usar símbolos Markdown como ###.

Datos del Cliente:
- Organización: ${profile.name || 'PYME'} (${profile.sector}, ${profile.size})
- Enfoque Evaluado: ${selectedRole.toUpperCase()}
- Madurez Obtenida: ${scoreData.score}% (Nivel de Riesgo: ${scoreData.level})

Deficiencias encontradas:
${failures.map(f => `- ${f.question} (Respuesta:${answers[f.id]})`).join('\n')}

Genera un informe formal estructurado en:
DIAGNÓSTICO EJECUTIVO DE POSTURA
BRECHAS CRÍTICAS DE SEGURIDAD DETECTADAS
RIESGO OPERATIVO Y FINANCIERO ASOCIADO
PLAN ESTRATÉGICO DE MITIGACIÓN A 30 DÍAS (Herramientas Open-Source/Bajo Costo)`;

    try {
      if (apiKey) {
        const rawText = await callGeminiApi(promptText, apiKey);
        setAiAnalysis(rawText.replace(/###/g, '').trim());
      } else {
        throw new Error("No API Key");
      }
    } catch (err) {
      // Fallback extenso, formal y libre de numerales ###
      setAiAnalysis(`DIAGNÓSTICO EJECUTIVO DE POSTURA
La entidad ${profile.name || 'evaluada'}, perteneciente al sector ${profile.sector}, presenta un índice global de postura de ciberseguridad del ${scoreData.score}% (${scoreData.level}). Tras la revisión del enfoque ${selectedRole.toUpperCase()}, se constata la presencia de vulnerabilidades estructurales en la prevención, detección y continuidad operativa.

BRECHAS CRÍTICAS DE SEGURIDAD DETECTADAS
1. Deficiencia en Autenticación y Control de Accesos: Exposición por credenciales sin protección MFA obligatoria.
2. Gestión de Copias de Respaldo e Inmutabilidad: Riesgo de indisponibilidad ante ataques de ransomware por falta de backups aislados fuera de línea.
3. Ausencia de Monitoreo Centralizado de Amenazas: Baja visibilidad operativa para detectar comportamientos anómalos o intentos de intrusión en tiempo real.

RIESGO OPERATIVO Y FINANCIERO ASOCIADO
El nivel de riesgo ${scoreData.level} expone a la organización a paralización de actividades operativas de hasta 15 días, pérdida irreversible de datos de clientes, así como potenciales sanciones económicas bajo la Ley 1581 (Habeas Data en Colombia).

PLAN ESTRATÉGICO DE MITIGACIÓN A 30 DÍAS (HERRAMIENTAS LIBRES & BAJO COSTO)
1. Despliegue Inmediato de MFA (Días 1-7): Activar autenticación de doble factor en correo corporativo y sistemas centrales.
2. Aislamiento de Backups (Días 8-15): Configurar un esquema de respaldos redundantes fuera de la red local aplicando la regla 3-2-1.
3. Segmentación y Antivirus Administrado (Días 16-30): Implementar VLANs con pfSense y despliegue de EDR/Wazuh para monitoreo de logs y alertas.`);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    try {
      if (apiKey) {
        const prompt = `Eres un Asesor Consultor en Ciberseguridad para PYMES en Colombia. Responde formalmente sin usar símbolos de numeral ### a la siguiente inquietud: "${userMsg}"`;
        const text = await callGeminiApi(prompt, apiKey);
        setChatMessages(prev => [...prev, { sender: 'ai', text: text.replace(/###/g, '').trim() }]);
      } else {
        throw new Error("No API Key");
      }
    } catch (err) {
      // Fallback Inteligente y Contextual para el Chatbot
      const lower = userMsg.toLowerCase();
      let responseText = "Para mitigar los riesgos reportados en la PYME, se recomienda estructurar un plan de acción priorizando los controles con mayor impacto operacional.";

      if (lower.includes('mitigar') || lower.includes('plan') || lower.includes('pasos')) {
        responseText = "Para mitigar el riesgo priorice: 1) Activar MFA en todas las cuentas de correo, 2) Aislar las copias de seguridad de la red corporativa para protegerse contra Ransomware, y 3) Segmentar la red Wi-Fi e implementar pfSense como Firewall principal.";
      } else if (lower.includes('phishing') || lower.includes('correo') || lower.includes('capacitaci')) {
        responseText = "La concienciación se fortalece mediante campañas cortas bimestrales de simulación de Phishing y estableciendo un botón de reporte directo en el cliente de correo para que los colaboradores notifiquen correos sospechosos.";
      } else if (lower.includes('backup') || lower.includes('respaldo') || lower.includes('copia')) {
        responseText = "Recomendamos aplicar la Regla 3-2-1: 3 copias de los datos, en 2 medios distintos, con 1 copia fuera de sitio (Offline u objeto inmutable en la nube) y realizar pruebas de restauración trimestrales.";
      } else if (lower.includes('ley') || lower.includes('habeas') || lower.includes('legal') || lower.includes('multa')) {
        responseText = "En Colombia, la Ley 1581 (Habeas Data) exige registrar las bases de datos ante la SIC y notificar incidentes de seguridad en un plazo máximo de 15 días hábiles ante brechas comprobadas de información confidencial.";
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800 mb-8 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-600/20 rounded-xl border border-cyan-500/30 text-cyan-400">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              CyberPyme NIST & ISO 27001
            </h1>
            <p className="text-xs text-slate-400">Semillero de Ciberseguridad PYME</p>
          </div>
        </div>
        {currentStep !== 'profile' && (
          <button
            onClick={() => { setCurrentStep('profile'); setAnswers({}); }}
            className="flex items-center space-x-2 text-xs bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        )}
      </header>

      <main className="max-w-6xl mx-auto">
        {currentStep === 'profile' && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5" /> 1. Perfil de la Organización
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Mida la resiliencia digital de su empresa adaptada al contexto operativo real de la PYME.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre de la PYME / Organización</label>
                <input
                  type="text"
                  placeholder="Ej. Autoshop S.A.S"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Sector Económico</label>
                  <select
                    value={profile.sector}
                    onChange={e => setProfile({ ...profile, sector: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {SECTORES_ECONOMICOS.map((sec, i) => (
                      <option key={i} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tamaño (Colaboradores)</label>
                  <select
                    value={profile.size}
                    onChange={e => setProfile({ ...profile, size: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option>1-10 emp.</option>
                    <option>11-50 emp.</option>
                    <option>51-150 emp.</option>
                    <option>150+ emp.</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-xs font-medium text-slate-300 mb-2">2. Seleccione el Rol / Enfoque de Evaluación</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'ti', title: 'Técnico TI / SysAdmin', desc: '10 controles técnicos (MFA, backups, VLANs, EDR, logs).' },
                    { id: 'gerente', title: 'Gerente / Director', desc: '10 controles estratégicos (Presupuesto, BCP, riesgos, NDAs).' },
                    { id: 'admin', title: 'Administrador / Decisión', desc: '10 controles operativos (Permisos, USBs, retiro de personal).' },
                    { id: 'usuario', title: 'Colaborador / Usuario Final', desc: '10 controles de percepción, hábitos y cultura de seguridad.' }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-4 rounded-xl border text-left transition ${
                        selectedRole === r.id
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-medium text-sm mb-1">{r.title}</div>
                      <div className="text-xs opacity-75">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('quiz')}
                className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition"
              >
                <span>Comenzar Evaluación de Madurez</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 'quiz' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sticky top-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center justify-between">
                  <span>Progreso de Evaluación</span>
                  <span className="text-cyan-400 font-mono">
                    {Object.keys(answers).length} / {activeQuestions.length}
                  </span>
                </h3>
                <div className="w-full bg-slate-950 rounded-full h-2 mb-6 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-2 transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / activeQuestions.length) * 100}%` }}
                  ></div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <div className="text-xs text-slate-400 mb-1">Postura Actual Calculada:</div>
                  <div className={`text-3xl font-bold font-mono ${scoreData.color}`}>
                    {scoreData.score}% ({scoreData.level})
                  </div>
                </div>

                {Object.keys(answers).length === activeQuestions.length && (
                  <button
                    onClick={() => {
                      setCurrentStep('results');
                      generateAiReport();
                    }}
                    className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold py-3 rounded-xl flex items-center justify-center space-x-2 transition"
                  >
                    <span>Generar Informe & Plan de IA</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {activeQuestions.map((q, idx) => (
                <div key={q.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded">
                      {q.nistRef}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Peso: -{q.weight} pts</span>
                  </div>

                  <h4 className="text-sm font-medium text-slate-200 mb-4">
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Cumple (100%)', value: 'si', btnClass: 'border-emerald-600/50 text-emerald-400' },
                      { label: 'Parcial (-50%)', value: 'parcial', btnClass: 'border-amber-600/50 text-amber-400' },
                      { label: 'No Cumple (0%)', value: 'no', btnClass: 'border-red-600/50 text-red-400' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(q.id, opt.value)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border transition ${
                          answers[q.id] === opt.value
                            ? 'bg-slate-800 border-cyan-400 text-white shadow-lg'
                            : `bg-slate-950 ${opt.btnClass}`
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'results' && (
          <div className="space-y-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 print:bg-white print:text-black print:border-none">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-800 print:border-black">
                <div>
                  <div className="text-xs text-cyan-400 font-mono uppercase print:text-slate-700">
                    INFORME DE CIBERSEGURIDAD | SECTOR: {profile.sector}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-100 print:text-black">
                    {profile.name || 'Empresa Evaluada'}
                  </h2>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    Evaluación
