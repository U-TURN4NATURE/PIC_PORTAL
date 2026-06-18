"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Megaphone,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  author: { name: string };
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/announcements');
      setAnnouncements(res.data.data || []);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleToggleActive = async (ann: Announcement) => {
    try {
      await api.patch(`/admin/announcements/${ann.id}`, { isActive: !ann.isActive });
      toast.success(`Announcement ${ann.isActive ? 'hidden' : 'published'}`);
      fetchAnnouncements();
    } catch {
      toast.error('Failed to update announcement');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      toast.success('Announcement deleted');
      setDeleteConfirm(null);
      fetchAnnouncements();
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  const activeCount = announcements.filter((a) => a.isActive).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-dm-serif text-brand-forest flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-forest/10 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-brand-forest" />
            </div>
            Announcements
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Publish updates visible to all approved PIC partners
          </p>
        </div>
        <button
          id="create-announcement-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-forest text-white text-sm font-semibold rounded-xl hover:bg-brand-forest/90 transition-all shadow-md shadow-brand-forest/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Posts" value={String(announcements.length)} color="brand-forest" />
        <StatCard label="Active / Visible" value={String(activeCount)} color="green" />
        <StatCard label="Hidden / Draft" value={String(announcements.length - activeCount)} color="gray" />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl p-5 border border-brand-sage/20 h-24" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-sage/20 shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-brand-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-brand-forest/40" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No announcements yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Create your first announcement to inform your PIC partners.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-brand-forest text-white text-sm font-semibold rounded-xl hover:bg-brand-forest/90 transition-colors"
          >
            Create Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <AnnouncementRow
              key={ann.id}
              announcement={ann}
              onToggle={() => handleToggleActive(ann)}
              onDeleteRequest={() => setDeleteConfirm(ann.id)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAnnouncementModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchAnnouncements();
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
        />
      )}
    </div>
  );
}

// ─── Row Component ─────────────────────────────────────────────────────────────

function AnnouncementRow({
  announcement,
  onToggle,
  onDeleteRequest,
}: {
  announcement: Announcement;
  onToggle: () => void;
  onDeleteRequest: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        announcement.isActive
          ? 'border-brand-sage/20 hover:border-brand-forest/20'
          : 'border-dashed border-gray-300 opacity-70 hover:opacity-90'
      }`}
    >
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Status Badge */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            announcement.isActive
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Megaphone className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 truncate">{announcement.title}</span>
            {announcement.isActive ? (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200">
                ACTIVE
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                HIDDEN
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(announcement.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span>by {announcement.author?.name || 'Admin'}</span>
          </div>

          {expanded && (
            <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-t border-brand-sage/10 pt-3">
              {announcement.content}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id={`expand-ann-${announcement.id}`}
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Collapse' : 'Preview'}
            className="p-2 rounded-lg text-gray-400 hover:text-brand-forest hover:bg-brand-sage/10 transition-colors"
          >
            {expanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <button
            id={`toggle-ann-${announcement.id}`}
            onClick={onToggle}
            title={announcement.isActive ? 'Hide from PICs' : 'Show to PICs'}
            className="p-2 rounded-lg text-gray-400 hover:text-brand-forest hover:bg-brand-sage/10 transition-colors"
          >
            {announcement.isActive ? (
              <ToggleRight className="w-5 h-5 text-green-500" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
          </button>

          <button
            id={`delete-ann-${announcement.id}`}
            onClick={onDeleteRequest}
            title="Delete announcement"
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Modal ──────────────────────────────────────────────────────────────

function CreateAnnouncementModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/admin/announcements', { title: title.trim(), content: content.trim(), isActive });
      toast.success('Announcement published!');
      onCreated();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create announcement');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-forest/10 rounded-xl flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-brand-forest" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">New Announcement</h2>
              <p className="text-xs text-gray-500">Visible to all active PIC partners</p>
            </div>
          </div>
          <button
            id="close-create-modal-btn"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5 flex-1">
            {/* Title */}
            <div>
              <label htmlFor="ann-title" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="ann-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Commission Rate Update"
                maxLength={150}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30 focus:border-brand-forest transition-all"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/150</p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="ann-content" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="ann-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement here..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-forest/30 focus:border-brand-forest transition-all resize-none"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-800">Publish Immediately</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isActive ? 'PICs will see this right away' : 'Save as draft (hidden from PICs)'}
                </p>
              </div>
              <button
                type="button"
                id="ann-active-toggle"
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                  isActive ? 'bg-brand-forest' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    isActive ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-announcement-btn"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-brand-forest text-white text-sm font-semibold rounded-xl hover:bg-brand-forest/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm shadow-brand-forest/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {isActive ? 'Publish' : 'Save Draft'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Announcement?</h3>
        <p className="text-sm text-gray-500 mb-6">
          This action cannot be undone. The announcement will be permanently removed from all PIC dashboards.
        </p>
        <div className="flex gap-3">
          <button
            id="cancel-delete-btn"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    'brand-forest': 'bg-brand-forest/5 border-brand-forest/20 text-brand-forest',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-500',
  };

  return (
    <div className={`rounded-2xl border px-5 py-4 ${colorMap[color] || colorMap.gray}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
