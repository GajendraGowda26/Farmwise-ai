"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Always show the "Listening" state (used on /preview). */
  forceListening?: boolean;
};

/**
 * The design is laid out on the original 245 x 555 artboard.
 * u(n) converts an artboard pixel value into a size that scales with the phone width.
 */
const u = (n: number) => `calc(var(--u) * ${n})`;

/** Waveform bars around the orb, in the orb's own coordinate space: [x, height, width, light?] */
const BARS: [number, number, number, boolean?][] = [
  [98, 26, 10, true],
  [128, 50, 12],
  [163, 85, 16],
  [203, 140, 16],
  [243, 85, 14],
  [272, 45, 9, true],
  [620, 45, 9, true],
  [650, 85, 14],
  [688, 140, 16],
  [728, 100, 16],
  [764, 50, 10],
  [793, 24, 10, true],
];

/** Per-bar animation timing so the waveform moves irregularly (each bar on its own rhythm), like the reference. */
const BAR_DUR = [0.62, 0.47, 0.71, 0.55, 0.83, 0.5, 0.58, 0.76, 0.49, 0.67, 0.53, 0.8];
const BAR_DELAY = [0.1, 0.35, 0.22, 0.05, 0.4, 0.28, 0.17, 0.44, 0.08, 0.31, 0.2, 0.38];

