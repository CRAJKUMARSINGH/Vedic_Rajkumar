import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (let trial=0; trial<5; trial++) {
  const p = await b.newPage();
  await p.addInitScript(() => { try{localStorage.setItem('vr-consent',JSON.stringify({given:false,timestamp:new Date().toISOString(),version:'1.0'}));}catch{} });
  await p.goto('http://127.0.0.1:4173/horoscope', { waitUntil:'domcontentloaded', timeout:60000 });
  await p.locator('#dob').waitFor({timeout:30000});
  await p.locator('#dob').fill('17/11/2007');
  await p.locator('#tob').fill('12:05');
  await p.locator('#pob').fill('Chennai, Tamil Nadu');
  // click IMMEDIATELY — no settle wait (mimics failing test)
  await p.getByRole('button',{name:/Get Transit Reading/}).click();
  let found=false;
  for(let i=0;i<9;i++){await p.waitForTimeout(5000);const t=await p.locator('body').innerText();if(/Overall Score|समग्र स्कोर/.test(t)){found=true;break;}}
  const lb = await p.locator('#location-listbox').count();
  console.log(`trial${trial}: score=${found} listboxCount=${lb}`);
  await p.close();
}
await b.close();
