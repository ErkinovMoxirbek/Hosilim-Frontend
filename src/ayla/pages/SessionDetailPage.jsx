// src/screens/SessionDetailScreen.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import historyService from "../services/historyService";
import { fmtDateTime, fmtSomH, fmtQtyD } from "../utils/formatters";

const SessionDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumData, ordData] = await Promise.all([
          historyService.getSessionSummary(id),
          historyService.getSessionOrders(id),
        ]);
        setSummary(sumData);
        setOrders(ordData);
      } catch (err) {
        setError("Ma'lumotni yuklab bo'lmadi");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B5E20]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-5">
        <p className="text-red-500 text-[15px] font-medium mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="text-blue-500 font-medium">Ortga qaytish</button>
      </div>
    );
  }

  if (!summary) return null;

  const isActive = summary.status === "STARTED";

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans pb-12">
      
      {/* iOS uslubidagi Navigation Bar */}
      <div className="sticky top-0 bg-[#F2F2F7]/85 backdrop-blur-xl px-4 py-3 flex items-center z-20 border-b border-gray-200/60">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#1B5E20] font-semibold text-[16px] active:opacity-60 transition-opacity"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Ortga
        </button>
        <div className="mx-auto pr-10">
          <h1 className="text-[17px] font-bold text-gray-900 text-center">Reys tafsilotlari</h1>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">
        
        {/* 1. Status Banner */}
        <div className={`rounded-[20px] p-5 shadow-sm ${isActive ? "bg-[#3B82F6]" : "bg-[#1E293B]"}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] font-bold text-white/90 uppercase tracking-wide">
              {isActive ? "Faol reys" : "Yakunlangan reys"}
            </span>
            {summary.driverName && (
              <span className="text-[13px] font-medium text-white/90">👤 {summary.driverName}</span>
            )}
          </div>
          <div className="text-[15px] font-bold text-white mt-1">
            {fmtDateTime(summary.startedAt)} <span className="opacity-50 mx-1">→</span> {fmtDateTime(summary.completedAt)}
          </div>
          {summary.totalShopsVisited > 0 && (
            <div className="text-[14px] text-white/80 font-medium mt-3 bg-white/10 inline-block px-3 py-1 rounded-lg">
              {summary.totalShopsVisited} ta do'kon borildi
            </div>
          )}
        </div>

        {/* 2. Moliyaviy xulosalar (3 ta katak) */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-[16px] p-4 text-center shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Jami savdo</p>
            <p className="text-[15px] font-bold text-gray-900">{fmtSomH(summary.totalOrderAmount)}</p>
          </div>
          <div className="flex-1 bg-white rounded-[16px] p-4 text-center shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Yuklangan</p>
            <p className="text-[15px] font-bold text-[#059669]">{fmtSomH(summary.totalCollected)}</p>
          </div>
          <div className="flex-1 bg-white rounded-[16px] p-4 text-center shadow-sm">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Qarz</p>
            <p className={`text-[15px] font-bold ${summary.totalDebt > 0 ? "text-red-500" : "text-gray-400"}`}>
              {fmtSomH(summary.totalDebt)}
            </p>
          </div>
        </div>

        {/* 3. Do'konlar va buyurtmalar */}
        {orders.length > 0 && (
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wide text-gray-500">
              Do'konlar ({orders.length})
            </h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-[20px] p-4 shadow-sm">
                  {/* Do'kon nomi va puli */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-[16px] text-gray-900">{order.shopName || "Do'kon"}</span>
                    <span className="font-bold text-[16px] text-gray-900">{fmtSomH(order.totalAmount)}</span>
                  </div>

                  {/* Sotib olingan narsalar */}
                  <div className="space-y-2 mb-4 bg-gray-50 rounded-[12px] p-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[14px] text-gray-600 font-medium">
                        <span>{item.product?.name} <span className="text-gray-400 mx-1">×</span> {fmtQtyD(item.quantity, item.product?.unit)}</span>
                        <span>{fmtSomH(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>

                  {/* To'lov holati */}
                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    {order.paidAmount > 0 && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#059669] mr-2"></div>
                        <span className="text-[13px] font-bold text-[#059669]">
                          To'landi: {fmtSomH(order.paidAmount)}
                        </span>
                      </div>
                    )}
                    {order.debtAmount > 0 && (
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-[13px] font-bold text-red-500">
                          Qarz: {fmtSomH(order.debtAmount)}
                        </span>
                      </div>
                    )}
                    {order.debtAmount <= 0 && order.paidAmount >= order.totalAmount && (
                      <span className="text-[13px] font-bold text-[#059669]">✓ To'liq to'landi</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Umumiy Sotilgan mahsulotlar ro'yxati */}
        {summary.soldProducts?.length > 0 && (
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wide text-gray-500">
              Sotilgan mahsulotlar jami
            </h2>
            <div className="bg-white rounded-[20px] shadow-sm overflow-hidden">
              {summary.soldProducts.map((line, idx) => (
                <div key={idx} className={`flex justify-between items-center p-4 ${idx !== summary.soldProducts.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <span className="text-[15px] font-semibold text-gray-800 flex-1">{line.productName}</span>
                  <div className="text-right">
                    <div className="text-[15px] font-bold text-[#1B5E20]">{fmtQtyD(line.totalQuantity, line.unit)}</div>
                    {line.totalValue > 0 && (
                      <div className="text-[12px] font-medium text-gray-400 mt-0.5">{fmtSomH(line.totalValue)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Qaytarilgan mahsulotlar (Vozvrat) */}
        {summary.returnedProducts?.length > 0 && (
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 mb-3 ml-2 uppercase tracking-wide text-gray-500">
              Qaytarilgan mahsulotlar (Vozvrat)
            </h2>
            <div className="bg-white rounded-[20px] shadow-sm overflow-hidden border border-red-100">
              {summary.returnedProducts.map((line, idx) => (
                <div key={idx} className={`flex justify-between items-center p-4 ${idx !== summary.returnedProducts.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <span className="text-[15px] font-medium text-gray-800">{line.productName}</span>
                  <span className="text-[15px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                    {fmtQtyD(line.totalQuantity, line.unit)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default SessionDetailScreen;