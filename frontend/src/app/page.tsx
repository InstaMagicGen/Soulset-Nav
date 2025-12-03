"use client";

import { useEffect, useRef, useState } from "react";

type Lang = "system" | "fr" | "en" | "ar";

const LANGS = [
  { code: "system", label: "Langue du système" },
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

const MODES = [
  { id: "quick", label: "Analyse rapide" },
  { id: "deep", label: "Deep clarity" },
  { id: "rest", label: "Soulset Rest" },
];

const TABS = [
  { id: "insights", label: "Insights" },
  { id: "actions", label: "Action steps" },
  { id: "rest", label: "Soulset Rest" },
];

const RANDOM_SOUNDS = ["/sounds/relax1.mp3", "/sounds/relax2.mp3"];
const RANDOM_VIDEOS = ["/videos/bg1.mp4", "/videos/bg2.mp4"];

// pour que TypeScript ne râle pas sur webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

function getSystemLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const code = navigator.language.slice(0, 2);
  if (code === "fr" || code === "en" || code === "ar") return code;
  return "en";
}

function getSlogan(lang: Lang) {
  const final = lang === "system" ? getSystemLang() : lang;
  switch (final) {
    case "fr":
      return "Clarté mentale, une question à la fois.";
    case "en":
      return "Mental clarity, one question at a time.";
    case "ar":
      return "وضوح ذهني… سؤال واحد في كل مرة.";
    default:
      return "Mental clarity, one question at a time.";
  }
}

type ApiResponse = {
  insights?: string;
  actions?: string[];
  soulsetRest?: string;
};

export default function Home() {
  const [language, setLanguage] = useState<Lang>("system");
  const [mode, setMode] = useState("quick");
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("insights");
  const [liveDialogue, setLiveDialogue] = useState(false);

  const [sound, setSound] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);

  const [insights, setInsights] = useState<string>("");
  const [actions, setActions] = useState<string[]>([]);
  const [restText, setRestText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // VOIX
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    // sons / vidéos aléatoires
    const s = RANDOM_SOUNDS[Math.floor(Math.random() * RANDOM_SOUNDS.length)];
    const v = RANDOM_VIDEOS[Math.floor(Math.random() * RANDOM_VIDEOS.length)];
    setSound(s);
    setVideo(v);
  }, []);

  // init Web Speech API quand on clique sur le micro
  function initRecognition() {
    if (typeof window === "undefined") return null;

    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
      alert("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
      return null;
    }

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;

    // langue pour la voix
    const finalLang = language === "system" ? getSystemLang() : language;
    if (finalLang === "fr") rec.lang = "fr-FR";
    else if (finalLang === "ar") rec.lang = "ar-SA";
    else rec.lang = "en-US";

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      // on ajoute le texte reconnu au textarea
      setInput((prev) =>
        prev ? prev + " " + transcript.trim() : transcript.trim()
      );
    };

    rec.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    return rec;
  }

  function toggleVoice() {
    if (isRecording) {
      // stop
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // start
    const rec = recognitionRef.current ?? initRecognition();
    if (!rec) return;

    try {
      rec.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  }

  async function handleSend() {
    if (!input.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const finalLang = language === "system" ? getSystemLang() : language;

    try {
    const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://symmetrical-space-zebra-jjgg9xv7xrj93jj6w-4000.app.github.dev";

const res = await fetch(`${baseUrl}/senset/analyze`, {



      const res = await fetch(`${baseUrl}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input,
          mode,
          lang: finalLang,
          liveDialogue,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur API (${res.status})`);
      }

      const data: ApiResponse = await res.json();

      setInsights(data.insights ?? "");
      setActions(data.actions ?? []);
      setRestText(data.soulsetRest ?? "");
      setActiveTab(mode === "rest" ? "rest" : "insights");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Impossible de contacter le backend pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  const slogan = getSlogan(language);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative">
      {/* Background vidéo */}
      {video && (
        <video
          src={video}
          autoPlay
          loop
          muted
          className="fixed inset-0 w-full h-full object-cover opacity-40"
        />
      )}

      {/* Opacity layer */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Soulset Navigator
            </h1>
            <p className="text-sm text-slate-200 mt-1">{slogan}</p>
            {sound && (
              <p className="text-[11px] text-slate-300/80 mt-1 italic">
                Ambiance sonore apaisante (fichier aléatoire sélectionné).
              </p>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Lang)}
              className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-sm"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setLiveDialogue(!liveDialogue)}
              className={`px-3 py-2 rounded-xl text-xs border transition
                ${
                  liveDialogue
                    ? "bg-teal-500 text-slate-900 border-teal-300"
                    : "bg-slate-900 border-slate-600"
                }
              `}
            >
              {liveDialogue ? "Live activé" : "Start live dialogue"}
            </button>
          </div>
        </header>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="bg-red-900/70 border border-red-500 text-xs rounded-xl px-3 py-2">
            {errorMsg}
          </div>
        )}

        {/* Main grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-4">
            {/* Modes */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium">Mode d’analyse :</p>

              <div className="grid grid-cols-3 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`px-3 py-2 text-sm rounded-xl border transition
                      ${
                        mode === m.id
                          ? "bg-teal-500 text-slate-900 border-teal-300"
                          : "bg-slate-950 border-slate-700"
                      }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Décris ta situation ici…"
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-teal-400"
              />

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={toggleVoice}
                  className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-sm
                    ${
                      isRecording
                        ? "bg-rose-600 border-rose-400"
                        : "bg-slate-800 border-slate-600"
                    }
                  `}
                >
                  🎙
                  {isRecording ? "Enregistrement..." : "Parler"}
                </button>

                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="px-6 py-2 rounded-xl bg-teal-500 text-slate-900 font-medium disabled:opacity-60"
                >
                  {loading ? "Analyse en cours..." : "Envoyer ➤"}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 mt-1">
                La voix est traitée localement par ton navigateur avant
                d&apos;être envoyée au backend.
              </p>
            </div>
          </div>

          {/* Right : tabs */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col">
            {/* Tabs */}
            <div className="flex gap-2 mb-3">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition
                    ${
                      activeTab === t.id
                        ? "bg-slate-200 text-slate-900 border-slate-200"
                        : "bg-slate-950 border-slate-700 text-slate-300"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto text-sm text-slate-200 leading-relaxed space-y-2">
              {activeTab === "insights" && (
                <>
                  {insights ? (
                    <p>{insights}</p>
                  ) : (
                    <p>
                      Les insights apparaîtront ici après l’analyse : résumé de
                      la situation, biais possibles, angles alternatifs.
                    </p>
                  )}
                </>
              )}

              {activeTab === "actions" && (
                <>
                  {actions.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {actions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      <li>Clarifier ton objectif réel.</li>
                      <li>Identifier ce qui dépend de toi.</li>
                      <li>Choisir une micro-action réalisable en 10 minutes.</li>
                    </ul>
                  )}
                </>
              )}

              {activeTab === "rest" && (
                <p className="italic">
                  {restText
                    ? restText
                    : "Respire profondément. Tu n’as pas besoin de résoudre toute ta vie aujourd’hui. Laisse-toi guider à ton rythme."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
