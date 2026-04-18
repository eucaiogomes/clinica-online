import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, ArrowRight, Sparkles } from 'lucide-react';
import { pageVariants, DictationTextarea, Shell } from '../components/Shared';
import { supabase } from '../lib/supabase';

export default function SocraticExercise({ emailDaUrl, playing, toggleAudio, startAudio }) {
  const [step, setStep] = useState(emailDaUrl ? 1 : 0); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [data, setData] = useState({
    paciente_email: emailDaUrl, 
    medo: '',
    evidencias: '',
    piorMelhor: '',
    cenarioRealista: '',
    intensidade: 50,
    finalIntensidade: 50
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);
  const set = (key, val) => setData((d) => ({ ...d, [key]: val }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const record = {
      paciente_email: data.paciente_email,
      situacao:       `[QUESTIONAMENTO SOCRÁTICO] ${data.medo}`,
      pensamento: [
        `EVIDÊNCIAS:\n${data.evidencias}`,
        `\nPIOR E MELHOR CENÁRIO:\n${data.piorMelhor}`
      ].join(""),
      emocao:         "Ansiedade/Medo",
      intensidade:    data.intensidade,
      resposta_alternativa: `CENÁRIO REALISTA: \n${data.cenarioRealista}\n\n[Intensidade antes: ${data.intensidade}% → depois: ${data.finalIntensidade}%]`,
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

  return (
    <Shell playing={playing} toggleAudio={toggleAudio} step={progressBarStep} totalSteps={5}>
      <AnimatePresence mode="wait">
        
        {step === 0 && (
          <motion.div key="s0" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 pt-6">
            <div className="text-center mb-8">
               <div className="mx-auto w-16 h-16 bg-sage-100/50 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="text-sage-600" size={32} />
               </div>
               <h2 className="font-serif text-3xl text-sage-800 mb-3">O Investigador</h2>
               <p className="text-sage-600/80 leading-relaxed text-sm">Vamos questionar as evidências dos seus medos. Identifique-se.</p>
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
              <h2 className="font-serif text-2xl text-sage-800 mb-2">Qual o medo e intensidade?</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">Qual é o pensamento catastrófico ou preocupação atual?</p>
            </div>
            <DictationTextarea value={data.medo} onChangeText={(val) => set("medo", val)} rows={3} placeholder="Ex: Eu vou falhar na apresentação e todos vão rir..." />
            <div className="pt-2">
               <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-semibold tracking-wider uppercase text-sage-500">Intensidade do medo (0 a 100)</label>
                  <span className="text-xl font-serif text-sage-600 bg-sage-100 px-3 py-1 rounded-full">{data.intensidade}%</span>
               </div>
               <input type="range" min="0" max="100" step="1" value={data.intensidade} onChange={(e) => set("intensidade", Number(e.target.value))} className="w-full accent-sage-500 h-2 bg-sage-100 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="flex gap-4 pt-2">
               <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50">Voltar</button>
               <button onClick={next} disabled={!data.medo.trim()} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium disabled:opacity-40 shadow-glass">Avançar</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 mb-2">Quais as evidências?</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">Como um detetive, liste os <b>fatos reais</b> que comprovam que isso tem 100% chance de acontecer, ou que provam o contrário.</p>
            </div>
            <DictationTextarea value={data.evidencias} onChangeText={(val) => set("evidencias", val)} rows={4} placeholder="Ex: De fato, gaguejei da última vez. Porém, no ensaio eu fui muito bem." />
            <div className="flex gap-4 pt-2">
               <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50">Voltar</button>
               <button onClick={next} disabled={!data.evidencias.trim()} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium disabled:opacity-40 shadow-glass">Avançar</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-sage-800 mb-2">Pior vs Melhor Cenário</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">
                Se o pior acontecesse, o que você poderia fazer para sobreviver a isso? E qual seria o melhor cenário possível?
              </p>
            </div>
            <DictationTextarea value={data.piorMelhor} onChangeText={(val) => set("piorMelhor", val)} rows={4} placeholder="Ex: Se der tudo errado, eu serei repreendido, mas a vida segue. O melhor seria se me aplaudissem de pé." />
            <div className="flex gap-4 pt-2">
               <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50">Voltar</button>
               <button onClick={next} disabled={!data.piorMelhor.trim()} className="w-2/3 bg-sage-600 text-white p-4 rounded-2xl font-medium disabled:opacity-40 shadow-glass">Avançar</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl text-blush-700 mb-2 flex items-center gap-2"><Sparkles className="text-blush-500" /> A Visão Realista</h2>
              <p className="text-sage-600/80 text-sm leading-relaxed">Tirando o pior e o melhor cenário, o que é <b>mais provável e realista</b> que aconteça?</p>
            </div>
            <DictationTextarea value={data.cenarioRealista} onChangeText={(val) => set("cenarioRealista", val)} rows={3} placeholder="Ex: É provável que eu fique nervoso no começo, mas depois fluirá normalmente." bgFocusClass="focus:border-blush-400 focus:ring-blush-100/50" />
            
            <div className="pt-2">
               <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-semibold tracking-wider text-sage-500 uppercase">Como se sente agora?</label>
                  <span className="text-xl font-serif text-blush-600 bg-blush-100 px-3 py-1 rounded-full">{data.finalIntensidade}%</span>
               </div>
               <input type="range" min="0" max="100" step="1" value={data.finalIntensidade} onChange={(e) => set("finalIntensidade", Number(e.target.value))} className="w-full accent-blush-400 h-2 bg-sage-100 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="flex gap-4 pt-4">
               <button onClick={back} className="w-1/3 p-4 rounded-2xl text-sage-500 font-medium hover:bg-sage-50">Voltar</button>
               <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={isSubmitting || !data.cenarioRealista.trim()} className="w-2/3 bg-blush-500 text-white p-4 rounded-2xl font-medium disabled:opacity-40 shadow-glass flex justify-center">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Salvar Resignificação'}
               </motion.button>
            </div>
          </motion.div>
        )}

        {step === 99 && (
          <motion.div key="s99" variants={pageVariants} initial="initial" animate="animate" className="text-center py-6 space-y-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart strokeWidth={1.5} size={40} className="fill-sage-200" />
            </motion.div>
            <h2 className="font-serif text-3xl text-sage-800">Uma mente mais leve.</h2>
            <p className="text-sage-600/80 text-sm leading-relaxed max-w-sm mx-auto">Sempre que os pensamentos se acelerarem, você já sabe como questioná-los.</p>
            {data.finalIntensidade < data.intensidade && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-sage-50 border border-sage-200 rounded-xl p-4 max-w-xs mx-auto text-sage-700">
                  <p className="font-semibold text-sm">O medo diminuiu de {data.intensidade}% para {data.finalIntensidade}%.</p>
               </motion.div>
            )}
            <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 border-2 border-sage-200 text-sage-500 hover:text-sage-700 rounded-2xl font-semibold">Novo Questionamento</button>
          </motion.div>
        )}
        
      </AnimatePresence>
    </Shell>
  );
}
