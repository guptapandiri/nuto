import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, money, type AdminCombo, type AdminComboItem, type AdminPackSize, type ComboFlavourOption } from './api';
import { optimizeImage } from './imageUpload';

interface ComboForm {
  slug: string; name: string; tagline: string; description: string; priceRupees: string;
  image: string; badge: string; stock: string; isActive: boolean; items: AdminComboItem[];
}
const blank = (): ComboForm => ({ slug: '', name: '', tagline: '', description: '', priceRupees: '', image: '', badge: '', stock: '50', isActive: true, items: [] });
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const input = 'mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-[13px] focus:border-[#1B7A4B] focus:outline-none';

export function CombosManager({ onChanged }: { onChanged: () => void }) {
  const [combos, setCombos] = useState<AdminCombo[]>([]);
  const [flavours, setFlavours] = useState<ComboFlavourOption[]>([]);
  const [sizes, setSizes] = useState<AdminPackSize[]>([]);
  const [form, setForm] = useState<ComboForm>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ combos: AdminCombo[]; flavours: ComboFlavourOption[]; sizes: AdminPackSize[] }>('/admin/combos');
      setCombos(data.combos); setFlavours(data.flavours); setSizes(data.sizes); setError('');
    } catch { setError('Could not load combo packs.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const existingImages = useMemo(() => Array.from(new Set(combos.map((combo) => combo.image).filter(Boolean))), [combos]);

  function reset() { setEditing(null); setForm(blank()); setError(''); }
  function startEdit(combo: AdminCombo) {
    setEditing(combo.slug);
    setForm({ slug: combo.slug, name: combo.name, tagline: combo.tagline,
      description: combo.description, priceRupees: String(combo.pricePaise / 100),
      image: combo.image, badge: combo.badge ?? '', stock: String(combo.stock),
      isActive: combo.isActive, items: combo.items });
    setError('');
  }

  async function selectImage(file: File | undefined) {
    if (!file) return;
    setProcessingImage(true); setError('');
    try {
      const image = await optimizeImage(file);
      setForm((current) => ({ ...current, image }));
    }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not process that image.'); }
    finally { setProcessingImage(false); }
  }

  function addItem() {
    if (!flavours[0] || !sizes[0]) return;
    const used = new Set(form.items.map((item) => `${item.flavourSlug}:${item.grams}`));
    for (const flavour of flavours) for (const size of sizes) {
      if (!used.has(`${flavour.slug}:${size.grams}`)) {
        setForm({ ...form, items: [...form.items, { flavourSlug: flavour.slug, grams: size.grams, quantity: 1 }] });
        return;
      }
    }
    setError('Every available flavour and size is already included.');
  }

  function updateItem(index: number, patch: Partial<AdminComboItem>) {
    setForm({ ...form, items: form.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const pricePaise = Math.round(Number(form.priceRupees) * 100);
    const stock = Number(form.stock);
    const keys = form.items.map((item) => `${item.flavourSlug}:${item.grams}`);
    if (!Number.isInteger(pricePaise) || pricePaise < 1 || !Number.isInteger(stock) || stock < 0) { setError('Enter a valid price and whole-number stock.'); return; }
    if (form.items.length === 0) { setError('Add at least one pack to the combo.'); return; }
    if (new Set(keys).size !== keys.length) { setError('The same flavour and size cannot be added twice. Increase its quantity instead.'); return; }
    setSaving(true); setError('');
    const details = { name: form.name, tagline: form.tagline, description: form.description,
      pricePaise, image: form.image, badge: form.badge.trim() || null, stock,
      isActive: form.isActive, items: form.items };
    try {
      if (editing) await api.put(`/admin/combos/${editing}`, details);
      else await api.post('/admin/combos', { ...details, slug: form.slug });
      reset(); await load(); onChanged();
    } catch (caught) {
      setError(caught instanceof Error && 'code' in caught && caught.code === 'slug_exists'
        ? 'That combo SKU is already in use.' : 'Could not save this combo. Check all fields and contents.');
    } finally { setSaving(false); }
  }

  async function remove(combo: AdminCombo) {
    if (!window.confirm(`Remove “${combo.name}” from the storefront? Existing order history will be preserved.`)) return;
    await api.delete(`/admin/combos/${combo.slug}`); if (editing === combo.slug) reset(); await load(); onChanged();
  }
  async function restore(combo: AdminCombo) {
    await api.put(`/admin/combos/${combo.slug}`, { name: combo.name, tagline: combo.tagline,
      description: combo.description, pricePaise: combo.pricePaise, image: combo.image,
      badge: combo.badge, stock: combo.stock, isActive: true, items: combo.items });
    await load(); onChanged();
  }

  return <section className="rounded-xl border border-neutral-200 bg-white p-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[15px] font-bold">Combo pack catalogue</h2><p className="mt-1 text-[12px] text-neutral-500">Create custom packs, edit descriptions and images, choose contents, or retire old combos.</p></div><button type="button" onClick={reset} className="rounded-lg bg-[#1B7A4B] px-4 py-2 text-[12px] font-bold text-white">+ Add combo</button></div>
    <div className="mt-4 grid gap-5 xl:grid-cols-[27rem_1fr]">
      <form onSubmit={submit} className="h-fit rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <h3 className="text-[13px] font-bold">{editing ? `Edit ${form.name}` : 'New combo pack'}</h3>
        <div className="mt-3 space-y-3">
          <Field label="Combo name"><input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, ...(!editing ? { slug: slugify(e.target.value) } : {}) })} className={input} placeholder="Weekend Mix" /></Field>
          <Field label="Combo SKU"><input required disabled={Boolean(editing)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className={input} placeholder="weekend-mix" /></Field>
          <Field label="Short tagline"><input required maxLength={160} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={input} placeholder="Four favourites · 100g each" /></Field>
          <Field label="Description"><textarea required rows={4} maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} placeholder="Describe who this combo is for and what it contains." /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Price (₹)"><input required type="number" min="0.01" step="0.01" value={form.priceRupees} onChange={(e) => setForm({ ...form, priceRupees: e.target.value })} className={input} /></Field><Field label="Stock"><input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={input} /></Field></div>
          <Field label="Badge (optional)"><input maxLength={60} value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className={input} placeholder="Best value" /></Field>
          <Field label="Combo image"><input aria-label="Upload combo image" required={!form.image} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void selectImage(e.target.files?.[0])} className="mt-1.5 block w-full rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-3 text-[12px] file:mr-3 file:rounded file:border-0 file:bg-[#EAF5EF] file:px-3 file:py-1.5 file:font-semibold file:text-[#1B7A4B]" />
            {existingImages.length > 0 && <div className="mt-2"><p className="text-[10px] text-neutral-500">Or reuse an existing combo image:</p><div className="mt-1 flex gap-2 overflow-x-auto">{existingImages.map((image, index) => <button key={index} type="button" onClick={() => setForm({ ...form, image })} aria-label={`Use existing combo image ${index + 1}`} className={`shrink-0 rounded border-2 ${form.image === image ? 'border-[#1B7A4B]' : 'border-transparent'}`}><img src={image} alt="" className="size-12 rounded object-cover" /></button>)}</div></div>}
            {processingImage && <p role="status" className="mt-2 text-[11px] text-[#1B7A4B]">Optimizing image…</p>}{form.image && <div className="mt-2 flex items-center gap-3 rounded-lg border bg-white p-2"><img src={form.image} alt="Combo preview" className="size-16 rounded object-cover" /><p className="text-[11px] font-semibold">Image ready</p></div>}
          </Field>
          <div><div className="flex items-center justify-between"><p className="text-[12px] font-medium">Pack contents</p><button type="button" onClick={addItem} className="rounded border border-[#1B7A4B] px-2.5 py-1 text-[11px] font-semibold text-[#1B7A4B]">+ Add pack</button></div>
            <div className="mt-2 space-y-2">{form.items.map((item, index) => <div key={index} className="grid grid-cols-[1fr_5.5rem_4rem_auto] gap-2"><select aria-label={`Flavour ${index + 1}`} value={item.flavourSlug} onChange={(e) => updateItem(index, { flavourSlug: e.target.value })} className={input}>{flavours.map((flavour) => <option key={flavour.slug} value={flavour.slug}>{flavour.name}</option>)}</select><select aria-label={`Size ${index + 1}`} value={item.grams} onChange={(e) => updateItem(index, { grams: Number(e.target.value) })} className={input}>{sizes.map((size) => <option key={size.grams} value={size.grams}>{size.grams}g</option>)}</select><input aria-label={`Quantity ${index + 1}`} type="number" min="1" max="100" value={item.quantity} onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })} className={input} /><button type="button" aria-label={`Remove pack ${index + 1}`} onClick={() => setForm({ ...form, items: form.items.filter((_, itemIndex) => itemIndex !== index) })} className="mt-1.5 text-lg text-red-500">×</button></div>)}</div>
          </div>
          <label className="flex items-center gap-2 text-[12px] font-medium"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="size-4 accent-[#1B7A4B]" />Visible in storefront</label>
        </div>
        {error && <p role="alert" className="mt-3 text-[12px] text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2"><button type="submit" disabled={saving || processingImage || !form.image} className="rounded-lg bg-[#1B7A4B] px-4 py-2 text-[12px] font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : editing ? 'Save combo' : 'Create combo'}</button>{editing && <button type="button" onClick={reset} className="rounded-lg border px-4 py-2 text-[12px] font-semibold">Cancel</button>}</div>
      </form>
      <div className="grid content-start gap-3 sm:grid-cols-2">{combos.map((combo) => <article key={combo.slug} className={`overflow-hidden rounded-lg border ${combo.isActive ? 'border-neutral-200' : 'bg-neutral-50 opacity-75'}`}><img src={combo.image} alt="" className="h-28 w-full object-cover" /><div className="p-3"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[13px] font-bold">{combo.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${combo.isActive ? 'bg-green-50 text-green-700' : 'bg-neutral-200'}`}>{combo.isActive ? 'Live' : 'Retired'}</span></div><p className="font-mono text-[10px] text-neutral-500">{combo.slug} · {combo.items.reduce((sum, item) => sum + item.quantity, 0)} packs · {money(combo.pricePaise)}</p><p className="mt-1 line-clamp-2 text-[11px] text-neutral-600">{combo.description}</p><div className="mt-3 flex gap-2 border-t pt-2"><button type="button" onClick={() => startEdit(combo)} className="rounded border px-3 py-1 text-[11px] font-semibold">Edit</button>{combo.isActive ? <button type="button" onClick={() => void remove(combo)} className="rounded border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-600">Remove</button> : <button type="button" onClick={() => void restore(combo)} className="rounded border border-green-200 px-3 py-1 text-[11px] font-semibold text-green-700">Restore</button>}</div></div></article>)}</div>
    </div>
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-[12px] font-medium">{label}{children}</label>; }
