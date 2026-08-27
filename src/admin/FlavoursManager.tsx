import { useCallback, useEffect, useState } from 'react';
import { api, money, type AdminFlavour, type AdminPackSize } from './api';

interface FormState {
  slug: string; name: string; note: string; blurb: string; accent: string;
  heat: 0 | 1 | 2 | 3; image: string; initialStock: string; isActive: boolean;
}

const blank = (): FormState => ({
  slug: '', name: '', note: '', blurb: '', accent: '#1B7A4B', heat: 0,
  image: '', initialStock: '100', isActive: true,
});
const slugify = (value: string) => value.toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const input = 'mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-[13px] focus:border-[#1B7A4B] focus:outline-none';

async function optimizeImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.');
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be smaller than 10 MB.');

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Could not read that image.'));
    });
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not process that image.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/webp', 0.82);
    if (result.length > 2_400_000) throw new Error('Image is still too large after compression.');
    return result;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function FlavoursManager({ onChanged }: { onChanged: () => void }) {
  const [flavours, setFlavours] = useState<AdminFlavour[]>([]);
  const [sizes, setSizes] = useState<AdminPackSize[]>([]);
  const [form, setForm] = useState<FormState>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ flavours: AdminFlavour[]; sizes: AdminPackSize[] }>('/admin/flavours');
      setFlavours(data.flavours); setSizes(data.sizes); setError('');
    } catch { setError('Could not load flavours.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  function reset() { setEditing(null); setForm(blank()); setError(''); }
  function startEdit(item: AdminFlavour) {
    setEditing(item.slug);
    setForm({ ...item, initialStock: '100' });
    setError('');
  }

  async function selectImage(file: File | undefined) {
    if (!file) return;
    setProcessingImage(true); setError('');
    try {
      const image = await optimizeImage(file);
      setForm((current) => ({ ...current, image }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not process that image.');
    } finally { setProcessingImage(false); }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const initialStock = Number(form.initialStock);
    if (!editing && (!Number.isInteger(initialStock) || initialStock < 0)) {
      setError('Initial stock must be a whole number.'); return;
    }
    setSaving(true); setError('');
    const details = { name: form.name, note: form.note, blurb: form.blurb,
      accent: form.accent, heat: form.heat, image: form.image, isActive: form.isActive };
    try {
      if (editing) await api.put(`/admin/flavours/${editing}`, details);
      else await api.post('/admin/flavours', { ...details, slug: form.slug, initialStock });
      reset(); await load(); onChanged();
    } catch (caught) {
      setError(caught instanceof Error && 'code' in caught && caught.code === 'slug_exists'
        ? 'That URL slug is already in use.' : 'Could not save this flavour. Check every field.');
    } finally { setSaving(false); }
  }

  async function remove(item: AdminFlavour) {
    if (!window.confirm(`Remove “${item.name}” from the storefront? Existing order history will be preserved.`)) return;
    await api.delete(`/admin/flavours/${item.slug}`);
    if (editing === item.slug) reset();
    await load(); onChanged();
  }

  async function restore(item: AdminFlavour) {
    await api.put(`/admin/flavours/${item.slug}`, { name: item.name, note: item.note,
      blurb: item.blurb, accent: item.accent, heat: item.heat, image: item.image, isActive: true });
    await load(); onChanged();
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-[15px] font-bold">Flavour catalogue</h2><p className="mt-1 text-[12px] text-neutral-500">Add, edit, remove, or restore flavours. New flavours automatically receive every pack-size SKU.</p></div>
        <button type="button" onClick={reset} className="rounded-lg bg-[#1B7A4B] px-4 py-2 text-[12px] font-bold text-white">+ Add flavour</button>
      </div>
      <div className="mt-4 grid gap-5 xl:grid-cols-[24rem_1fr]">
        <form onSubmit={submit} className="h-fit rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <h3 className="text-[13px] font-bold">{editing ? `Edit ${form.name}` : 'New flavour'}</h3>
          <div className="mt-3 space-y-3">
            <Field label="Name"><input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, ...(!editing ? { slug: slugify(e.target.value) } : {}) })} className={input} placeholder="Mint Masala" /></Field>
            <Field label="URL slug"><input required disabled={Boolean(editing)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className={input} placeholder="mint-masala" /></Field>
            <Field label="Short note"><input maxLength={120} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={input} placeholder="Fresh, savoury finish" /></Field>
            <Field label="Description"><textarea rows={3} maxLength={500} value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} className={input} placeholder="Describe the flavour for shoppers." /></Field>
            <Field label="Flavour image">
              <input aria-label="Upload flavour image" required={!form.image} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void selectImage(e.target.files?.[0])} className="mt-1.5 block w-full rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-3 text-[12px] file:mr-3 file:rounded file:border-0 file:bg-[#EAF5EF] file:px-3 file:py-1.5 file:font-semibold file:text-[#1B7A4B]" />
              <p className="mt-1 text-[10px] text-neutral-500">JPG, PNG, or WebP · up to 10 MB · automatically resized for the shop</p>
              {processingImage && <p role="status" className="mt-2 text-[11px] font-medium text-[#1B7A4B]">Optimizing image…</p>}
              {form.image && <div className="mt-2 flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-2"><img src={form.image} alt="Flavour preview" className="size-16 rounded object-cover" /><div><p className="text-[11px] font-semibold">Image ready</p><p className="text-[10px] text-neutral-500">Choose another file to replace it.</p></div></div>}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Accent colour"><div className="flex gap-2"><input aria-label="Choose accent colour" type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="mt-1.5 h-9 w-12 rounded border" /><input required aria-label="Accent colour hex" pattern="#[0-9A-Fa-f]{6}" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className={input} /></div></Field>
              <Field label="Heat"><select value={form.heat} onChange={(e) => setForm({ ...form, heat: Number(e.target.value) as FormState['heat'] })} className={input}><option value={0}>Mild</option><option value={1}>Medium</option><option value={2}>Hot</option><option value={3}>Very hot</option></select></Field>
            </div>
            {!editing && <Field label="Initial stock per SKU"><input required type="number" min="0" step="1" value={form.initialStock} onChange={(e) => setForm({ ...form, initialStock: e.target.value })} className={input} /></Field>}
            <label className="flex items-center gap-2 text-[12px] font-medium"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="size-4 accent-[#1B7A4B]" />Visible in storefront</label>
          </div>
          {!editing && sizes.length > 0 && <p className="mt-3 text-[11px] text-neutral-500">Creates: {sizes.map((s) => `${s.grams}g (${money(s.pricePaise)})`).join(', ')}</p>}
          {error && <p role="alert" className="mt-3 text-[12px] text-red-600">{error}</p>}
          <div className="mt-4 flex gap-2"><button type="submit" disabled={saving || processingImage || !form.image} className="rounded-lg bg-[#1B7A4B] px-4 py-2 text-[12px] font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save flavour' : 'Create flavour'}</button>{editing && <button type="button" onClick={reset} className="rounded-lg border px-4 py-2 text-[12px] font-semibold">Cancel</button>}</div>
        </form>
        <div className="grid content-start gap-2 sm:grid-cols-2">
          {flavours.map((item) => <article key={item.slug} className={`rounded-lg border p-3 ${item.isActive ? 'border-neutral-200' : 'bg-neutral-50 opacity-75'}`}>
            <div className="flex gap-3"><span className="mt-1 size-4 shrink-0 rounded-full" style={{ backgroundColor: item.accent }} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[13px] font-bold">{item.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.isActive ? 'bg-green-50 text-green-700' : 'bg-neutral-200 text-neutral-600'}`}>{item.isActive ? 'Live' : 'Retired'}</span></div><p className="truncate font-mono text-[10px] text-neutral-500">{item.slug} · {item.skuCount} SKUs</p><p className="mt-1 line-clamp-2 text-[11px] text-neutral-600">{item.note || item.blurb || 'No description yet.'}</p></div></div>
            <div className="mt-3 flex gap-2 border-t pt-2"><button type="button" onClick={() => startEdit(item)} className="rounded border px-3 py-1 text-[11px] font-semibold">Edit</button>{item.isActive ? <button type="button" onClick={() => void remove(item)} className="rounded border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-600">Remove</button> : <button type="button" onClick={() => void restore(item)} className="rounded border border-green-200 px-3 py-1 text-[11px] font-semibold text-green-700">Restore</button>}</div>
          </article>)}
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-[12px] font-medium">{label}{children}</label>;
}
