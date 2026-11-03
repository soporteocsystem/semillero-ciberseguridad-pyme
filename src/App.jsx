import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, ShieldAlert, Shield, AlertTriangle, CheckCircle2, 
  HelpCircle, UserCheck, Building2, Users, Briefcase, ChevronRight, 
  ChevronLeft, RefreshCw, Sparkles, Send, Download, FileText, 
  CheckSquare, Square, BarChart3, PieChart, Layers, ArrowRight, Activity
} from 'lucide-react';

// API Key injection mechanism handled directly via Gemini endpoints
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

// Question Bank aligned with NIST CSF 2.0 & ISO/IEC 27001 Annex A (A.5-A.8)
const QUESTION_BANK = {
  ti: [
    {
      id: 'ti_1',
      domain: 'Proteger (ISO A.9/A.13)',
      question: '¿Cuenta con autenticación de múltiples factores (MFA) obligatoria en todas las cuentas de correo y accesos administrativos?',
      weight: 8,
      nistRef: 'PR.AA-03 / ISO A.9.4.2',
      explanation: 'Sin MFA, las credenciales robadas otorgan acceso total a la infraestructura.'
    },
    {
      id: 'ti_2',
      domain: 'Proteger (ISO A.12)',
      question: '¿Posee un esquema automatizado de respaldos (Backups) probados periódicamente y aislados fuera de línea (Offline/Immutables)?',
      weight: 10,
      nistRef: 'PR.DS-11 / ISO A.12.3.1',
      explanation: 'Un backup conectado al mismo dominio será encriptado por un Ransomware.'
    },
    {
      id: 'ti_3',
      domain: 'Proteger (ISO A.12.6)',
      question: '¿Existe una política activa y automatizada de parcheo de vulnerabilidades en SO y software clave antes de 30 días?',
      weight: 7,
      nistRef: 'PR.IP-01 / ISO A.12.6.1',
      explanation: 'Los atacantes explotan fallos conocidos cuya solución ya existe.'
    },
    {
      id: 'ti_4',
      domain: 'Proteger (ISO A.13.1)',
      question: '¿La red local de la empresa se encuentra segmentada (VLANs separadas para WiFi invitados, servidores, IoT y operativas)?',
      weight: 6,
      nistRef: 'PR.AC-05 / ISO A.13.1.1',
      explanation: 'La falta de segmentación permite el movimiento lateral rápido en un ataque.'
    },
    {
      id: 'ti_5',
      domain: 'Detectar (ISO A.12.4)',
      question: '¿Dispone de una solución EDR/Antivirus administrada centralizadamente con monitoreo de alertas activo?',
      weight: 8,
      nistRef: 'DE.CM-04 / ISO A.12.4.1',
      explanation: 'Los antivirus tradicionales no detectan comportamiento anómalo ni ejecuciones script en memoria.'
    },
    {
      id: 'ti_6',
      domain: 'Recuperar (ISO A.17)',
      question: '¿Tiene un inventario de software y hardware actualizado con eliminación de servicios sin uso o descontinuados?',
      weight: 5,
      nistRef: 'ID.AM-01 / ISO A.8.1.1',
      explanation: 'No se puede proteger lo que no se conoce.'
    }
  ],
  gerencial: [
    {
      id: 'ger_1',
      domain: 'Identificar (ISO A.5)',
      question: '¿La empresa cuenta con una Política Integrada de Seguridad de la Información aprobada por la gerencia y revisada al menos 1 vez al año?',
      weight: 8,
      nistRef: 'GV.PO-01 / ISO A.5.1',
      explanation: 'La ciberseguridad requiere respaldo institucional formal para exigir cumplimiento.'
    },
    {
      id: 'ger_2',
      domain: 'Identificar (ISO A.5.24)',
      question: '¿Dispone de un Plan formal de Continuidad del Negocio (BCP) e Incidentes cibernéticos probado al menos una vez al año?',
      weight: 10,
      nistRef: 'RS.MA-01 / ISO A.5.24',
      explanation: 'Saber responder bajo estrés evita pérdidas financieras catastróficas y multas.'
    },
    {
      id: 'ger_3',
      domain: 'Identificar (ISO A.5.19)',
      question: '¿Evalúa formalmente los riesgos de ciberseguridad de proveedores externos (software, contabilidad, soporte TI)?',
      weight: 7,
      nistRef: 'ID.RA-03 / ISO A.5.19',
      explanation: 'Muchas PYMES sufren ataques a través de las credenciales de sus proveedores.'
    },
    {
      id: 'ger_4',
      domain: 'Identificar (ISO A.5.7)',
      question: '¿Asigna un presupuesto anual específico destinado a licenciamiento, herramientas y formación en ciberseguridad?',
      weight: 6,
      nistRef: 'GV.RM-01 / ISO A.5.7',
      explanation: 'La falta de presupuesto congela la madurez operativa e incrementa la deuda técnica.'
    },
    {
      id: 'ger_5',
      domain: 'Responder (ISO A.5.25)',
      question: '¿Tiene definidos legal e internamente los procedimientos de notificación a autoridades y clientes en caso de fuga de datos?',
      weight: 7,
      nistRef: 'RS.CO-02 / ISO A.5.25',
      explanation: 'Leyes como Ley 1581 (Habeas Data) en Colombia imponen severas sanciones por incumplir notificación.'
    },
    {
      id: 'ger_6',
      domain: 'Identificar (ISO A.5.1)',
      question: '¿Existe una matriz formal de clasificación de la información (Confidencial, Interna, Pública)?',
      weight: 6,
      nistRef: 'ID.AM-05 / ISO A.8.2',
      explanation: 'Evita la exposición accidental de datos críticos de clientes o nómina.'
    }
  ],
  operativo: [
    {
      id: 'ope_1',
      domain: 'Proteger (ISO A.7.2)',
      question: '¿Los empleados reciben capacitaciones prácticas en Phishing y prueba de concienciación al menos cada 6 meses?',
      weight: 9,
      nistRef: 'PR.AT-01 / ISO A.7.2.2',
      explanation: 'El factor humano es el vector número 1 de entrada para los ciberdelincuentes.'
    },
    {
      id: 'ope_2',
      domain: 'Proteger (ISO A.7.3)',
      question: '¿Está estrictamente prohibido y bloqueado por técnica el uso de memorias USB personales en los equipos de trabajo?',
      weight: 6,
      nistRef: 'PR.PT-01 / ISO A.7.10',
      explanation: 'Las USBs son un canal ágil de fuga de información e infección aislada.'
    },
    {
      id: 'ope_3',
      domain: 'Proteger (ISO A.9)',
      question: '¿Utilizan gestores de contraseñas corporativos y prohíben reutilizar claves o anotarlas en papeles/hojas de cálculo?',
      weight: 7,
      nistRef: 'PR.AC-01 / ISO A.9.4.3',
      explanation: 'La mala higiene de contraseñas vulnera incluso las plataformas más seguras.'
    },
    {
      id: 'ope_4',
      domain: 'Proteger (ISO A.8.1)',
      question: '¿Al desvincular a un empleado se revocan el 100% de los accesos a correos, carpetas y sistemas el mismo día?',
      weight: 9,
      nistRef: 'PR.AC-04 / ISO A.8.1.3',
      explanation: 'Cuentas huérfanas de ex-empleados son utilizadas para sabotaje o robo masivo.'
    },
    {
      id: 'ope_5',
      domain: 'Proteger (ISO A.7.4)',
      question: '¿Se aplica la regla de "Escritorio Limpio y Pantalla Bloqueada" automáticamente tras 3-5 minutos de inactividad?',
      weight: 5,
      nistRef: 'PR.IP-03 / ISO A.7.7',
      explanation: 'Protege contra la filtración de datos de física o por terceros/visitantes.'
    },
    {
      id: 'ope_6',
      domain: 'Proteger (ISO A.8.20)',
      question: '¿Existen políticas de control para el trabajo remoto/híbrido (uso exclusivo de portátiles corporativos y conexión por VPN)?',
      weight: 8,
      nistRef: 'PR.AC-03 / ISO A.8.20',
      explanation: 'Dispositivos personales (BYOD) desprotegidos comprometen la red empresarial.'
    }
  ]
};

