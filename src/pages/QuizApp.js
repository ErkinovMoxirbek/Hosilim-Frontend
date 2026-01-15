import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "https://api.au-pair-gallery.de";

const QuizApp = () => {
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // answers: { [questionId]: optionIndex }
  const [answers, setAnswers] = useState({});

  // feedback: { selected, isCorrect }
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

        // reset states
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
    if (feedback) return; // feedback chiqib turganda qayta bosishni bloklaymiz

    const q = currentQuestion;
    const isCorrect = optionIndex === q.correctAnswer;

    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
    setFeedback({ selected: optionIndex, isCorrect });
  };

  const goNext = () => {
    if (!currentQuestion) return;

    // feedbackni yopamiz
    setFeedback(null);

    // oxirgi savol bo‘lsa yakunlash
    if (currentIndex >= questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrentIndex((i) => i + 1);
  };

  // Natijalar
  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;

    for (const q of questions) {
      const chosen = answers[q.id];
      if (chosen === undefined) continue;
      if (chosen === q.correctAnswer) correct++;
      else wrong++;
    }

    return {
      correct,
      wrong,
      total: questions.length,
      answered: Object.keys(answers).length,
    };
  }, [questions, answers]);

  const wrongList = useMemo(() => {
    return questions.filter((q) => {
      const chosen = answers[q.id];
      if (chosen === undefined) return false; // bu variantda hamma javob berilgan bo‘ladi odatda
      return chosen !== q.correctAnswer;
    });
  }, [questions, answers]);

  // GROUPS VIEW
  if (!currentGroup) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Test guruhlari</h1>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {loadingGroups ? (
            <div className="p-6 bg-white rounded-xl shadow-sm border">Yuklanmoqda...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => startQuiz(g.id)}
                  className="p-6 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition text-left"
                >
                  <div className="text-lg font-semibold">{g.name}</div>
                  <div className="text-sm opacity-90 mt-1">Boshlash</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // LOADING QUESTIONS
  if (loadingQuestions) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border">Savollar yuklanmoqda...</div>
      </div>
    );
  }

  // FINISHED VIEW
  if (finished)
  {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-xl border">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">Natijalar</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded border bg-green-50">
              <div className="text-sm text-gray-600">To‘g‘ri</div>
              <div className="text-2xl font-bold">{stats.correct}</div>
            </div>
            <div className="p-4 rounded border bg-red-50">
              <div className="text-sm text-gray-600">Noto‘g‘ri</div>
              <div className="text-2xl font-bold">{stats.wrong}</div>
            </div>
          </div>

          <div className="mb-5 text-sm text-gray-700">
            Jami savol: <span className="font-semibold">{stats.total}</span>
          </div>

          {/* Noto‘g‘ri savollarni ko‘rsatish (ixtiyoriy) */}
          {wrongList.length > 0 && (
            <>
              <h3 className="text-lg font-bold mb-3">
                Noto‘g‘ri javoblar ({wrongList.length})
              </h3>

              <div className="space-y-3">
                {wrongList.map((q) => {
                  const chosen = answers[q.id];
                  return (
                    <div key={q.id} className="p-4 rounded border bg-red-50">
                      <p className="font-semibold mb-2">{q.question}</p>
                      <p className="text-sm">
                        Sizning javob:{" "}
                        <span className="font-bold">{q.options[chosen]}</span>
                      </p>
                      <p className="text-sm text-green-800 font-semibold mt-1">
                        To‘g‘ri javob: {q.options[q.correctAnswer]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={resetGroup}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
            >
              Qayta boshlash
            </button>
            <button
              onClick={backToGroups}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded"
            >
              Guruh tanlash
            </button>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ VIEW (ONE QUESTION AT A TIME)
  return (
    <div className="max-w-3xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={backToGroups}
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
        >
          Guruhlarga qaytish
        </button>

        <div className="text-sm text-gray-600">
          Savol: <span className="font-semibold">{currentIndex + 1}</span> /{" "}
          <span className="font-semibold">{questions.length}</span>
        </div>
      </div>

      {currentQuestion && (
        <div className="p-5 bg-white border rounded-lg shadow-sm">
          <p className="font-bold mb-4">{currentQuestion.question}</p>

          <div className="space-y-2">
            {currentQuestion.options.map((opt, i) => {
              const selected = feedback?.selected === i;
              const correct = currentQuestion.correctAnswer === i;

              // feedback bo‘lsa: ranglar
              let cls =
                "w-full text-left p-3 rounded border transition bg-gray-50 border-gray-200 hover:bg-gray-100";

              if (feedback) {
                // tanlangan javob
                if (selected && feedback.isCorrect) cls = "w-full text-left p-3 rounded border bg-green-100 border-green-300";
                else if (selected && !feedback.isCorrect) cls = "w-full text-left p-3 rounded border bg-red-100 border-red-300";
                // to‘g‘ri javobni ham ajratib ko‘rsatish (noto‘g‘ri tanlanganda)
                else if (!feedback.isCorrect && correct) cls = "w-full text-left p-3 rounded border bg-green-50 border-green-200";
                else cls = "w-full text-left p-3 rounded border bg-gray-50 border-gray-200";
              }

              return (
                <button key={i} onClick={() => handleSelect(i)} className={cls}>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback blok */}
          {feedback && (
            <div className={`mt-4 p-3 rounded border ${feedback.isCorrect ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
              {feedback.isCorrect ? (
                <div className="font-semibold">To‘g‘ri!</div>
              ) : (
                <>
                  <div className="font-semibold">Noto‘g‘ri tanladingiz.</div>
                  <div className="mt-1 text-sm">
                    To‘g‘ri javob:{" "}
                    <span className="font-bold">
                      {currentQuestion.options[currentQuestion.correctAnswer]}
                    </span>
                  </div>
                </>
              )}

              <button
                onClick={goNext}
                className="mt-3 w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {currentIndex === questions.length - 1 ? "YAKUNLASH" : "KEYINGI"}
              </button>
            </div>
          )}

          {/* Agar javob tanlanmagan bo‘lsa, pastda yordamchi tugmalar */}
          {!feedback && (
            <div className="mt-5 flex gap-3">
              <button
                onClick={resetGroup}
                className="py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded"
              >
                Qayta boshlash
              </button>
              <button
                onClick={() => setFinished(true)}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
              >
                Yakunlash (erta)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizApp;
