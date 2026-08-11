/**
 * Full-stack end-to-end test: drives a real browser through the storefront and
 * the admin dashboard against the live API and database.
 *
 * Needs both servers running:
 *   pnpm dev:api      (port 8787)
 *   pnpm dev --port 5177
 * Then: node scripts/e2e-test.mjs
 */
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL ?? 'http://localhost:5177';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@nuto.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'change-me-now';

const { spawn } = await import('node:child_process');
const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--no-sandbox',
  '--remote-debugging-port=9353','--user-data-dir=/tmp/nuto-e2e2','about:blank'], { stdio: 'ignore' });

let list;
for (let i = 0; i < 40; i++) {
  try { list = await (await fetch('http://127.0.0.1:9353/json/list')).json(); break; }
  catch { await new Promise(r => setTimeout(r, 500)); }
}
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));

let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error')
    errors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
  if (m.method === 'Runtime.exceptionThrown')
    errors.push('EX: ' + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text));
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result.exceptionDetails) throw new Error('eval threw: ' + r.result.exceptionDetails.text);
  return r.result.result.value;
};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Polls until the expression is truthy — no guessing at load times. */
async function waitFor(expr, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await ev(expr)) return true;
    await sleep(200);
  }
  throw new Error(`timed out waiting for ${label}`);
}
const go = async (path) => { await send('Page.navigate', { url: BASE + path }); await sleep(300); };

let failed = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`);
};

await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
// Start from a clean slate — a session cookie left by a previous run would
// skip the login page and silently weaken the auth assertions.
await send('Network.clearBrowserCookies');
await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });

/* ------------------------------------------------ storefront places an order */
await go('/p/peri-peri');
await waitFor(`!!([...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='ADD TO CART'))`, 'PDP');
await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='ADD TO CART').click()`);
await waitFor(`JSON.parse(localStorage.getItem('nuto.cart.v1')||'[]').length>0`, 'cart');

await go('/checkout');
await waitFor(`document.querySelectorAll('[data-field]').length>=8`, 'checkout form');
const fill = (f, v) => ev(`(()=>{const el=document.querySelector('[data-field="${f}"]');
  const proto=el.tagName==='SELECT'?HTMLSelectElement:HTMLInputElement;
  Object.getOwnPropertyDescriptor(proto.prototype,'value').set.call(el,${JSON.stringify(v)});
  el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));})()`);
for (const [f, v] of [['fullName','Meera Iyer'],['mobile','9876500011'],['email','meera@example.com'],
  ['addressLine1','12 Jubilee Hills'],['addressLine2','Road No 36'],['city','Hyderabad'],
  ['pincode','500033'],['state','Telangana']]) await fill(f, v);
await ev(`document.querySelector('input[value="cod"]').click()`);
await ev(`document.querySelector('form').requestSubmit()`);
await waitFor(`location.pathname==='/order-confirmed'`, 'confirmation');

const ref = await ev(`document.body.innerText.match(/NUTO-[A-Z0-9]{6}/)?.[0] ?? ''`);
check('storefront places a real order', /^NUTO-[A-Z0-9]{6}$/.test(ref), ref);

const lookup = await ev(`fetch('/api/orders/${ref}').then(r=>r.json())`);
check('order persisted to Postgres', lookup.reference === ref, `status=${lookup.status}`);
check('server computed the total', lookup.totalPaise === 25700, `₹${lookup.totalPaise/100}`);

/* -------------------------------------------------------------------- admin */
await go('/admin');
await waitFor(`document.body.innerText.includes('Admin sign in')`, 'login page');
check('admin is gated when signed out', true);

await ev(`(()=>{const inputs=document.querySelectorAll('input');
  const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
  set.call(inputs[0], ${JSON.stringify(ADMIN_EMAIL)}); inputs[0].dispatchEvent(new Event('input',{bubbles:true}));
  set.call(inputs[1], ${JSON.stringify(ADMIN_PASSWORD)}); inputs[1].dispatchEvent(new Event('input',{bubbles:true}));})()`);
await ev(`document.querySelector('form').requestSubmit()`);
await waitFor(`document.body.innerText.includes('Orders today')`, 'dashboard');
check('admin signs in and dashboard loads', true);

await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Orders').click()`);
await waitFor(`document.body.innerText.includes('${ref}')`, 'orders table');
check('orders table lists the new order', true, ref);

await ev(`[...document.querySelectorAll('tbody tr')].find(r=>r.innerText.includes('${ref}')).click()`);
// The drawer mounts immediately showing "Loading…" — wait for its contents,
// not just the dialog element.
await waitFor(`!!([...document.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim().toLowerCase()==='confirmed'))`, 'order drawer contents');
await ev(`[...document.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim().toLowerCase()==='confirmed').click()`);
await sleep(1200);
const updated = await ev(`fetch('/api/admin/orders?q=${ref}',{credentials:'include'}).then(r=>r.json())`);
check('status change persists to the database', updated.orders[0]?.status === 'confirmed', updated.orders[0]?.status);
const detail = await ev(`fetch('/api/admin/orders/${updated.orders[0].id}',{credentials:'include'}).then(r=>r.json())`);
check('status change is audited', detail.events.some(e => e.toStatus === 'confirmed' && e.actor.includes('@')),
  detail.events.map(e => `${e.toStatus}/${e.actor}`).join(' '));

await ev(`[...document.querySelectorAll('[role=dialog] button')].find(b=>b.textContent.trim().toLowerCase()==='close').click()`);
await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Inventory').click()`);
await waitFor(`document.querySelectorAll('tbody tr').length>=24`, 'inventory');
check('inventory lists all SKUs', true, (await ev(`document.querySelectorAll('tbody tr').length`)) + ' rows');

await ev(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Sign out').click()`);
await waitFor(`document.body.innerText.includes('Admin sign in')`, 'signed out');
const afterLogout = await ev(`fetch('/api/admin/orders',{credentials:'include'}).then(r=>r.status)`);
check('session is invalidated server-side', afterLogout === 401, 'status ' + afterLogout);

console.log('\nconsole errors:', errors.length ? errors : 'clean');
if (errors.length) failed++;
console.log(failed ? `\n${failed} failed` : '\nall passed');
ws.close(); chrome.kill(); process.exit(failed ? 1 : 0);
