import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Compass, ArrowRight, CheckCircle2, Rocket } from 'lucide-react';
import { pageVariants, DictationTextarea, Shell } from '../components/Shared';
import { supabase } from '../lib/supabase';

export default function ProblemSolvingExercise({ emailDaUrl, playing, toggleAudio, startAudio }) {
  const [step, setStep] = useState(emailDaUrl ? 1 : 0); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [data, setData] = useState({
    paciente_email: emailDaUrl, 
    situacao: '',
    brainstorm: '',
    prosContras: '',
    planoAcao: '',
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);
  const set = (key, val) => setData((d) => ({ ...d, [key]: val }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const record = {
      paciente_email: data.paciente_email,
      situacao:       `[RESOLUÇÃO DE PROBLEMAS] ${data.situacao}`,
      pensamento: [
        `IDEIAS:\n${data.brainstorm}`,
        `\nPRÓS E CONTRAS:\n${data.prosContras}`
      ].join(""),
      emocao:         "Não aplicável",
      intensidade:    0,
      resposta_alternativa: `PRIMEIRO PASSO / PLANO: \n${data.planoAcao}`,
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

  const progressBarStep = step > 0 && step < 99 ? step : 0; 
  // 4 content steps (1, 2, 3, 4)

  return (
    <Shell playing={playing} toggleAudio={toggleAudio} step={progressBarStep} totalSteps={4}>
      <AnimatePresence mode="wait">
        
        {step === 0 && (
          <motion.div key="s0" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 pt-6">
            <div className="text-center mb-8">
               <div className="mx-auto w-16 h-16 bg-sage-100/50 rounded-2xl flex items-center justify-center mb-4">
                  <Compass className="text-sage-600" size={32} />
               </div>
               <h2 className="font-serif text-3xl text-sage-800 mb-3">Resolução de Problemas</h2>
               <p className="text-sage-600/80 leading-relaxed text-sm">Foque no que você pode controlar. Identifique-se.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wider uppercase text-sage-500 mb-2 ml-1">Seu e-mail</label>
              <input type="email" value={data.paciente_email} onChange={(e) => set("paciente_email", e.target.value)} placeholder="seu@email.com" className="w-full p-4 bg-cream-50/50 border border-sage-100 focus:border-sage-300 focus:bg-white focus:ring-4 focus:ring-sage-100/50 rounded-2xl transition-all duration-300 outline-none text-sage-800" />
            </div>
            <button onClick={() => { startAudio(); next(); }} disabled={!data.paciente_email} className="w-full mt-2 bg-sage-600 text-white p-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-sage-700 shadow-glass disable:opacity-40 transition-all">
              Começar <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 mb-2">Qual é o problema?</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">
                Descreva o problema de forma clara e objetiva. Tente não incluir emoções, apenas os fatos.
              </p>
            </div>
            <DictationTextarea value={data.situacao} onChangeText={(val) => set("situacao", val)} rows={4} placeholder="Ex: Preciso entregar um projeto no trabalho amanhã e não terminei..." />
            <div className="flex gap-4 pt-2">
               <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50">Voltar</button>
               <button onClick={next} disabled={!data.situacao.trim()} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium disabled:opacity-40 shadow-glass">Avançar</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 mb-2">Chuva de Ideias</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">
                Liste todas as soluções possíveis para este problema. Liste até as que parecem absurdas, sem julgar.
              </p>
            </div>
            <DictationTextarea value={data.brainstorm} onChangeText={(val) => set("brainstorm", val)} rows={5} placeholder="- Pedir um pequeno prazo extra&#10;- Pedir ajuda ao colega..." />
            <div className="flex gap-4 pt-2">
               <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50">Voltar</button>
               <button onClick={next} disabled={!data.brainstorm.trim()} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium disabled:opacity-40 shadow-glass">Avançar</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 mb-2">Avaliando Soluções</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">Olhando para suas ideias, escolha uma e liste os Prós e Contras rápidos de tentar realizar essa ideia.</p>
            </div>
            <DictationTextarea value={data.prosContras} onChangeText={(val) => set("prosContras", val)} rows={4} placeholder="Ex: PRÓS: Posso entregar algo melhor. CONTRAS: O chefe pode não gostar do adiamento..." />
            <div className="flex gap-4 pt-2">
               <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50">Voltar</button>
               <button onClick={next} disabled={!data.prosContras.trim()} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium disabled:opacity-40 shadow-glass">Avançar</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-blush-700 mb-2 flex items-center gap-2"><Rocket className="text-blush-500" /> O Primeiro Passo</h2>
            </div>
            <div className="bg-blush-50/50 border border-blush-100 rounded-2xl p-4">
               <p className="text-blush-800 text-sm leading-relaxed">Grandes problemas são resolvidos em pequenas partes.<br/><br/><span className="font-semibold">Qual é o menor, mais simples e mais rápido primeiro passo que você pode dar agora ou amanhã sobre sua solução?</span></p>
            </div>
            <DictationTextarea value={data.planoAcao} onChangeText={(val) => set("planoAcao", val)} rows={3} placeholder="Ex: Mandar um email pedindo ajuda pro João." bgFocusClass="focus:border-blush-400 focus:ring-blush-100/50" />
            <div className="flex gap-4 pt-4">
               <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50">Voltar</button>
               <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={isSubmitting || !data.planoAcao.trim()} className="w-2/3 bg-blush-500 text-white p-4 rounded-2xl font-medium disabled:opacity-40 shadow-glass flex justify-center">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Criar Plano'}
               </motion.button>
            </div>
          </motion.div>
        )}

        {step === 99 && (
          <motion.div key="s99" variants={pageVariants} initial="initial" animate="animate" className="text-center py-6 space-y-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 strokeWidth={1.5} size={40} className="text-sage-500" />
            </motion.div>
            <h2 className="font-serif text-3xl text-sage-800">Plano traçado.</h2>
            <p className="text-sage-600/80 text-sm leading-relaxed max-w-sm mx-auto">Parabéns por organizar os fatos. O primeiro passo é tudo que importa agora.</p>
            <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 border-2 border-sage-200 text-sage-500 hover:text-sage-700 rounded-2xl font-semibold">Fazer novo exercício</button>
          </motion.div>
        )}
        
      </AnimatePresence>
    </Shell>
  );
}
