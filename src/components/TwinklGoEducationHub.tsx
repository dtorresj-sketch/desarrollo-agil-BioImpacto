import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  Star, 
  Heart, 
  Trophy, 
  Puzzle, 
  Stethoscope, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Printer, 
  Check, 
  User, 
  Brain, 
  ChevronRight,
} from 'lucide-react';
import { ContaminantProfile, ContaminantId } from '../types';
import { soundFX } from '../utils/audio';

interface TwinklGoEducationHubProps {
  contaminant: ContaminantProfile;
  onSelectContaminant: (id: ContaminantId) => void;
  onNavigateToDiorama: () => void;
}

// -------------------------------------------------------------
// Activity 1: Trophic Chain Puzzle Items
// -------------------------------------------------------------
interface TrophicSlot {
  id: string;
  name: string;
  icon: string;
  expectedOrder: number;
  description: string;
  bcfFactor: string;
}

const INITIAL_TROPHIC_ITEMS: TrophicSlot[] = [
  { id: 'water', name: 'Agua del Río (Efluente Industrial)', icon: '🏭', expectedOrder: 1, description: 'Concentración base liberada por fundición (0.001 - 0.003 ppm)', bcfFactor: '1x (Base)' },
  { id: 'phytoplankton', name: 'Fitoplancton & Algas Fotosintéticas', icon: '🌿', expectedOrder: 2, description: 'Absorción por difusión pasiva y quelación en pared celular', bcfFactor: '250x BCF' },
  { id: 'small_fish', name: 'Alevines & Peces Forrajeros (Presas)', icon: '🐟', expectedOrder: 3, description: 'Ingestión activa de zooplancton contaminado', bcfFactor: '1,200x BCF' },
  { id: 'large_fish', name: 'Trucha Fario Depredadora (PEST)', icon: '🦈', expectedOrder: 4, description: 'Biomagnificación por consumo de presas y acumulación muscular', bcfFactor: '8,500x BMF' },
  { id: 'human', name: 'Ser Humano (Consumidor Cúspide)', icon: '👤', expectedOrder: 5, description: 'Fijación en órganos diana con vida media de hasta 70 días', bcfFactor: 'Dosis Acumulada' }
];

// -------------------------------------------------------------
// Activity 2: Metal vs Target Organ Matching Pairs
// -------------------------------------------------------------
interface MatchCard {
  id: string;
  type: 'metal' | 'organ';
  pairId: string;
  title: string;
  symbol?: string;
  subtitle: string;
  icon: string;
  color: string;
}

const MATCH_CARDS: MatchCard[] = [
  { id: 'm-hg', type: 'metal', pairId: 'hg', title: 'Metilmercurio', symbol: 'CH₃Hg⁺', subtitle: 'Atraviesa Barrera Hematoencefálica', icon: '⚡', color: 'from-amber-600 to-yellow-500' },
  { id: 'o-hg', type: 'organ', pairId: 'hg', title: 'Cerebro & SNC', subtitle: 'Ataxia, temblores, disartria (Células de Purkinje)', icon: '🧠', color: 'from-purple-600 to-indigo-500' },

  { id: 'm-pb', type: 'metal', pairId: 'pb', title: 'Plomo', symbol: 'Pb²⁺', subtitle: 'Sustituto catiónico del Calcio Ca²⁺', icon: '💀', color: 'from-blue-600 to-cyan-500' },
  { id: 'o-pb', type: 'organ', pairId: 'pb', title: 'Huesos & Médula Ósea', subtitle: 'Inhibe ALAD y síntesis del grupo Hemo (Anemia)', icon: '🦴', color: 'from-slate-600 to-slate-400' },

  { id: 'm-cd', type: 'metal', pairId: 'cd', title: 'Cadmio', symbol: 'Cd²⁺', subtitle: 'Afinidad con metalotioneína renal', icon: '☣️', color: 'from-emerald-600 to-teal-500' },
  { id: 'o-cd', type: 'organ', pairId: 'cd', title: 'Túbulo Renal Proximal', subtitle: 'Proteinuria de bajo peso molecular y calciuria', icon: '🫘', color: 'from-rose-600 to-orange-500' },

  { id: 'm-as', type: 'metal', pairId: 'as', title: 'Arsénico', symbol: 'As³⁺', subtitle: 'Desacopla la fosforilación oxidativa', icon: '⚠️', color: 'from-purple-600 to-pink-500' },
  { id: 'o-as', type: 'organ', pairId: 'as', title: 'Piel & Vías Digestivas', subtitle: 'Hiperqueratosis palmoplantar y "gotas de lluvia"', icon: '🖐️', color: 'from-amber-700 to-yellow-600' }
];

