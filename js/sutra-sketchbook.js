(() => {
  const intro=document.getElementById('sutraBookIntro'); if(!intro)return;
  const list=document.getElementById('sutraLocationList');
  const bar=document.getElementById('sutraLoadingBar');
  const percent=document.getElementById('sutraLoadingPercent');
  const label=document.getElementById('sutraLoadingLabel');
  const items=[...list.querySelectorAll('span')];
  const duration=4300,start=performance.now();
  const labels=['Collecting memories','Tracing your journey','Saving places','Opening your scrapbook'];
  const step=items[0]?.getBoundingClientRect().height+13||53;
  document.body.classList.add('sutra-scrapbook-lock');
  function tick(now){
    const p=Math.min(1,(now-start)/duration);
    const y=28-p*((items.length-1)*step);
    list.style.transform='translateY('+y+'px)';
    const active=Math.min(items.length-1,Math.round(p*(items.length-1)));
    items.forEach((el,i)=>el.classList.toggle('active',i===active));
    bar.style.width=(p*100).toFixed(1)+'%';
    percent.textContent=Math.round(p*100)+'%';
    label.textContent=labels[Math.min(labels.length-1,Math.floor(p*labels.length))];
    if(p<1){requestAnimationFrame(tick);return}
    setTimeout(()=>{
      intro.classList.add('is-closing');
      document.body.classList.remove('sutra-scrapbook-lock');
      setTimeout(()=>intro.remove(),650);
    },220);
  }
  requestAnimationFrame(tick);
})();