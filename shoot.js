const path=require('path');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const puppeteer=require('/Users/rakinmiah/Desktop/Web Builder/studio/node_modules/puppeteer-core');
const OUT='/Users/rakinmiah/Desktop/Web Builder/referral-proto/assets';
(async()=>{
  const browser=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-gpu','--hide-scrollbars','--mute-audio']});
  for(const [file,w,h,dpr,mobile] of [['jdh-desktop.png',1440,900,1.5,false],['jdh-mobile.png',390,844,2,true]]){
    const page=await browser.newPage();
    await page.setViewport({width:w,height:h,deviceScaleFactor:dpr,isMobile:mobile,hasTouch:mobile});
    await page.goto('https://jdhgas.co.uk',{waitUntil:'networkidle2',timeout:45000});
    await new Promise(r=>setTimeout(r,2000));
    // privacy-preserving: DECLINE first, accept-style only as fallback for banner removal
    await page.evaluate(()=>{const els=[...document.querySelectorAll('button,a')];
      const b=els.find(e=>/^(decline|reject|no thanks)$/i.test((e.textContent||'').trim()))||els.find(e=>/^(accept|ok|got it)$/i.test((e.textContent||'').trim()));
      if(b)b.click();});
    await new Promise(r=>setTimeout(r,800));
    await page.evaluate(()=>new Promise(res=>{let y=0;const t=setInterval(()=>{y+=500;window.scrollTo(0,y);if(y>=document.body.scrollHeight){clearInterval(t);window.scrollTo(0,0);setTimeout(res,900);}},150);}));
    await new Promise(r=>setTimeout(r,1200));
    await page.screenshot({path:path.join(OUT,file),fullPage:true});
    console.log('✓',file);
    await page.close();
  }
  await browser.close();
})();
