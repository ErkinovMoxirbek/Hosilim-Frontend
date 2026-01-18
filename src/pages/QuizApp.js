import React, { useEffect, useMemo, useState } from "react";

// --- ICONS (Yumshoqroq chiziqlar bilan) ---
const Icons = {
  Check: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  X: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      className="w-5 h-5 ml-2"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  Refresh: () => (
    <svg
      className="w-5 h-5 mr-2"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Home: () => (
    <svg
      className="w-5 h-5 mr-2"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Sparkles: () => (
    <svg
      className="w-5 h-5 mr-2"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  ),
};

// --- YORDAMCHI FUNKSIYALAR ---

// Massivni aralashtirish (Fisher-Yates shuffle)
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Savollar va variantlarni qayta ishlash
const processQuestionsData = (rawData) => {
  if (!Array.isArray(rawData)) return [];

  // 1. Savollar ketma-ketligini aralashtirish
  const shuffledQuestions = shuffleArray(rawData);

  // 2. Har bir savolning variantlarini aralashtirish
  return shuffledQuestions.map((q) => {
    if (!q || !Array.isArray(q.options) || typeof q.correctAnswer !== "number") return q;

    // To'g'ri javob matnini saqlab qolamiz
    const correctOptionText = q.options[q.correctAnswer];

    // Variantlarni aralashtiramiz
    const shuffledOptions = shuffleArray(q.options);

    // Yangi variantlar ichidan to'g'ri javobning yangi indeksini topamiz
    const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

    return {
      ...q,
      options: shuffledOptions,
      correctAnswer: newCorrectIndex,
    };
  });
};

const QuizApp = () => {
  // Backenddagi groupCount logikasi
  const GROUP_COUNT = 5;

  const [groups, setGroups] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);

  const [currentGroup, setCurrentGroup] = useState(null); // 'random-mix' bo'lishi ham mumkin
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);

  // tests.json dan yuklash (public/tests.json)
  useEffect(() => {
    let alive = true;
    setLoadingGroups(true);

    fetch("/tests.json")
      .then((res) => {
        if (!res.ok) throw new Error("tests.json topilmadi");
        return res.json();
      })
      .then((data) => {
        if (!alive) return;

        const all = Array.isArray(data) ? data : [];
        setAllQuestions(all);

        // Spring Boot logikasi: groupCount=9, size=ceil(all/groupCount)
        const groupCount = GROUP_COUNT;
        const size = Math.ceil(all.length / groupCount);

        const gs = Array.from({ length: groupCount }, (_, i) => ({
          id: i + 1,
          name: `${i + 1}-Guruh`,
          // ixtiyoriy: UI uchun
          count: Math.max(0, Math.min(size, all.length - i * size)),
        }));

        setGroups(gs);
      })
      .catch(() => alive && setError("tests.json yuklanmadi. public/tests.json ni tekshiring."))
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

  // Oddiy guruhni boshlash (Spring Boot /questions/{groupId} logikasi)
  const startQuiz = (groupId) => {
    setLoadingQuestions(true);
    setError(null);

    try {
      const all = allQuestions;
      const groupCount = GROUP_COUNT;
      const size = Math.ceil(all.length / groupCount);

      const start = (groupId - 1) * size;
      const end = Math.min(start + size, all.length);

      const subset = start >= all.length || start < 0 ? [] : all.slice(start, end);

      const processed = processQuestionsData(subset);
      setQuestions(processed);
      setCurrentGroup(groupId);
      resetState();
    } catch (e) {
      setError("Savollarni yuklab bo'lmadi 😔");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // RANDOM 25 (Super Mode) — hamma savollardan 25 ta aralash
  const startRandom25 = () => {
    if (allQuestions.length === 0) return;

    setLoadingQuestions(true);
    setError(null);
    setCurrentGroup("random-mix");

    try {
      let processed = processQuestionsData(allQuestions).slice(0, 25);
      if (processed.length === 0) throw new Error("Savollar topilmadi");

      setQuestions(processed);
      resetState();
    } catch (e) {
      setError("Tasodifiy testni tayyorlab bo'lmadi 🥺");
      setCurrentGroup(null);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetGroup = () => {
    if (currentGroup === "random-mix") {
      startRandom25();
    } else if (currentGroup) {
      startQuiz(currentGroup);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleSelect = (optionIndex) => {
    if (!currentQuestion || feedback) return;
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

  // Natijalar hisobi
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

  // --- COMPONENTLAR ---

  const StickyHeader = () => (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100 mb-6">
      <div className="max-w-3xl mx-auto px-4 py-3 flex flex-col items-center justify-center text-center">
        <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Bu maxsus Nilufarxon uchun tayyorlangan.
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Agar siz Nilufarxon bo'lmasangiz, iltimos, Nilufarxonga raxmat ayting!  
        </p>
      </div>
    </div>
  );

  const Layout = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 font-sans text-gray-700 pb-10">
      <StickyHeader />
      <div className="max-w-3xl mx-auto px-4 w-full">{children}</div>
    </div>
  );

  // Xatolik ekrani
  if (error) {
    return (
      <Layout>
        <div className="p-8 bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-red-100 text-center animate-fade-in-up">
          <div className="text-4xl mb-3">🥺</div>
          <div className="text-red-500 mb-2 font-bold text-lg">Xatolik yuz berdi</div>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-400 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-500 transition transform hover:-translate-y-1"
          >
            Qayta urinish
          </button>
        </div>
      </Layout>
    );
  }

  // --- 1. GURUHLAR RO'YXATI & RANDOM TUGMA ---
  if (!currentGroup) {
    return (
      <Layout>
        <div className="animate-fade-in-up space-y-8">
          {/* Sarlavha */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Testlar to'plami</h2>
            <p className="text-gray-500 text-sm">O'z bilimingizni sinab ko'ring!</p>
          </div>

          {loadingGroups ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-400 text-sm font-medium">Yuklanmoqda...</p>
            </div>
          ) : (
            <>
              {/* GURUHLAR GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => startQuiz(g.id)}
                    className="group relative overflow-hidden p-5 bg-white rounded-3xl shadow-sm hover:shadow-xl border border-pink-50 hover:border-pink-200 transition-all duration-300 text-left active:scale-[0.98]"
                  >
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full opacity-40 group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="text-lg font-bold text-gray-700 group-hover:text-pink-600 transition-colors">
                        {g.name}
                      </div>
                      <div className="flex items-center mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-pink-500">
                        Boshlash <Icons.ArrowRight />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* RANDOM 25 TUGMASI */}
              <div className="mt-8 pt-6 border-t border-dashed border-pink-200">
                <button
                  onClick={startRandom25}
                  className="w-full relative overflow-hidden p-6 rounded-3xl shadow-xl shadow-purple-200 transition-transform hover:-translate-y-1 active:scale-95 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>

                  <div className="absolute top-2 right-4 text-white/30 text-2xl">✨</div>
                  <div className="absolute bottom-2 left-4 text-white/30 text-xl">✦</div>

                  <div className="relative z-10 flex items-center justify-center space-x-3 text-white">
                    <Icons.Sparkles />
                    <div className="text-left">
                      <div className="text-xl font-bold">Tavakkal 25 Test</div>
                      <div className="text-xs text-pink-100 font-medium opacity-90">
                        Barcha savollardan aralash
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </Layout>
    );
  }

  // --- 2. SAVOLLAR YUKLANISHI ---
  if (loadingQuestions) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 animate-pulse">
          <div className="text-5xl mb-4">🌸</div>
          <p className="text-gray-500 font-medium">Savollar tayyorlanmoqda...</p>
        </div>
      </Layout>
    );
  }

  // --- 3. NATIJA OYNASI ---
  if (finished) {
    const percentage = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
    const isSuccess = percentage >= 80;

    return (
      <Layout>
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white overflow-hidden animate-fade-in-up">
          <div className="p-8 text-center relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${
                isSuccess ? "from-green-400 to-emerald-500" : "from-pink-400 to-red-500"
              }`}
            ></div>

            <h2 className="text-2xl font-bold text-gray-800 mt-2 mb-1">Natijalar</h2>
            <p className="text-sm text-gray-500 mb-8">
              {isSuccess ? "Ajoyib natija! 😍" : "Yaxshi, lekin yana urinib ko'ring 😊"}
            </p>

            <div className="relative inline-flex items-center justify-center mb-6">
              <svg className="w-40 h-40 transform -rotate-90 filter drop-shadow-md">
                <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="10" fill="transparent" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * percentage) / 100}
                  strokeLinecap="round"
                  className={
                    isSuccess
                      ? "text-green-500 transition-all duration-1000"
                      : "text-pink-500 transition-all duration-1000"
                  }
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-gray-800">{percentage}%</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <div className="flex-1 bg-green-50/80 p-3 rounded-2xl border border-green-100">
                <div className="text-green-600 text-xs font-bold uppercase">To'g'ri</div>
                <div className="text-2xl font-bold text-green-700">{stats.correct}</div>
              </div>
              <div className="flex-1 bg-red-50/80 p-3 rounded-2xl border border-red-100">
                <div className="text-red-500 text-xs font-bold uppercase">Xato</div>
                <div className="text-2xl font-bold text-red-600">{stats.wrong}</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetGroup}
              className="flex-1 flex items-center justify-center py-4 px-6 bg-gray-800 text-white font-bold rounded-2xl shadow-lg hover:bg-gray-900 transition transform active:scale-95"
            >
              <Icons.Refresh /> Qayta ishlash
            </button>
            <button
              onClick={backToGroups}
              className="flex-1 flex items-center justify-center py-4 px-6 bg-white text-gray-700 font-bold rounded-2xl shadow-md hover:bg-gray-50 border border-gray-100 transition transform active:scale-95"
            >
              <Icons.Home /> Menyuga qaytish
            </button>
          </div>

          {wrongList.length > 0 && (
            <div className="p-6 bg-pink-50/30 border-t border-pink-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pl-1 border-l-4 border-pink-400">
                Xatolar tahlili
              </h3>
              <div className="space-y-4">
                {wrongList.map((q) => (
                  <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100/50">
                    <p className="font-semibold text-gray-800 mb-3">{q.question}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-red-500 bg-red-50 px-3 py-2 rounded-xl">
                        <Icons.X /> <span className="ml-2 font-medium">{q.options[answers[q.id]]}</span>
                      </div>
                      <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                        <Icons.Check /> <span className="ml-2 font-medium">{q.options[q.correctAnswer]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // --- 4. TEST JARAYONI ---
  const progressPercent = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <Layout>
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button
          onClick={backToGroups}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-400 hover:text-gray-600 transition hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="bg-white px-4 py-1.5 rounded-full shadow-sm text-sm font-bold text-purple-600 border border-purple-100">
          {currentIndex + 1} <span className="text-gray-300">/</span> {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-700 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Savol Kartasi */}
      {currentQuestion && (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-purple-100/50 border border-white overflow-hidden animate-fade-in-up">
          <div className="p-6 md:p-8 bg-gradient-to-b from-purple-50/50 to-transparent">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">{currentQuestion.question}</h2>
          </div>

          <div className="p-6 space-y-3">
            {currentQuestion.options.map((opt, i) => {
              const selected = feedback?.selected === i;
              const correct = currentQuestion.correctAnswer === i;

              let cardStyle =
                "bg-white border-2 border-gray-100 text-gray-600 hover:border-purple-200 hover:bg-purple-50";
              let icon = <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>;

              if (feedback) {
                if (selected && feedback.isCorrect) {
                  cardStyle = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200 transform scale-[1.02]";
                  icon = (
                    <div className="bg-white text-green-500 rounded-full p-0.5">
                      <Icons.Check />
                    </div>
                  );
                } else if (selected && !feedback.isCorrect) {
                  cardStyle = "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200";
                  icon = (
                    <div className="bg-white text-red-500 rounded-full p-0.5">
                      <Icons.X />
                    </div>
                  );
                } else if (!feedback.isCorrect && correct) {
                  cardStyle = "bg-green-100 border-green-200 text-green-800";
                  icon = (
                    <div className="bg-green-500 text-white rounded-full p-0.5">
                      <Icons.Check />
                    </div>
                  );
                } else {
                  cardStyle = "opacity-50 bg-gray-50 border-gray-100";
                }
              }

              return (
                <button
                  key={i}
                  disabled={!!feedback}
                  onClick={() => handleSelect(i)}
                  className={`w-full relative text-left p-4 rounded-2xl transition-all duration-300 font-medium flex items-center justify-between group ${cardStyle} ${
                    !feedback ? "active:scale-[0.98]" : ""
                  }`}
                >
                  <span className="flex-1 pr-3">{opt}</span>
                  <span className="flex-shrink-0 transition-transform group-hover:scale-110">{icon}</span>
                </button>
              );
            })}
          </div>

          {feedback && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 animate-fade-in-up">
              <div className={`text-center font-bold mb-4 ${feedback.isCorrect ? "text-green-600" : "text-red-500"}`}>
                {feedback.isCorrect ? "Barakalla! To'g'ri 👏" : "Afsuski xato 🥺"}
              </div>
              <button
                onClick={goNext}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-xl shadow-purple-300 hover:shadow-2xl hover:brightness-110 transition-all transform active:scale-95 flex items-center justify-center"
              >
                {currentIndex === questions.length - 1 ? "Natijani ko'rish" : "Keyingi savol"}
                <Icons.ArrowRight />
              </button>
            </div>
          )}

          {!feedback && (
            <div className="pb-6 text-center">
              <button
                onClick={() => setFinished(true)}
                className="text-xs font-medium text-gray-400 hover:text-pink-500 transition-colors"
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