/** Microphone glyph: solid capsule + open cradle + stand (matches the design). */
function MicIcon({ size }: { size: number }) {
  return (
    <svg width={u(size)} height={u(size)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8.52" y="2.28" width="6.96" height="11.28" rx="3.48" fill="#ffffff" />
      <path d="M6 10.92a6 6 0 0 0 12 0" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 16.9v3.4M8.7 20.9h6.6" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The "Listening" orb: pulsing mint border ring + hairline ripple, pale-mint inner disc,
 * green core, mic glyph and animated waveform bars. Drawn in a 734 x 584 space centred on (448, 480).
 */
function ListeningOrb() {
  return (
    <svg
      className="orb"
      viewBox="81 188 734 584"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* pale mint inner disc (colours sampled from the reference video) */}
        <radialGradient id="orb-mid" gradientUnits="userSpaceOnUse" cx="448" cy="480" r="236">
          <stop offset="0.64" stopColor="#bcf1cb" />
          <stop offset="1" stopColor="#d9f3e2" />
        </radialGradient>
        {/* pulsing outer border band: solid mint near the inner disc, thinning out towards its edge */}
        <radialGradient id="orb-ring-fill">
          <stop offset="0" stopColor="#86d79e" />
          <stop offset="0.77" stopColor="#86d79e" />
          <stop offset="1" stopColor="#86d79e" stopOpacity="0.6" />
        </radialGradient>
        {/* soft halo that travels with the pulsing border */}
        <radialGradient id="orb-glow">
          <stop offset="0" stopColor="#dcf2e3" stopOpacity="0.55" />
          <stop offset="0.8" stopColor="#dcf2e3" stopOpacity="0.55" />
          <stop offset="1" stopColor="#dcf2e3" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="orb-core" cx="0.5" cy="0.62" r="0.62">
          <stop offset="0" stopColor="#0f7d36" />
          <stop offset="0.55" stopColor="#168f3f" />
          <stop offset="1" stopColor="#1ea84a" />
        </radialGradient>
        <filter id="orb-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1fa94f" floodOpacity=".3" />
        </filter>
      </defs>

      {/* ripple: a faint hairline slips out of the border near its peak, travels outwards and fades */}
      <circle className="orb-ripple" cx="448" cy="480" r="236" stroke="#a9e3bd" strokeWidth="2.6" />

      {/* pulsing outer border: grows out from behind the inner disc into a thick mint band, then shrinks back */}
      <g className="orb-ring">
        <circle cx="448" cy="480" r="293" fill="url(#orb-glow)" />
        <circle cx="448" cy="480" r="236" fill="url(#orb-ring-fill)" />
      </g>

      {/* inner pale-mint disc with a thin bright-green edge line (breathes slightly with the border) */}
      <circle className="orb-inner" cx="448" cy="480" r="236" fill="url(#orb-mid)" stroke="#8fe8a8" strokeOpacity=".9" strokeWidth="4" />

      {/* waveform */}
      {BARS.map(([x, h, w, light], i) => (
        <rect
          key={i}
          className="orb-bar"
          x={x - w / 2}
          y={485 - h / 2}
          width={w}
          height={h}
          rx={w / 2}
          fill={light ? "#2bb25a" : "#1a9d45"}
          style={{ animationDuration: `${BAR_DUR[i % BAR_DUR.length]}s`, animationDelay: `-${BAR_DELAY[i % BAR_DELAY.length]}s` }}
        />
      ))}

      {/* core */}
      <g filter="url(#orb-shadow)">
        <circle cx="448" cy="480" r="150" fill="url(#orb-core)" />
      </g>
      <circle cx="448" cy="480" r="151" stroke="#43d06f" strokeOpacity=".9" strokeWidth="5" />

      {/* mic glyph (same drawing as MicIcon, scaled up) */}
      <g transform="translate(448 480) scale(8.3) translate(-12 -12)" style={{ filter: "drop-shadow(0 0.4px 0.5px rgba(0,40,15,.45))" }}>
        <rect x="8.52" y="2.28" width="6.96" height="11.28" rx="3.48" fill="#ffffff" />
        <path d="M6 10.92a6 6 0 0 0 12 0" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 16.9v3.4M8.7 20.9h6.6" stroke="#ffffff" strokeWidth="1.7" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function CardChevron() {
  return (
    <svg className="cchev" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3l9 9-9 9" stroke="#111" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FarmwiseApp({ forceListening = false }: Props) {
  const [listening, setListening] = useState(forceListening);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  /** Hook your backend / chat handler in here. */
  const submitQuery = () => {
    if (!query.trim() && files.length === 0) return;
    console.log("Farmwise query:", query.trim(), files);
    setQuery("");
    setFiles([]);
  };

  const stop = useCallback(() => {
    recRef.current?.stop?.();
    recRef.current = null;
    if (!forceListening) setListening(false);
  }, [forceListening]);

  const start = useCallback(() => {
    setTranscript("");
    setListening(true);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    rec.onend = () => {
      recRef.current = null;
    };
    rec.onerror = () => {};
    recRef.current = rec;
    try {
      rec.start();
    } catch {}
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && stop();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stop]);

  return (
    <div className="phone">
      <div className="screen">
        {/* ---------------- home content (blurred while listening) ---------------- */}
        <div className={`layer${listening ? " layer--blur" : ""}`} aria-hidden={listening}>
          {/* header */}
          <button className="abs c" aria-label="Back" style={{ left: u(20), top: u(35) }}>
            <svg width={u(11)} height={u(11)} viewBox="0 0 24 24" fill="none">
              <path d="M20 12H4M10 18l-6-6 6-6" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <svg className="abs c" style={{ left: u(52), top: u(35), width: u(9), height: u(9) }} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 21V11" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 12C12 7 8 4 3 4c0 5 3 8 9 8Z" fill="#16a34a" />
            <path d="M12 14c0-4 3-7 8-7 0 5-3 7-8 7Z" fill="#34c06a" />
          </svg>
          <span className="abs l brand" style={{ left: u(64), top: u(35), fontSize: u(10.4) }}>
            Farmwise AI
          </span>
          <button className="abs c" aria-label="Settings" style={{ left: u(211), top: u(35) }}>
            <svg width={u(11)} height={u(11)} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="#222" strokeWidth="2" />
              <path
                d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"
                stroke="#222"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* banner (cropped from the design) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="abs" src="/images/banner.svg" alt="" style={{ left: u(10), top: u(60), width: u(221), height: u(97) }} />

          {/* intro text */}
          <h1 className="abs c title" style={{ left: u(125), top: u(176), fontSize: u(13.4) }}>
            Hello, I&apos;m Farmwise AI
          </h1>
          <p className="abs c sub" style={{ left: u(123), top: u(194), fontSize: u(9.3) }}>
            Your smart farming assistant
          </p>
          <p className="abs c desc" style={{ left: u(123), top: u(215.5), fontSize: u(7.1), lineHeight: u(11) }}>
            Ask me anything about farming, market
            <br />
            prices, recycling, storeservices and more!
          </p>

          {/* mic */}
          <div className={listening ? "hide" : undefined}>
            <button
              className="abs c halo"
              onClick={start}
              aria-label="Tap to speak"
              style={{ left: u(113), top: u(267), width: u(62), height: u(62) }}
            >
              <span className="core" style={{ width: u(48), height: u(48) }}>
                <MicIcon size={26} />
              </span>
            </button>
            <p className="abs c tap" style={{ left: u(113), top: u(307), fontSize: u(10.8) }}>
              Tap to speak
            </p>
            {/* search bar + upload */}
            <form
              className="abs searchbar"
              style={{ left: u(16), top: u(318), width: u(213), height: u(21) }}
              onSubmit={(e) => {
                e.preventDefault();
                submitQuery();
              }}
            >
              <svg className="sicon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" stroke="#7a857f" strokeWidth="2" />
                <path d="M16 16l4.5 4.5" stroke="#7a857f" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {files.length > 0 && (
                <button type="button" className="fchip" onClick={() => setFiles([])} aria-label="Remove attached files" title="Remove attached files">
                  📎 {files.length === 1 ? files[0].name : `${files.length} files`} ×
                </button>
              )}
              <input
                className="sinput"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Farmwise"
                aria-label="Ask Farmwise"
                enterKeyHint="search"
              />
              {(query.trim() || files.length > 0) && (
                <button type="submit" className="sgo" aria-label="Send">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 19V5M6 11l6-6 6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <button type="button" className="splus" aria-label="Upload files" onClick={() => fileRef.current?.click()}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
                </svg>
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []);
                  if (picked.length) setFiles((f) => [...f, ...picked]);
                  e.target.value = "";
                }}
              />
            </form>

            {/* quick tools */}
            <h2 className="abs l qft" style={{ left: u(28), top: u(354), fontSize: u(11.8) }}>
              Quick Farming Tools
            </h2>

            <button className="abs card card--blue" style={{ left: u(16), top: u(371), width: u(100), height: u(62) }}>
              <span className="chead">
                <span className="emoji">🌤️</span>
                <span className="ctitle">
                  Weather &amp;
                  <br />
                  Crop Guide
                </span>
              </span>
              <span className="cdesc">
                See your weather &amp;
                <br />
                suitable crops
              </span>
              <CardChevron />
            </button>

            <button className="abs card card--green" style={{ left: u(129), top: u(371), width: u(100), height: u(62) }}>
              <span className="chead">
                <span className="emoji">🌱</span>
                <span className="ctitle">
                  Crop
                  <br />
                  Suggestions
                </span>
              </span>
              <span className="cdesc">
                Get crop suggestions
                <br />
                based on your land
                <br />
                &amp; season
              </span>
              <CardChevron />
            </button>
          </div>

          {/* landscape (vectorised) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="abs" src="/images/landscape.svg" alt="" style={{ left: 0, top: u(467), width: u(245), height: u(88) }} />
        </div>

        {/* ---------------- listening state ---------------- */}
        {listening && (
          <div className="overlay" role="dialog" aria-label="Listening">
            <p className="abs c listen" style={{ left: u(129), top: u(218), fontSize: u(13.2) }}>
              Listening.....
            </p>

            <p className="abs c blurtext" style={{ left: u(88), top: u(376), fontSize: u(7.4) }}>
              You can ask me anything
            </p>

            <button
              className="abs c rings"
              onClick={stop}
              aria-label="Stop listening"
              style={{ left: u(124), top: u(289), width: u(135.7), height: u(108) }}
            >
              <ListeningOrb />
            </button>

            <p className="abs c speak" style={{ left: u(123), top: u(362), fontSize: u(13.2) }}>
              Speak now
            </p>
            <div className="abs transcript" aria-live="polite" style={{ left: u(15), top: u(377), width: u(196), height: u(47), fontSize: u(7.5), padding: u(6) }}>
              {transcript}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
