import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

// ============================================
// 🎨 ICONS
// ============================================
const Icons = {
  Check: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={3.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={3.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  Trophy: () => (
    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  ),
  Crown: () => (
    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 16L3 6l5.5 4L12 4l3.5 6L21 6l-2 10H5zm0 2h14v2H5v-2z" />
    </svg>
  ),
  Sparkle: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5L12 0z" />
    </svg>
  ),
};

// ============================================
// 🎲 3D DICE - CSS based, smooth
// ============================================
const diceVariants = {
  initial: { 
    rotateX: -25, 
    rotateY: 35, 
    scale: 0.5, 
    opacity: 0 
  },
  animate: { 
    rotateX: -25, 
    rotateY: 35, 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 12,
      delay: 0.1
    }
  },
  float: {
    rotateX: [-25, -15, -25],
    rotateY: [35, 45, 35],
    y: [0, -12, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  spin: {
    rotateX: [0, 720],
    rotateY: [0, 720],
    rotateZ: [0, 360],
    transition: {
      duration: 1.5,
      ease: "easeInOut"
    }
  }
};

const DiceFace = ({ children, gradient }) => (
  <div 
    className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-white/40"
    style={{
      background: gradient,
      backfaceVisibility: "hidden",
      boxShadow: "inset 0 0 30px rgba(255,255,255,0.2), inset 0 -10px 20px rgba(0,0,0,0.05)"
    }}
  >
    {children}
  </div>
);

const Dice3DComponent = ({ spinning = false, size = 160 }) => {
  const dotColor = "bg-gradient-to-br from-rose-600 to-rose-900";
  
  return (
    <div 
      className="relative mx-auto" 
      style={{ 
        width: size, 
        height: size,
        perspective: "1200px"
      }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        variants={diceVariants}
        initial="initial"
        animate={spinning ? "spin" : ["animate", "float"]}
      >
        {/* Top - 1 dot */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `rotateX(90deg) translateZ(${size/2}px)`,
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace gradient="linear-gradient(135deg, #fef3e2 0%, #fed7aa 100%)">
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-3/4 h-3/4">
              <div className="col-start-2 row-start-2 flex items-center justify-center">
                <div className={`w-5 h-5 rounded-full ${dotColor} shadow-lg`}></div>
              </div>
            </div>
          </DiceFace>
        </div>

        {/* Bottom - 6 dots */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `rotateX(-90deg) translateZ(${size/2}px)`,
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace gradient="linear-gradient(135deg, #fecaca 0%, #fb7185 100%)">
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-3/4 h-3/4 p-2">
              {[0,2,6,8].map(pos => (
                <div key={pos} className={`flex items-center justify-center ${pos === 0 ? 'col-start-1 row-start-1' : pos === 2 ? 'col-start-3 row-start-1' : pos === 6 ? 'col-start-1 row-start-3' : 'col-start-3 row-start-3'}`}>
                  <div className={`w-4 h-4 rounded-full ${dotColor} shadow-md`}></div>
                </div>
              ))}
            </div>
          </DiceFace>
        </div>

        {/* Front - 4 dots */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(${size/2}px)`,
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace gradient="linear-gradient(180deg, #fff8f3 0%, #fed7aa 100%)">
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-3/4 h-3/4 p-2">
              {[0,2,6,8].map(pos => (
                <div key={pos} className={`flex items-center justify-center ${pos === 0 ? 'col-start-1 row-start-1' : pos === 2 ? 'col-start-3 row-start-1' : pos === 6 ? 'col-start-1 row-start-3' : 'col-start-3 row-start-3'}`}>
                  <div className={`w-4 h-4 rounded-full ${dotColor} shadow-md`}></div>
                </div>
              ))}
            </div>
          </DiceFace>
        </div>

        {/* Back - 5 dots */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `rotateY(180deg) translateZ(${size/2}px)`,
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace gradient="linear-gradient(180deg, #fef3e2 0%, #fbcfe8 100%)">
            <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-3/4 h-3/4 p-2">
              {[0,2,4,6,8].map(pos => (
                <div key={pos} className={`flex items-center justify-center ${pos === 0 ? 'col-start-1 row-start-1' : pos === 2 ? 'col-start-3 row-start-1' : pos === 4 ? 'col-start-2 row-start-2' : pos === 6 ? 'col-start-1 row-start-3' : 'col-start-3 row-start-3'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full ${dotColor} shadow-md`}></div>
                </div>
              ))}
            </div>
          </DiceFace>
        </div>

        {/* Left - 3 dots */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `rotateY(-90deg) translateZ(${size/2}px)`,
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace gradient="linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)">
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-3/4 h-3/4 p-2">
              {[0,4,8].map(pos => (
                <div key={pos} className={`flex items-center justify-center ${pos === 0 ? 'col-start-1 row-start-1' : pos === 4 ? 'col-start-2 row-start-2' : 'col-start-3 row-start-3'}`}>
                  <div className={`w-4 h-4 rounded-full ${dotColor} shadow-md`}></div>
                </div>
              ))}
            </div>
          </DiceFace>
        </div>

        {/* Right - 2 dots */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `rotateY(90deg) translateZ(${size/2}px)`,
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace gradient="linear-gradient(135deg, #fef3e2 0%, #fecaca 100%)">
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-3/4 h-3/4 p-2">
              {[0,8].map(pos => (
                <div key={pos} className={`flex items-center justify-center ${pos === 0 ? 'col-start-1 row-start-1' : pos === 3 ? 'col-start-3 row-start-3' : 'col-start-3 row-start-3'}`}>
                  <div className={`w-4 h-4 rounded-full ${dotColor} shadow-md`}></div>
                </div>
              ))}
            </div>
          </DiceFace>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================
// HELPERS
// ============================================
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const processQuestionsData = (rawData) => {
  if (!Array.isArray(rawData)) return [];
  return shuffleArray(rawData).map((q) => {
    if (!q || !Array.isArray(q.options) || typeof q.correctAnswer !== "number") return q;
    const correctOptionText = q.options[q.correctAnswer];
    const shuffledOptions = shuffleArray(q.options);
    const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);
    return { ...q, options: shuffledOptions, correctAnswer: newCorrectIndex };
  });
};

// ============================================
// 🎬 FRAMER MOTION VARIANTS
// ============================================
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

const questionVariants = {
  enter: { opacity: 0, x: 50, scale: 0.95 },
  center: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    x: -50, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const optionVariants = {
  hidden: { opacity: 0, x: -20 },
  show: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, type: "spring", stiffness: 250, damping: 20 }
  })
};

// Global constants for components
const CONFETTI_COLORS = ['#E11D48', '#F59E0B', '#FB7185', '#FCD34D', '#10B981', '#F472B6'];

// ============================================
// 🎯 MAIN COMPONENT
// ============================================
const QuizApp = () => {
  const GROUP_COUNT = 5;
  const [groups, setGroups] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [diceSpinning, setDiceSpinning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const smoothMouseY = useSpring(mouseY, { damping: 30, stiffness: 200 });

  useEffect(() => {
    let alive = true;
    setLoadingGroups(true);
    fetch("/tests.json")
      .then((res) => res.ok ? res.json() : Promise.reject("not found"))
      .then((data) => {
        if (!alive) return;
        const all = Array.isArray(data) ? data : [];
        setAllQuestions(all);
        const size = Math.ceil(all.length / GROUP_COUNT);
        setGroups(
          Array.from({ length: GROUP_COUNT }, (_, i) => ({
            id: i + 1,
            name: `${i + 1}-Guruh`,
            count: Math.max(0, Math.min(size, all.length - i * size)),
          }))
        );
      })
      .catch(() => alive && setError("tests.json yuklanmadi. public/tests.json ni tekshiring."))
      .finally(() => alive && setLoadingGroups(false));
    return () => { alive = false; };
  }, []);

  const handleMouseMove = useCallback((e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const resetState = useCallback(() => {
    setFinished(false);
    setAnswers({});
    setCurrentIndex(0);
    setFeedback(null);
    setCombo(0);
    setMaxCombo(0);
  }, []);

  const backToGroups = useCallback(() => {
    setCurrentGroup(null);
    setQuestions([]);
    resetState();
    setError(null);
  }, [resetState]);

  const startQuiz = useCallback((groupId) => {
    setLoadingQuestions(true);
    setError(null);
    try {
      const size = Math.ceil(allQuestions.length / GROUP_COUNT);
      const start = (groupId - 1) * size;
      const subset = allQuestions.slice(start, Math.min(start + size, allQuestions.length));
      setQuestions(processQuestionsData(subset));
      setCurrentGroup(groupId);
      resetState();
    } catch {
      setError("Savollarni yuklab bo'lmadi 😔");
    } finally {
      setLoadingQuestions(false);
    }
  }, [allQuestions, resetState]);

  const startRandom25 = useCallback(() => {
    if (allQuestions.length === 0) return;
    setLoadingQuestions(true);
    setError(null);
    setCurrentGroup("random-mix");
    setDiceSpinning(true);
    try {
      setQuestions(processQuestionsData(allQuestions).slice(0, 25));
      resetState();
      setTimeout(() => setDiceSpinning(false), 1500);
    } catch {
      setError("Tasodifiy testni tayyorlab bo'lmadi 🥺");
      setCurrentGroup(null);
    } finally {
      setLoadingQuestions(false);
    }
  }, [allQuestions, resetState]);

  const resetGroup = useCallback(() => {
    if (currentGroup === "random-mix") startRandom25();
    else if (currentGroup) startQuiz(currentGroup);
  }, [currentGroup, startQuiz, startRandom25]);

  const currentQuestion = questions[currentIndex];

  const handleSelect = useCallback((optionIndex) => {
    if (!currentQuestion || feedback !== null) return;
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    setFeedback({ selected: optionIndex, isCorrect });
    if (isCorrect) {
      setCombo(c => {
        const newCombo = c + 1;
        setMaxCombo(m => Math.max(m, newCombo));
        return newCombo;
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } else {
      setCombo(0);
    }
  }, [currentQuestion, feedback]);

  const goNext = useCallback(() => {
    setFeedback(null);
    setCurrentIndex(i => {
      if (i >= questions.length - 1) {
        setFinished(true);
        return i;
      }
      return i + 1;
    });
  }, [questions.length]);

  const stats = useMemo(() => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return { correct, wrong: questions.length - correct, total: questions.length };
  }, [questions, answers]);

  const wrongList = useMemo(() => 
    questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctAnswer),
    [questions, answers]
  );

  // ============================================
  // 🎨 MOUSE GLOW
  // ============================================
  const MouseGlow = () => (
    <motion.div
      className="fixed pointer-events-none z-0"
      style={{
        left: smoothMouseX,
        top: smoothMouseY,
        x: "-50%",
        y: "-50%",
        width: 500,
        height: 500,
        background: "radial-gradient(circle, rgba(225, 29, 72, 0.08) 0%, transparent 60%)",
      }}
    />
  );

  // ============================================
  // 🎊 CONFETTI
  // ============================================
  const Confetti = () => {
    const pieces = useMemo(() => 
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        xDrift: (Math.random() - 0.5) * 200,
      })), []
    );
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {pieces.map(p => (
          <motion.div
            key={p.id}
            className="absolute w-3 h-4 rounded-sm"
            style={{ 
              left: `${p.left}%`, 
              top: -20, 
              backgroundColor: p.color,
            }}
            initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
            animate={{ 
              y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
              x: p.xDrift,
              rotate: p.rotation + 720,
              opacity: 0
            }}
            transition={{ 
              duration: p.duration, 
              delay: p.delay,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    );
  };

  // ============================================
  // ✨ SUCCESS BURST
  // ============================================
  const SuccessBurst = () => {
    const bursts = useMemo(() => 
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: (i / 12) * Math.PI * 2,
        emoji: ['✨', '⭐', '💫', '🌟'][i % 4]
      })), []
    );
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        {bursts.map(b => (
          <motion.div
            key={b.id}
            className="absolute text-3xl"
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(b.angle) * 200,
              y: Math.sin(b.angle) * 200,
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0]
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {b.emoji}
          </motion.div>
        ))}
      </div>
    );
  };

  // ============================================
  // 📊 PROGRESS CIRCLE
  // ============================================
  const ProgressCircle = ({ percentage }) => {
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="gradCircle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E11D48" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx="100" cy="100" r={radius} stroke="#FFE4E6" strokeWidth="14" fill="transparent" />
          <motion.circle
            cx="100" cy="100" r={radius}
            stroke="url(#gradCircle)"
            strokeWidth="14"
            fill="transparent"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <motion.div 
          className="absolute flex flex-col items-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <span className="text-5xl md:text-6xl font-black text-gradient">{percentage}%</span>
          <span className="text-xs text-gray-600 font-extrabold mt-1 px-3 py-1 bg-white/80 rounded-full border border-rose-200">
            {stats.correct} / {stats.total}
          </span>
        </motion.div>
      </div>
    );
  };

  // ============================================
  // 🏆 HEADER
  // ============================================
  const StickyHeader = () => (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-rose-100/60 mb-6 shadow-lg shadow-rose-200/20">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="relative w-12 h-12"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-amber-500 rounded-2xl blur-md opacity-50" />
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center shadow-xl border-2 border-white/30">
              <motion.div 
                className="text-white"
                animate={{ scale: [1, 1.2, 1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Icons.Heart />
              </motion.div>
            </div>
            <motion.div 
              className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 bg-clip-text text-transparent leading-tight">
              Maxsus Nilufarxon uchun
            </h1>
            <p className="text-[10px] text-rose-400/80 font-extrabold tracking-wider">
              Texnologiya fani testlari
            </p>
          </div>
        </div>
        <AnimatePresence>
          {combo > 1 && (
            <motion.div 
              className="flex items-center space-x-1 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-white/30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <motion.span 
                className="text-base"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >🔥</motion.span>
              <span className="font-black text-sm">x{combo}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const Layout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 font-sans text-gray-700 pb-10 relative overflow-x-hidden">
      <MouseGlow />
      <StickyHeader />
      {showSuccess && <SuccessBurst />}
      <div className="max-w-3xl mx-auto px-4 w-full relative z-10">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </div>
    </div>
  );

  // ============================================
  // ❌ ERROR
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 font-sans p-4">
        <div className="max-w-3xl mx-auto pt-20">
          <motion.div 
            className="p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-rose-200 text-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.div 
              className="text-7xl mb-4 inline-block"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >🥺</motion.div>
            <div className="text-rose-500 mb-2 font-extrabold text-xl">Xatolik yuz berdi</div>
            <p className="text-gray-500 mb-6 text-sm">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-2xl font-bold shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Qayta urinish
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // 📚 GROUP SELECTION
  // ============================================
  if (!currentGroup) {
    const groupStyles = [
      { gradient: 'from-rose-400 to-pink-600', bg: 'bg-rose-50' },
      { gradient: 'from-amber-400 to-orange-600', bg: 'bg-amber-50' },
      { gradient: 'from-pink-400 to-rose-600', bg: 'bg-pink-50' },
      { gradient: 'from-orange-400 to-rose-500', bg: 'bg-orange-50' },
      { gradient: 'from-rose-500 to-amber-500', bg: 'bg-rose-50' },
    ];
    const groupIcons = ['📖', '✏️', '🎨', '🔬', '🎯', '🚀', '💡', '⚡'];

    return (
      <Layout key="groups">
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* 🎲 Hero Section */}
          <motion.div className="text-center space-y-2 pt-2" variants={itemVariants}>
            <div className="relative h-52 flex items-center justify-center mb-2">
              <motion.div 
                className="absolute bottom-8 w-48 h-12 bg-rose-500/20 rounded-full blur-2xl"
                animate={{ scale: [1, 0.7, 1], opacity: [0.3, 0.15, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <Dice3DComponent size={180} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              Testlar to'plami
            </h2>
            <p className="text-gray-600 text-sm font-bold">Bilimingizni sinab ko'ring! ✨</p>
          </motion.div>

          {loadingGroups ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-rose-200 rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-2 border-4 border-amber-300 rounded-full border-b-transparent"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="mt-4 text-gray-500 text-sm font-bold">Yuklanmoqda...</p>
            </motion.div>
          ) : (
            <>
              {/* Groups Grid */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
                variants={containerVariants}
              >
                {groups.map((g, idx) => {
                  const style = groupStyles[idx % groupStyles.length];
                  return (
                    <motion.button
                      key={g.id}
                      onClick={() => startQuiz(g.id)}
                      variants={itemVariants}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group relative overflow-hidden p-4 md:p-5 bg-white/85 backdrop-blur-xl rounded-3xl shadow-md hover:shadow-2xl border-2 border-white/80 text-left"
                    >
                      <motion.div 
                        className={`absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br ${style.gradient} rounded-full opacity-20 blur-md`}
                        whileHover={{ scale: 1.8, opacity: 0.5 }}
                        transition={{ duration: 0.7 }}
                      />
                      <div className={`absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br ${style.gradient} rounded-full opacity-15`} />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <motion.div 
                            className="text-3xl md:text-4xl"
                            animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: idx * 0.2 }}
                          >
                            {groupIcons[idx % groupIcons.length]}
                          </motion.div>
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white text-xs font-black shadow-lg`}>
                            {g.id}
                          </div>
                        </div>
                        <div className="text-base md:text-lg font-black text-gray-800 group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-amber-500 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                          {g.name}
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold mt-1">
                          {g.count} ta savol
                        </div>
                        <div className="flex items-center mt-3 text-xs font-extrabold text-gray-400 group-hover:text-rose-500 transition-colors">
                          Boshlash <Icons.ArrowRight />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Random 25 Button */}
              <motion.div 
                className="mt-8 pt-6 border-t-2 border-dashed border-rose-200/50"
                variants={itemVariants}
              >
                <motion.button
                  onClick={startRandom25}
                  className="w-full relative overflow-hidden p-6 md:p-8 rounded-3xl shadow-2xl group"
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500" />
                  <motion.div 
                    className="absolute -top-20 -right-20 w-60 h-60 bg-white/20 rounded-full blur-xl"
                    whileHover={{ scale: 1.5 }}
                    transition={{ duration: 1 }}
                  />
                  <motion.div 
                    className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-300/30 rounded-full blur-xl"
                    whileHover={{ scale: 1.5 }}
                    transition={{ duration: 1 }}
                  />
                  
                  <div className="relative z-10 flex items-center justify-center space-x-4 text-white">
                    <Dice3DComponent size={64} spinning={diceSpinning} />
                    <div className="text-left">
                      <div className="text-xl md:text-2xl font-black tracking-tight">Tavakkal 25 Test</div>
                      <div className="text-xs text-rose-100 font-bold opacity-95">
                        ✨ Barcha savollardan aralash
                      </div>
                    </div>
                    <motion.div 
                      className="text-5xl"
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >🎯</motion.div>
                  </div>
                </motion.button>
              </motion.div>

              <motion.div 
                className="text-center pt-2"
                variants={itemVariants}
              >
                <p className="text-xs text-gray-500 font-bold flex items-center justify-center gap-1">
                  <span className="text-rose-400">💖</span>
                  Muvaffaqiyat kaliti - tinimsiz o'rganish
                  <span className="text-rose-400">💖</span>
                </p>
              </motion.div>
            </>
          )}
        </motion.div>
      </Layout>
    );
  }

  // ============================================
  // ⏳ LOADING
  // ============================================
  if (loadingQuestions) {
    return (
      <Layout key="loading">
        <motion.div 
          className="flex flex-col items-center justify-center py-32"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="text-8xl mb-6"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >🌸</motion.div>
          <p className="text-gray-700 font-black text-lg mb-4">Savollar tayyorlanmoqda...</p>
          <div className="flex space-x-2">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 shadow-lg"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </Layout>
    );
  }

  // ============================================
  // 🏆 RESULTS
  // ============================================
  if (finished) {
    const percentage = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
    const isSuccess = percentage >= 80;
    const isPerfect = percentage === 100;
    const title = 
      isPerfect ? "Mukammal! Ajoyib! 🏆" :
      percentage >= 80 ? "Ajoyib natija! 😍" :
      percentage >= 60 ? "Yaxshi! 👏" :
      percentage >= 40 ? "Yomon emas 😊" : "Yana urinib ko'ring 💪";
    const subtitle = 
      isPerfect ? "Siz 100% natija ko'rsatdingiz! Bu haqiqiy ustuvorlik! ✨" :
      percentage >= 80 ? "Siz bu sohani yaxshi bilasiz!" :
      percentage >= 60 ? "Bilim mustahkam, lekin yana harakat qiling!" :
      percentage >= 40 ? "O'rganishda davom eting!" : "Qo'rqmang, qayta urinib ko'ring!";

    return (
      <Layout key="results">
        {isSuccess && <Confetti />}
        <motion.div 
          className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border-2 border-white/80 overflow-hidden mt-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500" />
          
          <div className="p-6 md:p-8 text-center relative overflow-hidden">
            {isPerfect && (
              <>
                {['🎉', '🎊', '⭐', '💫'].map((emoji, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-3xl"
                    style={{ 
                      top: i < 2 ? '0.5rem' : 'auto',
                      bottom: i >= 2 ? '0.5rem' : 'auto',
                      left: i % 2 === 0 ? '0.5rem' : 'auto',
                      right: i % 2 === 1 ? '0.5rem' : 'auto',
                    }}
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  >{emoji}</motion.div>
                ))}
              </>
            )}

            <motion.div 
              className="relative inline-block mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
            >
              <motion.div 
                className={`absolute inset-0 rounded-full blur-2xl ${isPerfect ? 'bg-amber-400/60' : isSuccess ? 'bg-emerald-400/60' : 'bg-rose-400/60'}`}
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className={`relative mx-auto w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white/40 ${
                isPerfect ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-rose-500' :
                isSuccess ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                'bg-gradient-to-br from-rose-400 to-pink-500'
              }`}>
                {isPerfect ? (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ><Icons.Trophy /></motion.div>
                ) : <Icons.Crown />}
              </div>
              {isPerfect && (
                <motion.div 
                  className="absolute -top-2 -right-2 text-3xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >👑</motion.div>
              )}
            </motion.div>

            <motion.h2 
              className="text-2xl md:text-3xl font-black bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >{title}</motion.h2>
            <motion.p 
              className="text-sm text-gray-600 mb-6 font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >{subtitle}</motion.p>

            <ProgressCircle percentage={percentage} />

            <motion.div 
              className="grid grid-cols-3 gap-2 md:gap-3 mt-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {[
                { emoji: '✅', label: "To'g'ri", value: stats.correct, color: 'from-emerald-50 to-teal-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                { emoji: '❌', label: 'Xato', value: stats.wrong, color: 'from-rose-50 to-red-50', text: 'text-rose-600', border: 'border-rose-200' },
                { emoji: '🔥', label: 'Combo', value: maxCombo, color: 'from-amber-50 to-orange-50', text: 'text-amber-600', border: 'border-amber-200' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className={`bg-gradient-to-br ${stat.color} p-3 md:p-4 rounded-2xl border-2 ${stat.border}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -4 }}
                >
                  <motion.div 
                    className="text-2xl mb-1"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2, delay: i * 0.2 }}
                  >{stat.emoji}</motion.div>
                  <div className={`${stat.text} text-[9px] md:text-[10px] font-extrabold uppercase tracking-wider`}>{stat.label}</div>
                  <div className={`text-2xl md:text-3xl font-black ${stat.text}`}>{stat.value}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            className="p-4 md:p-6 bg-gradient-to-r from-rose-50/60 to-amber-50/60 flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              onClick={resetGroup}
              className="flex-1 flex items-center justify-center py-4 px-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-extrabold rounded-2xl shadow-xl"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.span
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              ><Icons.Refresh /></motion.span>
              Qayta ishlash
            </motion.button>
            <motion.button
              onClick={backToGroups}
              className="flex-1 flex items-center justify-center py-4 px-6 bg-white text-gray-700 font-extrabold rounded-2xl shadow-lg border-2 border-rose-100"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icons.Home /> Menyuga qaytish
            </motion.button>
          </motion.div>

          {wrongList.length > 0 && (
            <motion.div 
              className="p-4 md:p-6 bg-gradient-to-br from-rose-50/40 to-amber-50/40 border-t border-rose-200/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-lg md:text-xl font-black text-gray-800 mb-4 pl-3 border-l-4 border-rose-500 flex items-center">
                <motion.span 
                  className="mr-2 text-2xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >📝</motion.span>
                <span className="bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">Xatolar tahlili</span>
                <span className="ml-auto text-sm bg-rose-500 text-white px-3 py-1 rounded-full shadow-md">
                  {wrongList.length} ta
                </span>
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scroll">
                {wrongList.map((q, idx) => (
                  <motion.div 
                    key={q.id} 
                    className="bg-white p-4 md:p-5 rounded-2xl shadow-md border-2 border-rose-100"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01, boxShadow: "0 10px 30px rgba(225, 29, 72, 0.1)" }}
                  >
                    <div className="flex items-start gap-2 mb-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs font-black flex items-center justify-center shadow-md">
                        {idx + 1}
                      </span>
                      <p className="font-bold text-gray-800 text-sm md:text-base flex-1">{q.question}</p>
                    </div>
                    <div className="space-y-2 text-xs md:text-sm ml-9">
                      <div className="flex items-center text-rose-600 bg-rose-50 px-3 py-2.5 rounded-xl border-2 border-rose-200">
                        <div className="flex-shrink-0 bg-rose-500 text-white rounded-full p-1"><Icons.X /></div>
                        <span className="ml-2 font-semibold flex-1 line-through opacity-70">{q.options[answers[q.id]]}</span>
                      </div>
                      <div className="flex items-center text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-xl border-2 border-emerald-200">
                        <div className="flex-shrink-0 bg-emerald-500 text-white rounded-full p-1"><Icons.Check /></div>
                        <span className="ml-2 font-bold flex-1">{q.options[q.correctAnswer]}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </Layout>
    );
  }

  // ============================================
  // ❓ QUIZ
  // ============================================
  const progressPercent = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <Layout key="quiz">
      {/* Top Controls */}
      <motion.div 
        className="flex items-center justify-between mb-5 px-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          onClick={backToGroups}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/85 backdrop-blur-xl shadow-md text-gray-600 border-2 border-white/80"
          whileHover={{ scale: 1.1, rotate: 12 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full blur-md opacity-50" />
          <div className="relative bg-white/90 backdrop-blur-xl px-5 py-2 rounded-full shadow-lg text-sm font-black bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent border-2 border-rose-200">
            {currentIndex + 1} <span className="text-gray-300 mx-1">/</span> {questions.length}
          </div>
        </div>
        
        <motion.div 
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/85 backdrop-blur-xl shadow-md border-2 border-white/80"
          whileHover={{ scale: 1.1 }}
        >
          <motion.div 
            className="text-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >💖</motion.div>
        </motion.div>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-white/70 rounded-full mb-6 overflow-hidden shadow-inner border-2 border-rose-100/60">
        <motion.div
          className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-rose-200/30 border-2 border-white/80 overflow-hidden"
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <div className="p-5 md:p-7 bg-gradient-to-br from-rose-50/80 via-pink-50/60 to-amber-50/40 relative overflow-hidden">
              <motion.div 
                className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-rose-300/30 to-pink-300/30 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative z-10 flex items-start gap-3">
                <motion.div 
                  className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-black shadow-lg border-2 border-white/30"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {currentIndex + 1}
                </motion.div>
                <div className="flex-1">
                  <div className="text-[10px] font-extrabold text-rose-400 uppercase tracking-widest mb-1">
                    ✨ Savol
                  </div>
                  <h2 className="text-lg md:text-2xl font-black text-gray-800 leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>
                <motion.div 
                  className="text-3xl"
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >❓</motion.div>
              </div>
            </div>

            <div className="p-4 md:p-6 space-y-3">
              {currentQuestion.options.map((opt, i) => {
                const selected = feedback?.selected === i;
                const correct = currentQuestion.correctAnswer === i;
                const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                const optionGradients = [
                  'from-rose-400 to-pink-600',
                  'from-amber-400 to-orange-500',
                  'from-pink-400 to-rose-500',
                  'from-orange-400 to-rose-500',
                  'from-rose-500 to-amber-500',
                  'from-pink-500 to-amber-500',
                ];

                let cardStyle = "bg-white/85 border-2 border-white/80 text-gray-700";
                let icon = (
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${optionGradients[i % optionGradients.length]} text-white font-black flex items-center justify-center shadow-md border-2 border-white/30`}>
                    {optionLetters[i]}
                  </div>
                );

                if (feedback !== null) {
                  if (selected && feedback.isCorrect) {
                    cardStyle = "bg-gradient-to-r from-emerald-400 to-teal-500 border-emerald-400 text-white shadow-2xl shadow-emerald-300/50";
                    icon = <div className="bg-white text-emerald-500 rounded-full p-1.5 shadow-lg"><Icons.Check /></div>;
                  } else if (selected && !feedback.isCorrect) {
                    cardStyle = "bg-gradient-to-r from-rose-500 to-red-500 border-rose-500 text-white shadow-2xl shadow-rose-300/50";
                    icon = <div className="bg-white text-rose-500 rounded-full p-1.5 shadow-lg"><Icons.X /></div>;
                  } else if (!feedback.isCorrect && correct) {
                    cardStyle = "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-800";
                    icon = <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-lg"><Icons.Check /></div>;
                  } else {
                    cardStyle = "opacity-40 bg-gray-50/50 border-gray-100";
                  }
                }

                return (
                  <motion.button
                    key={i}
                    disabled={feedback !== null}
                    onClick={() => handleSelect(i)}
                    className={`w-full relative text-left p-3 md:p-4 rounded-2xl font-semibold flex items-center justify-between group overflow-hidden ${cardStyle}`}
                    variants={optionVariants}
                    initial="hidden"
                    animate="show"
                    custom={i}
                    whileHover={!feedback ? { scale: 1.01, x: 4 } : {}}
                    whileTap={!feedback ? { scale: 0.98 } : {}}
                  >
                    {selected && !feedback && (
                      <motion.div
                        className="absolute inset-0 border-2 border-rose-400 rounded-2xl pointer-events-none"
                        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <div className="flex items-center flex-1 gap-3 min-w-0 relative z-10">
                      <div className="flex-shrink-0">{icon}</div>
                      <span className="flex-1 text-sm md:text-base break-words">{opt}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {feedback !== null && (
                <motion.div 
                  className="p-4 md:p-6 bg-gradient-to-r from-rose-50/80 to-amber-50/60 border-t-2 border-rose-200/60"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 250, damping: 25 }}
                >
                  <div className={`text-center font-black mb-4 text-base md:text-lg flex items-center justify-center ${
                    feedback.isCorrect ? "text-emerald-600" : "text-rose-500"
                  }`}>
                    <motion.span 
                      className="text-3xl mr-2"
                      animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                    >
                      {feedback.isCorrect ? "🎉" : "💔"}
                    </motion.span>
                    <span>
                      {feedback.isCorrect 
                        ? combo >= 5 ? `🔥 MEGA COMBO x${combo}!` 
                        : combo >= 3 ? `Ajoyib! Combo x${combo} 🔥` 
                        : "Barakalla! To'g'ri 👏" 
                        : "Afsuski xato 🥺"}
                    </span>
                  </div>
                  <motion.button
                    onClick={goNext}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-black text-base md:text-lg shadow-2xl shadow-rose-300/50 relative overflow-hidden"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="relative flex items-center justify-center">
                      {currentIndex === questions.length - 1 ? "🏆 Natijani ko'rish" : "Keyingi savol"}
                      <Icons.ArrowRight />
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {feedback === null && (
              <div className="pb-5 text-center">
                <motion.button
                  onClick={() => setFinished(true)}
                  className="text-xs font-bold text-gray-500"
                  whileHover={{ scale: 1.1, color: "#E11D48" }}
                >
                  ⚡ Testni shu yerda yakunlash
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default QuizApp;