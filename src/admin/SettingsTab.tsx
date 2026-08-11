import { useEffect, useState } from 'react';
import { api } from './api';

interface Commerce {
  freeShippingThresholdInPaise: number;
  flatShippingInPaise: number;
  codFeeInPaise: number;
  maxQuantityPerLine: number;
}

const fields: { key: keyof Commerce; label: string; hint: string; rupees: boolean }[] = [
  { key: 'freeShippingThresholdInPaise', label: 'Free shipping above', hint: 'Order subtotal at which shipping becomes free', rupees: true },
  { key: 'flatShippingInPaise', label: 'Flat shipping charge', hint: 'Charged below the free-shipping threshold', rupees: true },
  { key: 'codFeeInPaise', label: 'Cash on Delivery fee', hint: 'Added when the customer chooses COD', rupees: true },
  { key: 'maxQuantityPerLine', label: 'Max quantity per line', hint: 'Cap on units of a single SKU in one order', rupees: false },
];

export function SettingsTab() {
  const [values, setValues] = useState<Commerce | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<{ commerce?: Commerce }>('/admin/settings')
      .then((data) => data.commerce && setValues(data.commerce))
      .catch(() => undefined);
  }, []);

  if (!values) return <p className="text-[13px] text-neutral-500">Loading…</p>;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!values) return;
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/admin/settings/commerce', values);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-lg rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="text-[14px] font-bold">Shipping &amp; fees</h2>
      <p className="mt-1 text-[13px] text-neutral-500">
        These take effect immediately — the storefront and the order API both read them
        from here, so no deploy is needed.
      </p>

      <div className="mt-5 space-y-4">
        {fields.map((field) => (
          <label key={field.key} className="block text-[13px] font-medium">
            {field.label}
            <span className="mt-1.5 flex items-center gap-2">
              {field.rupees && <span className="text-neutral-500">₹</span>}
              <input
                type="number"
                min={0}
                value={field.rupees ? values[field.key] / 100 : values[field.key]}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  setSaved(false);
                  setValues({
                    ...values,
                    [field.key]: field.rupees ? Math.round(raw * 100) : Math.round(raw),
                  });
                }}
                className="w-40 rounded-lg border border-neutral-300 px-3 py-2 text-[14px] tabular-nums focus:border-[#1B7A4B] focus:outline-none"
              />
            </span>
            <span className="mt-1 block text-[12px] font-normal text-neutral-500">
              {field.hint}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#1B7A4B] px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="text-[13px] text-[#1B7A4B]">Saved.</span>}
      </div>
    </form>
  );
}
