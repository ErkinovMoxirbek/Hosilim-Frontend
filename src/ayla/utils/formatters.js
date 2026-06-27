// src/utils/formatters.js

export const fmtDateTime = (raw) => {
  if (!raw) return "—";
  try {
    const t = raw.substring(0, 16);
    const [date, time] = t.split("T");
    const [y, m, d] = date.split("-");
    return `${d}.${m}.${y}  ${time}`;
  } catch (e) {
    return raw.substring(0, 16).replace("T", "  ");
  }
};

export const fmtDuration = (start, end) => {
  if (!start || !end) return "";
  try {
    const getMins = (s) => {
      const timePart = s.substring(0, 16).split("T")[1];
      const [h, m] = timePart.split(":");
      return parseInt(h) * 60 + parseInt(m);
    };
    
    let diff = getMins(end) - getMins(start);
    if (diff < 0) diff += 1440; 
    
    if (diff < 1) return "1 daqiqadan kam";
    if (diff < 60) return `${diff} daq`;
    return `${Math.floor(diff / 60)} soat ${diff % 60} daq`;
  } catch (e) {
    return "";
  }
};

export const fmtSomH = (v) => {
  if (v === undefined || v === null) return "0 so'm";
  return Number(v).toLocaleString("ru-RU") + " so'm";
};

export const fmtQtyD = (qty, unit) => {
  const num = Number.isInteger(qty) ? qty : Number(qty).toFixed(2);
  let formattedUnit = "dona";
  if (unit === "LITR") formattedUnit = "L";
  if (unit === "KG") formattedUnit = "kg";
  
  return `${num} ${formattedUnit}`;
};