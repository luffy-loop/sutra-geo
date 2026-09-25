// SUTRA-GEO shared application layer
// Heritage-first experience: discover -> play -> preserve -> reward.

const SutraScrapbook = window.SutraScrapbook || {
  key:'sutra_scrapbook',
  storageKey(){return this.key+'_'+(window.SutraAuth?.user?.().email||'guest').toLowerCase()},
  get(){try{const d=JSON.parse(localStorage.getItem(this.storageKey())||'[]');return Array.isArray(d)?d:[]}catch{return[]}},
  save(item){if(!item||!item.title)return{added:false,item:null};const items=this.get();const duplicate=items.find(x=>x.title===item.title&&x.place===item.place);if(duplicate)return{added:false,item:duplicate};const saved={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,title:item.title,place:item.place||'India',type:item.type||'Memory',symbol:item.symbol||'✦',image:item.image||'',created:new Date().toISOString()};items.unshift(saved);localStorage.setItem(this.storageKey(),JSON.stringify(items));window.dispatchEvent(new CustomEvent('sutra:scrapbook-updated',{detail:saved}));return{added:true,item:saved}},
  remove(id){localStorage.setItem(this.storageKey(),JSON.stringify(this.get().filter(x=>x.id!==id)));window.dispatchEvent(new Event('sutra:scrapbook-updated'))},
  clear(){localStorage.removeItem(this.storageKey());window.dispatchEvent(new Event('sutra:scrapbook-updated'))}
};
window.SutraScrapbook = SutraScrapbook;

const SutraAuth = {
  key:'sutra_auth',
  login(name,email,travellerType='india') {
    const alreadyLogged = !!localStorage.getItem(this.key);
    localStorage.setItem(this.key, JSON.stringify({name,email,travellerType,joined:new Date().toISOString()}));
    // One-time welcome wallet: every new browser/user gets 50 free Sutra Coins.
    const userKey='sutra_welcome_'+btoa(unescape(encodeURIComponent(email.toLowerCase()))).replace(/[^a-z0-9]/gi,'').slice(0,80);
    if (!localStorage.getItem(userKey)) {
      localStorage.setItem('sutra_welcome_bonus_claimed_'+userKey,'1');
      // Wallet is user-specific, so every new account gets exactly 50 free coins.
      const walletKey='sutra_coins_'+btoa(unescape(encodeURIComponent(email.toLowerCase()))).replace(/[^a-z0-9]/gi,'').slice(0,80);
      if(!localStorage.getItem(walletKey)) localStorage.setItem(walletKey,'50');
      localStorage.setItem(userKey,'1');
      localStorage.setItem(walletKey+'_history', JSON.stringify([{label:'Welcome bonus',amount:50,date:new Date().toISOString()}]));
    }
    return !alreadyLogged;
  },
  isLoggedIn(){ return !!localStorage.getItem(this.key); },
  user(){ try{return JSON.parse(localStorage.getItem(this.key))||{}}catch{return{}} },
  logout(){ localStorage.removeItem(this.key); window.location.href='index.html'; }
};
window.SutraAuth = SutraAuth;

const SutraWallet = {
  storageKey(){
    const email=(SutraAuth.user().email||'guest').trim().toLowerCase();
    return 'sutra_coins_'+btoa(unescape(encodeURIComponent(email))).replace(/[^a-z0-9]/gi,'').slice(0,80);
  },
  historyKey(){ return this.storageKey()+'_history'; },
  get(){ return Number(localStorage.getItem(this.storageKey()) || 0); },
  set(value){ localStorage.setItem(this.storageKey(),String(Math.max(0,Number(value)||0))); renderPoints(); renderCoinStats(); },
  add(value,label='Heritage discovery'){
    const coins=Number(value)||0; if(coins<=0)return this.get();
    this.set(this.get()+coins);
    const history=JSON.parse(localStorage.getItem(this.historyKey())||'[]');
    history.unshift({label,amount:coins,date:new Date().toISOString()});
    localStorage.setItem(this.historyKey(),JSON.stringify(history.slice(0,50)));
    toast(`+${coins} Sutra Coins earned ✦`); return this.get();
  },
  spend(value){ const cost=Number(value)||0; if(this.get()<cost){toast(`You need ${cost-this.get()} more Sutra Coins.`);return false;} this.set(this.get()-cost);return true; }
};
window.SutraWallet=SutraWallet;

