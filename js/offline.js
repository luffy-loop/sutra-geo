function currentPackCity(){
  // Prefer the city the traveller is currently exploring (set when a node is
  // unlocked/viewed); fall back to the first dataset city so the button never
  // silently claims a city the user never selected.
  try{const ctx=JSON.parse(localStorage.getItem('sutra_current_context')||'null');if(ctx?.city)return ctx.city}catch(e){}
  return (window.SUTRA_HERITAGE&&window.SUTRA_HERITAGE[0])?window.SUTRA_HERITAGE[0].city:'Sample';
}
function packButtonLabel(){const btn=document.getElementById('offlinePackBtn');if(btn)btn.textContent=`Download ${currentPackCity()} Heritage Pack`}
async function downloadHeritagePack(){const city=currentPackCity();const cityNodes=(window.SUTRA_HERITAGE||[]).filter(x=>x.city===city);const pack={name:`${city} Heritage Pack`,size:'42 MB',items:['Map','Stories','Quest information','Heritage images']};const urls=['explore.html','map.html','ar.html','ai.html','js/heritageData.js','style.css',...cityNodes.slice(0,4).map(x=>x.image).filter(Boolean)];try{const cache=await caches.open('sutra-geo-v3');for(const url of urls){try{await cache.add(url)}catch(e){}}localStorage.setItem('sutra_offline_pack',JSON.stringify({downloaded:true,date:new Date().toISOString(),pack}));const el=document.getElementById('offlineStatus');if(el)el.textContent=`Downloaded ${city} Heritage Pack for low-connectivity demo use ✓`;toast(`${city} Heritage Pack downloaded to this browser.`)}catch(e){toast('Offline pack could not be downloaded in this browser.')}}
function renderOfflineStatus(){packButtonLabel();const el=document.getElementById('offlineStatus');if(!el)return;const x=JSON.parse(localStorage.getItem('sutra_offline_pack')||'null');if(x?.downloaded)el.textContent=`Downloaded ${x.pack?.name||'Heritage Pack'} for low-connectivity demo use ✓`}
window.downloadHeritagePack=downloadHeritagePack;document.addEventListener('DOMContentLoaded',renderOfflineStatus);
