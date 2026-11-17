import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage();
p.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0,200)));
await p.addInitScript(() => { try{localStorage.setItem('vr-consent',JSON.stringify({given:false,timestamp:new Date().toISOString(),version:'1.0'}));}catch{} });
await p.goto('http://127.0.0.1:4173/horoscope', { waitUntil:'domcontentloaded', timeout:60000 });
await p.locator('#dob').waitFor({timeout:30000});
await p.locator('#dob').fill('05/11/1988');
await p.locator('#tob').fill('08:32');
await p.locator('#pob').fill('Bengaluru, Karnataka');
// mimic new spec: wait nominatim response + listbox
await p.waitForResponse(r=>r.url().includes('nominatim'),{timeout:20000}).catch(()=>console.log('no nominatim resp'));
await p.locator('#location-listbox').waitFor({state:'visible',timeout:5000}).catch(()=>console.log('no listbox'));
await p.getByRole('button',{name:'Get Transit Reading',exact:true}).click();
for(let i=0;i<9;i++){await p.waitForTimeout(5000);const t=await p.locator('body').innerText();if(/Overall Score|समग्र स्कोर/.test(t)){console.log('SCORE at',i*5+5,'s');break;}if(i===8){console.log('FAIL');console.log(t.slice(0,400).replace(/\n+/g,' | '));}}
await b.close();
