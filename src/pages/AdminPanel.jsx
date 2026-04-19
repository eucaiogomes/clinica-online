import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ArrowLeft, Loader2, Sparkles, RefreshCcw, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error'

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (!error) {
      setConfigs(data || []);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus(null);
    
    // Fazemos updates individuais para garantir integridade (embora existam formas mais performáticas em lote)
    const promises = configs.map(config => 
      supabase.from('app_config').update({ value: config.value }).eq('id', config.id)
    );

    const results = await Promise.all(promises);
    const hasError = results.some(res => res.error);

    if (hasError) {
      setSaveStatus('error');
    } else {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000); // Limpa status após 3s
    }
    setSaving(false);
  }

  const handleChange = (id, newValue) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, value: newValue } : c));
  };

  // Agrupamento por categoria
  const grouped = configs.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-sage-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Header Fixo */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-sage-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="p-2 hover:bg-sage-50 rounded-full transition-colors text-sage-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-serif text-xl text-sage-900 font-bold">Painel de Controle</h1>
            <p className="text-xs text-sage-500 uppercase tracking-widest font-semibold font-sans">Personalização total do Diário</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-green-600 text-sm font-medium flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <Check size={16} /> Alterações salvas!
            </motion.span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-sage-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-sage-700 shadow-lg shadow-sage-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-sage-50 border border-sage-100 rounded-3xl p-8 mb-12 flex items-start gap-6 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-sage-800 font-serif text-2xl mb-2 flex items-center gap-2">
              <Sparkles className="text-sage-500" size={24} /> Edição Dinâmica
            </h2>
            <p className="text-sage-600/80 leading-relaxed text-sm max-w-xl">
              Tudo o que você alterar aqui será refletido imediatamente para suas pacientes. 
              Use com carinho para ajustar o tom de voz e os exemplos.
            </p>
          </div>
          <RefreshCcw className="absolute right-[-20px] bottom-[-20px] text-sage-200/40 w-48 h-48 -rotate-12" />
        </div>

        <div className="space-y-16 pb-20">
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category}>
              <h3 className="text-xs font-bold tracking-[0.2em] text-sage-400 uppercase mb-6 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-sage-200"></span>
                {category}
              </h3>
              
              <div className="grid gap-6">
                {items.map((config) => (
                  <div key={config.id} className="group bg-white p-6 rounded-2xl border border-sage-100 shadow-sm hover:shadow-md hover:border-sage-200 transition-all">
                    <div className="flex justify-between items-start mb-3">
                       <label className="text-sm font-bold text-sage-800 flex items-center gap-1.5">
                         {config.label}
                         {config.is_placeholder && <span className="text-[10px] bg-blush-50 text-blush-600 px-1.5 py-0.5 rounded-md uppercase">Placeholder</span>}
                       </label>
                       <span className="text-[10px] text-sage-300 font-mono select-none">{config.key}</span>
                    </div>

                    {config.value.length > 60 ? (
                      <textarea
                        value={config.value}
                        onChange={(e) => handleChange(config.id, e.target.value)}
                        rows={3}
                        className="w-full bg-cream-50/30 border border-sage-100 rounded-xl p-4 text-sage-700 text-sm focus:bg-white focus:ring-4 focus:ring-sage-100/50 focus:border-sage-300 transition-all outline-none resize-none leading-relaxed"
                      />
                    ) : (
                      <input
                        type="text"
                        value={config.value}
                        onChange={(e) => handleChange(config.id, e.target.value)}
                        className="w-full bg-cream-50/30 border border-sage-100 rounded-xl p-4 text-sage-700 text-sm focus:bg-white focus:ring-4 focus:ring-sage-100/50 focus:border-sage-300 transition-all outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
