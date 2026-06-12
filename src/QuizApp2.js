import React, { useEffect, useMemo, useState } from "react";

// ============================================
// 🎨 ICONS (Minimalist & Clean)
// ============================================
const Icons = {
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
};

// ============================================
// ⚙️ HELPERS (Logika o'zgarishsiz qoldi)
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

  // Yuklash logikasi
  useEffect(() => {
    let alive = true;
    setLoadingGroups(true);
    fetch("/tests.json")
      .then((res) => (res.ok ? res.json() : Promise.reject("not found")))
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
      .catch(() => alive && setError("Ma'lumot topilmadi. public/tests.json faylini tekshiring."))
      .finally(() => alive && setLoadingGroups(false));
    return () => {
      alive = false;
    };
  }, []);

  const resetState = () => {
    setFinished(false);
    setAnswers({});
    setCurrentIndex(0);
    setFeedback(null);
  };

  const backToGroups = () => {
    setCurrentGroup(null);
    setQuestions([]);
    resetState();
    setError(null);
  };

  const startQuiz = (groupId) => {
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
      setError("Savollarni yuklab bo'lmadi.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const startRandom25 = () => {
    if (allQuestions.length === 0) return;
    setLoadingQuestions(true);
    setError(null);
    setCurrentGroup("random-mix");
    try {
      setQuestions(processQuestionsData(allQuestions).slice(0, 25));
      resetState();
    } catch {
      setError("Tasodifiy testni tayyorlab bo'lmadi.");
      setCurrentGroup(null);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetGroup = () => {
    if (currentGroup === "random-mix") startRandom25();
    else if (currentGroup) startQuiz(currentGroup);
  };

  const currentQuestion = questions[currentIndex];

  const handleSelect = (optionIndex) => {
    if (!currentQuestion || feedback !== null) return;
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
    setFeedback({ selected: optionIndex, isCorrect });
  };

  const goNext = () => {
    setFeedback(null);
    if (currentIndex >= questions.length - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const stats = useMemo(() => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return { correct, wrong: questions.length - correct, total: questions.length };
  }, [questions, answers]);

  const wrongList = useMemo(() => {
    return questions.filter(
      (q) => answers[q.id] !== undefined && answers[q.id] !== q.correctAnswer
    );
  }, [questions, answers]);

  // ============================================
  // 📐 COMPONENTS & UI
  // ============================================
  const Layout = ({ children }) => (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 pb-12 selection:bg-gray-200">
      {/* Oddiy Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-4 flex flex-col items-center justify-center">
          <h1 className="text-sm font-bold tracking-widest text-gray-900 uppercase">
            Maxsus Nilufarxon uchun
          </h1>
          <p className="text-[10px] text-gray-500 font-medium tracking-wider mt-1 uppercase">
            Texnologiya fani testlari
          </p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-5 mt-8 w-full">{children}</div>
    </div>
  );

  // --- XATOLIK ---
  if (error) {
    return (
      <Layout>
        <div className="text-center py-20 border border-gray-200 rounded-2xl bg-gray-50">
          <div className="text-gray-900 mb-2 font-bold text-xl">Xatolik yuz berdi</div>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </Layout>
    );
  }

  // --- MENU / GURUHLAR ---
  if (!currentGroup) {
    return (
      <Layout>
        <div className="space-y-10 animate-in fade-in duration-500 slide-in-from-bottom-4">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Testlar to'plami</h2>
            <p className="text-gray-500 text-sm mt-2">Bilimingizni sinab ko'ring</p>
          </div>

          {loadingGroups ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => startQuiz(g.id)}
                    className="flex items-center justify-between p-5 bg-white border border-gray-200 hover:border-gray-900 rounded-2xl shadow-sm hover:shadow-md transition-all group text-left"
                  >
                    <div>
                      <div className="text-lg font-bold text-gray-900">{g.name}</div>
                      <div className="text-xs text-gray-500 font-medium mt-1">
                        {g.count} ta savol
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gray-200 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icons.ArrowRight />
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={startRandom25}
                  className="w-full flex items-center justify-between p-6 bg-gray-900 text-white hover:bg-black rounded-2xl shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="text-left">
                    <div className="text-xl font-bold">Tavakkal 25 Test</div>
                    <div className="text-xs text-gray-400 mt-1">Barcha savollardan aralash</div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center">
                    <Icons.ArrowRight />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // --- YUKLANMOQDA ---
  if (loadingQuestions) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 text-sm font-medium tracking-wide">Tayyorlanmoqda...</p>
        </div>
      </Layout>
    );
  }

  // --- NATIJALAR ---
  if (finished) {
    const percentage = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
    const isSuccess = percentage >= 80;

    return (
      <Layout>
        <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 md:p-12 text-center border-b border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Test Yakunlandi</h2>
            <p className="text-sm text-gray-500 mb-8">
              {isSuccess ? "Ajoyib natija!" : "Yana urinib ko'ring, albatta o'xshaydi."}
            </p>

            {/* Foiz */}
            <div className="text-[5rem] font-black leading-none tracking-tighter text-gray-900 mb-2">
              {percentage}%
            </div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-gray-200 text-sm font-bold text-gray-700 bg-gray-50">
              {stats.correct} / {stats.total} to'g'ri
            </div>

            {/* Statistika Bloklari */}
            <div className="grid grid-cols-2 gap-4 mt-10 max-w-sm mx-auto">
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">To'g'ri</div>
                <div className="text-3xl font-black text-gray-900">{stats.correct}</div>
              </div>
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Xato</div>
                <div className="text-3xl font-black text-gray-900">{stats.wrong}</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetGroup}
              className="flex-1 flex items-center justify-center py-4 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors"
            >
              <Icons.Refresh /> Qayta ishlash
            </button>
            <button
              onClick={backToGroups}
              className="flex-1 flex items-center justify-center py-4 bg-white border border-gray-200 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Icons.Home /> Menyuga qaytish
            </button>
          </div>
        </div>

        {/* Xatolar tahlili */}
        {wrongList.length > 0 && (
          <div className="mt-8 animate-in fade-in duration-700 delay-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">Xatolar tahlili ({wrongList.length})</h3>
            <div className="space-y-4">
              {wrongList.map((q, idx) => (
                <div key={q.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex gap-3 mb-4">
                    <span className="text-gray-400 font-bold text-sm mt-0.5">{idx + 1}.</span>
                    <p className="font-bold text-gray-900">{q.question}</p>
                  </div>
                  <div className="space-y-2 ml-7">
                    <div className="flex items-start gap-2 text-sm text-gray-500 line-through decoration-gray-300">
                      <span className="mt-0.5"><Icons.X /></span>
                      <span>{q.options[answers[q.id]]}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm font-bold text-gray-900">
                      <span className="mt-0.5"><Icons.Check /></span>
                      <span>{q.options[q.correctAnswer]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Layout>
    );
  }

  // --- TEST JARAYONI ---
  const progressPercent = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <Layout>
      {/* Top boshqaruv */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={backToGroups}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Progress Text */}
        <div className="text-sm font-bold text-gray-900 tracking-widest">
          {currentIndex + 1} <span className="text-gray-300 mx-1">/</span> {questions.length}
        </div>
      </div>

      {/* Progress Bar (Qora-Oq) */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Savol va Variantlar */}
      {currentQuestion && (
        <div className="bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="p-4 md:p-6 space-y-3 bg-gray-50/50">
            {currentQuestion.options.map((opt, i) => {
              const selected = feedback?.selected === i;
              const correct = currentQuestion.correctAnswer === i;
              const letter = ['A', 'B', 'C', 'D', 'E', 'F'][i];

              // Dinamik Stillar
              let cardStyle = "bg-white border border-gray-200 text-gray-700 hover:border-gray-900";
              let iconStyle = "bg-gray-100 text-gray-500";

              if (feedback !== null) {
                if (selected && feedback.isCorrect) {
                  cardStyle = "bg-gray-900 border-gray-900 text-white";
                  iconStyle = "bg-white text-gray-900";
                } else if (selected && !feedback.isCorrect) {
                  cardStyle = "bg-gray-100 border-gray-200 text-gray-400 line-through";
                  iconStyle = "bg-gray-200 text-gray-400";
                } else if (!feedback.isCorrect && correct) {
                  cardStyle = "bg-white border-[2px] border-gray-900 text-gray-900 font-bold shadow-sm";
                  iconStyle = "bg-gray-900 text-white";
                } else {
                  cardStyle = "opacity-50 bg-gray-50 border-gray-100";
                }
              }

              return (
                <button
                  key={i}
                  disabled={feedback !== null}
                  onClick={() => handleSelect(i)}
                  className={`w-full text-left p-4 rounded-xl font-medium flex items-center gap-4 transition-all duration-200 ${cardStyle} ${
                    !feedback ? "active:scale-[0.99]" : ""
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black transition-colors ${iconStyle}`}>
                    {letter}
                  </div>
                  <span className="flex-1 text-sm md:text-base leading-snug">{opt}</span>
                  
                  {/* To'g'ri/Xato iconkasi */}
                  {feedback !== null && (selected || (!feedback.isCorrect && correct)) && (
                    <div className="flex-shrink-0">
                      {correct ? <Icons.Check /> : <Icons.X />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Keyingi tugma */}
          {feedback !== null && (
            <div className="p-6 bg-white border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={goNext}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gray-900 text-white font-bold text-base hover:bg-black transition-colors active:scale-[0.98]"
              >
                {currentIndex === questions.length - 1 ? "Natijani ko'rish" : "Keyingi savol"}
                <Icons.ArrowRight />
              </button>
            </div>
          )}

          {/* Erta yakunlash */}
          {feedback === null && (
            <div className="pb-6 text-center">
              <button
                onClick={() => setFinished(true)}
                className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors underline decoration-transparent hover:decoration-gray-300 underline-offset-4"
              >
                Testni shu yerda yakunlash
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default QuizApp;