// -------------------------------------------------------------
// Activity 3: Twinkl Go Multiple-Choice Quiz Questions
// -------------------------------------------------------------
interface QuizQuestion {
  id: number;
  question: string;
  options: { id: string; text: string; correct: boolean; explanation: string }[];
  funFact: string;
  imageHint?: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '¿Por qué la concentración de metilmercurio es mucho mayor en una Trucha Fario adulta que en el agua del río donde nada?',
    options: [
      { id: 'a', text: 'Porque el agua del río evapora el metal rápidamente.', correct: false, explanation: 'Incorrecto. El metal no se evapora del agua líquida.' },
      { id: 'b', text: 'Por biomagnificación: acumula el metal de cientos de presas y su tasa de excreción es muy lenta.', correct: true, explanation: '¡Correcto! El mercurio se une a grupos sulfhidrilo (-SH) musculares y se concentra en cada nivel trófico sucesivo.' },
      { id: 'c', text: 'Porque el pez respira metales pesados en lugar de oxígeno.', correct: false, explanation: 'Incorrecto. Los peces extraen O₂ mediante sus branquias, pero absorben los iones por difusión y alimento.' }
    ],
    funFact: '💡 En la cúspide trófica marina, la concentración de contaminantes liposolubles puede multiplicarse por más de 100.000 veces respecto al agua ambiental.'
  },
  {
    id: 2,
    question: '¿Qué agente quelante médico es el fármaco de elección para tratar la intoxicación aguda por Plomo o Cadmio?',
    options: [
      { id: 'a', text: 'Paracetamol o Ibuprofeno en dosis altas.', correct: false, explanation: 'Incorrecto. Los analgésicos no tienen capacidad de formar complejos quelatos con metales divalentes.' },
      { id: 'b', text: 'EDTA Cálcico Disódico o DMSA (Ácido Dimercaptosuccínico).', correct: true, explanation: '¡Excelente! Los agentes quelantes poseen ligandos que atrapan al ion metálico formando un anillo heterocíclico hidrosoluble excretable en orina.' },
      { id: 'c', text: 'Suero fisiológico únicamente.', correct: false, explanation: 'Incorrecto. El suero hidrata pero no remueve los iones metálicos intracelulares.' }
    ],
    funFact: '💡 La palabra "quelación" proviene del griego "chele", que significa pinza de cangrejo, por la forma en que atrapa al metal.'
  },
  {
    id: 3,
    question: 'En el histórico caso de la Bahía de Minamata (Japón, 1956), ¿qué proceso transformó el mercurio inorgánico en su forma neurotóxica letal?',
    options: [
      { id: 'a', text: 'Metilación biológica por bacterias anaerobias sulfato-reductoras en el sedimento marino.', correct: true, explanation: '¡Correcto! Las bacterias transforman Hg²⁺ en metilmercurio (CH₃Hg⁺), que es liposoluble y atraviesa la barrera hematoencefálica humana.' },
      { id: 'b', text: 'La luz solar directa calentó el agua hasta crear gas mostaza.', correct: false, explanation: 'Incorrecto. La fotólisis no genera metilmercurio; es una biotransformación microbiana.' },
      { id: 'c', text: 'Los peces sintetizaron el mercurio como mecanismo de defensa.', correct: false, explanation: 'Incorrecto. Los peces son víctimas bioacumuladoras, no productores.' }
    ],
    funFact: '💡 El metilmercurio se une a la L-cisteína, mimetizando el aminoácido metionina, lo que le permite engañar al transportador LAT1 de la barrera hematoencefálica.'
  },
  {
    id: 4,
    question: 'En Chile, ¿qué zona costera ha sido declarada emblemática por la presencia de metales pesados (As, Cu, Pb) derivados de fundiciones y termoeléctricas?',
    options: [
      { id: 'a', text: 'Bahía de Quintero - Puchuncaví (Complejo Ventanas).', correct: true, explanation: '¡Correcto! La Bahía de Quintero-Puchuncaví ha presentado históricos episodios de contaminación por efluentes y material particulado de fundición de cobre.' },
      { id: 'b', text: 'Torres del Paine en la Patagonia.', correct: false, explanation: 'Incorrecto. Torres del Paine es una reserva natural protegida sin fundiciones industriales.' },
      { id: 'c', text: 'Isla de Pascua (Rapa Nui).', correct: false, explanation: 'Incorrecto. Rapa Nui no posee industrias metalúrgicas.' }
    ],
    funFact: '💡 En la Región de Valparaíso, los planes de descontaminación actuales exigen filtros electrostáticos y plantas de ácido sulfúrico con eficiencias superiores al 95%.'
  }
];

// -------------------------------------------------------------
// Activity 4: Clinical & Environmental Decision Simulator Cases
// -------------------------------------------------------------
interface CaseScenario {
  id: string;
  title: string;
  patientProfile: string;
  labReport: string;
  symptoms: string[];
  options: {
    name: string;
    actionType: 'correct' | 'suboptimal' | 'wrong';
    outcome: string;
    scoreChange: number;
  }[];
}

