'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  X, Send, MessageCircle, RotateCcw, Bot, Sparkles,
  ChevronDown, ExternalLink, Mic, MicOff, Volume2, VolumeX,
  Phone, Clock,
} from 'lucide-react';
import { useAIChat, QUICK_REPLIES, ChatMessage, ChatSession } from './useAIChat';
import VoiceCallMode from './VoiceCallMode';
import ChatHistoryPanel from './ChatHistoryPanel';
import { useAuthStore } from '@/store/authStore';

const G = '#1B4332';
const PINK = '#E91E8C';
const G2 = '#2ECC71';

// ── Markdown renderer ──────────────────────────────────────
function renderText(text: string) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g).map((p, j) =>
      j % 2 === 1 ? <strong key={j} style={{ color: G2 }}>{p}</strong> : p
    );
    if (line.trim().match(/^[•\-\*]/)) {
      return (
        <div key={i} className="flex items-start gap-1.5 mt-0.5">
          <span style={{ color: PINK }} className="flex-shrink-0 mt-0.5">•</span>
          <span>{parts}</span>
        </div>
      );
    }
    return <span key={i}>{parts}{i < arr.length - 1 && <br />}</span>;
  });
}

function stripMd(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '').replace(/•/g, '').replace(/\n+/g, ' ')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .trim();
}

