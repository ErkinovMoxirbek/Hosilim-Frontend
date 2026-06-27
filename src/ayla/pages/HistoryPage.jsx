// src/screens/HistoryScreen.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import historyService from "../services/historyService";
import { fmtDateTime, fmtDuration } from "../utils/formatters";

const HistoryScreen = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL"); // ALL, COMPLETED, ACTIVE

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyService.getAllSessions();
      setSessions(data);
    } catch (err) {
      setError("Ma'lumotni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return s.status === "STARTED";
    if (filter === "COMPLETED") return s.status !== "STARTED";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans pb-10">
      {/* iOS Header - Shaffof va Blur effektli */}
      <div className="sticky top-0 bg-[#F2F2F7]/80 backdrop-blur-xl z-20 pt-12 px-5 pb-4 border-b border-gray-200/50">
        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">Savdo tarixi</h1>
        <p className="text-[14px] text-gray-500 font-medium mt-1">
          {loading ? "Yuklanmoqda..." : `${sessions.length} ta reys topildi`}
        </p>

        {/* Segmented Control (iOS uslubidagi tablar) */}
        <div className="flex bg-[#E3E3E8] rounded-[9px] p-[2px] mt-5">
          {[
            { id: "ALL", label: "Barchasi" },
            { id: "COMPLETED", label: "Yakunlangan" },
            { id: "ACTIVE", label: "Faol" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-[7px] transition-all duration-200 ${
                filter === f.id
                  ? "bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kontent qismi */}
      <div className="px-5 mt-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B5E20]"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>
            <button
              onClick={fetchSessions}
              className="bg-gray-900 text-white px-6 py-2 rounded-full text-[14px] font-medium active:scale-95 transition-transform"
            >
              Qayta urinish
            </button>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium text-[15px] text-gray-500">Reys topilmadi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const isActive = session.status === "STARTED";
              const duration = fmtDuration(session.startedAt, session.completedAt);

              return (
                <div
                  key={session.id}
                  // Mana shu yer bosganda o'tishni ta'minlaydi
                  onClick={() => navigate(`/ayla/history/${session.id}`)}
                  className="bg-white rounded-[16px] p-4 flex items-center cursor-pointer active:bg-gray-50 transition-colors shadow-sm"
                >
                  {/* Status chizig'i */}
                  <div
                    className={`w-[4px] h-[48px] rounded-full mr-4 ${
                      isActive ? "bg-[#3B82F6]" : "bg-[#1B5E20]"
                    }`}
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[16px] text-gray-900">
                        {fmtDateTime(session.startedAt)}
                      </span>
                      <span
                        className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${
                          isActive
                            ? "bg-blue-50 text-blue-600"
                            : "bg-green-50 text-[#1B5E20]"
                        }`}
                      >
                        {isActive ? "Faol" : "Yakunlangan"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[13px] text-gray-500 font-medium mt-1">
                      {session.driverName && (
                        <span>👤 {session.driverName}</span>
                      )}
                      {duration && <span>◷ {duration}</span>}
                    </div>
                  </div>

                  {/* O'ng tomondagi icon */}
                  <div className="ml-3 text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;