function renderPoints(){document.querySelectorAll('.points-balance').forEach(el=>el.textContent=SutraWallet.get());}
function renderCoinStats(){document.querySelectorAll('.coin-stat').forEach(el=>el.textContent=SutraWallet.get());}
function toast(message){let el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';document.body.appendChild(el);}el.textContent=message;el.classList.add('toast-show');clearTimeout(window.__sutraToast);window.__sutraToast=setTimeout(()=>el.classList.remove('toast-show'),2600);}
window.toast=toast;
function getInitials(name='PG'){return name.trim().split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'PG';}

function runDailySutra(){
  const today=new Date().toISOString().slice(0,10);
  const userKey=(SutraAuth.user().email||'guest').toLowerCase();
  const last=localStorage.getItem('sutra_daily_quiz_date_'+userKey);
  const claim=document.getElementById('dailyClaim');
  const status=document.getElementById('dailyStatus');
  if(claim){claim.disabled=last===today;claim.textContent=last===today?'Daily reward claimed ✓':'Claim today’s +25 coins';}
  if(status&&last===today)status.textContent='You already claimed today’s Daily Sutra. Come back tomorrow.';
}
window.claimDailySutra=function(){
  const today=new Date().toISOString().slice(0,10);
  if(localStorage.getItem('sutra_daily_quiz_date_'+(SutraAuth.user().email||'guest').toLowerCase())===today){toast('Daily Sutra already claimed today.');return;}
  localStorage.setItem('sutra_daily_quiz_date_'+(SutraAuth.user().email||'guest').toLowerCase(),today);
  SutraWallet.add(25,'Daily Sutra quiz');
  runDailySutra();
};

// Small helper for a Pokémon-GO-style heritage capture mechanic.


const SutraJourney={
 key:'sutra_journey',
 get(){try{return JSON.parse(localStorage.getItem(this.key)||'[]')}catch{return[]}},
 add(city,state,node,type='visit'){const email=(SutraAuth.user().email||'guest').toLowerCase();const list=this.get();const item={id:`${Date.now()}-${Math.random().toString(36).slice(2,6)}`,email,city,state,node:node||'',type,date:new Date().toISOString()};list.unshift(item);localStorage.setItem(this.key,JSON.stringify(list.slice(0,500)));return item},
 forUser(){const email=(SutraAuth.user().email||'guest').toLowerCase();return this.get().filter(x=>x.email===email)}
};window.SutraJourney=SutraJourney;

const SutraProfile={
 photoKey(){return 'sutra_profile_photo_'+(SutraAuth.user().email||'guest').toLowerCase()},
 getPhoto(){return localStorage.getItem(this.photoKey())||''},
 setPhoto(data){localStorage.setItem(this.photoKey(),data);window.dispatchEvent(new Event('sutra:profile-updated'))},
 clearPhoto(){localStorage.removeItem(this.photoKey());window.dispatchEvent(new Event('sutra:profile-updated'))},
 privacy(){try{return JSON.parse(localStorage.getItem('sutra_privacy')||'{}')}catch{return{}}},
 savePrivacy(data){localStorage.setItem('sutra_privacy',JSON.stringify({...this.privacy(),...data}))}
};window.SutraProfile=SutraProfile;

window.SutraSettings={
 apply(){const p=SutraProfile.privacy();document.body.classList.toggle('high-contrast',!!p.highContrast);document.body.classList.toggle('large-text',!!p.largeText)},
 locationEnabled(){const p=SutraProfile.privacy();return p.location!==false},
 toggleLocation(v){SutraProfile.savePrivacy({location:!!v});this.apply();},
 deleteAccount(){const email=(SutraAuth.user().email||'guest').toLowerCase();const suffix=btoa(unescape(encodeURIComponent(email))).replace(/[^a-z0-9]/gi,'').slice(0,80);const scrapKey='sutra_scrapbook_'+email;const photoKey=SutraProfile.photoKey();const privacyKey=SutraProfile.privacyKey();localStorage.removeItem('sutra_auth');localStorage.removeItem('sutra_journey');localStorage.removeItem(scrapKey);localStorage.removeItem(photoKey);localStorage.removeItem(privacyKey);Object.keys(localStorage).filter(k=>k.includes(suffix)).forEach(k=>localStorage.removeItem(k));window.location.href='index.html'}
};

async function registerSutraSW(){if('serviceWorker' in navigator){try{await navigator.serviceWorker.register('sw.js')}catch(e){}}}

window.SutraNodeCapture={
  key:'sutra_captured_nodes',
  storageKey(){return this.key+'_'+(SutraAuth.user().email||'guest').toLowerCase()},
  get(){try{return JSON.parse(localStorage.getItem(this.storageKey())||'[]')}catch{return[]}},
  capture(id,name,place){
    const list=this.get(); if(list.includes(id)){toast(`${name} is already in your Heritage Collection.`);return false;}
    list.push(id);localStorage.setItem(this.storageKey(),JSON.stringify(list));
    const parts=String(place||'').split(' · ');
    SutraJourney.add(parts[0]||place,parts[1]||'',name,'heritage-node');
    localStorage.setItem('sutra_current_context',JSON.stringify({city:parts[0]||'',state:parts[1]||'',node:name,nodeId:id,updated:new Date().toISOString()}));
    SutraScrapbook.save({title:name,place,type:'Heritage Node',symbol:'🪔'});
    toast(`Heritage Node unlocked: ${name}`);return true;
  }
};

window.addEventListener('storage',()=>{renderPoints();renderCoinStats();});

document.addEventListener('DOMContentLoaded',()=>{
  const protectedPage=!!document.body.dataset.page;
  if(protectedPage&&!SutraAuth.isLoggedIn()){window.location.href='index.html';return;}
  renderPoints();renderCoinStats();runDailySutra();SutraSettings.apply();registerSutraSW();
  const user=SutraAuth.user();
  const nameEl=document.getElementById('userName');if(nameEl)nameEl.textContent=(user.name||'EXPLORER').toUpperCase();
  const avatar=document.getElementById('profileButton');if(avatar)avatar.textContent=getInitials(user.name);
  const banner=document.getElementById('travellerBanner');if(banner&&user.travellerType==='international')banner.style.display='flex';
  const form=document.getElementById('loginForm');
  if(form)form.addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('loginName')?.value.trim();const email=document.getElementById('loginEmail')?.value.trim();const travellerType=document.getElementById('travellerType')?.value||'india';if(!name||!email)return;const first=SutraAuth.login(name,email,travellerType);if(first)toast('Welcome to SUTRA-GEO · 50 free Sutra Coins ✦');window.location.href='explore.html';});
});
