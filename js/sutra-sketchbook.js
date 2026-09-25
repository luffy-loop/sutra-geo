(() => {
  const intro=document.getElementById('sutraBookIntro'); if(!intro)return;
  const list=document.getElementById('sutraLocationList'),bar=document.getElementById('sutraLoadingBar'),percent=document.getElementById('sutraLoadingPercent'),label=document.getElementById('sutraLoadingLabel'),items=[...list.querySelectorAll('span')];
  const duration=4300,start=performance.now();
  const labels=['Collecting memories','Tracing your journey','Saving places','Opening your scrapbook'];
  document.body.classList.add('sutra-scrapbook-lock');
  function tick(now){
    const p=Math.min(1,(now-start)/duration);
    const maxY=(items.length-1)*60;
    list.style.transform='translateY('+(28-p*maxY)+'px)';
    const active=Math.min(items.length-1,Math.round(p*(items.length-1)));
    items.forEach((el,i)=>el.classList.toggle('active',i===active));
    bar.style.width=(p*100).toFixed(1)+'%';
    percent.textContent=Math.round(p*100)+'%';
    label.textContent=labels[Math.min(labels.length-1,Math.floor(p*labels.length))];
    if(p<1){requestAnimationFrame(tick);return}
    intro.classList.add('is-closing');
    document.body.classList.remove('sutra-scrapbook-lock');
    setTimeout(()=>intro.remove(),700);
  }
  requestAnimationFrame(tick);
})();