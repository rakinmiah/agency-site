const path=require('path');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const puppeteer=require('/Users/rakinmiah/Desktop/Web Builder/studio/node_modules/puppeteer-core');
const OUT='/Users/rakinmiah/Desktop/Web Builder/referral-proto/assets';
(async()=>{
  const browser=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-gpu','--hide-scrollbars','--mute-audio']});
  for(const [file,url] of [['taxi-desktop.png','https://nationaltaxi.co.uk'],['deen-desktop.png','https://deenrelief.org']]){
    const page=await browser.newPage();
    await page.setViewport({width:1440,height:900,deviceScaleFactor:1.5});
    await page.goto(url,{waitUntil:'networkidle2',timeout:45000});
    await new Promise(r=>setTimeout(r,2200));
    await page.evaluate(()=>{const els=[...document.querySelectorAll('button,a')];
      const b=els.find(e=>/^(decline|reject|no thanks)$/i.test((e.textContent||'').trim()))||els.find(e=>/^(accept( all)?|ok|got it)$/i.test((e.textContent||'').trim()));
      if(b)b.click();});
    await new Promise(r=>setTimeout(r,800));
    await page.evaluate(()=>new Promise(res=>{let y=0;const t=setInterval(()=>{y+=460;window.scrollTo(0,y);if(y>=document.body.scrollHeight){clearInterval(t);setTimeout(res,600);}},220);}));
    await new Promise(r=>setTimeout(r,2200)); // counters settle
    await page.evaluate(()=>window.scrollTo(0,0));
    await new Promise(r=>setTimeout(r,600));
    await page.screenshot({path:path.join(OUT,file),fullPage:true});
    console.log('✓',file);
    await page.close();
  }
  await browser.close();
})();
