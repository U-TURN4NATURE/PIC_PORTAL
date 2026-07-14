'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Trash2, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { loadHistory, deleteSession, ChatSession } from './useAIChat';

const G = '#1B4332';
const PINK = '#E91E8C';
const G2 = '#2ECC71';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Abhi abhi';
  if (diffMin < 60) return `${diffMin} min pehle`;
  if (diffHr < 24) return `${diffHr} ghante pehle`;
  if (diffDay === 1) return 'Kal';
  if (diffDay < 7) return `${diffDay} din pehle`;
  return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' });
}

interface ChatHistoryPanelProps {
  onClose: () => void;
  onLoadSession: (session: ChatSession) => void;
}

export default function ChatHistoryPanel({ onClose, onLoadSession }: ChatHistoryPanelProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSessions(loadHistory());
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleLoad = useCallback((session: ChatSession) => {
    setSelectedId(session.id);
    onLoadSession(session);
  }, [onLoadSession]);

  const handleClearAll = useCallback(() => {
    if (confirm('Saari chat history delete karein?')) {
      localStorage.removeItem('saathi_chat_history');
      setSessions([]);
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes historySlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Panel */}
      <div
        className="fixed z-[60] flex flex-col overflow-hidden shadow-2xl"
        style={{
          bottom: '172px',
          right: '16px',
          width: 'min(360px, calc(100vw - 32px))',
          height: 'min(580px, calc(100vh - 200px))',
          background: 'linear-gradient(160deg, #080f0a 0%, #0f2016 50%, #080f0a 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '24px',
          animation: 'historySlideIn 0.3s cubic-bezier(0.34,1.2,0.64,1) forwards',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: G2 }} />
            <p className="text-white font-bold text-sm">Chat History</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: `${G2}22`, color: G2 }}
            >
              {sessions.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {sessions.length > 0 && (
              <button
                onClick={handleClearAll}
                title="Sab delete karo"
                className="p-1.5 rounded-full text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 py-3"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <MessageSquare className="w-12 h-12 text-white/10" />
              <p className="text-white/30 text-sm">Abhi tak koi chat nahi hui</p>
              <p className="text-white/20 text-xs">Saathi se baat karo — history yahan save hogi</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map(session => {
                const isSelected = selectedId === session.id;
                const msgCount = session.messages.filter(m => m.role === 'user').length;
                return (
                  <button
                    key={session.id}
                    onClick={() => handleLoad(session)}
                    className="w-full text-left rounded-2xl px-4 py-3 transition-all hover:scale-[1.01] active:scale-[0.99] group"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${G}88, #2d6a4f44)`
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? G2 + '44' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium leading-snug truncate"
                          style={{ color: isSelected ? G2 : 'rgba(255,255,255,0.85)' }}
                        >
                          {session.title || 'Chat session'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {formatDate(session.date)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            {msgCount} sawaal
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={e => handleDelete(e, session.id)}
                          className="p-1 rounded-full opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                      </div>
                    </div>

                    {/* Preview of last exchange */}
                    {session.messages.length > 0 && (
                      <p className="text-xs mt-2 truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {session.messages[session.messages.length - 1]?.text?.slice(0, 70)}...
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-center text-white/20 text-[10px]">
            History locally saved • Max 20 sessions
          </p>
        </div>
      </div>
    </>
  );
}
