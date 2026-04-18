import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, VolumeX, Feather } from 'lucide-react';
import { motion } from 'framer-motion';

export const EMOTIONS = [
  { label: "Ansiedade",    emoji: "😰", color: "text-amber-600", bg: "bg-amber-100" },
  { label: "Tristeza",     emoji: "😢", color: "text-blue-600", bg: "bg-blue-100" },
  { label: "Raiva",        emoji: "😠", color: "text-rose-600", bg: "bg-rose-100" },
  { label: "Culpa",        emoji: "😔", color: "text-purple-600", bg: "bg-purple-100" },
  { label: "Vergonha",     emoji: "😳", color: "text-pink-600", bg: "bg-pink-100" },
  { label: "Medo",         emoji: "😨", color: "text-orange-600", bg: "bg-orange-100" },
  { label: "Solidão",      emoji: "🥺", color: "text-stone-600", bg: "bg-stone-200" },
  { label: "Frustração",   emoji: "😤", color: "text-red-700", bg: "bg-red-100" },
  { label: "Confusão",     emoji: "😕", color: "text-indigo-600", bg: "bg-indigo-100" },
  { label: "Exaustão",     emoji: "😮‍💨", color: "text-stone-500", bg: "bg-stone-200" },
  { label: "Decepção",     emoji: "😞", color: "text-sky-600", bg: "bg-sky-100" },
  { label: "Insegurança",  emoji: "😟", color: "text-amber-700", bg: "bg-amber-200" },
];

export const pageVariants = {
  initial: { opacity: 0, y: 15, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -15, filter: 'blur(4px)', transition: { duration: 0.4, ease: [0.7, 0, 0.84, 0] } }
};

export function useAmbientAudio() {
  const ctxRef    = useRef(null);
  const gainRef   = useRef(null);
  const [playing, setPlaying] = useState(false);

  const start = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 5);
    master.connect(ctx.destination);
    gainRef.current = master;

    const freqs = [130.81, 164.81, 196.00, 246.94, 293.66];

    freqs.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo  = ctx.createOscillator();
      const lfoG = ctx.createGain();

      osc.type             = i === 0 ? "triangle" : "sine";
      osc.frequency.value  = freq;
      osc.detune.value     = (i % 2 === 0 ? 1 : -1) * 1.5;

      lfo.type             = "sine";
      lfo.frequency.value  = 0.06 + i * 0.018;  
      lfoG.gain.value      = 0.6;
      lfo.connect(lfoG);
      lfoG.connect(osc.frequency);
      lfo.start();

      gain.gain.value = i === 0 ? 0.35 : 0.15;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
    });

    setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (!ctxRef.current) { start(); return; }
    const ctx = ctxRef.current;
    if (ctx.state === "running") {
      gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      setTimeout(() => ctx.suspend(), 1500);
      setPlaying(false);
    } else {
      ctx.resume().then(() => {
        gainRef.current.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2);
        setPlaying(true);
      });
    }
  }, [start]);

  return { playing, toggle, start };
}

export function DictationTextarea({ value, onChangeText, placeholder, rows = 3, bgFocusClass = "focus:border-sage-300 focus:ring-sage-100/50" }) {
  const [isListening, setIsListening] = useState(false);
  const [interimResult, setInterimResult] = useState('');
  const recognitionRef = useRef(null);
  const valueRef = useRef(value);

  useEffect(() => { valueRef.current = value; }, [value]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }
      
      if (finalStr) {
        const current = valueRef.current || '';
        const newValue = current + (current.length > 0 && !current.endsWith(' ') ? ' ' : '') + finalStr;
        onChangeText(newValue);
      }
      setInterimResult(interimStr);
    };

    recognition.onerror = () => { setIsListening(false); }
    recognition.onend = () => { setIsListening(false); setInterimResult(''); }

    recognitionRef.current = recognition;
  }, [onChangeText]);

  const toggle = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try { recognitionRef.current?.start(); setIsListening(true); } 
      catch (e) { console.error(e); }
    }
  };

  const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div className="relative w-full">
      <textarea
        value={value + interimResult}
        onChange={(e) => onChangeText(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`w-full p-4 pr-12 bg-cream-50/50 border border-sage-100 focus:bg-white focus:ring-4 rounded-2xl transition-all duration-300 outline-none resize-none text-sage-800 placeholder-sage-300/80 ${bgFocusClass}`}
      />
      {supported && (
        <button
          onClick={toggle}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-300 z-10 ${
            isListening 
              ? 'bg-blush-100 text-blush-500 shadow-sm mic-active' 
              : 'bg-white/50 text-sage-400 hover:bg-sage-100 hover:text-sage-600'
          }`}
          title={isListening ? 'Parar gravação' : 'Gravar por voz'}
        >
          <Mic size={18} />
        </button>
      )}
    </div>
  );
}

export function Shell({ children, playing, toggleAudio, step, totalSteps }) {
  const stepsArray = Array.from({ length: totalSteps }, (_, i) => i + 1); // e.g. [1,2,3,4,5]

  return (
    <div className="min-h-[100dvh] bg-cream-100 bg-noise flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-sage-300/20 blur-[100px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blush-300/20 blur-[100px] mix-blend-multiply pointer-events-none" />

      <motion.div layout className="w-full max-w-lg z-10 relative">
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] shadow-glass border border-white/50 overflow-hidden relative">
          
          <div className="bg-sage-600/5 px-8 pt-6 pb-5 flex items-center justify-between border-b border-sage-100/50">
            <div>
              <h1 className="font-serif text-xl font-medium text-sage-800 tracking-tight flex items-center gap-2">
                <Feather size={18} className="text-sage-600" />
                Seu Espaço
              </h1>
              <p className="text-sage-500/80 text-xs mt-1 font-medium tracking-wide uppercase">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>

            <button 
              onClick={toggleAudio}
              className="px-3 py-1.5 rounded-full bg-sage-100/50 text-sage-600 text-xs font-semibold flex items-center gap-2 hover:bg-sage-200/50 transition-colors"
            >
              {playing ? <Volume2 size={14} /> : <VolumeX size={14}/>}
              {playing ? 'Som' : 'Mudo'}
            </button>
          </div>

          <div className="px-8 pb-10 pt-6 min-h-[420px] relative">
             {children}
          </div>
          
          {step > 0 && totalSteps > 0 && step <= totalSteps && (
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-sage-100/30 flex gap-[2px] px-1 pb-1">
               {stepsArray.map(s => (
                  <motion.div 
                     key={s}
                     animate={{ 
                        flexGrow: s <= step ? 1 : 0.2, 
                        backgroundColor: s <= step ? '#6B8C6B' : 'rgba(107, 140, 107, 0.15)' 
                     }}
                     className="h-[3px] rounded-full transition-all duration-300"
                  />
               ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
