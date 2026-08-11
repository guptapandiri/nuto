/**
 * End-to-end smoke test: drives a real browser through the whole purchase flow
 * over the Chrome DevTools Protocol. There is no test framework in this project,
 * so this is the safety net for the checkout path.
 *
 * Start the dev server first, then:
 *   node scripts/smoke-test.mjs
 *
 * Screenshots of each step land in $SHOT_DIR (default /tmp/nuto-smoke).
 * Exits non-zero if any check fails, so it can gate a deploy.
 */
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.env.BASE_URL ?? 'http://localhost:5177';
const OUT = process.env.SHOT_DIR ?? '/tmp/nuto-smoke';
const { spawn } = await import('node:child_process');
const { writeFile, mkdir } = await import('node:fs/promises');
await mkdir(OUT, { recursive: true });

const chrome = spawn(CHROME, ['--headless=new','--disable-gpu','--no-sandbox',
  '--remote-debugging-port=9335','--user-data-dir=/tmp/nuto-flow','about:blank'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 2500));
const list = await (await fetch('http://127.0.0.1:9335/json/list')).json();
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => (ws.onopen = r));
let id = 0; const pending = new Map();
const consoleErrors = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.consoleAPICalled' && ['error','warning'].includes(m.params.type)) {
    consoleErrors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
  }
  if (m.method === 'Runtime.exceptionThrown') consoleErrors.push('EXCEPTION: ' + m.params.exceptionDetails.text);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params={}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({id:i,method,params})); });
const evalJs = async (expression) => {
  const { result } = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const shot = async (name) => {
  const { result } = await send('Page.captureScreenshot', { format:'png', captureBeyondViewport:true });
  await writeFile(`${OUT}/${name}.png`, Buffer.from(result.data,'base64'));
};

await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

let failures = 0;
const check = (label, cond, detail='') => {
  if (!cond) failures++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`);
};

// 1. Add two different products from the shop page.
await send('Page.navigate', { url: `${BASE}/shop` }); await wait(1200);
await evalJs(`[...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Add to cart')[0].click()`);
await wait(400);
await evalJs(`document.querySelector('[aria-label="Close cart"]').click()`); await wait(300);
await evalJs(`[...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Add to cart')[2].click()`);
await wait(500);
let badge = await evalJs(`document.querySelector('header button[aria-label^="Open cart"]').textContent.trim()`);
check('cart badge shows 2 items', badge === '2', `badge="${badge}"`);
await shot('flow-1-drawer');

// 2. Increase quantity in the drawer.
await evalJs(`[...document.querySelectorAll('[role="dialog"] button')].find(b=>b.getAttribute('aria-label')?.startsWith('Increase')).click()`);
await wait(400);
badge = await evalJs(`document.querySelector('header button[aria-label^="Open cart"]').textContent.trim()`);
check('quantity increase updates badge to 3', badge === '3', `badge="${badge}"`);

// 3. Cart survives a reload (localStorage persistence).
await send('Page.navigate', { url: `${BASE}/cart` }); await wait(1300);
const afterReload = await evalJs(`document.querySelector('header button[aria-label^="Open cart"]').textContent.trim()`);
check('cart persists across reload', afterReload === '3', `badge="${afterReload}"`);
const cartTotal = await evalJs(`document.body.innerText.match(/Total\\s*\\n?\\s*(₹[\\d,\\.]+)/)?.[1] ?? 'not found'`);
check('cart shows a total', cartTotal.startsWith('₹'), cartTotal);
await shot('flow-2-cart');

// 4. Checkout: submit empty to trigger validation.
await send('Page.navigate', { url: `${BASE}/checkout` }); await wait(1300);
await evalJs(`document.querySelector('form').requestSubmit()`); await wait(600);
let errs = await evalJs(`document.querySelectorAll('p.text-danger').length`);
check('empty submit blocks and shows errors', errs >= 7, `${errs} field errors`);
await shot('flow-3-validation');

// 5. Bad mobile + bad pincode specifically.
const fill = async (field, value) => {
  await evalJs(`(() => {
    const el = document.querySelector('[data-field="${field}"]');
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement;
    Object.getOwnPropertyDescriptor(proto.prototype, 'value').set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
};
await fill('fullName','Ananya Rao');
await fill('mobile','12345');          // invalid: too short, wrong leading digit
await fill('email','ananya@example.com');
await fill('addressLine1','Flat 402, Sai Residency');
await fill('addressLine2','Road No. 12, Banjara Hills');
await fill('city','Hyderabad');
await fill('pincode','012345');        // invalid: leading zero
await fill('state','Telangana');
await evalJs(`document.querySelector('form').requestSubmit()`); await wait(600);
const badFields = await evalJs(`[...document.querySelectorAll('[aria-invalid="true"]')].map(e=>e.dataset.field).join(',')`);
check('rejects 5-digit mobile and 0-leading PIN', badFields.includes('mobile') && badFields.includes('pincode'), badFields);

// 6. Fix them, choose COD, verify the fee appears.
await fill('mobile','98765 43210');
await fill('pincode','500034');
await evalJs(`document.querySelector('input[value="cod"]').click()`); await wait(500);
const codShown = await evalJs(`document.body.innerText.includes('COD handling fee')`);
check('COD selection adds handling fee line', codShown);
await shot('flow-4-checkout-filled');

// 7. Place the order.
await evalJs(`document.querySelector('form').requestSubmit()`); await wait(2200);
const url = await evalJs(`location.pathname`);
check('navigates to confirmation', url === '/order-confirmed', url);
const ref = await evalJs(`document.body.innerText.match(/NUTO-[A-Z0-9]{6}/)?.[0] ?? 'none'`);
check('order reference generated', /^NUTO-[A-Z0-9]{6}$/.test(ref), ref);
const cleared = await evalJs(`document.querySelector('header button[aria-label^="Open cart"]').textContent.trim()`);
check('cart cleared after order', cleared === '', `badge="${cleared}"`);
await shot('flow-5-confirmed');

// 8. INR formatting uses Indian grouping.
const grouping = await evalJs(`new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(129999)`);
check('Indian digit grouping', grouping.includes('1,29,999'), grouping);

if (consoleErrors.length) { failures++; console.log('\nconsole errors/warnings:', consoleErrors); }
else console.log('\nconsole errors/warnings: none');
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
ws.close(); chrome.kill(); process.exit(failures ? 1 : 0);
