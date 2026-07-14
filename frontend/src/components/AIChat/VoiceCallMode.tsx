'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const G = '#1B4332';
const G2 = '#2ECC71';
const PINK = '#E91E8C';

type CallState = 'connecting' | 'listening' | 'processing' | 'speaking' | 'ended';

// ── Prepare text for natural TTS ──────────────────────────
function prepareForSpeech(text: string): string {
  return text
    // Strip markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/•\s*/g, ', ')
    .replace(/[-–—]\s/g, ', ')
    // Strip all emojis using Unicode property escapes
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    // Clean up punctuation
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/\.\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 600)
    .trim();
}

// ── Pick the most natural available voice ─────────────────
function getBestVoice(synth: SpeechSynthesis, isHindi: boolean): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (!voices.length) return null;

  if (isHindi) {
    // Priority order for Hindi
    const hindiPriority = [
      'Google हिन्दी',
      'Google Hindi',
      'Microsoft Swara Online (Natural)',
      'Microsoft Hemant Online',
      'hi-IN',
    ];
    for (const name of hindiPriority) {
      const v = voices.find(v =>
        v.name.toLowerCase().includes(name.toLowerCase()) ||
        v.lang === name
      );
      if (v) return v;
    }
    return voices.find(v => v.lang.startsWith('hi')) || null;
  } else {
    // Priority order for English
    const engPriority = [
      'Google UK English Female',
      'Google US English',
      'Microsoft Zira Online (Natural)',
      'Microsoft Jenny Online (Natural)',
      'Google UK English Male',
      'Samantha',
      'Karen',
    ];
    for (const name of engPriority) {
      const v = voices.find(v =>
        v.name.toLowerCase().includes(name.toLowerCase())
      );
      if (v) return v;
    }
    return voices.find(v => v.lang.startsWith('en')) || null;
  }
}

// ── Animated waveform ─────────────────────────────────────
function SoundWave({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-12">
      {[0.3, 0.7, 1, 0.5, 1.2, 0.8, 1.1, 0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.3].map((h, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: '3px',
            height: active ? `${h * 36}px` : '3px',
            background: color,
            opacity: active ? 0.75 + h * 0.2 : 0.2,
            borderRadius: '9999px',
            transition: 'height 0.12s ease, opacity 0.12s ease',
            animation: active
              ? `voiceWave ${0.6 + h * 0.3}s ease-in-out ${i * 0.06}s infinite alternate`
              : undefined,
          }}
        />
      ))}
    </div>
  );
}

// ── Central Avatar ────────────────────────────────────────
function CallAvatar({ callState }: { callState: CallState }) {
  const speaking = callState === 'speaking';
  const listening = callState === 'listening';
  const processing = callState === 'processing';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Outer glow rings */}
      {(speaking || listening) && (
        <>
          <div className="absolute rounded-full"
            style={{
              width: 200, height: 200,
              background: speaking ? `radial-gradient(circle, ${G2}18, transparent)` : `radial-gradient(circle, ${PINK}18, transparent)`,
              animation: 'ringExpand 2s ease-in-out infinite',
            }} />
          <div className="absolute rounded-full"
            style={{
              width: 175, height: 175,
              border: `2px solid ${speaking ? G2 : PINK}33`,
              animation: 'ringExpand 2s ease-in-out 0.5s infinite',
            }} />
          <div className="absolute rounded-full"
            style={{
              width: 150, height: 150,
              border: `1.5px solid ${speaking ? G2 : PINK}55`,
              animation: 'ringExpand 2s ease-in-out 1s infinite',
            }} />
        </>
      )}

      {/* Main avatar circle */}
      <div
        className="w-28 h-28 rounded-full flex flex-col items-center justify-center relative z-10"
        style={{
          background: speaking
            ? `radial-gradient(circle at 40% 35%, #1a4a30, #0a1f12)`
            : listening
              ? `radial-gradient(circle at 40% 35%, #2a0a35, #0f051a)`
              : `radial-gradient(circle at 40% 35%, #152010, #080e08)`,
          border: `2.5px solid ${speaking ? G2 : listening ? PINK : 'rgba(255,255,255,0.12)'}`,
          boxShadow: speaking
            ? `0 0 40px ${G2}44, 0 0 80px ${G2}18, inset 0 1px 0 rgba(255,255,255,0.1)`
            : listening
              ? `0 0 40px ${PINK}44, 0 0 80px ${PINK}18, inset 0 1px 0 rgba(255,255,255,0.1)`
              : '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <span className="text-4xl" style={{ filter: speaking || listening ? 'drop-shadow(0 0 8px currentColor)' : undefined }}>🌿</span>
        <span className="text-white/70 text-[11px] font-bold mt-1 tracking-wide">SAATHI AI</span>
      </div>

      {/* Processing spinner */}
      {processing && (
        <div className="absolute w-36 h-36 rounded-full"
          style={{ border: `2px solid transparent`, borderTopColor: G2, animation: 'spin 1s linear infinite' }} />
      )}
    </div>
  );
}