const CLINICAL_CASES: CaseScenario[] = [
  {
    id: 'case-1',
    title: 'Caso Clínico 1: Pescador de Río con Trastornos Motores',
    patientProfile: 'Hombre de 54 años, residente junto a río receptor de fundición, consume trucha fresca 5 veces por semana.',
    labReport: 'Sangre: 48 µg/L de Mercurio total (Valor normal < 5 µg/L). Orina: Elevada excreción de mercapturatos.',
    symptoms: ['Parestesias en extremidades', 'Temblor intencional distal', 'Constricción concéntrica del campo visual (visión en túnel)', 'Disartria progresiva'],
    options: [
      { name: 'Administrar Quelante DMSA (Ácido Dimercaptosuccínico) + Cese Inmediato de Dieta de Pescado', actionType: 'correct', outcome: '¡Éxito Clínico! El DMSA cruza las membranas celulares, quelando el CH₃Hg⁺ y aumentando su eliminación renal en un 600%. El paciente recupera progresivamente la coordinación motora.', scoreChange: 3 },
      { name: 'Prescribir Reposo en Cama y Vitamina C Oral únicamente', actionType: 'suboptimal', outcome: 'Respuesta Insuficiente. La vitamina C es un antioxidante útil pero no quelará la carga metálica intracelular en el SNC.', scoreChange: 1 },
      { name: 'Recomendar Aumentar el Consumo de Pescado para Obtener Omega-3', actionType: 'wrong', outcome: '¡Grave Error Iatrogénico! Aumentar el pescado incrementaría exponencialmente la dosis letal acumulada en el cerebro.', scoreChange: -2 }
    ]
  },
  {
    id: 'case-2',
    title: 'Caso Ecológico 2: Crisis de Efluentes en Fundición Fluvial',
    patientProfile: 'Comunidad costera aguas abajo de la fundición detecta mortandad de alevines y pH del agua en 5.2.',
    labReport: 'Monitoreo de Agua: 0.085 ppm de Cadmio y 0.12 ppm de Plomo en el punto de vertido.',
    symptoms: ['Sedimento fluvial color pardo oscuro', 'Alevines flotando en orillas', 'Alerta sanitaria para pozos de agua potable'],
    options: [
      { name: 'Implementar Reactor de Precipitación Química con Cal Apagada (Ca(OH)₂) + Filtro de Zeolitas 98%', actionType: 'correct', outcome: '¡Solución de Ingeniería Exitosa! La cal neutraliza el pH y precipita los iones Cd²⁺ y Pb²⁺ como hidróxidos insolubles, mientras las zeolitas adsorben los restos finales. El agua retorna a parámetros OMS.', scoreChange: 3 },
      { name: 'Diluir el Efluente Agregando Más Agua Potable del Río', actionType: 'wrong', outcome: 'Infracción Ambiental ("La dilución no es la solución"). La carga másica tóxica continúa llegando al ecosistema y bioacumulándose.', scoreChange: -2 },
      { name: 'Pintar el Tubo de Vertido con Resina Epóxica Externa', actionType: 'wrong', outcome: 'Inútil. Pintar el exterior no altera la composición química de los metales disueltos en el efluente interior.', scoreChange: -2 }
    ]
  }
];

