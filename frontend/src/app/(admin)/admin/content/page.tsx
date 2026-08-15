"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Save, Plus, Trash2, Edit2, LayoutTemplate, MessageSquare, HelpCircle, BarChart3, Phone } from 'lucide-react';

export default function WebsiteContentPage() {
  const [activeTab, setActiveTab] = useState('hero');
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const res = await api.get('/content');
      setContent(res.data.data);
    } catch (e: any) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const saveSection = async (section: string, data: any) => {
    try {
      await api.put(`/content/${section}`, data);
      toast.success(`${section} saved successfully!`);
      fetchContent();
    } catch (e: any) {
      toast.error(e.response?.data?.message || `Failed to save ${section}`);
    }
  };

  const addItem = async (section: string, data: any) => {
    try {
      await api.post(`/content/${section}/item`, data);
      toast.success('Item added successfully!');
      fetchContent();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add item');
    }
  };

  const deleteItem = async (section: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/content/${section}/item/${id}`);
      toast.success('Item deleted');
      fetchContent();
    } catch (e: any) {
      toast.error('Failed to delete item');
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-12 bg-white rounded-xl border border-gray-100"></div>
      <div className="h-64 bg-white rounded-xl border border-gray-100"></div>
    </div>;
  }

  const tabs = [
    { id: 'hero', name: 'Hero Banner', icon: LayoutTemplate },
    { id: 'testimonials', name: 'Testimonials', icon: MessageSquare },
    { id: 'faqs', name: 'FAQs', icon: HelpCircle },
    { id: 'stats', name: 'Stats Counter', icon: BarChart3 },
    { id: 'contact', name: 'Contact Info', icon: Phone },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-dm-serif text-brand-forest mb-1">Website Content</h1>
        <p className="text-gray-500">Manage the content displayed on your public landing page.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-brand-sage/20 p-3 shadow-sm flex flex-col gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive 
                      ? 'bg-brand-forest/10 text-brand-forest border border-brand-forest/20' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-brand-forest border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-forest' : 'text-gray-400'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-brand-sage/20 p-6 shadow-sm min-h-[400px]">
            
            {activeTab === 'hero' && (
              <HeroEditor 
                data={content?.hero} 
                onSave={(data) => saveSection('hero', data)} 
              />
            )}

            {activeTab === 'testimonials' && (
              <TestimonialsEditor 
                data={content?.testimonials || []} 
                onAdd={(item) => addItem('testimonials', item)}
                onDelete={(id) => deleteItem('testimonials', id)}
              />
            )}

            {activeTab === 'faqs' && (
              <FAQsEditor 
                data={content?.faqs || []} 
                onAdd={(item) => addItem('faqs', item)}
                onDelete={(id) => deleteItem('faqs', id)}
              />
            )}

            {activeTab === 'stats' && (
              <StatsEditor 
                data={content?.stats || []} 
                onAdd={(item) => addItem('stats', item)}
                onDelete={(id) => deleteItem('stats', id)}
              />
            )}

            {activeTab === 'contact' && (
              <ContactEditor 
                data={content?.contact} 
                onSave={(data) => saveSection('contact', data)} 
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Editor Subcomponents
// ─────────────────────────────────────────────────────────────

function HeroEditor({ data, onSave }: { data: any, onSave: (d: any) => void }) {
  const [formData, setFormData] = useState(data || {});

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Edit Hero Banner</h2>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
          <input 
            type="text" 
            className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-gold outline-none" 
            value={formData.badge || ''} 
            onChange={e => setFormData({...formData, badge: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Main Title</label>
          <input 
            type="text" 
            className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-gold outline-none" 
            value={formData.title || ''} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <textarea 
            className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-gold outline-none h-24" 
            value={formData.subtitle || ''} 
            onChange={e => setFormData({...formData, subtitle: e.target.value})} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input 
              type="text" 
              className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-gold outline-none" 
              value={formData.ctaText || ''} 
              onChange={e => setFormData({...formData, ctaText: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
            <input 
              type="text" 
              className="w-full p-2.5 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-gold outline-none" 
              value={formData.ctaLink || ''} 
              onChange={e => setFormData({...formData, ctaLink: e.target.value})} 
            />
          </div>
        </div>
      </div>
      <button 
        onClick={() => onSave(formData)}
        className="flex items-center gap-2 bg-brand-forest text-white px-6 py-2.5 rounded-xl font-medium hover:bg-brand-olive transition-colors"
      >
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </div>
  );
}

function ContactEditor({ data, onSave }: { data: any, onSave: (d: any) => void }) {
  const [formData, setFormData] = useState(data || {});

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Edit Contact Info</h2>
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="text" className="w-full p-2.5 border rounded-xl" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="text" className="w-full p-2.5 border rounded-xl" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea className="w-full p-2.5 border rounded-xl" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
          <input type="text" className="w-full p-2.5 border rounded-xl" value={formData.workingHours || ''} onChange={e => setFormData({...formData, workingHours: e.target.value})} />
        </div>
      </div>
      <button onClick={() => onSave(formData)} className="flex items-center gap-2 bg-brand-forest text-white px-6 py-2.5 rounded-xl font-medium">
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </div>
  );
}

function TestimonialsEditor({ data, onAdd, onDelete }: { data: any[], onAdd: (d: any) => void, onDelete: (id: string) => void }) {
  const [form, setForm] = useState({ name: '', role: '', text: '', rating: 5 });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">Testimonials</h2>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid gap-4">
        <h4 className="font-semibold text-sm">Add New Testimonial</h4>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Reviewer Name" className="p-2 border rounded-lg" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <input type="text" placeholder="Role / Company" className="p-2 border rounded-lg" value={form.role} onChange={e=>setForm({...form,role:e.target.value})} />
        </div>
        <textarea placeholder="Review Text" className="p-2 border rounded-lg" value={form.text} onChange={e=>setForm({...form,text:e.target.value})} />
        <button onClick={() => { onAdd(form); setForm({name:'',role:'',text:'',rating:5}) }} className="bg-brand-gold text-white px-4 py-2 rounded-lg font-medium w-max flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid gap-4">
        {data.length === 0 && <p className="text-gray-500 text-sm">No testimonials yet.</p>}
        {data.map(item => (
          <div key={item.id} className="p-4 border rounded-xl flex justify-between items-start bg-white shadow-sm">
            <div>
              <p className="font-bold">{item.name} <span className="text-sm font-normal text-gray-500 ml-2">{item.role}</span></p>
              <p className="text-sm text-gray-700 mt-2">"{item.text}"</p>
            </div>
            <button onClick={() => onDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQsEditor({ data, onAdd, onDelete }: { data: any[], onAdd: (d: any) => void, onDelete: (id: string) => void }) {
  const [form, setForm] = useState({ question: '', answer: '' });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">FAQs</h2>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid gap-4">
        <h4 className="font-semibold text-sm">Add New FAQ</h4>
        <input type="text" placeholder="Question" className="p-2 border rounded-lg" value={form.question} onChange={e=>setForm({...form,question:e.target.value})} />
        <textarea placeholder="Answer" className="p-2 border rounded-lg" value={form.answer} onChange={e=>setForm({...form,answer:e.target.value})} />
        <button onClick={() => { onAdd(form); setForm({question:'',answer:''}) }} className="bg-brand-gold text-white px-4 py-2 rounded-lg font-medium w-max flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      <div className="grid gap-4">
        {data.length === 0 && <p className="text-gray-500 text-sm">No FAQs yet.</p>}
        {data.map(item => (
          <div key={item.id} className="p-4 border rounded-xl flex justify-between items-start bg-white shadow-sm">
            <div>
              <p className="font-bold text-brand-forest">Q: {item.question}</p>
              <p className="text-sm text-gray-700 mt-2">A: {item.answer}</p>
            </div>
            <button onClick={() => onDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsEditor({ data, onAdd, onDelete }: { data: any[], onAdd: (d: any) => void, onDelete: (id: string) => void }) {
  const [form, setForm] = useState({ number: '', label: '' });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">Stats Counter</h2>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid gap-4">
        <h4 className="font-semibold text-sm">Add New Stat</h4>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="e.g. 500+" className="p-2 border rounded-lg" value={form.number} onChange={e=>setForm({...form,number:e.target.value})} />
          <input type="text" placeholder="Label (e.g. Happy Partners)" className="p-2 border rounded-lg" value={form.label} onChange={e=>setForm({...form,label:e.target.value})} />
        </div>
        <button onClick={() => { onAdd(form); setForm({number:'',label:''}) }} className="bg-brand-gold text-white px-4 py-2 rounded-lg font-medium w-max flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Stat
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length === 0 && <p className="text-gray-500 text-sm col-span-2">No stats yet.</p>}
        {data.map(item => (
          <div key={item.id} className="p-4 border rounded-xl text-center relative group bg-white shadow-sm">
            <button onClick={() => onDelete(item.id)} className="absolute top-2 right-2 text-red-500 bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
            <p className="text-3xl font-bold text-brand-gold">{item.number}</p>
            <p className="text-sm font-medium text-gray-600 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
