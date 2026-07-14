'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const G2 = '#2ECC71';
const PINK = '#E91E8C';

// ── Strip text for clean TTS ──────────────────────────────
function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/[•\-–—]\s*/g, ', ')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/\.\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 600)
    .trim();
}

// ── Best available TTS voice ──────────────────────────────
function pickVoice(synth: SpeechSynthesis, lang: string): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  const preferred = lang.startsWith('hi')
    ? ['Google हिन्दी', 'Google Hindi', 'Microsoft Swara', 'hi-IN']
    : ['Google UK English Female', 'Google US English', 'Microsoft Jenny', 'Microsoft Zira', 'Samantha'];
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name) || v.lang === name);
    if (v) return v;
  }
  return voices.find(v => v.lang.startsWith(lang.slice(0, 2))) ?? null;
}

// ── Simple waveform ───────────────────────────────────────
function Waveform({ active, color }: { active: boolean; color: string }) {
  const bars = [0.4, 0.9, 1, 0.6, 1.2, 0.7, 1.1, 0.5, 1, 0.4, 0.8, 0.6];
  return (
    <div className="flex items-center justify-center gap-1 h-10">
      {bars.map((h, i) => (
        <span key={i} style={{
          display: 'block',
          width: 3, borderRadius: 9999,
          background: color,
          height: active ? `${h * 32}px` : '3px',
          opacity: active ? 0.6 + h * 0.3 : 0.15,
          transition: 'height 0.12s ease, opacity 0.15s ease',
          animation: active ? `wv ${0.55 + h * 0.25}s ease-in-out ${i * 0.05}s infinite alternate` : undefined,
        }} />
      ))}
    </div>
  );
}

interface Props {
  onClose: () => void;
  onMessageSent: (user: string, ai: string) => void;
  isLoggedIn?: boolean;
}

