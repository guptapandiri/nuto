import { useCallback, useEffect, useState } from 'react';
import { api, money, type InventoryCombo, type InventoryVariant } from './api';

export function InventoryTab() {
  const [variants, setVariants] = useState<InventoryVariant[]>([]);
  const [combos, setCombos] = useState<InventoryCombo[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await api.get<{ variants: InventoryVariant[]; combos: InventoryCombo[] }>(
      '/admin/inventory',
    );
    setVariants(data.variants);
    setCombos(data.combos);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function save(kind: 'variant' | 'combo', id: string, patch: Record<string, unknown>) {
    setSaving(id);
    try {
      await api.patch('/admin/inventory', { kind, id, ...patch });
      await load();
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <h2 className="border-b border-neutral-200 px-4 py-3 text-[14px] font-bold">
          Flavour packs
        </h2>
        <table className="w-full min-w-[38rem] text-left text-[13px]">
          <thead className="border-b border-neutral-200 text-[12px] text-neutral-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">SKU</th>
              <th className="px-4 py-2.5 font-medium">Flavour</th>
              <th className="px-4 py-2.5 text-right font-medium">Price</th>
              <th className="px-4 py-2.5 font-medium">Stock</th>
              <th className="px-4 py-2.5 font-medium">Live</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {variants.map((v) => (
              <tr key={v.sku} className={v.stock === 0 ? 'bg-red-50/50' : undefined}>
                <td className="px-4 py-2 font-mono text-[12px]">{v.sku}</td>
                <td className="px-4 py-2">{v.flavour} · {v.grams}g</td>
                <td className="px-4 py-2 text-right tabular-nums">{money(v.pricePaise)}</td>
                <td className="px-4 py-2">
                  <StockInput
                    value={v.stock}
                    busy={saving === v.sku}
                    onCommit={(stock) => void save('variant', v.sku, { stock })}
                  />
                </td>
                <td className="px-4 py-2">
                  <Toggle
                    on={v.isActive}
                    busy={saving === v.sku}
                    onChange={(isActive) => void save('variant', v.sku, { isActive })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <h2 className="border-b border-neutral-200 px-4 py-3 text-[14px] font-bold">Combos</h2>
        <table className="w-full min-w-[34rem] text-left text-[13px]">
          <thead className="border-b border-neutral-200 text-[12px] text-neutral-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Combo</th>
              <th className="px-4 py-2.5 text-right font-medium">Price</th>
              <th className="px-4 py-2.5 font-medium">Stock</th>
              <th className="px-4 py-2.5 font-medium">Live</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {combos.map((combo) => (
              <tr key={combo.slug} className={combo.stock === 0 ? 'bg-red-50/50' : undefined}>
                <td className="px-4 py-2">{combo.name}</td>
                <td className="px-4 py-2 text-right tabular-nums">{money(combo.pricePaise)}</td>
                <td className="px-4 py-2">
                  <StockInput
                    value={combo.stock}
                    busy={saving === combo.slug}
                    onCommit={(stock) => void save('combo', combo.slug, { stock })}
                  />
                </td>
                <td className="px-4 py-2">
                  <Toggle
                    on={combo.isActive}
                    busy={saving === combo.slug}
                    onChange={(isActive) => void save('combo', combo.slug, { isActive })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/** Commits on blur or Enter rather than per keystroke, so one edit is one write. */
function StockInput({
  value,
  busy,
  onCommit,
}: {
  value: number;
  busy: boolean;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  function commit() {
    const next = Number(draft);
    if (Number.isInteger(next) && next >= 0 && next !== value) onCommit(next);
    else setDraft(String(value));
  }

  return (
    <input
      type="number"
      min={0}
      value={draft}
      disabled={busy}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className="w-20 rounded border border-neutral-300 px-2 py-1 text-[13px] tabular-nums focus:border-[#1B7A4B] focus:outline-none disabled:opacity-50"
    />
  );
}

function Toggle({
  on,
  busy,
  onChange,
}: {
  on: boolean;
  busy: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={busy}
      onClick={() => onChange(!on)}
      className={`h-6 w-11 rounded-full p-0.5 transition-colors disabled:opacity-50 ${
        on ? 'bg-[#1B7A4B]' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`block size-5 rounded-full bg-white transition-transform ${
          on ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}
