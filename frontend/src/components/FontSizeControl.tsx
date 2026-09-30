import { useEffect, useState } from "react";

/** A- / A / A+ accessibility control: scales the whole interface text. */
export default function FontSizeControl() {
  const [size, setSize] = useState<number>(() => Number(localStorage.getItem("agricast_font")) || 16);
  useEffect(() => {
    document.documentElement.style.fontSize = `${size}px`;
    localStorage.setItem("agricast_font", String(size));
  }, [size]);
  const btn = "px-2 py-0.5 border border-white/40 text-white hover:bg-white/10";
  return (
    <div className="flex items-center text-xs" role="group" aria-label="Text size">
      <button className={`${btn} rounded-l`} onClick={() => setSize((s) => Math.max(13, s - 1))} aria-label="Decrease text size">A-</button>
      <button className={`${btn} border-l-0`} onClick={() => setSize(16)} aria-label="Default text size">A</button>
      <button className={`${btn} border-l-0 rounded-r`} onClick={() => setSize((s) => Math.min(22, s + 1))} aria-label="Increase text size">A+</button>
    </div>
  );
}
