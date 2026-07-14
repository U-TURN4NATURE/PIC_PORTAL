'use client';

import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: `Namaste! 🌿 Main **Saathi** hoon — U-Turn4Nature PIC Portal ka AI assistant!\n\nHello! I'm **Saathi** 🌿 — your AI guide for the Partner in Change program.\n\nMain aapki madad kar sakta hoon:\n• PIC program join karne mein 📝\n• Earnings & income samajhne mein 💰\n• Products ke baare mein 🏡\n• Registration process mein 🚀\n\nAaj main aapki kya madad kar sakta hoon? 😊\nHow can I help you today?\n\n📞 **Call mode** ke liye phone icon dabao — bilkul phone call ki tarah baat kar sakte ho!`,
  timestamp: new Date(),
};

export const QUICK_REPLIES = [
  { label: 'PIC क्या है?', text: 'PIC kya hai? Mujhe samjhao.' },
  { label: 'Register karo', text: 'Mujhe register karna hai. Kaise karoon?' },
  { label: 'Kitna earn hoga?', text: 'Kitna paise earn kar sakta/sakti hoon?' },
  { label: 'What is PIC?', text: 'What is the PIC Partner in Change program?' },
  { label: 'How to earn?', text: 'How much can I earn as a PIC partner?' },
  { label: 'Free hai?', text: 'Kya registration bilkul free hai? Koi investment chahiye?' },
];

const HISTORY_KEY = 'saathi_chat_history';
const MAX_SESSIONS = 20;

// ── Local Storage Helpers ──────────────────────────────────
function loadHistory(): ChatSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSession(messages: ChatMessage[]) {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) return; // nothing to save

  try {
    const history = loadHistory();
    const title = userMessages[0].text.slice(0, 60) + (userMessages[0].text.length > 60 ? '...' : '');
    const session: ChatSession = {
      id: `session-${Date.now()}`,
      title,
      date: new Date().toISOString(),
      messages,
    };
    const updated = [session, ...history].slice(0, MAX_SESSIONS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return session.id;
  } catch {
    /* ignore */
  }
}

function deleteSession(sessionId: string) {
  try {
    const history = loadHistory().filter(s => s.id !== sessionId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* ignore */ }
}

export { loadHistory, saveSession, deleteSession };

// ── Hook ──────────────────────────────────────────────────
export function useAIChat(initialMessages?: ChatMessage[]) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? [WELCOME_MESSAGE]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string): Promise<string | null> => {
    if (!text.trim() || isLoading) return null;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages.filter(m => m.id !== 'welcome'), userMsg];
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    const geminiContents = updatedMessages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    try {
      abortRef.current = new AbortController();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: geminiContents }),
        signal: abortRef.current.signal,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response from AI');

      const replyText = data.reply || 'Sorry, I could not understand. Please try again.';
      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updated = [...prev, botMsg];
        // Auto-save to history
        saveSession(updated.filter(m => m.id !== 'welcome'));
        return updated;
      });

      return replyText;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const msg = err.message || 'AI service is temporarily unavailable. Please try again.';
        setError(msg);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearChat = useCallback(() => {
    // Save current before clearing
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length > 0) saveSession(messages.filter(m => m.id !== 'welcome'));
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  }, [messages]);

  return { messages, isLoading, error, sendMessage, clearChat };
}
