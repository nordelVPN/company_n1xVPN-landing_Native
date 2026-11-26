const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, firefox, webkit } = require('playwright');
const { PNG } = require('pngjs');

const engineName = process.argv[2] || 'chromium';
const engine = { chromium, firefox, webkit }[engineName];
if (!engine) throw new Error('Expected chromium, firefox or webkit');
const root = path.resolve(__dirname, '..');
const build = path.join(root, 'build/prod');
const output = path.join(root, 'docs/qa/front-003', engineName);
fs.mkdirSync(output, { recursive: true });
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  const file = path.resolve(build, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(build + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, body) => {
    res.writeHead(error ? 404 : 200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(error ? 'Not found' : body);
  });
});
async function newDemoContext(browser, opts){ const ctx = await browser.newContext(opts); await ctx.addInitScript(()=>{ window.__VPN_PORTAL_CONFIG__ = { mode: 'demo' }; }); return ctx; }
const report = { engine: engineName, checks: [], comparisons: [], errors: [] };

function comparison(actualPath, referencePath, name) {
  const actual = PNG.sync.read(fs.readFileSync(actualPath));
  const reference = PNG.sync.read(fs.readFileSync(referencePath));
  assert.equal(actual.width, reference.width);
  assert.equal(actual.height, reference.height);
  const overlay = new PNG({ width: actual.width, height: actual.height });
  const difference = new PNG({ width: actual.width, height: actual.height });
  let sum = 0;
  for (let i = 0; i < actual.data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const delta = Math.abs(actual.data[i + c] - reference.data[i + c]);
      sum += delta;
      overlay.data[i + c] = Math.round((actual.data[i + c] + reference.data[i + c]) / 2);
      difference.data[i + c] = delta;
    }
    overlay.data[i + 3] = difference.data[i + 3] = 255;
  }
  fs.writeFileSync(path.join(output, name + '-overlay.png'), PNG.sync.write(overlay));
  fs.writeFileSync(path.join(output, name + '-difference.png'), PNG.sync.write(difference));
  return { name, width: actual.width, height: actual.height, meanChannelDifference: sum / (actual.width * actual.height * 3), note: 'Diagnostic only: no visual acceptance threshold.' };
}


