import { useCallback, useEffect, useState } from 'react';
import { api, type Promotion, type PromotionKind } from './api';

interface PromotionForm {
  kind: PromotionKind;
  title: string;
  message: string;
  ctaLabel: string;
  ctaUrl: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

function localDateTime(value = new Date()): string {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

const emptyForm = (): PromotionForm => ({
  kind: 'offer',
  title: '',
  message: '',
  ctaLabel: '',
  ctaUrl: '',
  startsAt: localDateTime(),
  endsAt: '',
  isActive: true,
});

export function PromotionsTab() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [form, setForm] = useState<PromotionForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await api.get<{ promotions: Promotion[] }>('/admin/promotions');
      setPromotions(result.promotions);
      setError('');
    } catch {
      setError('Could not load promotions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function edit(promotion: Promotion) {
    setEditingId(promotion.id);
    setForm({
      kind: promotion.kind,
      title: promotion.title,
      message: promotion.message,
      ctaLabel: promotion.ctaLabel ?? '',
      ctaUrl: promotion.ctaUrl ?? '',
      startsAt: localDateTime(new Date(promotion.startsAt)),
      endsAt: promotion.endsAt ? localDateTime(new Date(promotion.endsAt)) : '',
      isActive: promotion.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
  }

  function payload(value: PromotionForm) {
    return {
      ...value,
      ctaLabel: value.ctaLabel.trim() || null,
      ctaUrl: value.ctaUrl.trim() || null,
      startsAt: new Date(value.startsAt).toISOString(),
      endsAt: value.endsAt ? new Date(value.endsAt).toISOString() : null,
    };
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/admin/promotions/${editingId}`, payload(form));
      } else {
        await api.post('/admin/promotions', payload(form));
      }
      reset();
      await load();
    } catch {
      setError('Could not save. Check the dates and CTA fields.');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(promotion: Promotion) {
    await api.put(`/admin/promotions/${promotion.id}`, {
      kind: promotion.kind,
      title: promotion.title,
      message: promotion.message,
      ctaLabel: promotion.ctaLabel,
      ctaUrl: promotion.ctaUrl,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      isActive: !promotion.isActive,
    });
    await load();
  }

  async function remove(promotion: Promotion) {
    if (!window.confirm(`Delete “${promotion.title}”?`)) return;
    await api.delete(`/admin/promotions/${promotion.id}`);
    if (editingId === promotion.id) reset();
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(20rem,26rem)_1fr]">
      <form onSubmit={save} className="h-fit rounded-xl border border-neutral-200 bg-white p-5 lg:sticky lg:top-6">
        <h2 className="text-[15px] font-bold">{editingId ? 'Edit promotion' : 'Add promotion'}</h2>
        <p className="mt-1 text-[13px] text-neutral-500">Launch a product, advertise an offer, or publish an announcement.</p>

        <div className="mt-5 space-y-4">
          <Field label="Type">
            <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as PromotionKind })} className={inputClass}>
              <option value="product_launch">Product launch</option>
              <option value="offer">Offer</option>
              <option value="announcement">Announcement</option>
            </select>
          </Field>
          <Field label="Title"><input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="Summer combo launch" /></Field>
          <Field label="Message"><textarea required maxLength={300} rows={3} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className={inputClass} placeholder="Short message shown in the storefront announcement bar." /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Button label"><input maxLength={60} value={form.ctaLabel} onChange={(event) => setForm({ ...form, ctaLabel: event.target.value })} className={inputClass} placeholder="Shop now" /></Field>
            <Field label="Button URL"><input maxLength={500} value={form.ctaUrl} onChange={(event) => setForm({ ...form, ctaUrl: event.target.value })} className={inputClass} placeholder="/shop" /></Field>
          </div>
          <Field label="Starts"><input required type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} className={inputClass} /></Field>
          <Field label="Ends (optional)"><input type="datetime-local" value={form.endsAt} min={form.startsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} className={inputClass} /></Field>
          <label className="flex items-center gap-2 text-[13px] font-medium"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="size-4 accent-[#1B7A4B]" />Active</label>
        </div>

        {error && <p role="alert" className="mt-4 text-[13px] text-red-600">{error}</p>}
        <div className="mt-5 flex gap-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#1B7A4B] px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish promotion'}</button>
          {editingId && <button type="button" onClick={reset} className="rounded-lg border border-neutral-300 px-4 py-2.5 text-[13px] font-medium">Cancel</button>}
        </div>
      </form>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-bold">Promotions &amp; events</h2><span className="text-[12px] text-neutral-500">{promotions.length} total</span></div>
        {loading ? <p className="text-[13px] text-neutral-500">Loading…</p> : promotions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-[13px] text-neutral-500">No promotions yet. Create the first one.</div>
        ) : (
          <div className="space-y-3">
            {promotions.map((promotion) => (
              <article key={promotion.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">{promotion.kind.replace('_', ' ')}</span><Status promotion={promotion} /></div><h3 className="mt-2 font-bold">{promotion.title}</h3><p className="mt-1 text-[13px] text-neutral-600">{promotion.message}</p></div>
                  <div className="flex gap-2"><button type="button" onClick={() => edit(promotion)} className="rounded border border-neutral-300 px-3 py-1.5 text-[12px] font-semibold">Edit</button><button type="button" onClick={() => void toggle(promotion)} className="rounded border border-neutral-300 px-3 py-1.5 text-[12px] font-semibold">{promotion.isActive ? 'Pause' : 'Activate'}</button><button type="button" onClick={() => void remove(promotion)} className="rounded border border-red-200 px-3 py-1.5 text-[12px] font-semibold text-red-600">Delete</button></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-neutral-100 pt-3 text-[12px] text-neutral-500"><span>Starts {formatDate(promotion.startsAt)}</span><span>{promotion.endsAt ? `Ends ${formatDate(promotion.endsAt)}` : 'No end date'}</span>{promotion.ctaLabel && <span>CTA: {promotion.ctaLabel} → {promotion.ctaUrl}</span>}</div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const inputClass = 'mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-[14px] focus:border-[#1B7A4B] focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-[13px] font-medium">{label}{children}</label>; }

function Status({ promotion }: { promotion: Promotion }) {
  const now = Date.now();
  let label = 'Live';
  let style = 'bg-green-50 text-green-700';
  if (!promotion.isActive) { label = 'Paused'; style = 'bg-neutral-100 text-neutral-500'; }
  else if (new Date(promotion.startsAt).getTime() > now) { label = 'Scheduled'; style = 'bg-blue-50 text-blue-700'; }
  else if (promotion.endsAt && new Date(promotion.endsAt).getTime() <= now) { label = 'Ended'; style = 'bg-amber-50 text-amber-700'; }
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style}`}>{label}</span>;
}

function formatDate(value: string): string { return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
