import { useEffect, useRef, useState } from "react";
import { PhoneCall, PhoneOff, Volume2, VolumeX, MessageSquare } from "lucide-react";
import { PanchayatPicker, CropPicker } from "../components/FarmSelectors";
import { useFarmSelection } from "../context/FarmSelectionContext";
import { useLanguage } from "../context/LanguageContext";
import { api, friendlyErrorMessage } from "../services/api";
import ErrorState from "../components/ErrorState";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
type CallState = "idle" | "ringing" | "connected" | "ended";
interface Turn { who: "system" | "user"; text: string }

export default function VoiceLinePage() {
  const { t, lang, setLang } = useLanguage();
  const { panchayat, crop, cropStage } = useFarmSelection();
  const [tab, setTab] = useState<"call" | "sms">("call");
  const [state, setState] = useState<CallState>("idle");
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [voiceOn, setVoiceOn] = useState(true);
  const [hasTamilVoice, setHasTamilVoice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [smsLog, setSmsLog] = useState<{ dir: "out" | "in"; text: string }[]>([]);
  const lastTextRef = useRef("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      if (!("speechSynthesis" in window)) return setHasTamilVoice(false);
      const voices = window.speechSynthesis.getVoices();
      setHasTamilVoice(voices.some((v) => v.lang?.toLowerCase().startsWith("ta")));
    };
    check();
    window.speechSynthesis?.addEventListener?.("voiceschanged", check);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", check);
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);

  const speak = (text: string, l: string) => {
    if (!voiceOn || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[₹]/g, " rupees "));
    u.lang = l === "ta" ? "ta-IN" : "en-IN";
    window.speechSynthesis.speak(u);
  };

  const startCall = () => {
    setTranscript([]); setError(null); setState("ringing");
    setTimeout(() => {
      setState("connected");
      const greet = lang === "ta" ? `அக்ரிகாஸ்ட் வாய்ஸ்லைனுக்கு வரவேற்கிறோம். ${t("ui.menuTitle")}: ${MENU_TEXT(lang)}` : `Welcome to AgriCast VoiceLine. ${MENU_TEXT(lang)}`;
      lastTextRef.current = greet;
      setTranscript([{ who: "system", text: greet }]);
      speak(greet, lang);
    }, 900);
  };
  const endCall = () => { window.speechSynthesis?.cancel(); setState("ended"); };

  const press = async (key: string) => {
    if (state !== "connected" || busy) return;
    setBusy(true); setError(null);
    setTranscript((tr) => [...tr, { who: "user", text: `${t("ui.youPressed")}: ${key}` }]);
    try {
      const res = await api.post("/voice/session", { panchayatId: panchayat?._id, key, language: lang, crop: crop?.name, cropStage, lastText: lastTextRef.current });
      const s = res.data.session;
      lastTextRef.current = s.responseText;
      if (s.action === "LANGUAGE") setLang(s.language);
      setTranscript((tr) => [...tr, { who: "system", text: s.responseText }]);
      speak(s.responseText, s.language);
      if (s.action === "END") setTimeout(() => setState("ended"), 400);
    } catch (e) { setError(friendlyErrorMessage(e)); } finally { setBusy(false); }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (KEYS.includes(e.key)) press(e.key); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, busy, lang]);

  const sendSms = async () => {
    if (!smsText.trim()) return;
    const msg = smsText.trim();
    setSmsLog((l) => [...l, { dir: "out", text: msg }]);
    setSmsText(""); setError(null);
    try {
      const res = await api.post("/sms/simulate", { message: msg, panchayatId: panchayat?._id, language: lang, crop: crop?.name, cropStage });
      setSmsLog((l) => [...l, { dir: "in", text: res.data.reply }]);
    } catch (e) { setError(friendlyErrorMessage(e)); }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 space-y-5">
      <div className="flex items-center gap-2"><PhoneCall className="text-agri-green" aria-hidden="true" /><h1 className="text-2xl font-serif font-bold text-agri-forest">{t("ui.voiceTitle")}</h1></div>
      <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded inline-block px-2 py-1">{t("ui.ivrNotice")}</p>

      <div className="bg-agri-light/70 border border-agri-green/20 rounded-xl p-3 space-y-3">
        <p className="text-xs text-gray-600">{t("ui.settingsFor")}</p>
        <PanchayatPicker /><CropPicker />
      </div>

      <div className="flex border-b border-agri-light">
        <button onClick={() => setTab("call")} className={`px-4 py-2 text-sm font-semibold ${tab === "call" ? "text-agri-green border-b-2 border-agri-green" : "text-gray-500"}`}>{t("ui.tabCall")}</button>
        <button onClick={() => setTab("sms")} className={`px-4 py-2 text-sm font-semibold ${tab === "sms" ? "text-agri-green border-b-2 border-agri-green" : "text-gray-500"}`}>{t("ui.tabSms")}</button>
      </div>

      {error && <ErrorState message={error} />}

      {tab === "call" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-agri-light rounded-xl bg-white p-4">
            <p className="text-xs text-gray-600 mb-2">{t("ui.ivrHint")}</p>
            {!hasTamilVoice && lang === "ta" && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-2">{t("ui.noTamilVoice")}</p>}
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-semibold ${state === "connected" ? "text-green-700" : state === "ringing" ? "text-amber-700" : "text-gray-600"}`}>
                {state === "idle" && t("ui.idle")}{state === "ringing" && t("ui.ringing")}{state === "connected" && t("ui.connected")}{state === "ended" && t("ui.ended")}
              </span>
              <button onClick={() => setVoiceOn((v) => !v)} className="p-2 rounded hover:bg-agri-light" aria-label={voiceOn ? t("ui.voiceOff") : t("ui.voiceOn")}>{voiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {KEYS.map((k) => (
                <button key={k} onClick={() => press(k)} disabled={state !== "connected" || busy}
                  className="aspect-square rounded-full border border-agri-green/40 text-agri-forest font-semibold text-lg hover:bg-agri-light active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">{k}</button>
              ))}
            </div>
            {state === "idle" || state === "ended" ? (
              <button onClick={startCall} className="w-full py-2.5 rounded-full bg-agri-green text-white font-semibold flex items-center justify-center gap-2"><PhoneCall size={18} aria-hidden="true" />{t("ui.callBtn")}</button>
            ) : (
              <button onClick={endCall} className="w-full py-2.5 rounded-full bg-red-600 text-white font-semibold flex items-center justify-center gap-2"><PhoneOff size={18} aria-hidden="true" />{t("ui.hangUp")}</button>
            )}
          </div>

          <div className="border border-agri-light rounded-xl bg-white p-4 flex flex-col h-80">
            <h3 className="text-xs font-semibold text-gray-600 mb-2">{t("ui.transcript")}</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {transcript.length === 0 && <p className="text-sm text-gray-400">{t("ui.callBtn")}...</p>}
              {transcript.map((turn, i) => (
                <div key={i} className={`text-sm rounded-lg px-3 py-2 max-w-[92%] ${turn.who === "system" ? "bg-agri-light text-agri-forest" : "bg-agri-green text-white ml-auto"}`}>{turn.text}</div>
              ))}
              <div ref={endRef} />
            </div>
          </div>
        </div>
      )}

      {tab === "sms" && (
        <div className="border border-agri-light rounded-xl bg-white p-4">
          <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded inline-block px-2 py-1 mb-3">{t("ui.smsNotice")}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {["WEATHER", "RAIN", "ADVISORY", "ALERT", "FARM", "HELP"].map((k) => (
              <button key={k} onClick={() => setSmsText(k)} className="text-xs px-2.5 py-1.5 rounded-full border border-agri-green/40 text-agri-forest hover:bg-agri-light">{k}</button>
            ))}
          </div>
          <div className="h-56 overflow-y-auto border border-agri-light rounded-lg p-3 space-y-2 mb-3 bg-agri-light/20">
            {smsLog.length === 0 && <p className="text-sm text-gray-400 flex items-center gap-2"><MessageSquare size={16} aria-hidden="true" />{t("ui.smsPlaceholder")}</p>}
            {smsLog.map((m, i) => (<div key={i} className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${m.dir === "out" ? "bg-agri-green text-white ml-auto" : "bg-white border border-agri-light"}`}>{m.text}</div>))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); sendSms(); }} className="flex gap-2">
            <input value={smsText} onChange={(e) => setSmsText(e.target.value)} placeholder={t("ui.smsPlaceholder")} className="flex-1 border border-agri-green/40 rounded-full px-4 py-2.5 text-sm min-h-[44px]" />
            <button type="submit" className="px-4 py-2.5 rounded-full bg-agri-green text-white text-sm font-semibold">{t("ui.send")}</button>
          </form>
        </div>
      )}
    </div>
  );
}

function MENU_TEXT(lang: string) {
  return lang === "ta"
    ? "1 வானிலைக்கு, 2 மழை முன்னறிவிப்புக்கு, 3 விவசாயம் செய்யலாமா எனில், 4 பயிர் ஆபத்துக்கு, 5 நீர்ப்பாசனத்திற்கு, 6 எச்சரிக்கைகளுக்கு, 0 மெனுவை மீண்டும் கேட்க."
    : "Press 1 for weather, 2 for rain forecast, 3 for should I farm today, 4 for crop risk, 5 for irrigation, 6 for alerts, 0 to hear the menu again.";
}
