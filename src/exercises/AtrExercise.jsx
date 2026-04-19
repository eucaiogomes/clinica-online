import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Wind, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { pageVariants, EMOTIONS, DictationTextarea, Shell } from '../components/Shared';
import { supabase } from '../lib/supabase';

export default function AtrExercise({ emailDaUrl, playing, toggleAudio, startAudio }) {
  const [step, setStep] = useState(emailDaUrl ? 1 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breathPhase, setBreathPhase] = useState("inspire");
  const [configs, setConfigs] = useState({});
  const [configsLoading, setConfigsLoading] = useState(true);

  const [data, setData] = useState({
    paciente_email: emailDaUrl,
    situacao: '',
    pensamento: '',
    hotThought: '',
    selectedEmotions: [],
    intensidade: 50,
    evidenceFor: '',
    evidenceAgainst: '',
    resposta_alternativa: '',
    finalIntensidade: 50
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);
  const set = (key, val) => setData((d) => ({ ...d, [key]: val }));

  useEffect(() => {
    async function loadConfigs() {
      const { data, error } = await supabase.from('app_config').select('key, value');
      if (!error && data) {
        const map = {};
        data.forEach(item => map[item.key] = item.value);
        setConfigs(map);
      }
      setConfigsLoading(false);
    }
    loadConfigs();
  }, []);

  useEffect(() => {
    if (step !== 1) return;
    const id = setInterval(
      () => setBreathPhase((p) => (p === "inspire" ? "expire" : "inspire")),
      4000
    );
    return () => clearInterval(id);
  }, [step]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const record = {
      paciente_email: data.paciente_email,
      situacao: `[RPD] ${data.situacao}`, // Adicionamos a tag do tipo
      pensamento: [
        data.pensamento,
        data.hotThought ? `\nPensamento central: "${data.hotThought}"` : "",
        data.evidenceFor ? `\nA favor: ${data.evidenceFor}` : "",
        data.evidenceAgainst ? `\nContra: ${data.evidenceAgainst}` : "",
      ].join(""),
      emocao: data.selectedEmotions.join(", "),
      intensidade: data.intensidade,
      resposta_alternativa: `${data.resposta_alternativa}\n\n[Intensidade antes: ${data.intensidade}% → depois: ${data.finalIntensidade}%]`,
    };

    const { error } = await supabase.from('tabela_atr').insert([record]);
    setIsSubmitting(false);

    if (!error) {
      setStep(99);
    } else {
      console.error(error);
      alert('Ops, houve um erro ao salvar. Tente novamente.');
    }
  };

  // Atalho para pegar texto dinâmico ou fallback
  const txt = (key, fallback) => configs[key] || fallback;

  // Steps com conteúdo visual no progresso (2 a 6, total = 5 passos na barra)
  // Mapeamos para 1 a 5 para a barra de progresso (step - 1 se for 2..6)
  const progressBarStep = step > 1 && step < 99 ? step - 1 : 0;

  if (configsLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <Loader2 className="animate-spin text-sage-400" size={32} />
      </div>
    );
  }

  return (
    <Shell playing={playing} toggleAudio={toggleAudio} step={progressBarStep} totalSteps={5}>
      <AnimatePresence mode="wait">

        {step === 0 && (
          <motion.div key="s0" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 pt-6">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl text-sage-800 mb-3">{txt('s0_title', 'Que bom ter você aqui!')}</h2>
              <p className="text-sage-600/80 leading-relaxed text-sm whitespace-pre-wrap">{txt('s0_desc', 'Este é o seu cantinho seguro...')}</p>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wider uppercase text-sage-500 mb-2 ml-1">{txt('s0_input_label', 'Seu e-mail de acesso')}</label>
              <input
                type="email"
                value={data.paciente_email}
                onChange={(e) => set("paciente_email", e.target.value)}
                placeholder={txt('s0_input_placeholder', 'seu@email.com')}
                className="w-full p-4 bg-cream-50/50 border border-sage-100 focus:border-sage-300 focus:bg-white focus:ring-4 focus:ring-sage-100/50 rounded-2xl transition-all duration-300 outline-none text-sage-800 placeholder-sage-300"
              />
            </div>
            <button onClick={() => { startAudio(); next(); }} disabled={!data.paciente_email} className="w-full mt-2 bg-sage-600 text-white p-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-sage-700 shadow-glass hover:shadow-glass-hover transition-all duration-300 disabled:opacity-40 disabled:hover:shadow-none group">
              {txt('s0_btn', 'Abrir meu diário')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 pt-8 flex flex-col items-center text-center">
            <p className="text-sage-500/80 text-sm tracking-wider uppercase font-semibold">{txt('s1_subtitle', 'Antes de darmos o primeiro passo...')}</p>

            <motion.h2
              key={breathPhase}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
              className="font-serif text-3xl text-sage-800"
            >
              {breathPhase === 'inspire' ? txt('s1_breath_in', 'Inspire devagar...') : txt('s1_breath_out', 'Expire com calma...')}
            </motion.h2>

            <motion.div
              animate={{
                scale: breathPhase === "inspire" ? 1.4 : 0.8,
                opacity: breathPhase === "inspire" ? 1 : 0.7,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full border border-sage-200/50 bg-gradient-to-br from-sage-200 to-sage-400 shadow-[0_0_0_12px_rgba(107,140,107,0.1)] flex items-center justify-center"
            >
              <Wind className="text-white relative z-10" size={32} />
            </motion.div>

            <p className="text-sage-600/80 text-sm max-w-xs mx-auto pt-2">{txt('s1_footer', 'Este momentinho é todinho seu...')}</p>

            <div className="flex gap-4 w-full pt-4">
              <button onClick={next} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50 transition-colors">{txt('s1_btn_skip', 'Pular um pouco')}</button>
              <button onClick={() => { startAudio(); next(); }} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium hover:bg-sage-700 shadow-glass transition-all">{txt('s1_btn_start', 'Prontinho, vamos lá')}</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 mb-2">{txt('s2_title', 'Como você está se sentindo agora?')}</h2>
            </div>
            <DictationTextarea
              value={data.situacao} onChangeText={(val) => set("situacao", val)} rows={4}
              placeholder={txt('s2_placeholder', 'Ex: Fui entregar o projeto...')}
            />
            <div className="flex gap-4 pt-2">
              <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50 transition-colors hover:text-sage-600">{txt('s2_btn_back', 'Voltar')}</button>
              <button onClick={next} disabled={!data.situacao.trim()} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium hover:bg-sage-700 shadow-glass disabled:opacity-40 transition-all">{txt('s2_btn_next', 'Avançar')}</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 mb-2">{txt('s3_title', 'O que passou pela sua cabeça?')}</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">
                {txt('s3_desc', 'Naquele exato instante, o que a sua mente...')}
              </p>
            </div>
            <DictationTextarea value={data.pensamento} onChangeText={(val) => set("pensamento", val)} rows={3} placeholder={txt('s3_placeholder', 'Ex: Eu sempre estrago tudo...')} />

            <AnimatePresence>
              {data.pensamento.length > 15 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                  <label className="block text-xs font-semibold tracking-wider text-sage-500">{txt('s3_hot_label', 'Qual foi o pensamento que mais doeu?')}</label>
                  <input
                    value={data.hotThought} onChange={(e) => set("hotThought", e.target.value)}
                    placeholder={txt('s3_hot_placeholder', 'Ex: Eu não sou boa o suficiente.')}
                    className="w-full p-4 bg-cream-50/50 border border-blush-200 focus:border-blush-400 focus:bg-white focus:ring-4 focus:ring-blush-100/50 rounded-2xl transition-all duration-300 outline-none text-sage-800 placeholder-sage-300"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 pt-2">
              <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50 transition-colors hover:text-sage-600">{txt('s2_btn_back', 'Voltar')}</button>
              <button onClick={next} disabled={!data.pensamento.trim()} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium hover:bg-sage-700 shadow-glass disabled:opacity-40 transition-all">{txt('s2_btn_next', 'Avançar')}</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 mb-2">{txt('s4_title', 'E como o seu coração ficou?')}</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">{txt('s4_desc', 'Escolha os sentimentos que vieram à tona na hora.')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(em => {
                const sel = data.selectedEmotions.includes(em.label);
                return (
                  <button
                    key={em.label}
                    onClick={() => {
                      const arr = sel ? data.selectedEmotions.filter((x) => x !== em.label) : [...data.selectedEmotions, em.label];
                      set("selectedEmotions", arr);
                    }}
                    className={`px-3 py-2 rounded-xl border transition-all text-sm font-medium flex items-center gap-1.5 ${sel ? `${em.bg} border-transparent shadow-sm ${em.color} scale-105` : 'bg-cream-50/50 text-sage-600 border-sage-100 hover:border-sage-200/80'
                      }`}
                  >
                    <span>{em.emoji}</span> {em.label}
                  </button>
                )
              })}
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-semibold tracking-wider uppercase text-sage-500">{txt('s4_intens_label', 'De 0 a 100, qual o peso desse sentimento?')}</label>
                <span className="text-xl font-serif text-sage-600 bg-sage-100 px-3 py-1 rounded-full">{data.intensidade}%</span>
              </div>
              <input type="range" min="0" max="100" step="1" value={data.intensidade} onChange={(e) => set("intensidade", Number(e.target.value))} className="w-full accent-sage-500 h-2 bg-sage-100 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50 transition-colors hover:text-sage-600">{txt('s2_btn_back', 'Voltar')}</button>
              <button onClick={next} disabled={data.selectedEmotions.length === 0} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium hover:bg-sage-700 shadow-glass disabled:opacity-40 transition-all">{txt('s2_btn_next', 'Avançar')}</button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="s5" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div><h2 className="font-serif text-2xl text-sage-800 mb-2">{txt('s5_title', 'Vamos bancar um pouco a detetive?')}</h2></div>
            {(data.hotThought || data.pensamento) && (
              <div className="bg-sage-50/80 border-l-4 border-sage-400 p-4 rounded-r-2xl">
                <p className="text-sage-700 font-serif italic">"{data.hotThought || data.pensamento.slice(0, 100)}"</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-sage-500 mb-2 ml-1">{txt('s5_favor_label', 'O que me faz acreditar nisso?')}</label>
                <DictationTextarea value={data.evidenceFor} onChangeText={(val) => set("evidenceFor", val)} rows={2} placeholder={txt('s5_favor_placeholder', 'O que realmente aconteceu...')} />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-blush-600 mb-2 ml-1">{txt('s5_against_label', 'Por outro lado, o que vai contra isso?')}</label>
                <DictationTextarea value={data.evidenceAgainst} onChangeText={(val) => set("evidenceAgainst", val)} rows={2} placeholder={txt('s5_against_placeholder', 'Sempre tem algo que mostre...')} bgFocusClass="focus:border-blush-400 focus:ring-blush-100/50" />
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50 transition-colors hover:text-sage-600">{txt('s2_btn_back', 'Voltar')}</button>
              <button onClick={next} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium hover:bg-sage-700 shadow-glass transition-all">{txt('s2_btn_next', 'Avançar')}</button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="s6" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div><h2 className="font-serif text-2xl text-blush-700 mb-2 flex items-center gap-2"><Sparkles className="text-blush-500" /> {txt('s6_title', 'Um abraço em palavras')}</h2></div>
            <div className="bg-blush-50/50 border border-blush-100 rounded-2xl p-4">
              <p className="text-blush-800 text-sm leading-relaxed whitespace-pre-wrap">{txt('s6_desc_block', 'Imagine que uma das suas pessoas favoritas...')}</p>
            </div>
            <DictationTextarea value={data.resposta_alternativa} onChangeText={(val) => set("resposta_alternativa", val)} rows={3} placeholder={txt('s6_placeholder', 'Sinta que está falando com ela...')} bgFocusClass="focus:border-blush-400 focus:ring-blush-100/50" />
            <div className="pt-2">
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-semibold tracking-wider text-sage-500 uppercase">{txt('s6_intens_label', 'E agora, como está o peso do sentimento?')}</label>
                <span className="text-xl font-serif text-blush-600 bg-blush-100 px-3 py-1 rounded-full">{data.finalIntensidade}%</span>
              </div>
              <input type="range" min="0" max="100" step="1" value={data.finalIntensidade} onChange={(e) => set("finalIntensidade", Number(e.target.value))} className="w-full accent-blush-400 h-2 bg-sage-100 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50 transition-colors hover:text-sage-600">{txt('s2_btn_back', 'Voltar')}</button>
              <motion.button
                whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={isSubmitting || !data.resposta_alternativa.trim()}
                className="w-2/3 bg-blush-500 text-white p-4 rounded-2xl font-medium hover:bg-blush-600 shadow-glass disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : txt('s6_btn', 'Guardar esse desabafo')}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 99 && (
          <motion.div key="s99" variants={pageVariants} initial="initial" animate="animate" className="text-center py-6 space-y-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-20 h-20 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart strokeWidth={1.5} size={40} className="fill-sage-200" />
            </motion.div>
            <h2 className="font-serif text-3xl text-sage-800">{txt('s99_title', 'Tô super orgulhosa de você!')}</h2>
            <p className="text-sage-600/80 text-sm leading-relaxed max-w-sm mx-auto">{txt('s99_desc', 'Parar tudo e olhar com carinho...')}</p>
            {data.finalIntensidade < data.intensidade && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-sage-50 border border-sage-200 rounded-xl p-4 max-w-xs mx-auto text-sage-700">
                <p className="font-semibold text-sm">O peso do sentimento caiu de {data.intensidade}% para {data.finalIntensidade}%.</p>
                <p className="text-xs pt-1 opacity-80 uppercase tracking-widest">{txt('s99_intens_footer', 'Acompanhar isso é lindo')}</p>
              </motion.div>
            )}
            <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 border-2 border-sage-200 text-sage-500 hover:text-sage-700 hover:bg-sage-50 rounded-2xl font-semibold transition-all">
              {txt('s99_btn_new', 'Escrever mais um pouco')}
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </Shell>
  );
}
