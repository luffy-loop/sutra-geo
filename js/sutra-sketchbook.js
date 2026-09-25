(() => {
  const intro=document.getElementById('sutraBookIntro'); if(!intro)return;
  const list=document.getElementById('sutraLocationList'),bar=document.getElementById('sutraLoadingBar'),percent=document.getElementById('sutraLoadingPercent'),label=document.getElementById('sutraLoadingLabel'),items=[...list.querySelectorAll('span')];
  const start=performance.now(),duration=3200,labels=['Collecting memories','Tracing your journey','Saving places','Opening your scrapbook'];
  document.body.classList.add('sutra-scrapbook-lock');
  function tick(now){
    const p=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-p,3),active=Math.min(items.length-1,Math.floor(p*items.length));
    items.forEach((el,i)=>el.classList.toggle('active',i===active));
    list.style.transform='translateY('+(28-eased*(items.length*52))+'px)';
    bar.style.width=(p*100).toFixed(1)+'%';percent.textContent=Math.round(p*100)+'%';label.textContent=labels[Math.min(labels.length-1,Math.floor(p*labels.length))];
    if(p<1){requestAnimationFrame(tick);return}
    setTimeout(()=>{intro.classList.add('is-closing');document.body.classList.remove('sutra-scrapbook-lock');setTimeout(()=>{intro.remove();document.getElementById('scrapbookContent')?.scrollIntoView({behavior:'smooth',block:'start'})},650)},180);
  }
  requestAnimationFrame(tick);
})();