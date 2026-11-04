import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, Shield, AlertTriangle, CheckCircle2,
  HelpCircle, UserCheck, Building2, Users, Briefcase, ChevronRight,
  ChevronLeft, RefreshCw, Sparkles, Send, Download, FileText,
  CheckSquare, Square, BarChart3, PieChart, Layers, ArrowRight, Activity
} from 'lucide-react';

// Endpoint para Gemini API
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Banco de Preguntas Equilibrado por Dominios NIST CSF 2.0 / ISO 27001
const QUESTION_BANK = {
  ti: [
    {
      id: 'ti_1',
      domain: 'Proteger (ISO A.9/A.13)',
      question: '¿Cuenta con autenticación de múltiples factores (MFA) obligatoria en todas las cuentas de correo y accesos administrativos?',
      weight: 12,
      nistRef: 'PR.AA-03 / ISO A.9.4.2',
      explanation: 'Sin MFA, las credenciales robadas otorgan acceso total a la infraestructura.'
    },
    {
      id: 'ti_2',
      domain: 'Recuperar (ISO A.12.3)',
      question: '¿Posee un esquema automatizado de respaldos (Backups) probados periódicamente y aislados fuera de línea (Offline/Inmutables)?',
      weight: 15,
      nistRef: 'RC.RP-01 / ISO A.12.3.1',
      explanation: 'Un backup conectado al mismo dominio será encriptado por un Ransomware.'
    },
    {
      id: 'ti_3',
      domain: 'Proteger (ISO A.12.6)',
      question: '¿Existe una política activa y automatizada de parcheo de vulnerabilidades en SO y software clave antes de 30 días?',
      weight: 10,
      nistRef: 'PR.IP-01 / ISO A.12.6.1',
      explanation: 'Los atacantes explotan fallos conocidos cuya solución ya existe.'
    },
    {
      id: 'ti_4',
      domain: 'Proteger (ISO A.13.1)',
      question: '¿La red local de la empresa se encuentra segmentada (VLANs separadas para WiFi invitados, servidores, IoT y operativas)?',
      weight: 8,
      nistRef: 'PR.AC-05 / ISO A.13.1.1',
      explanation: 'La falta de segmentación permite el movimiento lateral rápido en un ataque.'
    },
    {
      id: 'ti_5',
      domain: 'Detectar (ISO A.12.4)',
      question: '¿Dispone de una solución EDR/Antivirus administrada centralizadamente con monitoreo de alertas activo?',
      weight: 10,
      nistRef: 'DE.CM-04 / ISO A.12.4.1',
      explanation: 'Los antivirus tradicionales no detectan comportamiento anómalo en memoria.'
    },
    {
      id: 'ti_6',
      domain: 'Identificar (ISO A.8.1)',
      question: '¿Tiene un inventario de software y hardware actualizado con eliminación de servicios sin uso o descontinuados?',
      weight: 8,
      nistRef: 'ID.AM-01 / ISO A.8.1.1',
      explanation: 'No se puede proteger lo que no se conoce o no se administra.'
    },
    {
      id: 'ti_7',
      domain: 'Responder (ISO A.5.24)',
      question: '¿Cuenta con un procedimiento documentado y probado para aislar equipos infectados y responder a incidentes de seguridad?',
      weight: 12,
      nistRef: 'RS.MA-01 / ISO A.5.24',
      explanation: 'La improvisación en medio de un incidente aumenta el impacto financiero y operativo.'
    },
    {
      id: 'ti_8',
      domain: 'Gobernar (ISO A.5.1)',
      question: '¿Existen políticas de seguridad de la información definidas, formalmente aprobadas y revisadas anualmente?',
      weight: 7,
      nistRef: 'GV.PO-01 / ISO A.5.1',
      explanation: 'Sin políticas claras, las medidas técnicas carecen de respaldo organizativo.'
    },
    {
      id: 'ti_9',
      domain: 'Detectar (ISO A.12.4)',
      question: '¿Se realiza recolección y revisión periódica de logs de eventos en servidores, firewalls y sistemas críticos?',
      weight: 8,
      nistRef: 'DE.AE-02 / ISO A.12.4.1',
      explanation: 'Sin registros de auditoría es imposible detectar intromisiones o realizar análisis forense.'
    },
    {
      id: 'ti_10',
      domain: 'Recuperar (ISO A.17.1)',
      question: '¿Se han ejecutado simulacros de recuperación ante desastres (DRP) en el último año para validar la continuidad operacional?',
      weight: 10,
      nistRef: 'RC.CO-01 / ISO A.17.1.1',
      explanation: 'Los respaldos no garantizan la recuperación si los procesos de restauración no han sido validados.'
    }
  ],
  gerente: [
    {
      id: 'ge_1',
      domain: 'Gobernar (ISO A.5.1)',
      question: '¿La alta dirección asigna un presupuesto específico y recursos para la gestión de riesgos de ciberseguridad?',
      weight: 15,
      nistRef: 'GV.RM-01 / ISO A.5.1',
      explanation: 'La ciberseguridad es una responsabilidad del negocio, no solo del departamento técnico.'
    },
    {
      id: 'ge_2',
      domain: 'Identificar (ISO A.5.9)',
      question: '¿La empresa ha clasificado sus activos de información más críticos (datos de clientes, finanzas, PI) y evalúa sus riesgos?',
      weight: 15,
      nistRef: 'ID.RA-01 / ISO A.5.9',
      explanation: 'Identificar el valor de la información permite priorizar las inversiones de protección.'
    },
    {
      id: 'ge_3',
      domain: 'Proteger (ISO A.7.2)',
      question: '¿Se realizan capacitaciones periódicas y simulaciones de Phishing para todo el personal de la empresa?',
      weight: 12,
      nistRef: 'PR.AT-01 / ISO A.7.2.2',
      explanation: 'El factor humano es el vector de ataque primario en el 80% de los incidentes.'
    },
    {
      id: 'ge_4',
      domain: 'Recuperar (ISO A.17.1)',
      question: '¿Dispone la empresa de un Plan de Continuidad del Negocio (BCP) para operar ante fallas tecnológicas graves?',
      weight: 15,
      nistRef: 'RC.CO-02 / ISO A.17.1.2',
      explanation: 'Garantiza la supervivencia comercial durante ataques de ransomware o desastres.'
    },
    {
      id: 'ge_5',
      domain: 'Proteger (ISO A.5.19)',
      question: '¿Existen acuerdos de confidencialidad (NDA) y cláusulas de ciberseguridad exigidas a proveedores y terceros?',
      weight: 11,
      nistRef: 'PR.PS-01 / ISO A.5.19',
      explanation: 'Los terceros representan una puerta trasera frecuente hacia la red corporativa.'
    },
    {
      id: 'ge_6',
      domain: 'Responder (ISO A.5.25)',
      question: '¿Existe un protocolo de comunicación de crisis e informe legal/regulatorio ante fuga de datos o ciberataques?',
      weight: 12,
      nistRef: 'RS.CO-02 / ISO A.5.25',
      explanation: 'No reportar brechas de datos genera sanciones legales e irreversibles daños reputacionales.'
    },
    {
      id: 'ge_7',
      domain: 'Gobernar (ISO A.5.4)',
      question: '¿La gerencia revisa periódicamente el cumplimiento normativo (protección de datos, habeas data) aplicable a la PYME?',
      weight: 10,
      nistRef: 'GV.OV-01 / ISO A.5.4',
      explanation: 'El incumplimiento normativo expone a la empresa a multas financieras considerables.'
    },
    {
      id: 'ge_8',
      domain: 'Detectar (ISO A.12.4)',
      question: '¿Se reciben informes ejecutivos periódicos sobre el estado de las alertas y la postura de riesgo cibernético?',
      weight: 10,
      nistRef: 'DE.DP-01 / ISO A.12.4',
      explanation: 'Sin visibilidad del riesgo, la toma de decisiones estratégicas se realiza a ciegas.'
    }
  ],
  admin: [
    {
      id: 'ad_1',
      domain: 'Proteger (ISO A.9.2)',
      question: '¿Existe un procedimiento formal para revocar accesos inmediatamente cuando un empleado deja la empresa?',
      weight: 15,
      nistRef: 'PR.AC-01 / ISO A.9.2.6',
      explanation: 'Cuentas huérfanas de ex-empleados son utilizadas para robos de información.'
    },
    {
      id: 'ad_2',
      domain: 'Proteger (ISO A.9.4)',
      question: '¿Se exige una política de contraseñas seguras y uso obligatorio de gestores de contraseñas institucionales?',
      weight: 12,
      nistRef: 'PR.AA-01 / ISO A.9.4.3',
      explanation: 'La reutilización de contraseñas débiles compromete múltiples sistemas corporativos.'
    },
    {
      id: 'ad_3',
      domain: 'Proteger (ISO A.8.20)',
      question: '¿Se prohíbe o restringe estrictamente el uso de memorias USB personales y dispositivos externos no autorizados?',
      weight: 12,
      nistRef: 'PR.PT-01 / ISO A.8.20',
      explanation: 'Los medios extraíbles infectados son un vector clásico de entrada de malware offline.'
    },
    {
      id: 'ad_4',
      domain: 'Gobernar (ISO A.5.10)',
      question: '¿Los empleados han firmado políticas claras sobre el uso aceptable de activos de información y equipos de cómputo?',
      weight: 10,
      nistRef: 'GV.PO-02 / ISO A.5.10',
      explanation: 'Establece el marco legal y disciplinario para el manejo de los recursos tecnológicos.'
    },
    {
      id: 'ad_5',
      domain: 'Proteger (ISO A.7.1)',
      question: '¿Se realizan verificaciones de antecedentes antes de la contratación de personal con acceso a datos sensibles?',
      weight: 11,
      nistRef: 'PR.AT-02 / ISO A.7.1.1',
      explanation: 'Previene riesgos de amenazas internas e infiltraciones en roles clave.'
    },
    {
      id: 'ad_6',
      domain: 'Identificar (ISO A.8.1)',
      question: '¿Se mantiene una lista limpia y actualizada de usuarios activos y los permisos que cada uno posee?',
      weight: 15,
      nistRef: 'ID.AM-02 / ISO A.8.1.2',
      explanation: 'El principio de menor privilegio evita accesos no autorizados a datos confidenciales.'
    },
    {
      id: 'ad_7',
      domain: 'Responder (ISO A.5.26)',
      question: '¿El personal conoce exactamente a quién contactar internamente al sospechar de un correo engañoso o virus?',
      weight: 15,
      nistRef: 'RS.MA-02 / ISO A.5.26',
      explanation: 'La alerta temprana por parte de los usuarios permite contener brechas antes de que se extiendan.'
    },
    {
      id: 'ad_8',
      domain: 'Recuperar (ISO A.11.2)',
      question: '¿Existen medidas de seguridad física (llaves, control de acceso) para resguardar los equipos e instalaciones principales?',
      weight: 10,
      nistRef: 'RC.RP-02 / ISO A.11.2',
      explanation: 'El acceso físico directo a los equipos permite eludir la mayoría de los controles lógicos.'
    }
  ]
};

