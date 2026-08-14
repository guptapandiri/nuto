import { useState, type FormEvent } from 'react';
import { apiUrl } from '@/lib/api';
import { formatPaiseCompact } from '@/lib/money';

type TrackingStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

interface TrackingResult {
  reference: string;
  status: TrackingStatus;
  paymentMethod: 'prepaid' | 'cod';
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'failed';
  totalPaise: number;
  createdAt: string;
  updatedAt: string;
  trackingUrl: string | null;
}

const steps: TrackingStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
const labels: Record<TrackingStatus, string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrderTracking() {
  const [reference, setReference] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const normalized = reference.trim().toUpperCase();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch(apiUrl(`/api/orders/${encodeURIComponent(normalized)}`));
      if (!response.ok) {
        setError(response.status === 404 ? 'Order not found. Check the reference and try again.' : 'Tracking is temporarily unavailable.');
        return;
      }
      setResult((await response.json()) as TrackingResult);
    } catch {
      setError('Tracking is temporarily unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-sm leading-relaxed text-neutral-500">Enter the reference shown on your confirmation, for example NUTO-ABC123.</p>
      <form onSubmit={submit} className="mt-5 flex gap-2">
        <input
          type="text"
          value={reference}
          onChange={(event) => setReference(event.target.value.toUpperCase())}
          required
          pattern="NUTO-[A-Za-z0-9]{6}"
          maxLength={11}
          placeholder="NUTO-ABC123"
          aria-label="Order reference"
          className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-[16px] font-semibold tracking-wide uppercase outline-none focus:border-[#1B7A4B]"
        />
        <button type="submit" disabled={busy} className="rounded-lg bg-[#1B7A4B] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
          {busy ? 'Checking…' : 'Track'}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-[#E23744]">{error}</p>}
      {result && <TrackingDetails result={result} />}
    </div>
  );
}

function TrackingDetails({ result }: { result: TrackingResult }) {
  const cancelled = result.status === 'cancelled';
  const activeIndex = steps.indexOf(result.status);
  return (
    <div className="mt-6 rounded-xl border border-neutral-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-bold">{result.reference}</p><p className="mt-1 text-xs text-neutral-500">Placed {formatDate(result.createdAt)}</p></div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cancelled ? 'bg-red-50 text-[#E23744]' : 'bg-[#1B7A4B]/10 text-[#1B7A4B]'}`}>{labels[result.status]}</span>
      </div>

      {cancelled ? (
        <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-[#E23744]">This order was cancelled.</p>
      ) : (
        <ol className="mt-6 space-y-0" aria-label="Order progress">
          {steps.map((step, index) => {
            const complete = index <= activeIndex;
            return (
              <li key={step} className="relative flex min-h-12 gap-3 last:min-h-0">
                {index < steps.length - 1 && <span className={`absolute top-5 left-[9px] h-[calc(100%-4px)] w-0.5 ${index < activeIndex ? 'bg-[#1B7A4B]' : 'bg-neutral-200'}`} />}
                <span className={`relative z-10 mt-0.5 size-5 shrink-0 rounded-full border-2 ${complete ? 'border-[#1B7A4B] bg-[#1B7A4B]' : 'border-neutral-300 bg-white'}`}>
                  {complete && <svg viewBox="0 0 20 20" className="size-4 text-white" fill="none" aria-hidden="true"><path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </span>
                <span className={`text-sm ${complete ? 'font-semibold text-neutral-900' : 'text-neutral-400'}`}>{labels[step]}</span>
              </li>
            );
          })}
        </ol>
      )}

      <dl className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-neutral-500">Order total</dt><dd className="font-bold">{formatPaiseCompact(result.totalPaise)}</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Payment</dt><dd className="capitalize">{result.paymentMethod === 'cod' ? 'Cash on delivery' : result.paymentStatus}</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Last updated</dt><dd>{formatDate(result.updatedAt)}</dd></div>
      </dl>

      {result.trackingUrl ? (
        <a href={result.trackingUrl} target="_blank" rel="noreferrer" className="mt-4 block rounded-lg bg-neutral-900 px-4 py-2.5 text-center text-sm font-bold text-white">OPEN COURIER TRACKING</a>
      ) : result.status === 'shipped' ? (
        <p className="mt-4 text-sm text-neutral-500">Courier tracking will appear here shortly.</p>
      ) : null}
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}
