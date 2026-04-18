import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Wind, ArrowRight } from 'lucide-react';
import { pageVariants, Shell } from '../components/Shared';
import { supabase } from '../lib/supabase';

export default function RelaxationExercise({ emailDaUrl, playing, toggleAudio, startAudio }) {
  const [step, setStep] = useState(emailDaUrl ? 1 : 0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [breathPhase, setBreathPhase] = useState("inspire");

  const [data, setData] = useState({
    paciente_email: emailDaUrl, 
    intensidadeAntes: 80,
    intensidadeDepois: 50
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);
  const set = (key, val) => setData((d) => ({ ...d, [key]: val }));

  // O passo 2 é a respiração.
  useEffect(() => {
    if (step !== 2) return;
    setBreathPhase("inspire");
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
      situacao:       `[RESPIRAÇÃO RELAXADA] Sessão de aterramento.`,
      pensamento:     `Tensão inicial: ${data.intensidadeAntes}%`,
      emocao:         "Calma/Relaxamento (Busca)",
      intensidade:    data.intensidadeAntes,
      resposta_alternativa: `Tensão final: ${data.intensidadeDepois}%\n\n[Tensão antes: ${data.intensidadeAntes}% → depois: ${data.intensidadeDepois}%]`,
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
  // 3 content steps

  return (
    <Shell playing={playing} toggleAudio={toggleAudio} step={progressBarStep} totalSteps={3}>
      <AnimatePresence mode="wait">
        
        {step === 0 && (
          <motion.div key="s0" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 pt-6">
            <div className="text-center mb-8">
               <div className="mx-auto w-16 h-16 bg-sage-100/50 rounded-2xl flex items-center justify-center mb-4">
                  <Wind className="text-sage-600" size={32} />
               </div>
               <h2 className="font-serif text-3xl text-sage-800 mb-3">Respiração e Aterramento</h2>
               <p className="text-sage-600/80 leading-relaxed text-sm">Dedique alguns minutos apenas para você. Identifique-se.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wider uppercase text-sage-500 mb-2 ml-1">Seu e-mail</label>
              <input type="email" value={data.paciente_email} onChange={(e) => set("paciente_email", e.target.value)} placeholder="seu@email.com" className="w-full p-4 bg-cream-50/50 border border-sage-100 focus:border-sage-300 focus:bg-white focus:ring-4 focus:ring-sage-100/50 rounded-2xl transition-all outline-none text-sage-800" />
            </div>
            <button onClick={() => { startAudio(); next(); }} disabled={!data.paciente_email} className="w-full mt-2 bg-sage-600 text-white p-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-sage-700 shadow-glass disabled:opacity-40 transition-all">
              Começar <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 mb-2">Como você chegou aqui?</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">Qual o seu nível de ansiedade, estresse ou tensão neste exato momento?</p>
            </div>
            <div className="pt-8 pb-4">
               <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-semibold tracking-wider uppercase text-sage-500">Nível de Tensão Inicial (0 a 100)</label>
                  <span className="text-xl font-serif text-amber-600 bg-amber-100 px-3 py-1 rounded-full">{data.intensidadeAntes}%</span>
               </div>
               <input type="range" min="0" max="100" step="1" value={data.intensidadeAntes} onChange={(e) => set("intensidadeAntes", Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="flex gap-4 pt-8">
               <button onClick={next} className="w-full bg-sage-600 text-white p-4 rounded-2xl font-medium shadow-glass">Continuar para Respiração</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8 pt-8 flex flex-col items-center text-center">
            <p className="text-sage-500/80 text-sm tracking-wider uppercase font-semibold">Tire esse tempo apenas para ser.</p>
            
            <motion.h2 
              key={breathPhase}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
              className="font-serif text-3xl text-sage-800"
            >
              {breathPhase === 'inspire' ? 'Inspire...' : 'Expire...'}
            </motion.h2>

            <motion.div
               animate={{
                  scale: breathPhase === "inspire" ? 1.6 : 0.7,
                  opacity: breathPhase === "inspire" ? 1 : 0.6,
               }}
               transition={{ duration: 4, ease: "easeInOut" }}
               className="w-32 h-32 rounded-full border border-sage-200/50 bg-gradient-to-br from-sage-200 to-sage-400 shadow-[0_0_0_12px_rgba(107,140,107,0.1)] flex items-center justify-center my-8"
            >
               <Wind className="text-white relative z-10" size={32} />
            </motion.div>
            
            <p className="text-sage-600/80 text-sm max-w-xs mx-auto pb-4">Siga esse ritmo pelo tempo que precisar. Quando sentir calma, siga em frente.</p>
            
            <button onClick={next} className="w-full border-2 border-sage-200 text-sage-600 p-4 rounded-2xl font-medium hover:bg-sage-50 hover:text-sage-700 transition-all">
              Eu me sinto pronto(a)
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 mb-2">Um novo estado</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">Avalie novamente como o seu corpo se sente agora, após esta pausa.</p>
            </div>
            
            <div className="pt-8 pb-4">
               <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-semibold tracking-wider uppercase text-sage-500">Nível de Tensão Final</label>
                  <span className="text-xl font-serif text-sage-600 bg-sage-100 px-3 py-1 rounded-full">{data.intensidadeDepois}%</span>
               </div>
               <input type="range" min="0" max="100" step="1" value={data.intensidadeDepois} onChange={(e) => set("intensidadeDepois", Number(e.target.value))} className="w-full accent-sage-500 h-2 bg-sage-100 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="flex gap-4 pt-8">
               <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50">Voltar</button>
               <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={isSubmitting} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium disabled:opacity-40 shadow-glass flex justify-center">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Finalizar Sessão'}
               </motion.button>
            </div>
          </motion.div>
        )}

        {step === 99 && (
          <motion.div key="s99" variants={pageVariants} initial="initial" animate="animate" className="text-center py-6 space-y-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart strokeWidth={1.5} size={40} className="fill-sage-200" />
            </motion.div>
            <h2 className="font-serif text-3xl text-sage-800">Caminho do meio.</h2>
            <p className="text-sage-600/80 text-sm leading-relaxed max-w-sm mx-auto">Você sempre pode voltar a essa respiração quando o mundo parecer pesado.</p>
            {data.intensidadeDepois < data.intensidadeAntes && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-sage-50 border border-sage-200 rounded-xl p-4 max-w-xs mx-auto text-sage-700">
                  <p className="font-semibold text-sm">A tensão reduziu de {data.intensidadeAntes}% para {data.intensidadeDepois}%.</p>
               </motion.div>
            )}
            <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 border-2 border-sage-200 text-sage-500 hover:text-sage-700 rounded-2xl font-semibold">Recomeçar</button>
          </motion.div>
        )}
        
      </AnimatePresence>
    </Shell>
  );
}