interface VoiceCallModeProps {
  onClose: () => void;
  onMessageSent: (userText: string, aiReply: string) => void;
}

export default function VoiceCallMode({ onClose, onMessageSent }: VoiceCallModeProps) {
  const [callState, setCallState] = useState<CallState>('connecting');
  const [userTranscript, setUserTranscript] = useState('');
  const [aiText, setAiText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [listenLang, setListenLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [voicesReady, setVoicesReady] = useState(false);
  const [callHistory, setCallHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(true);
  const stateRef = useRef<CallState>('connecting');
  const aiTextRef = useRef('');

  const updateState = (newState: CallState) => {
    stateRef.current = newState;
    setCallState(newState);
  };

  const updateAiText = (text: string) => {
    aiTextRef.current = text;
    setAiText(text);
  };

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Load voices ──────────────────────────────────────────
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const synth = synthRef.current;

    const tryLoadVoices = () => {
      if (synth.getVoices().length > 0) setVoicesReady(true);
    };
    tryLoadVoices();
    synth.onvoiceschanged = tryLoadVoices;
    return () => { synth.onvoiceschanged = null; };
  }, []);

  // ── Speak with best voice ────────────────────────────────
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise(resolve => {
      const synth = synthRef.current;
      if (!synth || isSpeakerOff) { resolve(); return; }

      synth.cancel();

      const clean = prepareForSpeech(text);
      // Detect language
      const hindiChars = (clean.match(/[\u0900-\u097F]/g) || []).length;
      const hindiWords = (clean.match(/\bhai\b|\bkya\b|\bnahi\b|\bkaisa\b|\bkarein\b|\bboliye\b|\bpehle\b/gi) || []).length;
      const isHindi = hindiChars > 5 || hindiWords > 2;

      const utter = new SpeechSynthesisUtterance(clean);

      // Best voice selection
      const bestVoice = getBestVoice(synth, isHindi);
      if (bestVoice) utter.voice = bestVoice;

      utter.lang = isHindi ? 'hi-IN' : 'en-IN';
      utter.rate = 0.88;       // slightly slower = more natural
      utter.pitch = 1.0;       // neutral pitch (no robotic high pitch)
      utter.volume = 1.0;

      utter.onstart = () => updateState('speaking');
      utter.onend = () => resolve();
      utter.onerror = () => resolve();

      // IMPORTANT: Strictly stop listening BEFORE speaking to prevent the infinite echo loop!
      recognitionRef.current?.abort();

      synth.speak(utter);
    });
  }, [isSpeakerOff]);

  // ── Send to AI ───────────────────────────────────────────
  const sendToAI = useCallback(async (text: string) => {
    if (!activeRef.current) return;
    
    // Stop mic explicitly so we don't catch anything while processing
    recognitionRef.current?.abort();
    
    updateState('processing');
    setUserTranscript(text);
    updateAiText('');

    // Append context note to keep responses short and match language
    const userPayloadMsg = { 
      role: 'user', 
      parts: [{ text: text + '\n\n[SYSTEM: This is a VOICE CALL. CRITICAL RULES:\n1. Detect user language (Hindi/English) and match it EXACTLY.\n2. Do NOT use emojis, asterisks, or markdown formatting.\n3. Be extremely smart, brief, and conversational (like a real human on the phone). Do not give long lists.]' }] 
    };

    const payloadMessages = [...callHistory, userPayloadMsg];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
        }),
      });
      const data = await res.json();
      const reply = data.reply || 'Kuch samajh nahi aaya. Phir se boliye?';

      if (!activeRef.current) return;
      updateAiText(reply);
      onMessageSent(text, reply);

      // Save to history (save original text without system note)
      setCallHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text }] },
        { role: 'model', parts: [{ text: reply }] }
      ]);

      await speak(reply);
      
      // Delay before listening to avoid picking up the tail end of the AI's speech
      if (activeRef.current) {
        updateState('listening');
        setTimeout(() => startListening(), 400);
      }
    } catch {
      if (!activeRef.current) return;
      updateAiText('Network error. Dobara boliye please.');
      
      await speak('Network error aayi. Dobara boliye please.');
      if (activeRef.current) {
        updateState('listening');
        setTimeout(() => startListening(), 400);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak, onMessageSent, callHistory]);

  // ── Speech recognition ───────────────────────────────────
  const startListening = useCallback(() => {
    // Strictly do not listen while speaking or processing
    if (!activeRef.current || isMuted || stateRef.current === 'speaking' || stateRef.current === 'processing') {
      if (stateRef.current !== 'speaking' && stateRef.current !== 'processing') updateState('listening');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { updateState('listening'); return; }

    recognitionRef.current?.abort();
    const rec = new SR();
    recognitionRef.current = rec;

    rec.lang = listenLang;
    rec.continuous = true; // IMPORTANT: Keep mic open continuously instead of closing on every pause
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => { 
      if (activeRef.current && stateRef.current !== 'speaking') { 
        updateState('listening'); 
        setUserTranscript(''); 
      } 
    };

    rec.onresult = (event: any) => {
      // Do not process results if we are supposed to be speaking
      if (stateRef.current === 'speaking') return;

      const results = Array.from(event.results as any[]);
      const transcript = results.map((r: any) => r[0].transcript).join(' ');
      
      const last = results[results.length - 1] as any;
      const finalTranscript = transcript.trim();

      setUserTranscript(finalTranscript);
      if (last.isFinal && finalTranscript.length > 1) {
        rec.stop();
        sendToAI(finalTranscript);
      }
    };

    rec.onspeechend = () => rec.stop();

    rec.onerror = (e: any) => {
      if (!activeRef.current) return;
      if (e.error !== 'aborted') {
        setTimeout(() => { if (activeRef.current) startListening(); }, 1200);
      }
    };

    rec.onend = () => {
      if (activeRef.current && stateRef.current === 'listening') {
        setTimeout(() => { if (activeRef.current) startListening(); }, 700);
      }
    };

    try { rec.start(); } catch { /* already started */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listenLang, isMuted, sendToAI]);

  // ── Boot ─────────────────────────────────────────────────
  useEffect(() => {
    activeRef.current = true;
    timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);

    const greet = async () => {
      updateState('speaking');
      // Natural bilingual greeting (English first, then Hindi)
      const greeting = 'Hello, I am Saathi! Namaste! Main Saathi hoon. Boliye, how can I help you today?';
      updateAiText(greeting);
      
      await speak(greeting);
      
      if (activeRef.current) {
        updateState('listening');
        setTimeout(() => startListening(), 400);
      }
    };

    // Wait for voices to load
    const t = setTimeout(greet, voicesReady ? 600 : 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voicesReady]);

  // ── End call ─────────────────────────────────────────────
  const endCall = useCallback(() => {
    activeRef.current = false;
    recognitionRef.current?.abort();
    synthRef.current?.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    updateState('ended');
    setTimeout(onClose, 600);
  }, [onClose]);

  const toggleMute = useCallback(() => {
    setIsMuted(m => {
      if (!m) { recognitionRef.current?.abort(); updateState('listening'); }
      else if (stateRef.current === 'listening') startListening();
      return !m;
    });
  }, [startListening]);

  const toggleLang = useCallback(() => {
    const next = listenLang === 'hi-IN' ? 'en-IN' : 'hi-IN';
    setListenLang(next);
    if (stateRef.current === 'listening') {
      recognitionRef.current?.abort();
      setTimeout(() => { if (activeRef.current) startListening(); }, 400);
    }
  }, [listenLang, startListening]);

  // State labels
  const stateConfig: Record<CallState, { label: string; color: string; sub: string }> = {
    connecting: { label: 'Connecting...', color: 'rgba(255,255,255,0.5)', sub: 'Saathi se jud raha hai' },
    listening:  { label: isMuted ? '🔇 Muted' : '🎙️ Sun raha hoon...', color: PINK, sub: isMuted ? 'Unmute karein bolne ke liye' : 'Apna sawaal boliye' },
    processing: { label: '💭 Soch raha hoon...', color: G2, sub: 'Jawab dhundh raha hoon' },
    speaking:   { label: '🔊 Bol raha hoon...', color: G2, sub: 'Suniye...' },
    ended:      { label: 'Call khatam', color: 'rgba(255,255,255,0.4)', sub: '' },
  };
  const sc = stateConfig[callState];

  return (
    <>
      <style>{`
        @keyframes voiceWave {
          0% { height: 3px; } 100% { height: 36px; }
        }
        @keyframes ringExpand {
          0% { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.05); opacity: 0; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes callFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Full-screen backdrop */}
      <div className="fixed inset-0 z-[100] flex flex-col"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, #0f2e1a 0%, #060d07 50%, #0a0514 100%)',
          animation: 'callFadeIn 0.4s ease-out forwards',
        }}>

        {/* Subtle ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full" style={{ width: 400, height: 400, top: -100, left: -100, background: `radial-gradient(circle, ${G}30, transparent)`, filter: 'blur(60px)' }} />
          <div className="absolute rounded-full" style={{ width: 300, height: 300, bottom: -50, right: -50, background: `radial-gradient(circle, ${PINK}20, transparent)`, filter: 'blur(60px)' }} />
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-4">
          <div>
            <p className="text-white/30 text-xs font-medium tracking-wider uppercase">Voice Guidance</p>
            <p className="text-white font-bold text-lg mt-0.5">Saathi AI 🌿</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button onClick={toggleLang}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:scale-105"
              style={{ background: `${PINK}18`, border: `1px solid ${PINK}40`, color: PINK }}>
              {listenLang === 'hi-IN' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
            </button>
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: G2, animation: 'subtlePulse 2s ease-in-out infinite' }} />
              <span className="text-sm font-mono font-bold" style={{ color: G2 }}>{formatDuration(callDuration)}</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-8">

          {/* Avatar */}
          <CallAvatar callState={callState} />

          {/* Status */}
          <div className="text-center">
            <p className="text-base font-bold transition-all duration-300" style={{ color: sc.color }}>
              {sc.label}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{sc.sub}</p>
          </div>

          {/* Waveform */}
          <SoundWave
            active={callState === 'speaking' || callState === 'listening'}
            color={callState === 'speaking' ? G2 : PINK}
          />

          {/* Live transcript card */}
          <div className="w-full max-w-sm rounded-2xl px-5 py-4 min-h-[88px] flex items-center justify-center text-center transition-all duration-300"
            style={{
              background: callState === 'listening'
                ? `linear-gradient(135deg, ${PINK}10, transparent)`
                : callState === 'speaking'
                  ? `linear-gradient(135deg, ${G}30, transparent)`
                  : 'rgba(255,255,255,0.04)',
              border: `1px solid ${callState === 'listening' ? PINK + '30' : callState === 'speaking' ? G2 + '25' : 'rgba(255,255,255,0.07)'}`,
            }}>
            {callState === 'listening' && userTranscript && (
              <p className="text-sm font-medium leading-relaxed" style={{ color: PINK + 'cc' }}>
                🎙️ "{userTranscript}"
              </p>
            )}
            {callState === 'listening' && !userTranscript && (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)', animation: 'subtlePulse 2s ease-in-out infinite' }}>
                {isMuted ? 'Mic muted hai — unmute karein' : 'Boliye... main sun raha hoon 👂'}
              </p>
            )}
            {callState === 'speaking' && aiText && (
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {aiText.replace(/\*\*(.*?)\*\*/g, '$1').slice(0, 180)}{aiText.length > 180 ? '...' : ''}
              </p>
            )}
            {callState === 'processing' && (
              <div className="flex items-center gap-3">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full"
                    style={{ background: G2, animation: `subtlePulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Jawab dhoondh raha hoon...</span>
              </div>
            )}
            {callState === 'connecting' && (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Saathi se connect ho raha hai...</p>
            )}
          </div>

          {/* Speaker off indicator */}
          {isSpeakerOff && (
            <p className="text-xs px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
              🔇 Speaker off — AI reply sunai nahi dega
            </p>
          )}
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 flex items-center justify-center gap-6 px-8 pb-14">

          {/* Mute */}
          <div className="flex flex-col items-center gap-2">
            <button onClick={toggleMute}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: isMuted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${isMuted ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)'}`,
              }}>
              {isMuted ? <MicOff className="w-6 h-6 text-white/80" /> : <Mic className="w-6 h-6 text-white/60" />}
            </button>
            <span className="text-[10px] text-white/30">{isMuted ? 'Unmute' : 'Mute'}</span>
          </div>

          {/* End Call */}
          <div className="flex flex-col items-center gap-2">
            <button onClick={endCall}
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #f53a3a, #c42828)',
                boxShadow: '0 8px 40px rgba(245,58,58,0.45), 0 2px 8px rgba(0,0,0,0.3)',
              }}>
              <PhoneOff className="w-8 h-8 text-white" />
            </button>
            <span className="text-[10px] text-white/30">Call band karo</span>
          </div>

          {/* Speaker */}
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => setIsSpeakerOff(s => !s)}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{
                background: isSpeakerOff ? 'rgba(255,80,80,0.15)' : callState === 'speaking' ? `${G2}22` : 'rgba(255,255,255,0.07)',
                border: `1.5px solid ${isSpeakerOff ? 'rgba(255,80,80,0.35)' : callState === 'speaking' ? G2 + '50' : 'rgba(255,255,255,0.12)'}`,
              }}>
              {isSpeakerOff
                ? <VolumeX className="w-6 h-6 text-red-400/80" />
                : <Volume2 className="w-6 h-6" style={{ color: callState === 'speaking' ? G2 : 'rgba(255,255,255,0.4)' }} />
              }
            </button>
            <span className="text-[10px] text-white/30">{isSpeakerOff ? 'Speaker off' : 'Speaker'}</span>
          </div>
        </div>

        {/* Bottom hint */}
        <p className="relative z-10 text-center text-white/20 text-[11px] pb-5 px-6">
          Hindi ya English — dono mein boliye 🌿
        </p>
      </div>
    </>
  );
}