// ── Typing indicator ───────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${G}, #2d6a4f)` }}>
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full"
              style={{ background: G2, animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────
function MessageBubble({
  message, isNew, onSpeak, isSpeaking,
}: {
  message: ChatMessage; isNew: boolean;
  onSpeak: (text: string) => void; isSpeaking: boolean;
}) {
  const isUser = message.role === 'user';
  if (isUser) {
    return (
      <div className="flex justify-end mb-3" style={{ animation: isNew ? 'chatSlideIn 0.3s ease-out' : undefined }}>
        <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-br-sm text-white text-sm leading-relaxed"
          style={{ background: `linear-gradient(135deg, ${PINK}, #c4157a)` }}>
          {message.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2 mb-3" style={{ animation: isNew ? 'chatSlideIn 0.3s ease-out' : undefined }}>
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-md"
        style={{ background: `linear-gradient(135deg, ${G}, #2d6a4f)` }}>
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.92)' }}>
        {renderText(message.text)}
        {/* Speak button */}
        <button onClick={() => onSpeak(message.text)}
          className="mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all opacity-50 hover:opacity-100"
          style={{ background: isSpeaking ? `${PINK}33` : 'rgba(255,255,255,0.06)', border: `1px solid ${isSpeaking ? PINK + '50' : 'rgba(255,255,255,0.08)'}`, color: isSpeaking ? PINK : G2 }}>
          {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          <span>{isSpeaking ? 'Band karo' : 'Suniye'}</span>
        </button>
        {/* Register link */}
        {message.text.includes('/register') && (
          <Link href="/register"
            className="mt-2 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full w-fit"
            style={{ background: `${PINK}22`, border: `1px solid ${PINK}60`, color: PINK }}>
            <ExternalLink className="w-3 h-3" /> Register Now →
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Main Widget ────────────────────────────────────────────
export default function AIChatWidget() {
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showCallMode, setShowCallMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [listenLang, setListenLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { messages, isLoading, error, sendMessage, clearChat } = useAIChat(undefined, isAuthenticated);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hasRec = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    const hasSynth = !!window.speechSynthesis;
    setSpeechSupported(hasRec && hasSynth);
    if (hasSynth) synthRef.current = window.speechSynthesis;
  }, []);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  // Auto-speak latest AI msg
  useEffect(() => {
    if (!voiceEnabled || !isOpen) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'model' && last.id !== 'welcome' && !isLoading) {
      speakText(last.text, last.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading]);

  // TTS
  const speakText = useCallback((text: string, msgId?: string) => {
    if (!synthRef.current) return;
    if (isSpeaking && speakingMsgId === msgId) {
      synthRef.current.cancel(); setIsSpeaking(false); setSpeakingMsgId(null); return;
    }
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(stripMd(text));
    const isHindi = /[\u0900-\u097F]/.test(text) || /\bhai\b|\bkya\b|\bnahi\b/i.test(text);
    utter.lang = isHindi ? 'hi-IN' : 'en-IN';
    utter.rate = 0.92; utter.pitch = 1.05;
    utter.onstart = () => { setIsSpeaking(true); setSpeakingMsgId(msgId || null); };
    utter.onend = () => { setIsSpeaking(false); setSpeakingMsgId(null); };
    utter.onerror = () => { setIsSpeaking(false); setSpeakingMsgId(null); };
    synthRef.current.speak(utter);
  }, [isSpeaking, speakingMsgId]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel(); setIsSpeaking(false); setSpeakingMsgId(null);
  }, []);

  // STT
  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    stopSpeaking();
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = listenLang; rec.continuous = false; rec.interimResults = true;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => {
      setInputText(Array.from(e.results as any[]).map((r: any) => r[0].transcript).join(''));
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.start();
  }, [listenLang, stopSpeaking]);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false); }, []);
  const toggleMic = useCallback(() => isListening ? stopListening() : startListening(), [isListening, startListening, stopListening]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    stopListening();
    const text = inputText; setInputText(''); setShowQuickReplies(false);
    await sendMessage(text);
  }, [inputText, isLoading, sendMessage, stopListening]);

  const handleQuickReply = useCallback(async (text: string) => {
    setShowQuickReplies(false); await sendMessage(text);
  }, [sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Voice call callback — add messages to chat history panel
  const handleCallMessage = useCallback((userText: string, aiReply: string) => {
    // call mode saves via its own sendToAI path; we just note it happened
  }, []);

  // Load history session into chat
  const handleLoadSession = useCallback((session: ChatSession) => {
    // For now just close history — future: reinstate messages
    setShowHistory(false);
    setIsOpen(true);
  }, []);

  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%,60%,100%{transform:translateY(0);opacity:.4}
          30%{transform:translateY(-6px);opacity:1}
        }
        @keyframes chatSlideIn {
          from{transform:translateY(10px);opacity:0}
          to{transform:translateY(0);opacity:1}
        }
        @keyframes chatWidgetOpen {
          from{transform:scale(.85) translateY(20px);opacity:0}
          to{transform:scale(1) translateY(0);opacity:1}
        }
        @keyframes saathiPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(233,30,140,.5)}
          50%{box-shadow:0 0 0 12px rgba(233,30,140,0)}
        }
        @keyframes micRipple {
          0%{box-shadow:0 0 0 0 rgba(233,30,140,.8)}
          70%{box-shadow:0 0 0 16px rgba(233,30,140,0)}
          100%{box-shadow:0 0 0 0 rgba(233,30,140,0)}
        }
       @keyframes greenDot{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes listeningWave{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.8)}}

        /* Mobile full-screen chat */
        @media (max-width: 640px) {
          .saathi-chat-window {
            bottom: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
          }
          .saathi-fab {
            bottom: 20px !important;
            right: 16px !important;
            width: 54px !important;
            height: 54px !important;
          }
          .saathi-label {
            bottom: 78px !important;
            right: 10px !important;
          }
        }
      `}</style>

      {/* ── Voice Call fullscreen overlay ── */}
      {showCallMode && (
        <VoiceCallMode
          onClose={() => setShowCallMode(false)}
          onMessageSent={handleCallMessage}
          isLoggedIn={isAuthenticated}
        />
      )}

      {/* ── History panel ── */}
      {showHistory && !showCallMode && (
        <ChatHistoryPanel
          onClose={() => setShowHistory(false)}
          onLoadSession={handleLoadSession}
        />
      )}

      {/* ── FAB ── */}
      <button
        onClick={() => { setIsOpen(p => !p); setShowHistory(false); }}
        aria-label="Saathi AI chat"
        className="saathi-fab fixed z-50 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          bottom: '100px', right: '24px', width: '60px', height: '60px',
          background: isOpen ? 'rgba(27,67,50,0.95)' : `linear-gradient(135deg,${G} 0%,#2d6a4f 50%,${PINK} 100%)`,
          animation: !isOpen ? 'saathiPulse 2.5s ease-in-out infinite' : undefined,
          border: `2px solid ${isOpen ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
        }}
      >
        {isOpen
          ? <ChevronDown className="w-6 h-6 text-white" />
          : <div className="relative">
              <MessageCircle className="w-7 h-7 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                style={{ background: G2, animation: 'greenDot 2s ease-in-out infinite' }} />
            </div>
        }
      </button>

      {/* ── Label ── */}
      {!isOpen && !showCallMode && (
        <div className="saathi-label fixed z-50 text-xs font-bold text-white px-2 py-1 rounded-full pointer-events-none"
          style={{ bottom: '164px', right: '18px', background: `${G}cc`, border: `1px solid ${G2}44`, backdropFilter: 'blur(8px)' }}>
          🎙️ Saathi AI
        </div>
      )}

      {/* ── Chat Window ── */}
      {isOpen && !showCallMode && !showHistory && (
        <div className="saathi-chat-window fixed z-50 flex flex-col overflow-hidden shadow-2xl"
          style={{
            bottom: '172px', right: '16px',
            width: 'min(390px, calc(100vw - 32px))',
            height: 'min(610px, calc(100vh - 200px))',
            background: 'linear-gradient(160deg, #0d2818 0%, #1B4332 40%, #0f1f0f 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px',
            animation: 'chatWidgetOpen 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
          }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg,${G},#2d6a4f)`, border: `2px solid ${G2}44` }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Saathi AI 🌿</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: G2 }} />
                  <p className="text-xs" style={{ color: G2 }}>
                    {isListening ? '🎙️ Sun raha hoon...' : isSpeaking ? '🔊 Bol raha hoon...' : 'Online • PIC Assistant'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* 📞 Call button */}
              <button
                onClick={() => setShowCallMode(true)}
                title="Voice call — bilkul phone call jaisa!"
                className="p-1.5 rounded-full transition-all hover:scale-110"
                style={{ background: `${G2}22`, border: `1px solid ${G2}44`, color: G2 }}
              >
                <Phone className="w-4 h-4" />
              </button>
              {/* 📜 History */}
              <button
                onClick={() => setShowHistory(true)}
                title="Chat history"
                className="p-1.5 rounded-full transition-all text-white/40 hover:text-white/80 hover:bg-white/10"
              >
                <Clock className="w-4 h-4" />
              </button>
              {/* Voice toggle */}
              {speechSupported && (
                <button
                  onClick={() => { setVoiceEnabled(v => !v); if (voiceEnabled) stopSpeaking(); }}
                  className="p-1.5 rounded-full transition-all"
                  style={{ background: voiceEnabled ? `${G2}22` : 'transparent', color: voiceEnabled ? G2 : 'rgba(255,255,255,0.3)' }}>
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              )}
              <button onClick={() => { clearChat(); setShowQuickReplies(true); }}
                className="p-1.5 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsOpen(false); stopSpeaking(); }}
                className="p-1.5 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Call CTA banner */}
          <button
            onClick={() => setShowCallMode(true)}
            className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:brightness-110"
            style={{ background: `linear-gradient(90deg, ${G2}18, ${PINK}18)`, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${G2}, #27ae60)` }}>
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: G2 }}>📞 Phone call ki tarah baat karo!</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Sirf bolo — Saathi sunegi aur bol ke jawab degi
              </p>
            </div>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
              style={{ background: `${G2}22`, color: G2 }}>Tap!</span>
          </button>

          {/* Listening banner */}
          {isListening && (
            <div className="flex-shrink-0 px-4 py-2 flex items-center gap-3"
              style={{ background: `${PINK}18`, borderBottom: `1px solid ${PINK}33` }}>
              <div className="flex items-center gap-0.5 h-4">
                {[0.6, 1, 0.8, 1.2, 0.7].map((h, i) => (
                  <span key={i} className="w-1 rounded-full" style={{ height: `${h * 12}px`, background: PINK, animation: `listeningWave 0.8s ease-in-out ${i * 0.1}s infinite` }} />
                ))}
              </div>
              <p className="text-xs font-semibold flex-1" style={{ color: PINK }}>
                Bol rahe ho... (Hindi/English dono chalega)
              </p>
              <button onClick={() => setListenLang(l => l === 'hi-IN' ? 'en-IN' : 'hi-IN')}
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${PINK}33`, color: PINK }}>{listenLang === 'hi-IN' ? 'हिं' : 'EN'}</button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id} message={msg} isNew={i === messages.length - 1 && i > 0}
                onSpeak={t => speakText(t, msg.id)} isSpeaking={isSpeaking && speakingMsgId === msg.id} />
            ))}
            {isLoading && <TypingIndicator />}
            {error && (
              <div className="text-center py-2">
                <p className="text-xs text-red-400 bg-red-400/10 rounded-xl px-3 py-2 inline-block">{error}</p>
              </div>
            )}
            {showQuickReplies && messages.length === 1 && !isLoading && (
              <div className="mt-3">
                <p className="text-xs text-white/30 mb-2 font-medium">Jaldi poochho / Quick ask:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((qr, i) => (
                    <button key={i} onClick={() => handleQuickReply(qr.text)}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105 active:scale-95"
                      style={{ background: i % 2 === 0 ? `${G}88` : `${PINK}22`, border: `1px solid ${i % 2 === 0 ? G2 + '44' : PINK + '44'}`, color: i % 2 === 0 ? G2 : PINK }}>
                      {qr.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-3 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
            {speechSupported && (
              <p className="text-center text-white/25 text-[10px] mb-1.5">
                🎙️ Mic se bolo ya likho • 📞 Call ke liye phone icon dabao
              </p>
            )}
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2"
              style={{ background: isListening ? `${PINK}12` : 'rgba(255,255,255,0.07)', border: `1px solid ${isListening ? PINK + '60' : 'rgba(255,255,255,0.12)'}`, transition: 'all 0.3s' }}>
              {speechSupported && (
                <button onClick={toggleMic} disabled={isLoading}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                  style={{ background: isListening ? PINK : 'rgba(255,255,255,0.1)', animation: isListening ? 'micRipple 1.2s ease-out infinite' : undefined }}>
                  {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                </button>
              )}
              <input ref={inputRef} value={inputText}
                onChange={e => setInputText(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Bol rahe ho...' : 'Type karo ya 🎙️ dabao...'}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm outline-none min-w-0"
                style={{ color: 'rgba(255,255,255,0.9)' }} />
              <button onClick={handleSend} disabled={!inputText.trim() || isLoading}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30 hover:scale-110 active:scale-95"
                style={{ background: inputText.trim() ? `linear-gradient(135deg,${PINK},#c4157a)` : 'rgba(255,255,255,0.1)' }}>
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-center text-white/15 text-[10px] mt-1.5">
              Powered by Groq • Llama 3.3 70B • Free forever
            </p>
          </div>
        </div>
      )}
    </>
  );
}
