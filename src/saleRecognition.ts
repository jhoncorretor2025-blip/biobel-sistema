import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type RecognitionType =
  | 'venda_registrada'
  | 'primeira_venda_dia'
  | 'maior_venda_dia'
  | 'meta_diaria'
  | 'meta_mensal';

export interface RecognitionResult {
  type: RecognitionType;
  title: string;
  message: string;
  priority: number;
}

export interface RecognitionSale {
  id: string;
  date: string;
  total: number;
  vendedora?: string;
}

const collectionName = 'saleRecognitions';

function normalizeAmount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(String(value ?? '').replace(/[^0-9,.-]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function getValueMessage(total: number) {
  if (total >= 500) return { title: '🏆 VENDA INCRÍVEL!', message: 'Parabéns! Você fez uma venda incrível!', priority: 40 };
  if (total >= 300) return { title: '🔥 EXCELENTE VENDA!', message: 'Excelente venda! Parabéns pelo resultado!', priority: 30 };
  if (total >= 100) return { title: '🎉 BOA VENDA!', message: 'Boa venda! Você está mandando muito bem!', priority: 20 };
  return { title: '👏 VENDA REGISTRADA!', message: 'Bom trabalho! Continue assim!', priority: 10 };
}

function sameLocalDay(a: string, b = new Date()) {
  const da = new Date(a);
  if (Number.isNaN(da.getTime())) return false;
  return da.getFullYear() === b.getFullYear()
    && da.getMonth() === b.getMonth()
    && da.getDate() === b.getDate();
}

export async function claimSaleRecognition(sale: RecognitionSale): Promise<RecognitionResult | null> {
  if (!sale?.id) return null;

  const recognitionRef = doc(db, collectionName, sale.id);
  const existing = await getDocs(query(collection(db, collectionName), orderBy('recognizedAt', 'desc')));

  if (existing.docs.some(d => d.id === sale.id)) return null;

  const total = normalizeAmount(sale.total);
  const sameDay = existing.docs
    .map(d => d.data() as any)
    .filter(r => sameLocalDay(String(r.saleDate || '')));

  const isFirst = sameDay.length === 0;
  const highest = sameDay.reduce((m, r) => Math.max(m, normalizeAmount(r.saleTotal)), 0);
  const isRecord = total > highest;

  const base = getValueMessage(total);
  let result: RecognitionResult = {
    type: 'venda_registrada',
    title: base.title,
    message: base.message,
    priority: base.priority
  };

  if (isRecord && highest > 0) {
    result = {
      type: 'maior_venda_dia',
      title: '👑 NOVO RECORDE!',
      message: 'Essa é a maior venda do dia!',
      priority: 60
    };
  } else if (isFirst) {
    result = {
      type: 'primeira_venda_dia',
      title: '🌟 PRIMEIRA VENDA DO DIA!',
      message: 'Que seja a primeira de muitas!',
      priority: 50
    };
  }

  await setDoc(recognitionRef, {
    saleId: sale.id,
    staffName: sale.vendedora || 'Não informado',
    saleDate: sale.date,
    saleTotal: total,
    recognitionType: result.type,
    recognized: true,
    recognizedAt: serverTimestamp()
  }, { merge: true });

  return result;
}

export function buildRecognitionLog(sale: RecognitionSale, activity?: string) {
  const time = new Date(sale.date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return {
    time,
    activity: activity || 'Venda realizada',
    detail: `Venda realizada: R$ ${normalizeAmount(sale.total).toFixed(2).replace('.', ',')}`
  };
}
