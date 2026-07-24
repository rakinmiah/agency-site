// full-page MOBILE captures of the three client sites — for the phone-size case cards.
// 375pt viewport @2x, lazy content pre-fired, cropped later to keep pan speed sane.
const path=require('path');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const puppeteer=require('/Users/rakinmiah/Desktop/Web Builder/studio/node_modules/puppeteer-core');
const OUT='/Users/rakinmiah/Desktop/Web Builder/referral-proto/assets';
const SITES={
  taxi:'https://nationaltaxi.co.uk',
  jdh:'https://jdhgas.co.uk',
  deen:'https://deenrelief.org',
};
(async()=>{
  const browser=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-gpu','--hide-scrollbars','--mute-audio']});
  for(const [name,url] of Object.entries(SITES)){
    const page=await browser.newPage();
    await page.setViewport({width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true});
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1');
    await page.goto(url,{waitUntil:'networkidle2',timeout:45000});
    await new Promise(r=>setTimeout(r,2200));
    await page.evaluate(()=>{const els=[...document.querySelectorAll('button,a')];
      const b=els.find(e=>/^(decline|reject|no thanks)$/i.test((e.textContent||'').trim()))||els.find(e=>/^(accept( all)?|ok|got it)$/i.test((e.textContent||'').trim()));
      if(b)b.click();});
    await page.evaluate(()=>new Promise(res=>{let y=0;const t=setInterval(()=>{y+=460;window.scrollTo(0,y);if(y>=document.body.scrollHeight){clearInterval(t);setTimeout(res,500);}},180);}));
    await new Promise(r=>setTimeout(r,1500));
    await page.evaluate(()=>window.scrollTo(0,0));
    await new Promise(r=>setTimeout(r,900));
    // fixed bottom bars (call/whatsapp strips) smear mid-page in fullPage captures — hide them
    await page.evaluate(()=>{[...document.querySelectorAll('*')].forEach(el=>{
      const cs=getComputedStyle(el);
      if(cs.position==='fixed' && el.getBoundingClientRect().top>innerHeight*0.5) el.style.display='none';
    });});
    await page.screenshot({path:path.join(OUT,`${name}-mobile.jpg`),type:'jpeg',quality:82,fullPage:true});
    console.log(`✓ ${name}-mobile.jpg`);
    await page.close();
  }
  await browser.close();
})();