export default function VoiceCallMode({ onClose, onMessageSent, isLoggedIn }: Props) {
  const [phase, setPhase] = useState<'connecting' | 'speaking' | 'listening' | 'processing' | 'ended'>('connecting');
  const [userText, setUserText] = useState('');
  const [aiText, setAiText]   = useState('');
  const [muted, setMuted]     = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [lang, setLang]       = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [elapsed, setElapsed] = useState(0);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const alive   = useRef(true);
  const synth   = useRef<SpeechSynthesis | null>(null);
  const recRef  = useRef<any>(null);
  const phaseRef = useRef<string>('connecting');
  const historyRef = useRef<{ role: string; parts: { text: string }[] }[]>([]);
  const langRef = useRef(lang);
  langRef.current = lang;

  const setPhaseSync = (p: typeof phase) => { phaseRef.current = p; setPhase(p); };
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  // Timer
  useEffect(() => {
    const t = setInterval(() => { if (alive.current) setElapsed(e => e + 1); }, 1000);
    return () => clearInterval(t);
  }, []);

  // Load voices
  useEffect(() => {
    synth.current = window.speechSynthesis;
    const s = synth.current;
    const load = () => { if (s.getVoices().length > 0) setVoicesLoaded(true); };
    load();
    s.onvoiceschanged = load;
    return () => { synth.current = null; };
  }, []);

  // ── Core: speak, then listen ──────────────────────────────
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise(resolve => {
      const s = synth.current;
      if (!s || speakerOff || !alive.current) { resolve(); return; }

      s.cancel();

      const clean = cleanForSpeech(text);
      if (!clean) { resolve(); return; }

      const isHindi = /[\u0900-\u097F]/.test(clean) || /\b(hai|hoon|mein|kya|nahin|karein|boliye)\b/i.test(clean);
      const voiceLang = isHindi ? 'hi-IN' : 'en-IN';

      const utter = new SpeechSynthesisUtterance(clean);
      const bestVoice = pickVoice(s, voiceLang);
      if (bestVoice) utter.voice = bestVoice;
      utter.lang   = voiceLang;
      utter.rate   = 0.9;
      utter.pitch  = 1.0;
      utter.volume = 1.0;

      utter.onstart = () => { if (alive.current) setPhaseSync('speaking'); };
      utter.onend   = () => resolve();
      utter.onerror = () => resolve();

      s.speak(utter);
    });
  }, [speakerOff]);

  const listen = useCallback(() => {
    if (!alive.current || muted) {
      setPhaseSync('listening');
      return;
    }
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { setPhaseSync('listening'); return; }

    // Abort any previous instance
    try { recRef.current?.abort(); } catch {}
    const rec = new SR();
    recRef.current = rec;

    rec.lang = langRef.current;
    rec.continuous = false;       // simple one-shot mode is most reliable
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let finalSent = false;

    rec.onstart = () => {
      if (!alive.current) return;
      setPhaseSync('listening');
      setUserText('');
    };

    rec.onresult = (e: any) => {
      if (!alive.current || phaseRef.current !== 'listening') return;
      const all = Array.from(e.results as SpeechRecognitionResultList);
      const transcript = all.map((r: any) => r[0].transcript).join(' ').trim();
      setUserText(transcript);
      const last = all[all.length - 1] as any;
      if (last.isFinal && transcript.length > 1 && !finalSent) {
        finalSent = true;
        rec.stop();
        sendToAI(transcript);
      }
    };

    // If no speech detected after silence, restart
    rec.onend = () => {
      if (!alive.current) return;
      if (phaseRef.current === 'listening' && !finalSent) {
        setTimeout(() => { if (alive.current && phaseRef.current === 'listening') listen(); }, 300);
      }
    };

    rec.onerror = (e: any) => {
      if (!alive.current) return;
      if (e.error === 'aborted' || e.error === 'no-speech') {
        if (phaseRef.current === 'listening') {
          setTimeout(() => { if (alive.current && phaseRef.current === 'listening') listen(); }, 500);
        }
        return;
      }
      console.error('SpeechRecognition error:', e.error);
      setTimeout(() => { if (alive.current && phaseRef.current === 'listening') listen(); }, 1000);
    };

    try { rec.start(); } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  const sendToAI = useCallback(async (text: string) => {
    if (!alive.current) return;

    // Stop mic before processing
    try { recRef.current?.abort(); } catch {}
    setPhaseSync('processing');
    setUserText(text);
    setAiText('');

    const msgs = [
      ...historyRef.current,
      {
        role: 'user',
        parts: [{ text: `${text}\n\n[SYSTEM: Voice call. Respond ONLY in the same language as the user (Hindi or English). Be very short, natural, conversational. No markdown, no lists, no emojis.]` }]
      }
    ];

    try {
      const res  = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: msgs, isLoggedIn: !!isLoggedIn }) });
      const data = await res.json();
      const reply = data.reply || 'Kuch samajh nahi aaya, dobara boliye please.';

      if (!alive.current) return;
      setAiText(reply);
      onMessageSent(text, reply);

      historyRef.current = [
        ...historyRef.current,
        { role: 'user',  parts: [{ text }] },
        { role: 'model', parts: [{ text: reply }] },
      ];

      await speak(reply);
    } catch {
      if (!alive.current) return;
      setAiText('Network error. Dobara try karein.');
      await speak('Network error aayi. Dobara try karein.');
    }

    // Back to listening after speaking
    if (alive.current) {
      setPhaseSync('listening');
      setTimeout(() => { if (alive.current) listen(); }, 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak, onMessageSent]);

  // Boot: greet → listen
  useEffect(() => {
    if (!voicesLoaded) return;
    alive.current = true;

    const boot = async () => {
      const greeting = 'Hello! I am Saathi. Namaste! Aap registration, earning, ya PIC program ke baare mein kuch bhi pooch sakte hain.';
      setAiText(greeting);
      await speak(greeting);
      if (alive.current) {
        setPhaseSync('listening');
        setTimeout(() => { if (alive.current) listen(); }, 400);
      }
    };
    const t = setTimeout(boot, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voicesLoaded]);

  const endCall = () => {
    alive.current = false;
    try { recRef.current?.abort(); } catch {}
    synth.current?.cancel();
    setPhaseSync('ended');
    setTimeout(onClose, 500);
  };

  const toggleMute = () => {
    setMuted(m => {
      if (!m) { try { recRef.current?.abort(); } catch {} setPhaseSync('listening'); }
      else if (phaseRef.current === 'listening') setTimeout(listen, 200);
      return !m;
    });
  };

  const toggleLang = () => {
    const next = lang === 'hi-IN' ? 'en-IN' : 'hi-IN';
    setLang(next);
    langRef.current = next;
    if (phaseRef.current === 'listening') {
      try { recRef.current?.abort(); } catch {}
      setTimeout(() => { if (alive.current) listen(); }, 300);
    }
  };

  const phaseLabel: Record<string, { text: string; color: string; sub: string }> = {
    connecting: { text: 'Connecting...', color: 'rgba(255,255,255,0.5)', sub: 'Please wait' },
    speaking:   { text: '🔊 Speaking...', color: G2,   sub: 'Suniye...' },
    listening:  { text: muted ? '🔇 Muted' : '🎙️ Listening...', color: PINK, sub: muted ? 'Unmute to speak' : 'Boliye, main sun raha hoon' },
    processing: { text: '💭 Thinking...', color: G2,   sub: 'Jawab dhoondh raha hoon' },
    ended:      { text: 'Call ended',    color: 'rgba(255,255,255,0.4)', sub: '' },
  };
  const info = phaseLabel[phase] ?? phaseLabel.connecting;

  return (
    <>
      <style>{`
        @keyframes wv { from { height: 3px; } to { height: 100%; } }
        @keyframes ring { 0%{transform:scale(.85);opacity:.7} 100%{transform:scale(1.06);opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>

      <div className="fixed inset-0 z-[100] flex flex-col" style={{
        background: 'radial-gradient(ellipse at 30% 20%, #0f2e1a 0%, #060d07 50%, #0a0514 100%)',
        animation: 'fadeIn .35s ease-out forwards',
      }}>
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div style={{ position:'absolute', width:400, height:400, top:-120, left:-80, borderRadius:'50%', background:`radial-gradient(circle,#1B433230,transparent)`, filter:'blur(60px)' }} />
          <div style={{ position:'absolute', width:300, height:300, bottom:-60, right:-60, borderRadius:'50%', background:`radial-gradient(circle,${PINK}20,transparent)`, filter:'blur(60px)' }} />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-10 pb-4">
          <div>
            <p style={{ color:'rgba(255,255,255,.3)', fontSize:11, fontWeight:600, letterSpacing:2, textTransform:'uppercase' }}>Voice Guidance</p>
            <p style={{ color:'#fff', fontWeight:700, fontSize:18, marginTop:2 }}>Saathi AI 🌿</p>
          </div>
          <div className="flex gap-3">
            <button onClick={toggleLang} style={{ background:`${PINK}18`, border:`1px solid ${PINK}40`, color:PINK, borderRadius:999, padding:'6px 12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              {lang === 'hi-IN' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:999, padding:'6px 12px' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:G2, animation:'pulse 2s ease-in-out infinite', display:'inline-block' }} />
              <span style={{ color:G2, fontFamily:'monospace', fontWeight:700, fontSize:13 }}>{fmt(elapsed)}</span>
            </div>
          </div>
        </div>

        {/* Centre */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-6">
          {/* Avatar */}
          <div style={{ position:'relative', width:200, height:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {(phase === 'speaking' || phase === 'listening') && [0,1,2].map(i => (
              <div key={i} style={{
                position:'absolute', borderRadius:'50%',
                width: 180 - i*30, height: 180 - i*30,
                border:`1.5px solid ${phase==='speaking' ? G2 : PINK}${['33','44','66'][i]}`,
                animation:`ring ${1.8 + i*.3}s ease-out ${i*.4}s infinite`,
              }} />
            ))}
            <div style={{
              width:110, height:110, borderRadius:'50%', position:'relative', zIndex:2,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              background: phase === 'speaking' ? 'radial-gradient(circle at 40% 35%,#1a4a30,#0a1f12)'
                        : phase === 'listening' ? 'radial-gradient(circle at 40% 35%,#2a0a35,#0f051a)'
                        : 'radial-gradient(circle at 40% 35%,#152010,#080e08)',
              border: `2.5px solid ${phase === 'speaking' ? G2 : phase === 'listening' ? PINK : 'rgba(255,255,255,.12)'}`,
              boxShadow: phase === 'speaking' ? `0 0 40px ${G2}44,0 0 80px ${G2}18`
                       : phase === 'listening' ? `0 0 40px ${PINK}44,0 0 80px ${PINK}18`
                       : '0 8px 32px rgba(0,0,0,.5)',
              transition: 'all .5s cubic-bezier(.4,0,.2,1)',
            }}>
              <span style={{ fontSize:36 }}>🌿</span>
              <span style={{ color:'rgba(255,255,255,.7)', fontSize:10, fontWeight:700, marginTop:3, letterSpacing:1 }}>SAATHI AI</span>
            </div>
            {phase === 'processing' && (
              <div style={{ position:'absolute', width:136, height:136, borderRadius:'50%', border:`2px solid transparent`, borderTopColor:G2, animation:'spin 1s linear infinite' }} />
            )}
          </div>

          {/* Status */}
          <div style={{ textAlign:'center' }}>
            <p style={{ color: info.color, fontWeight:700, fontSize:15, transition:'color .3s' }}>{info.text}</p>
            <p style={{ color:'rgba(255,255,255,.3)', fontSize:12, marginTop:4 }}>{info.sub}</p>
          </div>

          {/* Waveform */}
          <Waveform active={phase === 'speaking' || phase === 'listening'} color={phase === 'speaking' ? G2 : PINK} />

          {/* Transcript card */}
          <div style={{
            width:'100%', maxWidth:360, borderRadius:18, padding:'16px 20px', minHeight:80,
            display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center',
            transition:'all .3s',
            background: phase === 'listening' ? `linear-gradient(135deg,${PINK}10,transparent)`
                       : phase === 'speaking'  ? `linear-gradient(135deg,#1B433228,transparent)`
                       : 'rgba(255,255,255,.04)',
            border: `1px solid ${phase === 'listening' ? PINK+'30' : phase === 'speaking' ? G2+'25' : 'rgba(255,255,255,.07)'}`,
          }}>
            {phase === 'listening' && userText && (
              <p style={{ color:`${PINK}cc`, fontSize:14, lineHeight:1.5 }}>🎙️ "{userText}"</p>
            )}
            {phase === 'listening' && !userText && (
              <p style={{ color:'rgba(255,255,255,.25)', fontSize:14, animation:'pulse 2s ease-in-out infinite' }}>
                {muted ? 'Mic muted — unmute to speak' : 'Boliye... main sun raha hoon 👂'}
              </p>
            )}
            {phase === 'speaking' && aiText && (
              <p style={{ color:'rgba(255,255,255,.82)', fontSize:13, lineHeight:1.6 }}>
                {aiText.slice(0, 180)}{aiText.length > 180 ? '...' : ''}
              </p>
            )}
            {phase === 'processing' && (
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {[0,1,2].map(i => <span key={i} style={{ width:10, height:10, borderRadius:'50%', background:G2, animation:`pulse 1.2s ease-in-out ${i*.2}s infinite`, display:'inline-block' }} />)}
                <span style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}>Soch raha hoon...</span>
              </div>
            )}
            {phase === 'connecting' && <p style={{ color:'rgba(255,255,255,.3)', fontSize:13 }}>Saathi se connect ho raha hai...</p>}
          </div>
        </div>

        {/* Controls */}
        <div style={{ position:'relative', zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', gap:28, paddingBottom:56, paddingLeft:32, paddingRight:32 }}>
          {/* Mute */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <button onClick={toggleMute} style={{
              width:56, height:56, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'transform .15s',
              background: muted ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.07)',
              border: `1.5px solid ${muted ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.12)'}`,
            }}>
              {muted ? <MicOff size={22} color="rgba(255,255,255,.8)" /> : <Mic size={22} color="rgba(255,255,255,.55)" />}
            </button>
            <span style={{ color:'rgba(255,255,255,.3)', fontSize:10 }}>{muted ? 'Unmute' : 'Mute'}</span>
          </div>

          {/* End call */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <button onClick={endCall} style={{
              width:80, height:80, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              background:'linear-gradient(135deg,#f53a3a,#c42828)',
              boxShadow:'0 8px 40px rgba(245,58,58,.45),0 2px 8px rgba(0,0,0,.3)',
              border:'none', transition:'transform .15s',
            }}>
              <PhoneOff size={32} color="#fff" />
            </button>
            <span style={{ color:'rgba(255,255,255,.3)', fontSize:10 }}>End Call</span>
          </div>

          {/* Speaker */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <button onClick={() => setSpeakerOff(s => !s)} style={{
              width:56, height:56, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              background: speakerOff ? 'rgba(255,80,80,.15)' : 'rgba(255,255,255,.07)',
              border: `1.5px solid ${speakerOff ? 'rgba(255,80,80,.35)' : 'rgba(255,255,255,.12)'}`,
            }}>
              {speakerOff ? <VolumeX size={22} color="rgba(255,100,100,.8)" /> : <Volume2 size={22} color="rgba(255,255,255,.55)" />}
            </button>
            <span style={{ color:'rgba(255,255,255,.3)', fontSize:10 }}>{speakerOff ? 'Speaker off' : 'Speaker'}</span>
          </div>
        </div>

        <p style={{ position:'relative', zIndex:10, textAlign:'center', color:'rgba(255,255,255,.18)', fontSize:11, paddingBottom:20 }}>
          Hindi ya English — dono mein boliye 🌿
        </p>
      </div>
    </>
  );
}
