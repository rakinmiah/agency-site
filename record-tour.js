// Scripted "best parts" tour of a live site → mp4. Frames at 10fps via screenshot loop (works on any
// puppeteer version), assembled with ffmpeg. Reproducible: site updates → re-run.
const fs=require('fs'),path=require('path');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const puppeteer=require('/Users/rakinmiah/Desktop/Web Builder/studio/node_modules/puppeteer-core');
const TOURS={
  taxi:{url:'https://nationaltaxi.co.uk',stops:[0,.06,.13,.24,.36,.47,.47,.6,.6]},   // hero/booking → fares → pricing table (hold) → book-pay-later
  deen:{url:'https://deenrelief.org',stops:[0,.05,.12,.12,.26,.4,.4,.52]},           // hero → sponsor widget (hold) → care centres → campaigns (hold)
};
const which=process.argv[2]; const t=TOURS[which]; if(!t){console.log('usage: node record-tour.js taxi|deen');process.exit(1);}
(async()=>{
  const dir=path.join(__dirname,'_frames_'+which); fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir);
  const browser=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-gpu','--hide-scrollbars','--mute-audio']});
  const page=await browser.newPage();
  await page.setViewport({width:1280,height:800,deviceScaleFactor:1.5});
  await page.goto(t.url,{waitUntil:'networkidle2',timeout:45000});
  await new Promise(r=>setTimeout(r,2500));
  await page.evaluate(()=>{const els=[...document.querySelectorAll('button,a')];
    const b=els.find(e=>/^(decline|reject|no thanks)$/i.test((e.textContent||'').trim()))||els.find(e=>/^(accept( all)?|ok|got it)$/i.test((e.textContent||'').trim()));
    if(b)b.click();});
  await new Promise(r=>setTimeout(r,900));
  const H=await page.evaluate(()=>document.body.scrollHeight-innerHeight);
  // eased glide between stops, ~10fps frames
  let n=0; const FPS=10, SEG=1.1; // seconds per segment
  for(let s=0;s<t.stops.length-1;s++){
    const a=t.stops[s]*H, b=t.stops[s+1]*H, frames=Math.round(FPS*SEG);
    for(let f=0;f<frames;f++){
      const k=f/(frames-1), e=a===b?0:(1-Math.cos(Math.PI*k))/2; // hold segments when a===b
      await page.evaluate(y=>window.scrollTo(0,y), a+(b-a)*e);
      await new Promise(r=>setTimeout(r,25));
      await page.screenshot({path:path.join(dir,String(n++).padStart(4,'0')+'.jpg'),type:'jpeg',quality:70});
    }
  }
  await browser.close();
  console.log(`${which}: ${n} frames`);
})();