(async () => {
 let browser;
 try {
  const dict = require('../src/data/locales.json');
  assert.deepEqual(Object.keys(dict.en).sort(), Object.keys(dict.ru).sort());
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const url = 'http://127.0.0.1:' + server.address().port;
  browser = await engine.launch({headless:true,...(process.argv[3]?{channel:process.argv[3]}:{})});
  report.version = browser.version();
  for (const width of [375,768,1440]) {
   const context = await newDemoContext(browser, {viewport:{width,height:900},reducedMotion:'reduce'});
   const page = await context.newPage();
   const errors=[];
   page.on('pageerror', e=>errors.push(e.message));
   page.on('console', m=>{if(m.type()==='error')errors.push(m.text());});
   page.on('response', r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
   page.on('requestfailed', r=>errors.push(r.url()));
   await page.goto(url,{waitUntil:'networkidle'});
   for(const lang of ['en','ru']){
    await page.selectOption('[data-language-select]',lang);
    assert.equal(await page.locator('html').getAttribute('lang'),lang);
    assert.equal(await page.title(),dict[lang]['index.title']);
    const measurements=await page.evaluate(()=>{
     const outside=[...document.querySelectorAll('main h1,main h2,main h3,main p,main button,main a,main input')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left< -1||r.right>innerWidth+1);}).map(el=>el.textContent);
     return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,outside,motion:getComputedStyle(document.documentElement).scrollBehavior};
    });
    assert(measurements.scrollWidth<=width+1,JSON.stringify(measurements));
    assert.deepEqual(measurements.outside,[]);
    assert.equal(measurements.motion,'auto');
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    // Check every annotated text and attribute, including empty translations.
    const untranslated=await page.evaluate(dict=>{
     const bad=[];
     for(const el of document.querySelectorAll('[data-i18n]'))if(el.textContent!==dict[el.dataset.i18n])bad.push(el.dataset.i18n);
     for(const attr of ['aria-label','placeholder','title','content'])for(const el of document.querySelectorAll('[data-i18n-'+attr+']'))if(el.getAttribute(attr)!==dict[el.getAttribute('data-i18n-'+attr)])bad.push(attr);
     return bad;
    },dict[lang]);
    assert.deepEqual(untranslated,[]);
    await page.screenshot({path:path.join(output,lang+'-'+width+'.png'),fullPage:true});
    if(width<=900){
     const menu=page.locator('[data-menu-toggle]');
     await menu.focus();await page.keyboard.press('Enter');
     assert.equal(await menu.getAttribute('aria-expanded'),'true');
     await page.keyboard.press('Escape');
     assert.equal(await menu.getAttribute('aria-expanded'),'false');
     assert(await menu.evaluate(el=>el===document.activeElement));
    }
    const connect=page.locator('[data-connect]');
    await connect.click();assert.equal(await connect.getAttribute('aria-pressed'),'true');
    await page.selectOption('[data-language-select]',lang==='en'?'ru':'en');
    assert.equal(await connect.getAttribute('aria-pressed'),'true');
    await page.selectOption('[data-language-select]',lang);
    assert.equal(await page.locator('[data-preview-status]').textContent(),dict[lang]['app.preview.connectedStatus']);
    await connect.click();
    await page.locator('[data-demo-info]').click();
    assert(await page.locator('[data-demo-notice]').isVisible());
    assert.equal(await page.locator('.plan-card').count(),4);
    assert.deepEqual(await page.locator('.plan-card .price').allTextContents(),['€1','€7','€15','€55']);
    for(let i=0;i<4;i++){
     const card=page.locator('.plan-card').nth(i);
     assert.equal(await card.locator('h3').textContent(),dict[lang]['pricing.plans.'+i+'.name']);
     assert.equal(await card.locator('.plan-devices').textContent(),dict[lang]['pricing.plans.'+i+'.devices']);
     assert.equal(await card.locator('.plan-note').count(),i===1?0:1);
     if(i!==1)assert.equal(await card.locator('.plan-note').textContent(),dict[lang]['pricing.plans.'+i+'.note']);
     assert.equal(await card.locator('.button').textContent(),dict[lang]['pricing.plans.'+i+'.button']);
    }
    assert.equal(await page.locator('.pricing-note').count(),0);
    const search=page.locator('input[type=search]');
    await search.fill('test');assert.equal(await search.inputValue(),'test');
    assert.equal(await search.getAttribute('placeholder'),dict[lang]['support.searchPlaceholder']);
    await search.fill('');
    for(const cta of await page.locator('[data-wishlist-open]').all()){
     if(!await cta.isVisible())continue;
     await cta.focus();await page.keyboard.press('Enter');
     assert(await page.locator('dialog').evaluate(el=>el.open));
     assert.equal(await page.locator('#order-title').textContent(),dict[lang]['checkout.title']);
     assert.equal(await page.locator('[data-wishlist-close]').innerText(),'');
     assert.equal(await page.locator('dialog').getAttribute('aria-describedby'),'wishlist-description');
     const planIds=['trial','monthly','quarterly','yearly'];
     const prices=['€1','€7','€15','€55'];
     const pi=planIds.indexOf(await cta.getAttribute('data-select-plan')||'trial');
     assert(pi>=0);
     assert.equal(await page.locator('[name=order-plan]:checked').getAttribute('value'),planIds[pi]);
     assert.equal(await page.locator('[data-order-plan]').textContent(),dict[lang]['pricing.plans.'+pi+'.name']);
     assert.equal(await page.locator('[data-order-total]').textContent(),prices[pi]);
     assert.equal(await page.locator('[data-order-billing]').textContent(),dict[lang][pi===0?'checkout.once':'checkout.recurring']);
     await page.locator('[value=yearly]').check();
     assert.equal(await page.locator('[data-order-plan]').textContent(),dict[lang]['pricing.plans.3.name']);
     assert.equal(await page.locator('[data-order-total]').textContent(),'€55');
     assert.equal(await page.locator('[data-order-billing]').textContent(),dict[lang]['checkout.recurring']);
     await page.locator('[value=trial]').check();
     assert.equal(await page.locator('[data-order-total]').textContent(),'€1');
     assert.equal(await page.locator('[data-order-billing]').textContent(),dict[lang]['checkout.once']);
     await page.locator('[value=yearly]').check();
     await page.locator('#order-email').fill('demo@example.com');
     await page.selectOption('#order-payment','card');
     await page.locator('[data-order-form] button[type=submit]').click();
     assert(await page.locator('[data-order-notice]').isVisible());
     assert(await page.locator('dialog').evaluate(el=>el.open && el.scrollWidth<=el.clientWidth+1));
     for(let i=0;i<10;i++)await page.keyboard.press('Tab');
     assert(await page.locator('dialog').evaluate(el=>el.contains(document.activeElement)));
     await page.keyboard.press('Escape');
     await page.waitForFunction(()=>!document.querySelector('dialog').open);
    assert(await cta.evaluate(el=>el===document.activeElement),await page.evaluate(()=>document.activeElement.outerHTML));
    }
    const cta=page.locator('#plans [data-wishlist-open]').first();
    await cta.click();await page.locator('[data-wishlist-close]').click();
    await page.waitForFunction(()=>!document.querySelector('dialog').open);
    assert(await cta.evaluate(el=>el===document.activeElement),await page.evaluate(()=>document.activeElement.outerHTML));
    await cta.click();await page.mouse.click(2,2);
    assert(!await page.locator('dialog').evaluate(el=>el.open));
    await page.waitForFunction(()=>!document.querySelector('dialog').open);
    assert(await cta.evaluate(el=>el===document.activeElement),await page.evaluate(()=>document.activeElement.outerHTML));
    for(const link of await page.locator('a[href^="#"]').all()){const href=await link.getAttribute('href');if(href!=='#')assert(await page.locator(href).count());}
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.locator('html').getAttribute('lang'),lang);
    report.checks.push({width,lang,measurements,interactions:'passed'});
   }
   assert.deepEqual(errors,[]);await context.close();
  }

  for(const width of [375,768,1440]){
   const context=await newDemoContext(browser, {viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
   for(const lang of ['en','ru']){
    await page.goto(url+'/login.html',{waitUntil:'networkidle'});
    await page.selectOption('[data-language-select]',lang);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:path.join(output,'login-'+lang+'-'+width+'.png'),fullPage:true});
    await page.fill('#login-email','user@example.com');await page.fill('#login-password','demo-password');await page.locator('[data-demo-login] button').click();
    await page.waitForURL('**/account.html');
    assert.equal(await page.locator('html').getAttribute('lang'),lang);
    assert.equal(await page.locator('.account-email').textContent(),'user@example.com');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:path.join(output,'account-'+lang+'-'+width+'.png'),fullPage:true});
    await page.locator('[data-wishlist-open]').first().click();
    await page.locator('[value=quarterly]').check();
    // Change language through the existing controller while the background is inert.
    await page.evaluate(lang=>{const select=document.querySelector('[data-language-select]');select.value=lang;select.dispatchEvent(new Event('change'));},lang==='en'?'ru':'en');
    assert.equal(await page.locator('[data-order-plan]').textContent(),dict[lang==='en'?'ru':'en']['pricing.plans.2.name']);
    assert.equal(await page.locator('[data-order-total]').textContent(),'€15');
    await page.screenshot({path:path.join(output,'order-'+(lang==='en'?'ru':'en')+'-'+width+'.png'),fullPage:true});
    await page.keyboard.press('Escape');
    await page.locator('[data-account-action]').first().click();
    assert(await page.locator('[data-account-notice]').isVisible());
    await page.locator('[data-demo-logout]').click();await page.waitForURL('**/login.html');
    report.checks.push({width,lang,pages:'login -> account -> order -> logout',passed:true});
   }
   assert.deepEqual(errors,[]);await context.close();
  }
  const motion=await newDemoContext(browser, {reducedMotion:'no-preference'});const mp=await motion.newPage();await mp.goto(url);
  const opener=mp.locator('[data-wishlist-open]').first();await opener.click();
  assert.equal(await mp.locator('dialog').evaluate(el=>getComputedStyle(el).animationName),'dialog-in');
  await mp.keyboard.press('Escape');
  await mp.waitForFunction(()=>!document.querySelector('dialog').open);
  assert(await opener.evaluate(el=>el===document.activeElement));await motion.close();

  // Storage failures must not break localization.
  const blocked=await newDemoContext(browser, );
  await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});
  const bp=await blocked.newPage();await bp.goto(url);await bp.selectOption('[data-language-select]','ru');
  assert.equal(await bp.locator('html').getAttribute('lang'),'ru');await blocked.close();
  const nojs=await newDemoContext(browser, {javaScriptEnabled:false});const np=await nojs.newPage();await np.goto(url);
  assert.equal(await np.locator('main section').count(),5);assert.equal(await np.locator('html').getAttribute('lang'),'en');await nojs.close();
  for(const [id,file] of [['home','01-home'],['the-app','02-the-app'],['why-n1x','03-why-n1x'],['plans','04-plans'],['support','07-support']]){
   const reference=path.join(root,'docs/assets/images/concept',file+'.png');
   const {width,height}=PNG.sync.read(fs.readFileSync(reference));
   const context=await newDemoContext(browser, {viewport:{width,height},reducedMotion:'reduce'});
   const page=await context.newPage();await page.goto(url,{waitUntil:'networkidle'});
   await page.evaluate(id=>{for(const s of document.querySelectorAll('main section'))if(s.id!==id)s.style.display='none';document.querySelector('footer').style.display='none';},id);
   const actual=path.join(output,id+'.png');await page.screenshot({path:actual});
   report.comparisons.push(comparison(actual,reference,id));await context.close();
  }

  for(const [name,ref] of [['account','account-page/06-account'],['checkout','05-checkout']]){
   const reference=path.join(root,'docs/assets/images/concept',ref+'.png');
   const {width,height}=PNG.sync.read(fs.readFileSync(reference));
   const context=await newDemoContext(browser, {viewport:{width,height},reducedMotion:'reduce'});
   const page=await context.newPage();await page.goto(url+(name==='account'?'/account.html':''),{waitUntil:'networkidle'});
   if(name==='checkout')await page.locator('[data-wishlist-open]').first().click();
   const actual=path.join(output,name+'.png');await page.screenshot({path:actual});
   report.comparisons.push(comparison(actual,reference,name));await context.close();
  }
 }catch(e){report.errors.push(e.stack);process.exitCode=1;}
 finally{await browser?.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