export default function App() {
  // App States
  const [step, setStep] = useState('welcome'); // 'welcome', 'questions', 'results'
  const [profile, setProfile] = useState({
    name: '',
    sector: 'Servicios',
    employees: '11-50',
    role: 'ti' // 'ti', 'gerencial', 'operativo'
  });

  const [answers, setAnswers] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [checklist, setChecklist] = useState({});

  const currentQuestions = QUESTION_BANK[profile.role] || QUESTION_BANK.ti;

  // Deductive Scoring Engine (Starts at 100%)
  const scoreMetrics = useMemo(() => {
    let score = 100;
    const domainScores = {
      'Identificar (ISO A.5)': { max: 0, lost: 0 },
      'Proteger (ISO A.7/A.8/A.9/A.12/A.13)': { max: 0, lost: 0 },
      'Detectar (ISO A.12.4)': { max: 0, lost: 0 },
      'Responder (ISO A.5.25)': { max: 0, lost: 0 },
      'Recuperar (ISO A.17)': { max: 0, lost: 0 }
    };

    currentQuestions.forEach(q => {
      const ans = answers[q.id] || 'si'; // Default assumed Compliant until answered
      const domainKey = Object.keys(domainScores).find(d => q.domain.startsWith(d.split(' ')[0])) || 'Proteger (ISO A.7/A.8/A.9/A.12/A.13)';

      if (!domainScores[domainKey]) {
        domainScores[domainKey] = { max: 0, lost: 0 };
      }

      domainScores[domainKey].max += q.weight;

      if (ans === 'no') {
        score -= q.weight;
        domainScores[domainKey].lost += q.weight;
      } else if (ans === 'parcial') {
        score -= (q.weight * 0.5);
        domainScores[domainKey].lost += (q.weight * 0.5);
      }
    });

    const finalScore = Math.max(0, Math.round(score));
    
    let riskLevel = { label: 'Bajo', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (finalScore < 50) {
      riskLevel = { label: 'Crítico', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    } else if (finalScore < 75) {
      riskLevel = { label: 'Alto', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    } else if (finalScore < 90) {
      riskLevel = { label: 'Medio', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    }

    return { finalScore, riskLevel, domainScores };
  }, [answers, currentQuestions]);

  // Handle Question Answer Select
  const handleAnswerChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // Trigger Gemini AI Report Generation
  const generateAiReport = async () => {
    setLoadingAi(true);
    const failedQuestions = currentQuestions.filter(q => answers[q.id] === 'no' || answers[q.id] === 'parcial');
    
    const prompt = `
      Actúa como un Auditor Senior de Ciberseguridad ISO 27001 y NIST CSF 2.0 especializado en acompañar PYMEs en Colombia y América Latina.
      Genera un informe técnico-ejecutivo en JSON estricto estructurado para la PYME "${profile.name || 'Empresa Evaluada'}" (Sector: ${profile.sector}, Empleados: ${profile.employees}), evaluada por un rol de: ${profile.role.toUpperCase()}.
      
      Puntaje Final: ${scoreMetrics.finalScore}% / 100% (Nivel de Riesgo: ${scoreMetrics.riskLevel.label}).

      Fallas identificadas:
      ${failedQuestions.map(q => `- ${q.question} (Estado: ${answers[q.id]}, Norma: ${q.nistRef}, Peso: ${q.weight} pts)`).join('\n')}

      Responde ÚNICAMENTE en formato JSON plano sin bloques de marcas de formato (\`\`\`json ...) con la siguiente estructura:
      {
        "diagnosticoEjecutivo": "Resumen conciso (max 150 palabras) sobre la postura de riesgo de la PYME.",
        "brechasCriticas": [
          { "norma": "NIST/ISO", "hallazgo": "Descripción corta", "impacto": "Consecuencia operativa/financiera" }
        ],
        "planAccion": {
          "cortoPlazo": [
            { "tarea": "Actividad prioritaria (1-30 días)", "herramientaRecomendada": "Herramienta costo-efectiva o u OpenSource recomendada", "normaTarget": "ISO/NIST" }
          ],
          "medianoPlazo": [
            { "tarea": "Actividad estratégica (30-90 días)", "herramientaRecomendada": "Recomendación práctica", "normaTarget": "ISO/NIST" }
          ],
          "largoPlazo": [
            { "tarea": "Consolidación (90+ días)", "herramientaRecomendada": "Recomendación", "normaTarget": "ISO/NIST" }
          ]
        },
        "consejoClave": "Un mensaje motivador final enfocado en la cultura organizacional."
      }
    `;

    try {
      const res = await fetch(`${GEMINI_API_URL}?key=`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        setAiAnalysis(parsed);
        // Init checklist items
        const initialChecklist = {};
        let idCounter = 0;
        ['cortoPlazo', 'medianoPlazo', 'largoPlazo'].forEach(fase => {
          parsed.planAccion?.[fase]?.forEach(item => {
            initialChecklist[`task_${idCounter++}`] = false;
          });
        });
        setChecklist(initialChecklist);
      }
    } catch (err) {
      console.error("Error al conectar con Gemini:", err);
      // Fallback object if offline or error
      setAiAnalysis({
        diagnosticoEjecutivo: "Evaluación completada. Se detectaron varias oportunidades de mejora en el control de accesos y respaldos.",
        brechasCriticas: [
          { norma: "ISO 27001 / NIST", hallazgo: "Ausencia de MFA o Plan de Contingencia formal.", impacto: "Exposición a ransomware y suplantación de identidad." }
        ],
        planAccion: {
          cortoPlazo: [{ tarea: "Implementar autenticación MFA en correos empresariales", herramientaRecomendada: "Google Authenticator / Microsoft Authenticator (Gratuito)", normaTarget: "PR.AA-03" }],
          medianoPlazo: [{ tarea: "Establecer respaldos offline semanales", herramientaRecomendada: "Veeam Community / Restic (Open Source)", normaTarget: "PR.DS-11" }],
          largoPlazo: [{ tarea: "Realizar simulacros de phishing y concienciación", herramientaRecomendada: "GoPhish (Open Source)", normaTarget: "PR.AT-01" }]
        },
        consejoClave: "La seguridad es un proceso continuo. Priorice los controles de mayor peso técnico."
      });
    } finally {
      setLoadingAi(false);
    }
  };

  // Interactive AI Assistant Chat
  const handleSendChatMessage = async (e) => {
    e?.preventDefault();
    if (!userQuery.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user', text: userQuery }];
    setChatMessages(newMessages);
    setUserQuery('');
    setLoadingChat(true);

    const promptChat = `
      Eres el Asesor Virtual de Ciberseguridad de este Semillero PYME.
      Postura de la empresa: Puntaje ${scoreMetrics.finalScore}%, Riesgo ${scoreMetrics.riskLevel.label}, Rol del usuario: ${profile.role}.
      Pregunta del usuario: "${userQuery}"
      
      Responde de forma concisa, práctica y profesional orientada a la PYME sin tecnicismos excesivos. Sugiere soluciones de bajo presupuesto.
    `;

    try {
      const res = await fetch(`${GEMINI_API_URL}?key=`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptChat }] }]
        })
      });

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, tuve un problema procesando la consulta. Intenta nuevamente.";
      setChatMessages([...newMessages, { sender: 'ai', text: reply }]);
    } catch (err) {
      setChatMessages([...newMessages, { sender: 'ai', text: "Error de conexión con la IA de asistencia." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleFinishQuestions = () => {
    setStep('results');
    generateAiReport();
  };

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                CyberPyme NIST & ISO 27001
              </h1>
              <span className="text-xs text-cyan-400 font-mono">Semillero de Ciberseguridad</span>
            </div>
          </div>

          {step !== 'welcome' && (
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400">Postura Actual</div>
                <div className={`font-mono text-sm font-bold ${scoreMetrics.riskLevel.color}`}>
                  {scoreMetrics.finalScore}% ({scoreMetrics.riskLevel.label})
                </div>
              </div>
              <button 
                onClick={() => { setStep('welcome'); setAnswers({}); setAiAnalysis(null); }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* STEP 1: WELCOME & PROFILING */}
        {step === 'welcome' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Diagnóstico Asistido con Inteligencia Artificial</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Evaluador de Madurez Tecnológica y Ciberseguridad
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                Mida la resiliencia digital de su empresa. Asumiendo un **100% de postura ideal**, evalúe los controles críticos de las normas **NIST CSF 2.0** e **ISO/IEC 27001** adaptados al contexto de su rol.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <span>1. Perfil de la Organización</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Nombre de la PYME / Organización</label>
                  <input
                    type="text"
                    placeholder="Ej. Soluciones Logísticas S.A.S"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Sector Económico</label>
                  <select
                    value={profile.sector}
                    onChange={(e) => setProfile({ ...profile, sector: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                  >
                    <option value="Servicios">Servicios & Consultoría</option>
                    <option value="Comercio / Retail">Comercio / E-commerce</option>
                    <option value="Salud">Salud & Salud Digital</option>
                    <option value="Financiero / Fintech">Financiero / Fintech</option>
                    <option value="Manufactura">Manufactura / Industrial</option>
                    <option value="Tecnología">Tecnología & Software</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Tamaño de la Empresa (Colaboradores)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['1-10', '11-50', '51-150', '150+'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setProfile({ ...profile, employees: range })}
                        className={`py-2 text-xs rounded-lg font-medium border transition ${
                          profile.employees === range 
                            ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-950' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {range} emp.
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-3 flex items-center space-x-2 pt-4">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <span>2. Seleccione su Rol / Enfoque de Evaluación</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Role TI */}
                <div
                  onClick={() => setProfile({ ...profile, role: 'ti' })}
                  className={`cursor-pointer border rounded-2xl p-4 transition duration-200 relative overflow-hidden flex flex-col justify-between ${
                    profile.role === 'ti' 
                      ? 'bg-slate-850 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Técnico TI / SysAdmin</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Enfoque operativo detallado: arquitectura, parches, backups, MFA, segmentación y logs.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                    <span>Ver 6 preguntas técnicas</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Role Gerente */}
                <div
                  onClick={() => setProfile({ ...profile, role: 'gerencial' })}
                  className={`cursor-pointer border rounded-2xl p-4 transition duration-200 relative overflow-hidden flex flex-col justify-between ${
                    profile.role === 'gerencial' 
                      ? 'bg-slate-850 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-400">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Gerente / Director</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Enfoque estratégico: cumplimiento, políticas, presupuesto, BCP y gestión de riesgos.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-blue-400 font-semibold">
                    <span>Ver 6 preguntas estratégicas</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Role Operativo */}
                <div
                  onClick={() => setProfile({ ...profile, role: 'operativo' })}
                  className={`cursor-pointer border rounded-2xl p-4 transition duration-200 relative overflow-hidden flex flex-col justify-between ${
                    profile.role === 'operativo' 
                      ? 'bg-slate-850 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="p-3 w-fit rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Administrador / Toma de Decisión</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Enfoque organizacional: concienciación, contraseñas, USBs, baja de personal y proveedores.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-indigo-400 font-semibold">
                    <span>Ver 6 preguntas operativas</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('questions')}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center justify-center space-x-2 text-base mt-4"
              >
                <span>Comenzar Evaluación de Madurez</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DEDUCTIVE ASSESSMENT WIZARD */}
        {step === 'questions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Live Deductive Gauge */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-20 space-y-6">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Cálculo de Madurez Deductiva</span>
                <h3 className="text-xl font-bold text-white mt-1">Nivel de Postura Actual</h3>
              </div>

              {/* Gauge Meter */}
              <div className="flex flex-col items-center justify-center relative py-4">
                <div className="w-44 h-44 rounded-full border-8 border-slate-800 flex items-center justify-center relative shadow-inner">
                  <svg className="w-full h-full absolute inset-0 transform -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-slate-800"
                      fill="transparent"
                    />
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={477}
                      strokeDashoffset={477 - (477 * scoreMetrics.finalScore) / 100}
                      strokeLinecap="round"
                      className={`transition-all duration-500 ${
                        scoreMetrics.finalScore >= 75 
                          ? 'text-emerald-500' 
                          : scoreMetrics.finalScore >= 50 
                          ? 'text-amber-500' 
                          : 'text-rose-500'
                      }`}
                      fill="transparent"
                    />
                  </svg>
                  <div className="text-center z-10">
                    <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                      {scoreMetrics.finalScore}%
                    </span>
                    <span className="block text-xs text-slate-400 font-medium mt-1">de 100% Inicial</span>
                  </div>
                </div>

                <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold border ${scoreMetrics.riskLevel.bg} ${scoreMetrics.riskLevel.color} ${scoreMetrics.riskLevel.border}`}>
                  Riesgo Global: {scoreMetrics.riskLevel.label}
                </div>
              </div>

              {/* Domain deduction status */}
              <div className="space-y-3 border-t border-slate-800 pt-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Desglose por Dominio NIST/ISO</h4>
                {Object.entries(scoreMetrics.domainScores).map(([dom, val]) => (
                  <div key={dom} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 truncate max-w-[200px]">{dom}</span>
                      <span className="text-rose-400 font-mono">
                        {val.lost > 0 ? `-${val.lost} pts` : '100%'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${val.lost > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(0, 100 - (val.lost * 5))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Cada respuesta parcial o no cumplida descuenta puntos según la criticidad del control en NIST e ISO 27001.</span>
              </div>
            </div>

            {/* Right Column: Question List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Cuestionario de Diagnóstico</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Evaluando como: <span className="text-cyan-400 font-semibold uppercase">{profile.role}</span> | Empresa: {profile.name || 'PYME'}
                    </p>
                  </div>
                  <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700">
                    {Object.keys(answers).length} / {currentQuestions.length} Respondidas
                  </span>
                </div>

                <div className="space-y-6">
                  {currentQuestions.map((q, idx) => {
                    const currentAns = answers[q.id] || 'si';
                    return (
                      <div 
                        key={q.id}
                        className={`p-5 rounded-2xl border transition ${
                          currentAns === 'no' 
                            ? 'bg-rose-950/10 border-rose-900/40' 
                            : currentAns === 'parcial'
                            ? 'bg-amber-950/10 border-amber-900/40'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-slate-700">
                                {q.nistRef}
                              </span>
                              <span className="text-xs font-semibold text-slate-400">
                                Descuento: -{q.weight} pts
                              </span>
                            </div>
                            <h4 className="font-semibold text-white text-sm sm:text-base pt-1">
                              {idx + 1}. {q.question}
                            </h4>
                            <p className="text-xs text-slate-400 pt-1 leading-relaxed">
                              💡 <strong className="text-slate-300">Riesgo Asociado:</strong> {q.explanation}
                            </p>
                          </div>
                        </div>

                        {/* Options Buttons */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                          <button
                            type="button"
                            onClick={() => handleAnswerChange(q.id, 'si')}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition border ${
                              currentAns === 'si'
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Cumple (100%)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAnswerChange(q.id, 'parcial')}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition border ${
                              currentAns === 'parcial'
                                ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-950'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Parcial (-50%)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAnswerChange(q.id, 'no')}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition border ${
                              currentAns === 'no'
                                ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-950'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>No Cumple (0%)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
                  <button
                    onClick={() => setStep('welcome')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center space-x-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Atrás</span>
                  </button>

                  <button
                    onClick={handleFinishQuestions}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center space-x-2"
                  >
                    <span>Generar Informe & Plan de IA</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: RESULTS DASHBOARD & IA ROADMAP */}
        {step === 'results' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header / Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono px-3 py-1 rounded-full">
                      Informe NIST CSF 2.0 & ISO 27001
                    </span>
                    <span className="text-xs text-slate-400">| PYME: {profile.name || 'Sin Nombre'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Postura General de Ciberseguridad
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
                    Basado en las respuestas del perfil <strong className="text-slate-200 uppercase">{profile.role}</strong>, la empresa conserva el siguiente porcentaje de madurez:
                  </p>
                </div>

                <div className="flex items-center space-x-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Puntaje Final</div>
                    <div className={`text-4xl font-extrabold font-mono ${scoreMetrics.riskLevel.color}`}>
                      {scoreMetrics.finalScore}%
                    </div>
                  </div>
                  <div className="h-10 w-px bg-slate-800" />
                  <div className="text-center">
                    <div className="text-xs text-slate-400 uppercase font-semibold">Nivel Riesgo</div>
                    <div className={`text-sm font-bold mt-1 px-3 py-0.5 rounded-full border ${scoreMetrics.riskLevel.bg} ${scoreMetrics.riskLevel.color} ${scoreMetrics.riskLevel.border}`}>
                      {scoreMetrics.riskLevel.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Imprimir / Exportar PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Postura Ciberseguridad PYME: ${scoreMetrics.finalScore}% - Riesgo: ${scoreMetrics.riskLevel.label}`);
                      alert('Resumen copiado al portapapeles');
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Copiar Resumen</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  Semillero de Ciberseguridad PYMEs &copy; 2026
                </div>
              </div>
            </div>

            {/* AI Diagnostics Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-cyan-600/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Análisis Diagnóstico Inteligente (Gemini IA)</h3>
                  <p className="text-xs text-slate-400">Generado en tiempo real evaluando las brechas reportadas</p>
                </div>
              </div>

              {loadingAi ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-sm text-slate-400 font-medium">Analizando brechas de seguridad con Inteligencia Artificial...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-6 pt-2">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed">
                    <p className="font-semibold text-cyan-400 mb-1">Resumen del Auditor:</p>
                    {aiAnalysis.diagnosticoEjecutivo}
                  </div>

                  {/* Critical gaps table */}
                  {aiAnalysis.brechasCriticas?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Brechas Críticas Prioritarias</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {aiAnalysis.brechasCriticas.map((b, idx) => (
                          <div key={idx} className="bg-slate-950/70 border border-rose-900/30 p-3.5 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between text-rose-400 font-mono">
                              <span>{b.norma}</span>
                              <span className="font-bold">Prioridad Alta</span>
                            </div>
                            <div className="text-slate-200 font-semibold">{b.hallazgo}</div>
                            <div className="text-slate-400">{b.impacto}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Implementation Roadmap */}
                  <div className="space-y-4 border-t border-slate-800 pt-6">
                    <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <span>Plan de Actividades Iniciales (Hoja de Ruta PYME)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Corto Plazo */}
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-emerald-400 font-mono">Fase 1: Corto Plazo</span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">1-30 Días</span>
                        </div>
                        <div className="space-y-3">
                          {aiAnalysis.planAccion?.cortoPlazo?.map((item, idx) => {
                            const itemKey = `task_cp_${idx}`;
                            return (
                              <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                                <div className="flex items-start space-x-2">
                                  <button onClick={() => toggleChecklist(itemKey)} className="mt-0.5 text-cyan-400">
                                    {checklist[itemKey] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                                  </button>
                                  <span className={`font-medium ${checklist[itemKey] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {item.tarea}
                                  </span>
                                </div>
                                <div className="bg-slate-950 p-2 rounded text-[11px] text-cyan-300 font-mono">
                                  🛠️ {item.herramientaRecomendada}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mediano Plazo */}
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-amber-400 font-mono">Fase 2: Mediano Plazo</span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">30-90 Días</span>
                        </div>
                        <div className="space-y-3">
                          {aiAnalysis.planAccion?.medianoPlazo?.map((item, idx) => {
                            const itemKey = `task_mp_${idx}`;
                            return (
                              <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                                <div className="flex items-start space-x-2">
                                  <button onClick={() => toggleChecklist(itemKey)} className="mt-0.5 text-cyan-400">
                                    {checklist[itemKey] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                                  </button>
                                  <span className={`font-medium ${checklist[itemKey] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {item.tarea}
                                  </span>
                                </div>
                                <div className="bg-slate-950 p-2 rounded text-[11px] text-amber-300 font-mono">
                                  🛠️ {item.herramientaRecomendada}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Largo Plazo */}
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-blue-400 font-mono">Fase 3: Largo Plazo</span>
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">90+ Días</span>
                        </div>
                        <div className="space-y-3">
                          {aiAnalysis.planAccion?.largoPlazo?.map((item, idx) => {
                            const itemKey = `task_lp_${idx}`;
                            return (
                              <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
                                <div className="flex items-start space-x-2">
                                  <button onClick={() => toggleChecklist(itemKey)} className="mt-0.5 text-cyan-400">
                                    {checklist[itemKey] ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                                  </button>
                                  <span className={`font-medium ${checklist[itemKey] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                    {item.tarea}
                                  </span>
                                </div>
                                <div className="bg-slate-950 p-2 rounded text-[11px] text-blue-300 font-mono">
                                  🛠️ {item.herramientaRecomendada}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {aiAnalysis.consejoClave && (
                    <div className="bg-cyan-950/30 border border-cyan-800/40 p-4 rounded-xl text-xs text-cyan-200 italic">
                      💬 "{aiAnalysis.consejoClave}"
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* AI Assistant Interactive Chat Widget */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Consultar al Asesor de IA del Semillero</h3>
                    <p className="text-xs text-slate-400">Haga preguntas sobre cómo implementar estas soluciones en su PYME</p>
                  </div>
                </div>
              </div>

              {/* Chat History Box */}
              <div className="h-48 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                {chatMessages.length === 0 ? (
                  <div className="text-slate-500 text-center py-10">
                    Pregunte cosas como: "¿Cómo configuro MFA gratuito en Google Workspace?" o "¿Qué herramientas Open Source puedo usar para backups?"
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl ${
                        msg.sender === 'user' 
                          ? 'bg-cyan-600 text-white rounded-br-none' 
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {loadingChat && (
                  <div className="text-slate-400 italic text-xs flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>El asesor de IA está redactando la respuesta...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escriba su inquietud técnica o de gestión..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                />
                <button
                  type="submit"
                  disabled={loadingChat}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
