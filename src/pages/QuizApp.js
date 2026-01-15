import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "https://api.au-pair-gallery.de";

// Oddiy SVG iconlar (kutubxona shart emas)
const Icons = {
  Check: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
  ),
  Home: () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  )
};

const QuizApp = () => {
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);

  // Groups load
  useEffect(() => {
    let alive = true;
    setLoadingGroups(true);
    setError(null);

    fetch(`${API_BASE}/quiz/groups`)
      .then((res) => {
        if (!res.ok) throw new Error("Guruhlarni yuklab bo‘lmadi");
        return res.json();
      })
      .then((data) => {
        if (!alive) return;
        setGroups(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message || "Xatolik");
      })
      .finally(() => {
        if (!alive) return;
        setLoadingGroups(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const startQuiz = (groupId) => {
    let alive = true;
    setLoadingQuestions(true);
    setError(null);

    fetch(`${API_BASE}/quiz/questions/${groupId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Savollarni yuklab bo‘lmadi");
        return res.json();
      })
      .then((data) => {
        if (!alive) return;
        setQuestions(Array.isArray(data) ? data : []);
        setCurrentGroup(groupId);
        setFinished(false);
        setAnswers({});
        setCurrentIndex(0);
        setFeedback(null);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message || "Xatolik");
      })
      .finally(() => {
        if (!alive) return;
        setLoadingQuestions(false);
      });

    return () => {
      alive = false;
    };
  };

  const backToGroups = () => {
    setCurrentGroup(null);
    setQuestions([]);
    setAnswers({});
    setFinished(false);
    setCurrentIndex(0);
    setFeedback(null);
    setError(null);
  };

  const resetGroup = () => {
    if (currentGroup) startQuiz(currentGroup);
  };

  const currentQuestion = questions[currentIndex];

  const handleSelect = (optionIndex) => {
    if (!currentQuestion) return;
    if (feedback) return;

    const q = currentQuestion;
    const isCorrect = optionIndex === q.correctAnswer;

    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
    setFeedback({ selected: optionIndex, isCorrect });
  };

  const goNext = () => {
    if (!currentQuestion) return;
    setFeedback(null);
    if (currentIndex >= questions.length - 1) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    for (const q of questions) {
      const chosen = answers[q.id];
      if (chosen === undefined) continue;
      if (chosen === q.correctAnswer) correct++;
      else wrong++;
    }
    return { correct, wrong, total: questions.length };
  }, [questions, answers]);

  const wrongList = useMemo(() => {
    return questions.filter((q) => {
      const chosen = answers[q.id];
      if (chosen === undefined) return false;
      return chosen !== q.correctAnswer;
    });
  }, [questions, answers]);

  // --- UI COMPONENTS ---

  // Sticky Header Component
  const StickyHeader = () => (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100 mb-6">
      <div className="max-w-3xl mx-auto px-4 py-3 flex flex-col items-center justify-center text-center">
        <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Nilufarxon uchun maxsus ✨(م)dan
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          O‘qishlaringizga doim omad tilayman! 🎓 
        </p>
      </div>
    </div>
  );

  // Background Wrapper
  const Layout = ({ children }) => (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      <StickyHeader />
      <div className="max-w-3xl mx-auto px-4 w-full">
        {children}
      </div>
    </div>
  );

  // Error Message
  if (error) {
    return (
      <Layout>
        <div className="p-6 bg-white rounded-2xl shadow-xl border border-red-100 text-center">
          <div className="text-red-500 mb-2 font-bold text-lg">Xatolik yuz berdi 😔</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-full font-semibold shadow-lg hover:bg-red-600 transition"
          >
            Sahifani yangilash
          </button>
        </div>
      </Layout>
    );
  }

  // --- VIEW: GROUPS LIST ---
  if (!currentGroup) {
    return (
      <Layout>
        <div className="animate-fade-in-up">
          <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Test Guruhlari</h2>
          
          {loadingGroups ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500 text-sm">Guruhlar yuklanmoqda...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => startQuiz(g.id)}
                  className="group relative overflow-hidden p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl border border-transparent hover:border-purple-200 transition-all duration-300 text-left active:scale-[0.98]"
                >
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                    <div className="text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                      {g.name}
                    </div>
                    <div className="flex items-center mt-3 text-sm font-medium text-purple-600">
                      Boshlash <Icons.ArrowRight />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // --- VIEW: LOADING QUESTIONS ---
  if (loadingQuestions) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Savollar tayyorlanmoqda...</p>
        </div>
      </Layout>
    );
  }

  // --- VIEW: RESULT ---
  if (finished) {
    const percentage = Math.round((stats.correct / stats.total) * 100);
    const isSuccess = percentage >= 80;

    return (
      <Layout>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
          {/* Result Header */}
          <div className={`p-8 text-center ${isSuccess ? 'bg-gradient-to-b from-green-50 to-white' : 'bg-gradient-to-b from-red-50 to-white'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Natijalar</h2>
            <p className="text-sm text-gray-500 mb-6">Test yakunlandi</p>
            
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={351} 
                  strokeDashoffset={351 - (351 * percentage) / 100} 
                  className={isSuccess ? "text-green-500" : "text-pink-500"} 
                />
              </svg>
              <div className="absolute text-3xl font-bold text-gray-800">{percentage}%</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="text-xs text-green-600 uppercase font-bold tracking-wider">To‘g‘ri</div>
                <div className="text-2xl font-bold text-green-700">{stats.correct}</div>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="text-xs text-red-600 uppercase font-bold tracking-wider">Xato</div>
                <div className="text-2xl font-bold text-red-700">{stats.wrong}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <button onClick={resetGroup} className="flex-1 flex items-center justify-center py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition active:scale-95">
              <Icons.Refresh /> Qayta ishlash
            </button>
            <button onClick={backToGroups} className="flex-1 flex items-center justify-center py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition active:scale-95">
              <Icons.Home /> Guruhlar
            </button>
          </div>

          {/* Mistakes Analysis */}
          {wrongList.length > 0 && (
            <div className="bg-gray-50 p-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Xatolar tahlili ({wrongList.length})</h3>
              <div className="space-y-4">
                {wrongList.map((q) => {
                  const chosen = answers[q.id];
                  return (
                    <div key={q.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
                      <p className="font-semibold text-gray-800 mb-3">{q.question}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start text-red-600 bg-red-50 p-2 rounded-lg">
                          <span className="font-bold mr-2">Siz:</span> {q.options[chosen]}
                        </div>
                        <div className="flex items-start text-green-700 bg-green-50 p-2 rounded-lg">
                          <span className="font-bold mr-2">To‘g‘ri:</span> {q.options[q.correctAnswer]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // --- VIEW: QUIZ ACTIVE ---
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <Layout>
      {/* Top Bar inside Quiz */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button onClick={backToGroups} className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center transition">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Chiqish
        </button>
        <div className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {currentQuestion && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
          {/* Question Text */}
          <div className="p-6 md:p-8 bg-gradient-to-b from-white to-gray-50">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {currentQuestion.options.map((opt, i) => {
              const selected = feedback?.selected === i;
              const correct = currentQuestion.correctAnswer === i;
              
              let statusClass = "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700";
              let icon = null;

              if (feedback) {
                if (selected && feedback.isCorrect) {
                  statusClass = "bg-green-500 border-green-500 text-white shadow-md scale-[1.02]";
                  icon = <Icons.Check />;
                } else if (selected && !feedback.isCorrect) {
                  statusClass = "bg-red-500 border-red-500 text-white shadow-md";
                  icon = <Icons.X />;
                } else if (!feedback.isCorrect && correct) {
                  statusClass = "bg-green-100 border-green-200 text-green-800";
                  icon = <Icons.Check />;
                } else {
                  statusClass = "bg-gray-50 border-gray-100 text-gray-400 opacity-60";
                }
              }

              return (
                <button
                  key={i}
                  disabled={!!feedback}
                  onClick={() => handleSelect(i)}
                  className={`w-full relative text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium flex items-center justify-between ${statusClass} ${!feedback ? 'active:scale-98' : ''}`}
                >
                  <span className="flex-1 pr-2">{opt}</span>
                  {icon && <span className="flex-shrink-0">{icon}</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {feedback && (
            <div className="p-6 pt-2 bg-white border-t border-gray-100">
               <div className={`mb-4 text-sm font-semibold text-center ${feedback.isCorrect ? "text-green-600" : "text-red-500"}`}>
                  {feedback.isCorrect ? "Javob to‘g‘ri! 🎉" : "Afsuski noto‘g‘ri 😕"}
               </div>
              <button
                onClick={goNext}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg shadow-purple-200 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center"
              >
                {currentIndex === questions.length - 1 ? "NATIJANI KO‘RISH" : "KEYINGI SAVOL"}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          )}

          {/* Early Finish Button (Only visible if no answer selected yet) */}
          {!feedback && (
             <div className="px-6 pb-6 pt-2 flex justify-center">
                <button 
                  onClick={() => setFinished(true)} 
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Testni vaqtli yakunlash
                </button>
             </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default QuizApp;