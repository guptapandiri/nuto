import { Fragment, useCallback, useEffect, useState } from 'react';
import { api, money, type InventoryCombo, type InventoryVariant } from './api';

interface InventoryEdit {
  kind: 'variant' | 'combo';
  id: string;
  label: string;
  priceRupees: string;
  stock: string;
  isActive: boolean;
  priceNote?: string;
}

export function InventoryTab() {
  const [variants, setVariants] = useState<InventoryVariant[]>([]);
  const [combos, setCombos] = useState<InventoryCombo[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [editing, setEditing] = useState<InventoryEdit | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const data = await api.get<{ variants: InventoryVariant[]; combos: InventoryCombo[] }>(
      '/admin/inventory',
    );
    setVariants(data.variants);
    setCombos(data.combos);
  }, []);

  useEffect(() => { void load(); }, [load]);

  function editVariant(variant: InventoryVariant) {
    setEditing({
      kind: 'variant',
      id: variant.sku,
      label: `${variant.flavour} · ${variant.grams}g`,
      priceRupees: String(variant.pricePaise / 100),
      stock: String(variant.stock),
      isActive: variant.isActive,
      priceNote: `The ${variant.grams}g price is shared by every flavour pack of this size.`,
    });
    setError('');
  }

  function editCombo(combo: InventoryCombo) {
    setEditing({
      kind: 'combo',
      id: combo.slug,
      label: combo.name,
      priceRupees: String(combo.pricePaise / 100),
      stock: String(combo.stock),
      isActive: combo.isActive,
    });
    setError('');
  }

  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const stock = Number(editing.stock);
    const pricePaise = Math.round(Number(editing.priceRupees) * 100);
    if (!Number.isInteger(stock) || stock < 0 || !Number.isInteger(pricePaise) || pricePaise < 1) {
      setError('Enter a valid price and a whole-number stock quantity.');
      return;
    }

    setSaving(editing.id);
    setError('');
    try {
      await api.patch('/admin/inventory', {
        kind: editing.kind,
        id: editing.id,
        stock,
        pricePaise,
        isActive: editing.isActive,
      });
      await load();
      setEditing(null);
    } catch {
      setError('Could not save this SKU. Please try again.');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <InventorySection title="Flavour packs" minWidth="44rem">
        <thead className="border-b border-neutral-200 text-[12px] text-neutral-500">
          <tr>
            <Header>SKU</Header><Header>Flavour</Header><Header right>Price</Header>
            <Header>Stock</Header><Header>Live</Header><Header right>Action</Header>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {variants.map((variant) => (
            <Fragment key={variant.sku}>
              <tr className={variant.stock === 0 ? 'bg-red-50/50' : undefined}>
                <td className="px-4 py-2 font-mono text-[12px]">{variant.sku}</td>
                <td className="px-4 py-2">{variant.flavour} · {variant.grams}g</td>
                <td className="px-4 py-2 text-right tabular-nums">{money(variant.pricePaise)}</td>
                <td className="px-4 py-2 tabular-nums">{variant.stock}</td>
                <td className="px-4 py-2"><LiveStatus live={variant.isActive} /></td>
                <td className="px-4 py-2 text-right"><EditButton onClick={() => editVariant(variant)} /></td>
              </tr>
              {editing?.kind === 'variant' && editing.id === variant.sku && (
                <EditRow editing={editing} saving={saving === variant.sku} error={error} setEditing={setEditing} onSave={saveEdit} onCancel={() => setEditing(null)} />
              )}
            </Fragment>
          ))}
        </tbody>
      </InventorySection>

      <InventorySection title="Combos" minWidth="44rem">
        <thead className="border-b border-neutral-200 text-[12px] text-neutral-500">
          <tr>
            <Header>SKU</Header><Header>Combo</Header><Header right>Price</Header>
            <Header>Stock</Header><Header>Live</Header><Header right>Action</Header>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {combos.map((combo) => (
            <Fragment key={combo.slug}>
              <tr className={combo.stock === 0 ? 'bg-red-50/50' : undefined}>
                <td className="px-4 py-2 font-mono text-[12px]">{combo.slug}</td>
                <td className="px-4 py-2">{combo.name}</td>
                <td className="px-4 py-2 text-right tabular-nums">{money(combo.pricePaise)}</td>
                <td className="px-4 py-2 tabular-nums">{combo.stock}</td>
                <td className="px-4 py-2"><LiveStatus live={combo.isActive} /></td>
                <td className="px-4 py-2 text-right"><EditButton onClick={() => editCombo(combo)} /></td>
              </tr>
              {editing?.kind === 'combo' && editing.id === combo.slug && (
                <EditRow editing={editing} saving={saving === combo.slug} error={error} setEditing={setEditing} onSave={saveEdit} onCancel={() => setEditing(null)} />
              )}
            </Fragment>
          ))}
        </tbody>
      </InventorySection>
    </div>
  );
}

function InventorySection({ title, minWidth, children }: { title: string; minWidth: string; children: React.ReactNode }) {
  return (
    <section className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <h2 className="border-b border-neutral-200 px-4 py-3 text-[14px] font-bold">{title}</h2>
      <table className="w-full text-left text-[13px]" style={{ minWidth }}>{children}</table>
    </section>
  );
}

function Header({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-4 py-2.5 font-medium ${right ? 'text-right' : ''}`}>{children}</th>;
}

function EditButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded border border-neutral-300 px-3 py-1.5 text-[12px] font-semibold hover:border-[#1B7A4B] hover:text-[#1B7A4B]">Edit</button>;
}

function LiveStatus({ live }: { live: boolean }) {
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${live ? 'bg-green-50 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>{live ? 'Live' : 'Hidden'}</span>;
}

function EditRow({ editing, saving, error, setEditing, onSave, onCancel }: {
  editing: InventoryEdit;
  saving: boolean;
  error: string;
  setEditing: React.Dispatch<React.SetStateAction<InventoryEdit | null>>;
  onSave: (event: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const inputClass = 'mt-1 w-full rounded border border-neutral-300 px-2.5 py-2 text-[13px] focus:border-[#1B7A4B] focus:outline-none';
  return (
    <tr className="bg-[#F6FBF8]">
      <td colSpan={6} className="px-4 py-4">
        <form onSubmit={onSave} className="rounded-lg border border-green-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><p className="text-[13px] font-bold">Edit {editing.label}</p><p className="font-mono text-[11px] text-neutral-500">{editing.id}</p></div>
            <button type="button" onClick={onCancel} className="text-[12px] font-medium text-neutral-500">Cancel</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-[12px] font-medium">Price (₹)<input required type="number" min="0.01" step="0.01" value={editing.priceRupees} onChange={(event) => setEditing({ ...editing, priceRupees: event.target.value })} className={inputClass} /></label>
            <label className="text-[12px] font-medium">Stock<input required type="number" min="0" step="1" value={editing.stock} onChange={(event) => setEditing({ ...editing, stock: event.target.value })} className={inputClass} /></label>
            <label className="flex items-center gap-2 self-end rounded border border-neutral-200 px-3 py-2.5 text-[13px] font-medium"><input type="checkbox" checked={editing.isActive} onChange={(event) => setEditing({ ...editing, isActive: event.target.checked })} className="size-4 accent-[#1B7A4B]" />Visible in storefront</label>
          </div>
          {editing.priceNote && <p className="mt-2 text-[11px] text-amber-700">{editing.priceNote}</p>}
          {error && <p role="alert" className="mt-2 text-[12px] text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="mt-3 rounded-lg bg-[#1B7A4B] px-4 py-2 text-[12px] font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      </td>
    </tr>
  );
}