export default function App() {
  const [profile, setProfile] = useState({ name: '', sector: 'Servicios & Consultoría', size: '11-50 emp.' });
  const [selectedRole, setSelectedRole] = useState('ti');
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState('profile'); // 'profile', 'quiz', 'results'
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const activeQuestions = QUESTION_BANK[selectedRole] || QUESTION_BANK.ti;

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // Cálculo del Puntaje Deductivo Ponderado
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

    return { score: finalScore, level, color, border, totalDeduction };
  }, [answers, activeQuestions]);

  // Generación de informe con la API de Gemini
  const generateAiReport = async () => {
    setLoadingAi(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    const failures = activeQuestions.filter(q => answers[q.id] === 'no' || answers[q.id] === 'parcial');
    
    const promptText = `Actúa como un Auditor Senior de Ciberseguridad especializado en PYMES en Colombia.
Analiza la siguiente evaluación realizada con estándares NIST CSF 2.0 e ISO/IEC 27001:
- Empresa: ${profile.name || 'PYME'} (${profile.sector}, ${profile.size})
- Rol Evaluado: ${selectedRole.toUpperCase()}
- Puntaje Obtenido: ${scoreData.score}% (Nivel de Riesgo: ${scoreData.level})

Controles con deficiencias detectadas:
${failures.map(f => `- ${f.question} (Respuesta: ${answers[f.id]}, Norma: ${f.nistRef})`).join('\n')}

Por favor proporciona un informe conciso y estructurado con:
1. Resumen Ejecutivo del estado de madurez de la empresa.
2. Top 3 Vulnerabilidades Críticas identificadas y el impacto directo para el negocio.
3. Plan de Acción Priorizado a Corto Plazo (0-30 días) utilizando herramientas open-source o soluciones de bajo costo para PYMES.`;

    try {
      if (!apiKey) {
        setAiAnalysis("Para habilitar el análisis en tiempo real con Inteligencia Artificial, registra tu variable VITE_GEMINI_API_KEY en Vercel.");
        setLoadingAi(false);
        return;
      }

      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setAiAnalysis(data.candidates[0].content.parts[0].text);
      } else {
        setAiAnalysis("No se pudo generar el análisis automático. Verifica la validez de tu API Key.");
      }
    } catch (err) {
      setAiAnalysis("Error al conectar con la API de Gemini. Revisa la consola o la configuración de red.");
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
      if (!apiKey) {
        setChatMessages(prev => [...prev, { sender: 'ai', text: 'Configura la variable VITE_GEMINI_API_KEY en Vercel para conversar con el asesor.' }]);
        setChatLoading(false);
        return;
      }

      const prompt = `Eres un Asesor Consultor en Ciberseguridad para PYMES. El usuario pregunta: "${userMsg}". Responde de forma clara, técnica y orientada a soluciones prácticas de bajo costo.`;

      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setChatMessages(prev => [...prev, { sender: 'ai', text: data.candidates[0].content.parts[0].text }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'ai', text: 'Lo siento, tuve un problema procesando la consulta. Intenta nuevamente.' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Error de conexión con el servicio de Inteligencia Artificial.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* Header Bar */}
      <header className="max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-600/20 rounded-xl border border-cyan-500/30 text-cyan-400">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CyberPyme NIST & ISO 27001
            </h1>
            <p className="text-xs text-slate-400">Semillero de Ciberseguridad PYME</p>
          </div>
        </div>
        {currentStep !== 'profile' && (
          <button
            onClick={() => { setCurrentStep('profile'); setAnswers({}); }}
            className="flex items-center space-x-2 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto">
        {/* Step 1: Perfil de la Organización */}
        {currentStep === 'profile' && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur">
            <h2 className="text-xl font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5" /> 1. Perfil de la Organización
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Mida la resiliencia digital de su empresa evaluando los controles críticos de las normas NIST CSF 2.0 e ISO/IEC 27001 adaptados al contexto PYME.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nombre de la PYME / Organización</label>
                <input
                  type="text"
                  placeholder="Ej. Soluciones Logísticas S.A.S"
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
                    <option>Servicios & Consultoría</option>
                    <option>Comercio & Retail</option>
                    <option>Tecnología & Software</option>
                    <option>Salud & Servicios Médicos</option>
                    <option>Manufactura e Industria</option>
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
                <label className="block text-xs font-medium text-slate-300 mb-2">2. Seleccione el Rol de Evaluación</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'ti', title: 'Técnico TI / SysAdmin', desc: 'MFA, backups, parches, VLANs, EDR y logs.' },
                    { id: 'gerente', title: 'Gerente / Director', desc: 'Presupuesto, BCP, riesgos y proveedores.' },
                    { id: 'admin', title: 'Administrador / Toma Decisión', desc: 'Permisos, contraseñas, USBs y capacitación.' }
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

        {/* Step 2: Cuestionario Dinámico */}
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
                  <div className="text-xs text-slate-400 mb-1">Postura Calculada Actual:</div>
                  <div className={`text-2xl font-bold font-mono ${scoreData.color}`}>
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
                <div key={q.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded">
                      {q.nistRef}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Peso: -{q.weight} pts</span>
                  </div>

                  <h4 className="text-sm font-medium text-slate-200 mb-2">
                    {idx + 1}. {q.question}
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">{q.explanation}</p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Cumple (100%)', value: 'si', btnClass: 'border-emerald-600/50 hover:bg-emerald-950/40 text-emerald-400' },
                      { label: 'Parcial (-50%)', value: 'parcial', btnClass: 'border-amber-600/50 hover:bg-amber-950/40 text-amber-400' },
                      { label: 'No Cumple (0%)', value: 'no', btnClass: 'border-red-600/50 hover:bg-red-950/40 text-red-400' }
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

        {/* Step 3: Resultados e IA */}
        {currentStep === 'results' && (
          <div className="space-y-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                <div>
                  <div className="text-xs text-cyan-400 font-mono uppercase tracking-wider mb-1">
                    Informe NIST CSF 2.0 & ISO 27001 | PYME: {profile.name || 'Evaluada'}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-100">Postura General de Ciberseguridad</h2>
                </div>
                <div className={`text-right p-4 rounded-xl bg-slate-950 border ${scoreData.border}`}>
                  <div className="text-xs text-slate-400">PUNTAJE FINAL</div>
                  <div className={`text-3xl font-extrabold font-mono ${scoreData.color}`}>
                    {scoreData.score}%
                  </div>
                  <div className="text-xs font-medium text-slate-300">Nivel de Riesgo: {scoreData.level}</div>
                </div>
              </div>

              {/* Diagnóstico con Inteligencia Artificial */}
              <div className="mt-6 bg-slate-950 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Análisis Diagnóstico Inteligente (Gemini IA)
                </h3>
                {loadingAi ? (
                  <div className="flex items-center space-x-3 text-slate-400 text-sm py-4">
                    <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                    <span>Auditando brechas y generando recomendaciones personalizadas...</span>
                  </div>
                ) : (
                  <div className="text-xs md:text-sm text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                    {aiAnalysis}
                  </div>
                )}
              </div>
            </div>

            {/* Chatbot Asesor Integrado */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Consultar al Asesor de IA del Semillero
              </h3>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto space-y-3 mb-4">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">
                    Haga preguntas sobre cómo implementar estas soluciones en su PYME.
                  </p>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md p-3 rounded-xl text-xs ${
                        msg.sender === 'user'
                          ? 'bg-cyan-600 text-slate-950 font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-200'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="text-xs text-slate-500 flex items-center space-x-2">
                    <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                    <span>El asesor está respondiendo...</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escriba su inquietud técnica o de gestión..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-4 py-2.5 rounded-xl flex items-center justify-center transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
