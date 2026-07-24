// 5 distinct VIEWS per site (viewport shots at different sections = "different pages" of the story)
const path=require('path');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const puppeteer=require('/Users/rakinmiah/Desktop/Web Builder/studio/node_modules/puppeteer-core');
const OUT='/Users/rakinmiah/Desktop/Web Builder/referral-proto/assets';
const SETS={
  taxi:{url:'https://nationaltaxi.co.uk',views:[0,.13,.30,.47,.72]},
  deen:{url:'https://deenrelief.org',views:[0,.12,.30,.45,.62]},
};
(async()=>{
  const browser=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-gpu','--hide-scrollbars','--mute-audio']});
  for(const [name,cfg] of Object.entries(SETS)){
    const page=await browser.newPage();
    await page.setViewport({width:1440,height:900,deviceScaleFactor:1.5});
    await page.goto(cfg.url,{waitUntil:'networkidle2',timeout:45000});
    await new Promise(r=>setTimeout(r,2200));
    await page.evaluate(()=>{const els=[...document.querySelectorAll('button,a')];
      const b=els.find(e=>/^(decline|reject|no thanks)$/i.test((e.textContent||'').trim()))||els.find(e=>/^(accept( all)?|ok|got it)$/i.test((e.textContent||'').trim()));
      if(b)b.click();});
    // full slow pre-scroll so lazy content + counters are all fired before any view is shot
    await page.evaluate(()=>new Promise(res=>{let y=0;const t=setInterval(()=>{y+=460;window.scrollTo(0,y);if(y>=document.body.scrollHeight){clearInterval(t);setTimeout(res,500);}},200);}));
    await new Promise(r=>setTimeout(r,1500));
    const H=await page.evaluate(()=>document.body.scrollHeight-innerHeight);
    for(let i=0;i<cfg.views.length;i++){
      await page.evaluate(y=>window.scrollTo(0,y), cfg.views[i]*H);
      await new Promise(r=>setTimeout(r,1400)); // reveals settle at this view
      await page.screenshot({path:path.join(OUT,`${name}-v${i+1}.jpg`),type:'jpeg',quality:85,fullPage:false});
    }
    console.log(`✓ ${name}: ${cfg.views.length} views`);
    await page.close();
  }
  await browser.close();
})();