export const TwinklGoEducationHub: React.FC<TwinklGoEducationHubProps> = ({
  contaminant,
  onNavigateToDiorama
}) => {
  // Activity Tabs: 'trophic_puzzle' | 'card_match' | 'quiz_challenge' | 'clinical_sim' | 'real_cases' | 'certificate'
  const [activeTab, setActiveTab] = useState<'trophic_puzzle' | 'card_match' | 'quiz_challenge' | 'clinical_sim' | 'real_cases' | 'certificate'>('trophic_puzzle');

  // Gamification State
  const [studentName, setStudentName] = useState<string>('Estudiante de Ciencias');
  const [totalScore, setTotalScore] = useState<number>(0);
  const [stars, setStars] = useState<number>(3);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [speechActive, setSpeechActive] = useState<boolean>(false);

  // -----------------------------------------------------------
  // State for Activity 1: Trophic Chain Puzzle
  // -----------------------------------------------------------
  const [trophicItems, setTrophicItems] = useState<TrophicSlot[]>(() => {
    // Shuffle initial items
    return [...INITIAL_TROPHIC_ITEMS].sort(() => Math.random() - 0.5);
  });
  const [trophicValidated, setTrophicValidated] = useState<boolean>(false);
  const [trophicIsCorrect, setTrophicIsCorrect] = useState<boolean>(false);

  // -----------------------------------------------------------
  // State for Activity 2: Matching Cards
  // -----------------------------------------------------------
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [matchShuffledList, setMatchShuffledList] = useState<MatchCard[]>(() => {
    return [...MATCH_CARDS].sort(() => Math.random() - 0.5);
  });

  // -----------------------------------------------------------
  // State for Activity 3: Multiple Choice Quiz
  // -----------------------------------------------------------
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // -----------------------------------------------------------
  // State for Activity 4: Clinical Cases
  // -----------------------------------------------------------
  const [caseIndex, setCaseIndex] = useState<number>(0);
  const [selectedCaseOption, setSelectedCaseOption] = useState<number | null>(null);
  const [caseOutcome, setCaseOutcome] = useState<string | null>(null);

  // Speech narration helper
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-CL';
      utterance.rate = 1.0;
      utterance.onend = () => setSpeechActive(false);
      setSpeechActive(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeechActive(false);
    }
  };

  // Helper to add stars & play celebration
  const awardAchievement = (starCount: number, points: number, activityName: string) => {
    soundFX.playCorrect();
    soundFX.playStarUnlock();
    setStars(prev => prev + starCount);
    setTotalScore(prev => prev + points);
    if (!completedActivities.includes(activityName)) {
      setCompletedActivities(prev => [...prev, activityName]);
    }
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e']
      });
    } catch {
      // Ignore
    }
  };

  // Activity 1 Handlers: Reorder Trophic Slots
  const moveTrophicItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= trophicItems.length) return;

    const newArr = [...trophicItems];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setTrophicItems(newArr);
    setTrophicValidated(false);
  };

  const validateTrophicChain = () => {
    const isCorrect = trophicItems.every((item, idx) => item.expectedOrder === idx + 1);
    setTrophicValidated(true);
    setTrophicIsCorrect(isCorrect);

    if (isCorrect) {
      awardAchievement(3, 150, 'trophic_puzzle');
    } else {
      soundFX.playIncorrect();
    }
  };

  const resetTrophicPuzzle = () => {
    setTrophicItems([...INITIAL_TROPHIC_ITEMS].sort(() => Math.random() - 0.5));
    setTrophicValidated(false);
    setTrophicIsCorrect(false);
  };

  // Activity 2 Handlers: Matching Game
  const handleCardClick = (card: MatchCard) => {
    if (matchedPairs.includes(card.pairId)) return;
    if (selectedCards.includes(card.id)) return;

    if (selectedCards.length === 0) {
      setSelectedCards([card.id]);
    } else if (selectedCards.length === 1) {
      const firstCardId = selectedCards[0];
      const firstCard = matchShuffledList.find(c => c.id === firstCardId);
      setSelectedCards([firstCardId, card.id]);

      if (firstCard && firstCard.pairId === card.pairId && firstCard.type !== card.type) {
        // MATCH!
        setTimeout(() => {
          soundFX.playCorrect();
          soundFX.playStarUnlock();
          setMatchedPairs(prev => [...prev, card.pairId]);
          setSelectedCards([]);
          if (matchedPairs.length + 1 === MATCH_CARDS.length / 2) {
            awardAchievement(4, 200, 'card_match');
          }
        }, 400);
      } else {
        // WRONG MATCH
        setTimeout(() => {
          soundFX.playIncorrect();
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  const resetMatchGame = () => {
    setMatchedPairs([]);
    setSelectedCards([]);
    setMatchShuffledList([...MATCH_CARDS].sort(() => Math.random() - 0.5));
  };

  // Activity 3 Handlers: Multiple Choice Quiz
  const handleAnswerOption = (optId: string) => {
    if (selectedOptionId !== null) return;
    setSelectedOptionId(optId);

    const currQ = QUIZ_QUESTIONS[quizIndex];
    const selectedOpt = currQ.options.find(o => o.id === optId);

    if (selectedOpt?.correct) {
      soundFX.playCorrect();
      setQuizScore(prev => prev + 100);
    } else {
      soundFX.playIncorrect();
      setLives(prev => Math.max(0, prev - 1));
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedOptionId(null);
    if (quizIndex + 1 < QUIZ_QUESTIONS.length && lives > 0) {
      setQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      awardAchievement(3, 150, 'quiz_challenge');
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedOptionId(null);
    setQuizScore(0);
    setLives(3);
    setQuizFinished(false);
  };

  // Activity 4 Handlers: Clinical Simulator
  const handleCaseSelectOption = (idx: number) => {
    setSelectedCaseOption(idx);
    const currCase = CLINICAL_CASES[caseIndex];
    const opt = currCase.options[idx];
    setCaseOutcome(opt.outcome);

    if (opt.actionType === 'correct') {
      awardAchievement(2, 100, `clinical_case_${caseIndex}`);
    } else if (opt.actionType === 'suboptimal') {
      soundFX.playPhaseStep();
      setTotalScore(prev => prev + 25);
    } else {
      soundFX.playIncorrect();
    }
  };

  const handleNextCase = () => {
    setSelectedCaseOption(null);
    setCaseOutcome(null);
    setCaseIndex(prev => (prev + 1) % CLINICAL_CASES.length);
  };

  return (
    <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
      
      {/* ========================================================================= */}
      {/* 1. TWINKL GO BRANDED TOP HEADER & GAMIFICATION STATUS BAR                 */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-indigo-950 border-b border-cyan-500/30 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/30 ring-2 ring-white/30">
              ⭐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-sm">
                  Twinkl Go! Chile
                </span>
                <span className="text-xs text-cyan-300 font-mono font-bold">
                  Recursos Digitales Interactivos
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
                Aventura Interactiva de Ecotoxicología & Bioacumulación
              </h2>
            </div>
          </div>

          {/* Student Score, Stars & Voice Narration Control */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Stars Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-400/40 text-amber-300 font-black text-sm shadow-md">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 animate-bounce" />
              <span>{stars} Estrellas</span>
            </div>

            {/* Total Points */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-400/40 text-cyan-300 font-mono font-bold text-sm shadow-md">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span>{totalScore} pts</span>
            </div>

            {/* Audio Reader / Speech Synthesis */}
            <button
              id="btn-twinkl-speech-narration"
              onClick={() => {
                if (speechActive) {
                  stopSpeech();
                } else {
                  speakText("Bienvenido al centro interactivo Twinkl Go de Bioacumulación y Toxicología. Completa las misiones, ordena la cadena trófica, empareja los órganos diana y obtén tu diploma de experto ambiental.");
                }
              }}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                speechActive 
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse' 
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
              title="Voz de narración interactiva"
            >
              {speechActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              <span className="hidden md:inline">{speechActive ? 'Silenciar' : 'Escuchar Voz'}</span>
            </button>

            {/* Return to Diorama Button */}
            <button
              id="btn-return-to-diorama"
              onClick={onNavigateToDiorama}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/60 flex items-center gap-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Ver Diorama Fluvial</span>
            </button>

          </div>

        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-4 pt-3 border-t border-cyan-800/40 flex items-center justify-between gap-4 text-xs font-medium text-cyan-200">
          <div className="flex items-center gap-2">
            <span className="font-bold">Nivel Actual:</span>
            <span className="px-2 py-0.5 rounded bg-teal-800/60 text-white font-semibold">
              {stars >= 12 ? '🥇 Maestro en Ecotoxicología Marina' : stars >= 6 ? '🥈 Investigador Ambiental Senior' : '🥉 Detective Ecotoxicológico Junior'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Misiones Completadas: <strong>{completedActivities.length} / 5</strong></span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVITY NAVIGATION TABS (Twinkl Go Educational Modules)               */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          id="tab-act-trophic-puzzle"
          onClick={() => setActiveTab('trophic_puzzle')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'trophic_puzzle'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Puzzle className="w-4 h-4" />
          <span>1. Cadena Trófica (Ordenar)</span>
          {completedActivities.includes('trophic_puzzle') && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
        </button>

        <button
          id="tab-act-card-match"
          onClick={() => setActiveTab('card_match')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'card_match'
              ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>2. Emparejar Metal y Órgano</span>
          {completedActivities.includes('card_match') && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" />}
        </button>

        <button
          id="tab-act-quiz-challenge"
          onClick={() => setActiveTab('quiz_challenge')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'quiz_challenge'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>3. Trivia Interactiva (Quiz)</span>
          {completedActivities.includes('quiz_challenge') && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
        </button>

        <button
          id="tab-act-clinical-sim"
          onClick={() => setActiveTab('clinical_sim')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'clinical_sim'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>4. Casos Clínicos & Quelación</span>
        </button>

        <button
          id="tab-act-real-cases"
          onClick={() => setActiveTab('real_cases')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'real_cases'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>5. Casos Reales (Chile & Mundo)</span>
        </button>

        <button
          id="tab-act-certificate"
          onClick={() => setActiveTab('certificate')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'certificate'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
              : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>🎓 Diploma / Certificado</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN ACTIVITY CONTAINER                                                */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-7 min-h-[460px]">
        
        {/* --------------------------------------------------------------------- */}
        {/* MODULE 1: TROPHIC CHAIN ORDERING PUZZLE                                */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === 'trophic_puzzle' && (
          <div className="space-y-5 max-w-4xl mx-auto">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
                  Misión Pedagógica 1
                </span>
                <h3 className="text-lg font-bold text-white">
                  Ordena la Cadena Trófica de Menor a Mayor Biomagnificación
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Usa los botones <strong className="text-amber-300">↑ y ↓</strong> para ordenar los eslabones desde el origen del contaminante hasta el consumidor cúspide.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetTrophicPuzzle}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Reiniciar y mezclar"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  id="btn-validate-trophic-chain"
                  onClick={validateTrophicChain}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Comprobar Respuesta</span>
                </button>
              </div>
            </div>

            {/* Validation Banner */}
            {trophicValidated && (
              <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
                trophicIsCorrect
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
              }`}>
                {trophicIsCorrect ? (
                  <>
                    <div className="p-2 rounded-full bg-emerald-500 text-slate-950">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-300">
                        ¡Excelente! Has ordenado perfectamente la cadena trófica.
                      </h4>
                      <p className="text-xs mt-0.5 text-emerald-200/90">
                        Los metales pesados como el metilmercurio se concentran exponencialmente en cada nivel debido a su alta afinidad por proteínas tisulares y lenta tasa de eliminación biológica (k_e). ¡+150 pts y +3 Estrellas!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded-full bg-rose-500 text-white">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-rose-300">
                        Aún hay eslabones desordenados.
                      </h4>
                      <p className="text-xs mt-0.5 text-rose-200/90">
                        Pista: El proceso comienza en el <strong>Agua con efluente</strong>, sigue por los microorganismos fotosintéticos (Fitoplancton), peces forrajeros, depredador (Trucha) y finalmente el Ser Humano.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Interactive Order Slots */}
            <div className="space-y-2.5">
              {trophicItems.map((slot, index) => {
                const isCorrectPosition = trophicValidated && slot.expectedOrder === index + 1;
                const isWrongPosition = trophicValidated && slot.expectedOrder !== index + 1;

                return (
                  <div
                    key={slot.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 shadow-md ${
                      isCorrectPosition
                        ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500'
                        : isWrongPosition
                        ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">
                        {index + 1}°
                      </span>
                      <span className="text-2xl">{slot.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {slot.name}
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-semibold">
                            {slot.bcfFactor}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">{slot.description}</p>
                      </div>
                    </div>

                    {/* Up / Down Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveTrophicItem(index, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all text-xs font-bold"
                        title="Subir eslabón"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveTrophicItem(index, 'down')}
                        disabled={index === trophicItems.length - 1}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all text-xs font-bold"
                        title="Bajar eslabón"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* MODULE 2: MATCHING METAL TO TARGET ORGAN (Memory Cards Mini-Game)     */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === 'card_match' && (
          <div className="space-y-5 max-w-4xl mx-auto">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-purple-400 text-xs font-bold uppercase tracking-wider font-mono">
                  Misión Pedagógica 2
                </span>
                <h3 className="text-lg font-bold text-white">
                  Emparejamiento: Conecta el Metal Tóxico con su Órgano Diana
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Haz clic en una tarjeta de Metal y luego en su Órgano Diana correspondiente según su mecanismo histológico.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs font-mono text-cyan-300">
                  Parejas: <strong>{matchedPairs.length} / {MATCH_CARDS.length / 2}</strong>
                </div>
                <button
                  onClick={resetMatchGame}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar</span>
                </button>
              </div>
            </div>

            {/* Victory Banner */}
            {matchedPairs.length === MATCH_CARDS.length / 2 && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-300">
                      ¡Felicidades! Has completado todos los emparejamientos de toxicocinética.
                    </h4>
                    <p className="text-xs mt-0.5 text-emerald-200/80">
                      Dominas la afinidad histológica del Mercurio (Cerebro), Plomo (Huesos/Hemo), Cadmio (Riñón) y Arsénico (Piel). +200 pts ganados.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {matchShuffledList.map((card) => {
                const isSelected = selectedCards.includes(card.id);
                const isMatched = matchedPairs.includes(card.pairId);

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between min-h-[145px] shadow-lg ${
                      isMatched
                        ? 'bg-emerald-950/30 border-emerald-500/40 opacity-60 scale-95 pointer-events-none'
                        : isSelected
                        ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/50 scale-105 shadow-cyan-950/80'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-600 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-2xl">{card.icon}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        card.type === 'metal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {card.type === 'metal' ? 'Elemento Químico' : 'Órgano Diana'}
                      </span>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-sm font-bold text-white flex items-center justify-between">
                        <span>{card.title}</span>
                        {card.symbol && <span className="text-xs font-mono text-cyan-400">{card.symbol}</span>}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {card.subtitle}
                      </p>
                    </div>

                    {isMatched && (
                      <div className="mt-2 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Emparejado</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* MODULE 3: TWINKL GO INTERACTIVE MULTIPLE CHOICE QUIZ                  */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === 'quiz_challenge' && (
          <div className="max-w-3xl mx-auto space-y-5">
            
            {/* Quiz Header with Lives & Score */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
                  Trivia Twinkl Go! - Pregunta {quizIndex + 1} de {QUIZ_QUESTIONS.length}
                </span>
                <h3 className="text-base font-bold text-white">
                  Desafío de Comprensión Ecotoxicológica
                </h3>
              </div>

              {/* Lives and Score Badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-rose-500">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Heart 
                      key={i} 
                      className={`w-4 h-4 ${i < lives ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`} 
                    />
                  ))}
                </div>
                <div className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold">
                  {quizScore} pts
                </div>
              </div>
            </div>

            {!quizFinished ? (
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
                
                {/* Question Prompt */}
                <h4 className="text-base font-extrabold text-white leading-relaxed">
                  {QUIZ_QUESTIONS[quizIndex].question}
                </h4>

                {/* Options List */}
                <div className="space-y-2.5 pt-2">
                  {QUIZ_QUESTIONS[quizIndex].options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    const showCorrect = selectedOptionId !== null && opt.correct;
                    const showWrong = selectedOptionId === opt.id && !opt.correct;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleAnswerOption(opt.id)}
                        disabled={selectedOptionId !== null}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 text-xs sm:text-sm font-medium ${
                          showCorrect
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50'
                            : showWrong
                            ? 'bg-rose-950/80 border-rose-500 text-rose-100 ring-2 ring-rose-500/50'
                            : isSelected
                            ? 'bg-slate-800 border-cyan-400 text-white'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold shrink-0 text-xs ${
                          showCorrect ? 'bg-emerald-500 text-slate-950' : showWrong ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {opt.id.toUpperCase()}
                        </span>
                        <div className="flex-1">
                          <p>{opt.text}</p>
                          {selectedOptionId !== null && (
                            <p className="mt-1.5 text-xs text-slate-400 font-normal">
                              {opt.explanation}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Fun Fact Callout & Next Button */}
                {selectedOptionId !== null && (
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                    <p className="text-xs text-amber-300/90 font-medium">
                      {QUIZ_QUESTIONS[quizIndex].funFact}
                    </p>
                    <button
                      id="btn-quiz-next-question"
                      onClick={handleNextQuizQuestion}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/30 flex items-center gap-1.5 ml-auto"
                    >
                      <span>Siguiente Pregunta</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Quiz Finished View */
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-white">
                  ¡Trivia Completada con Éxito!
                </h3>
                <p className="text-sm text-slate-300">
                  Puntaje obtenido: <strong className="text-cyan-400 font-mono text-base">{quizScore} puntos</strong> con {lives} vidas restantes.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={resetQuiz}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Jugar de Nuevo</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('certificate')}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/20"
                  >
                    <Award className="w-4 h-4" />
                    <span>Ver Diploma con mi Puntaje</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* MODULE 4: CLINICAL & REMEDIATION DECISION SIMULATOR                   */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === 'clinical_sim' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                  Simulador de Decisiones Clínicas & Ambientales
                </span>
                <h3 className="text-base font-bold text-white">
                  {CLINICAL_CASES[caseIndex].title}
                </h3>
              </div>
              <button
                onClick={handleNextCase}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-bold flex items-center gap-1"
              >
                <span>Siguiente Caso</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Patient File Card */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <User className="w-4 h-4 text-cyan-400" />
                <span><strong>Perfil:</strong> {CLINICAL_CASES[caseIndex].patientProfile}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-amber-300">
                📄 <strong>Informe de Laboratorio:</strong> {CLINICAL_CASES[caseIndex].labReport}
              </div>

              {/* Symptoms Pills */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Signos y Síntomas Observados:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CLINICAL_CASES[caseIndex].symptoms.map((sym, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-medium">
                      ⚠️ {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Treatment Decision Options */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  ¿Cuál es la conducta médica / de remediación indicada?
                </span>
                {CLINICAL_CASES[caseIndex].options.map((opt, i) => {
                  const isSelected = selectedCaseOption === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleCaseSelectOption(i)}
                      className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? opt.actionType === 'correct'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                            : 'bg-rose-950 border-rose-500 text-rose-200'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <span>{opt.name}</span>
                      {isSelected && (
                        <span className="shrink-0 font-mono text-xs font-bold">
                          {opt.actionType === 'correct' ? '✅ Correcto' : '❌ Inadecuado'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Case Outcome Display */}
              {caseOutcome && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs text-slate-200 space-y-1 animate-fade-in">
                  <span className="font-bold text-cyan-300 font-mono block">Evolución y Resultado:</span>
                  <p>{caseOutcome}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* MODULE 5: REAL WORLD ENVIRONMENTAL CASES (Chile & Global)             */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === 'real_cases' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-rose-400 text-xs font-bold uppercase tracking-wider font-mono">
                Casos Emblemáticos en Ecotoxicología Aplicada
              </span>
              <h3 className="text-lg font-bold text-white">
                Casos Históricos de Bioacumulación: Chile y el Mundo
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Conoce los antecedentes históricos reales que dieron origen a las normativas de salud ambiental y límites OMS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Chile: Bahía de Quintero - Puchuncaví */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 text-[10px] font-bold">
                    🇨🇱 Chile (Región de Valparaíso)
                  </span>
                  <span className="text-xs font-mono text-slate-400">1964 - Presente</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Bahía de Quintero - Puchuncaví (Complejo Ventanas)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Complejo industrial de fundición de concentrados de cobre y termoeléctricas con histórica descarga de escorias, dióxido de azufre (SO₂), arsénico (As) y metales pesados en la bahía costera.
                </p>
                <div className="p-2 bg-slate-950 rounded-lg text-[11px] text-cyan-300 font-mono">
                  🔬 Solución: Cierre de fundición Ventanas (2023) y reconversión a monitoreo continuo.
                </div>
              </div>

              {/* Chile: Bahía de Chañaral */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 text-[10px] font-bold">
                    🇨🇱 Chile (Región de Atacama)
                  </span>
                  <span className="text-xs font-mono text-slate-400">1938 - 1990</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Bahía de Chañaral (Relaves de Cobre El Salvador)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Vertido directo de más de 300 millones de toneladas de relaves mineros ricos en cadmio, cobre y arsénico a la desembocadura del Río Salado, generando un avance artificial de playa y esterilización marina.
                </p>
                <div className="p-2 bg-slate-950 rounded-lg text-[11px] text-cyan-300 font-mono">
                  🔬 Solución: Construcción del tranque de relaves Pampa Austral y fitoestabilización.
                </div>
              </div>

              {/* Japón: Bahía de Minamata */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-bold">
                    🇯🇵 Japón (Prefectura de Kumamoto)
                  </span>
                  <span className="text-xs font-mono text-slate-400">1956</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Bahía de Minamata (Corporación Chisso)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Descarga de metilmercurio utilizado como catalizador de acetaldehído. Bioacumulación en peces y mariscos causó severos daños neurológicos congénitos en la población pesquera local.
                </p>
                <div className="p-2 bg-slate-950 rounded-lg text-[11px] text-cyan-300 font-mono">
                  🔬 Legado: Creación del Convenio de Minamata sobre el Mercurio de las Naciones Unidas.
                </div>
              </div>

              {/* Japón: Río Jinzu (Enfermedad Itai-Itai) */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[10px] font-bold">
                    🇯🇵 Japón (Prefectura de Toyama)
                  </span>
                  <span className="text-xs font-mono text-slate-400">1912 - 1968</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Cuenca del Río Jinzu (Enfermedad Itai-Itai)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Contaminación por Cadmio de minas de zinc y plomo en aguas de regadío de arrozales. Produjo osteomalacia severa con fracturas óseas espontáneas por disfunción tubular renal.
                </p>
                <div className="p-2 bg-slate-950 rounded-lg text-[11px] text-cyan-300 font-mono">
                  🔬 Mecanismo: Sustitución de Ca²⁺ en hidroxiapatita ósea e hipercalciuria inducida.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* MODULE 6: TWINKL GO PRINTABLE / DIGITAL DIPLOMA CERTIFICATE          */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === 'certificate' && (
          <div className="max-w-2xl mx-auto space-y-5">
            
            {/* Student Name Customizer */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Nombre del Estudiante:</span>
              </div>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Escribe tu nombre aquí"
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-amber-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 w-64"
              />
              <button
                onClick={() => {
                  soundFX.playFanfare();
                  try {
                    confetti({ particleCount: 60, spread: 80, origin: { x: 0.5, y: 0.5 } });
                  } catch {
                    // Ignore
                  }
                  window.print();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-400/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Diploma</span>
              </button>
            </div>

            {/* Diploma Parchment Design */}
            <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-50 text-slate-900 p-8 rounded-2xl border-4 border-amber-500 shadow-2xl relative overflow-hidden text-center select-none font-sans">
              
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 text-amber-600 text-lg font-serif">❧</div>
              <div className="absolute top-2 right-2 text-amber-600 text-lg font-serif">☙</div>
              <div className="absolute bottom-2 left-2 text-amber-600 text-lg font-serif">❧</div>
              <div className="absolute bottom-2 right-2 text-amber-600 text-lg font-serif">☙</div>

              {/* Seal Header */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🎓</span>
                <span className="text-xs font-black uppercase tracking-widest text-amber-800 font-mono">
                  TWINKL GO! CHILE • CIENCIAS NATURALES
                </span>
                <span className="text-2xl">⭐</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight font-serif uppercase">
                Certificado de Logro y Excelencia
              </h2>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-1">
                En Ecotoxicología Marina, Bioacumulación & Salud Ambiental
              </p>

              {/* Student Name */}
              <div className="my-6 py-2 border-b-2 border-amber-400 max-w-md mx-auto">
                <p className="text-xs text-slate-600 font-medium italic">Se otorga con distinción académica a:</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-normal mt-1 font-serif">
                  {studentName || 'Estudiante Destacado'}
                </h3>
              </div>

              <p className="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed">
                Por haber completado exitosamente los módulos experimentales de bioacumulación trófica, clasificación de órganos diana y protocolos de quelación clínica para <strong>{contaminant.name} ({contaminant.chemicalFormula})</strong>.
              </p>

              {/* Badge & Scores Summary */}
              <div className="mt-6 pt-4 border-t border-amber-300/80 flex items-center justify-around text-xs">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Estrellas Ganadas</span>
                  <strong className="text-base text-amber-700 font-black">⭐ {stars}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Puntaje Total</span>
                  <strong className="text-base text-cyan-700 font-black font-mono">{totalScore} pts</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase font-bold">Fecha de Acreditación</span>
                  <strong className="text-xs text-slate-800 font-bold">{new Date().toLocaleDateString('es-CL')}</strong>
                </div>
              </div>

              {/* Golden Seal Stamp */}
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-md border-2 border-amber-300">
                <span>🏅 EXPERTO EN BIOMAGNIFICACIÓN VERIFICADO</span>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
