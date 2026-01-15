import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "https://api.au-pair-gallery.de";

const QuizApp = () => {
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
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

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const resetGroup = () => {
    // shu guruhni qaytadan
    if (currentGroup) startQuiz(currentGroup);
  };

  const backToGroups = () => {
    setCurrentGroup(null);
    setQuestions([]);
    setAnswers({});
    setFinished(false);
    setError(null);
  };

  // Natijalarni hisoblash
  const stats = useMemo(() => {
    if (!questions.length) return { correct: 0, wrong: 0, unanswered: 0, total: 0 };

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    for (const q of questions) {
      const chosen = answers[q.id];
      if (chosen === undefined || chosen === null) {
        unanswered++;
        continue;
      }
      if (chosen === q.correctAnswer) correct++;
      else wrong++;
    }

    return { correct, wrong, unanswered, total: questions.length };
  }, [questions, answers]);

  // Noto‘g‘ri + belgilanmagan savollar ro‘yxati
  const wrongList = useMemo(() => {
    return questions.filter((q) => {
      const chosen = answers[q.id];
      if (chosen === undefined || chosen === null) return true; // belgilanmagan ham chiqsin
      return chosen !== q.correctAnswer;
    });
  }, [questions, answers]);

  // Quiz tanlanmagan bo‘lsa: guruhlar ekrani
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

  // Quiz ekrani
  return (
    <div className="max-w-3xl mx-auto p-6">
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {loadingQuestions ? (
        <div className="p-6 bg-white rounded-xl shadow-sm border">Savollar yuklanmoqda...</div>
      ) : !finished ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={backToGroups}
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              Guruhlarga qaytish
            </button>

            <div className="text-sm text-gray-600">
              Belgilangan:{" "}
              <span className="font-semibold">
                {Object.keys(answers).length}/{questions.length}
              </span>
            </div>
          </div>

          {questions.map((q, idx) => (
            <div key={q.id} className="mb-8 p-4 bg-white border rounded-lg shadow-sm">
              <p className="font-bold mb-3">
                {idx + 1}. {q.question}
              </p>

              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(q.id, i)}
                  className={`block w-full text-left p-2 my-1 rounded border transition ${
                    answers[q.id] === i
                      ? "bg-blue-100 border-blue-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}

          <div className="flex gap-3">
            <button
              onClick={() => setFinished(true)}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded"
            >
              YAKUNLASH
            </button>
            <button
              onClick={resetGroup}
              className="py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded"
            >
              Qayta boshlash
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-xl border">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">Natijalar</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded border bg-green-50">
              <div className="text-sm text-gray-600">To‘g‘ri</div>
              <div className="text-2xl font-bold">{stats.correct}</div>
            </div>
            <div className="p-4 rounded border bg-red-50">
              <div className="text-sm text-gray-600">Noto‘g‘ri</div>
              <div className="text-2xl font-bold">{stats.wrong}</div>
            </div>
            <div className="p-4 rounded border bg-yellow-50">
              <div className="text-sm text-gray-600">Belgilanmagan</div>
              <div className="text-2xl font-bold">{stats.unanswered}</div>
            </div>
          </div>

          <div className="mb-3 text-sm text-gray-700">
            Jami savol: <span className="font-semibold">{stats.total}</span>
          </div>

          <h3 className="text-lg font-bold mb-3">
            Noto‘g‘ri / belgilanmagan savollar ({wrongList.length})
          </h3>

          {wrongList.length === 0 ? (
            <div className="p-4 rounded bg-green-50 border text-green-700">
              Barchasi to‘g‘ri. Ajoyib natija.
            </div>
          ) : (
            <div className="space-y-3">
              {wrongList.map((q) => {
                const chosen = answers[q.id];
                const isUnanswered = chosen === undefined || chosen === null;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded border ${
                      isUnanswered ? "bg-yellow-50" : "bg-red-50"
                    }`}
                  >
                    <p className="font-semibold mb-2">{q.question}</p>

                    <p className="text-sm">
                      Sizning javob:{" "}
                      <span className="font-bold">
                        {isUnanswered ? "Belgilanmagan" : q.options[chosen]}
                      </span>
                    </p>

                    <p className="text-sm text-green-800 font-semibold mt-1">
                      To‘g‘ri javob: {q.options[q.correctAnswer]}
                    </p>
                  </div>
                );
              })}
            </div>
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
      )}
    </div>
  );
};

export default QuizApp;
