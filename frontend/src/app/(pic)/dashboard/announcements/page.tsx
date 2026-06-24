"use client";

import { useState, useEffect, useMemo } from 'react';
import { Megaphone, Calendar, User, RefreshCw, Bell, Search, X } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { Announcement } from '@/lib/api-types';

const LAST_SEEN_KEY = 'pic_announcements_last_seen';

export default function PICAnnouncementsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useApi<Announcement[]>('/pic/announcements');
  const announcements = data ?? [];

  // Mark as "seen" when user opens this page
  useEffect(() => {
    if (announcements.length > 0) {
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    }
  }, [announcements]);

  const filtered = useMemo(() => {
    if (!search.trim()) return announcements;
    const q = search.toLowerCase();
    return announcements.filter(
      (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
    );
  }, [announcements, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-dm-serif text-brand-forest flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-forest/10 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-brand-forest" />
            </div>
            Announcements
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Official updates from U-Turn4Nature</p>
        </div>
        <button
          onClick={() => refetch()}
          id="refresh-announcements-btn"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-forest border border-brand-sage/40 rounded-xl hover:bg-brand-sage/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="announcement-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search announcements..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-brand-sage/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest/40 bg-white transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-brand-sage/20 shadow-sm">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-sage/20 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-brand-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-brand-forest/40" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {search ? 'No results found' : 'No announcements yet'}
          </h3>
          <p className="text-gray-500 text-sm">
            {search
              ? `No announcements match "${search}"`
              : 'Check back later for updates from the U-Turn4Nature team.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          {search && (
            <p className="text-sm text-gray-500">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
            </p>
          )}
          {filtered.map((ann, idx) => (
            <AnnouncementCard key={ann.id} announcement={ann} isLatest={idx === 0 && !search} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementCard({
  announcement,
  isLatest,
}: {
  announcement: Announcement;
  isLatest: boolean;
}) {
  const [expanded, setExpanded] = useState(isLatest);

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${
        isLatest ? 'border-brand-forest/30 ring-1 ring-brand-forest/10' : 'border-brand-sage/20'
      }`}
    >
      <button
        id={`announcement-expand-${announcement.id}`}
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isLatest ? 'bg-brand-forest text-white' : 'bg-brand-sage/20 text-brand-forest'
            }`}
          >
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">{announcement.title}</h3>
              {isLatest && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-gold/20 text-yellow-700 rounded-full border border-brand-gold/30 shrink-0">
                  LATEST
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {announcement.author?.name || 'Admin'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(announcement.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
        <div
          className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-transform duration-200 ${
            expanded ? 'rotate-180 bg-brand-forest/5 border-brand-forest/20' : 'border-gray-200'
          }`}
        >
          <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-brand-sage/10">
          <div className="mt-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {announcement.content}
          </div>
        </div>
      )}
    </div>
  );
}
