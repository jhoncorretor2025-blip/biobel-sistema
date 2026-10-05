import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PartyPopper, Trophy, X } from 'lucide-react';
import type { RecognitionResult } from './saleRecognition';

interface Props {
  open: boolean;
  recognition: RecognitionResult | null;
  saleTotal?: number;
  staffName?: string;
  onClose: () => void;
}

export function SaleRecognitionModal({ open, recognition, saleTotal = 0, staffName = '', onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, 7000);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && recognition && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/55 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 24 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/30 bg-white dark:bg-slate-900 shadow-2xl"
          >
            <div className="pointer-events-none absolute inset-0 opacity-80">
              {['🎉','✨','💖','⭐','🛍️','💰','👏'].map((e, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${10 + i * 13}%`,
                    top: `${8 + (i % 3) * 12}%`
                  }}
                  animate={{ y: [0, 18, 0], rotate: [-8, 8, -8] }}
                  transition={{ duration: 1.8 + i * 0.12, repeat: Infinity }}
                >{e}</motion.span>
              ))}
            </div>

            <button
              aria-label="Fechar"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>

            <div className="relative p-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                {recognition.priority >= 60 ? <Trophy size={40} /> : <PartyPopper size={40} />}
              </div>

              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Reconhecimento Biobel</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{recognition.title}</h2>

              <div className="my-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/70">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Venda de
                </p>
                <p className="mt-1 text-4xl font-black text-emerald-600 dark:text-emerald-400">
                  {saleTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {staffName && (
                  <p className="mt-2 text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
                    {staffName}
                  </p>
                )}
              </div>

              <p className="text-base font-semibold leading-relaxed text-slate-600 dark:text-slate-300">
                {recognition.message}
              </p>

              <button
                onClick={onClose}
                className="mt-7 w-full rounded-2xl bg-slate-900 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
