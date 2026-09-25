document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'explore') initExplore();
  if (page === 'planner') initPlanner();
  if (page === 'stays') initStays();
  if (page === 'food') initFood();
  if (page === 'events') initEvents();
  if (page === 'store') initStore();
  if (page === 'stories') initStories();
  if (page === 'contact') initContact();
});

function initExplore() {
  const grid = document.getElementById('stateGrid');
  const search = document.getElementById('stateSearch');
  if (!grid) return;
  const render = query => {
    const q = (query || '').toLowerCase();
    const states = SUTRA_DATA.states.filter(s =>
      `${s.name} ${s.districts.join(' ')} ${s.tagline} ${s.culture} ${s.dish}`.toLowerCase().includes(q)
    );
    grid.innerHTML = states.map(s => `
      <article class="state-card" style="--state-image:url('${s.image}')" onclick="openState('${s.name.replace(/'/g, "\\'")}')">
        <div class="state-icon">${s.icon}</div>
        <h3>${s.name}</h3>
        <p>${s.tagline}</p>
        <span class="district-count">${s.districts.length} featured districts →</span>
      </article>`).join('') || `<div class="empty-state"><span>🧭</span><h2>No match yet.</h2><p>Try a state, district, food or culture keyword.</p></div>`;
  };
  render('');
  search?.addEventListener('input', e => render(e.target.value));
}

function openState(name) {
  const state = SUTRA_DATA.states.find(x => x.name === name);
  if (!state) return;
  const modal = document.getElementById('stateModal');
  if (!modal) { sessionStorage.setItem('selectedState', name); window.location.href='stories.html'; return; }
  document.getElementById('modalStateIcon').textContent=state.icon;
  document.getElementById('modalStateName').textContent=state.name;
  document.getElementById('modalStateTagline').textContent=state.tagline;
  document.getElementById('modalCulture').textContent=state.culture;
  document.getElementById('modalDish').textContent=state.dish;
  document.getElementById('modalDistricts').innerHTML=state.districts.map(d=>`<span>${d}</span>`).join('');
  document.getElementById('modalMapLink').href=`map.html?state=${encodeURIComponent(state.name)}`;
  document.getElementById('modalPlannerLink').href=`planner.html?state=${encodeURIComponent(state.name)}`;
  modal.classList.add('open');
}
window.closeStateModal=function(){document.getElementById('stateModal')?.classList.remove('open')};

function fillStateSelect(id, all = true) {
  const el = document.getElementById(id);
  if (!el) return;
  const options = SUTRA_DATA.states.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
  el.innerHTML = all ? `<option value="all">All regions</option>${options}` : options;
}

function initPlanner() {
  const state = document.getElementById('planState'); const district = document.getElementById('planDistrict'); const build = document.getElementById('buildTrip');
  if (!state || !district || !build) return; fillStateSelect('planState', false);
  const queryState = new URLSearchParams(window.location.search).get('state'); if (queryState && SUTRA_DATA.states.some(s=>s.name===queryState)) state.value=queryState;
  const updateDistricts=()=>{const s=SUTRA_DATA.states.find(x=>x.name===state.value)||SUTRA_DATA.states[0];district.innerHTML=s.districts.map(d=>`<option value="${d}">${d}</option>`).join('')}; updateDistricts(); state.addEventListener('change',updateDistricts);
  const date=document.getElementById('planDate');if(date){const now=new Date();date.value=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);}
  build.addEventListener('click',()=>{const s=SUTRA_DATA.states.find(x=>x.name===state.value)||SUTRA_DATA.states[0],d=district.value,mood=document.getElementById('planMood')?.value||'Heritage',travellers=document.getElementById('planTravellers')?.value||'2',itinerary=document.getElementById('itinerary');
    const hyderabad=s.name==='Telangana'&&d==='Hyderabad';const places=hyderabad?[
      ['09:00','Charminar','Heritage Micro-Quest + old-city architecture'],['10:30','Laad Bazaar','Local craft lane + artisan discovery'],['13:00','Local Food Experience','Deccani food story and community kitchen stop'],['16:00','Artisan Experience','Lac bangle / craft demonstration'],['18:00','Oral History Node','Listen to a verified local memory']
    ]:s.districts.slice(0,3).map((p,i)=>[`${9+i*3}:00`,p,i===0?'Heritage walk + micro-quest':i===1?'Local market + craft experience':'Food, story and slow travel']);
    itinerary.innerHTML=`<div class="trip-head"><div><p class="eyebrow">YOUR ${s.name.toUpperCase()} ROUTE</p><h2>${d} · ${mood}</h2><p class="muted">${travellers} travellers · ${date?.value||''}</p></div><span>✦</span></div><div class="route-reasons"><span>Distance</span><span>Time</span><span>Heritage diversity</span><span>Local experiences</span></div>${places.map((p,i)=>`<div class="trip-day"><div class="day-no">${String(i+1).padStart(2,'0')}</div><div><small class="eyebrow">${p[0]}</small><h3>${p[1]}</h3><p>${p[2]}</p></div></div>`).join('')}<div class="route-explain"><b>Why this route?</b><p>Route optimized using distance, time, heritage diversity and local experiences. Prototype recommendations are curated; production routing can use live road, opening-hour and crowd data.</p></div><div style="margin-top:18px"><button class="btn btn-primary" onclick="saveGeneratedTrip('${s.name.replace(/'/g,"\\'")}','${d.replace(/'/g,"\\'")}')">Save route +25 coins</button></div>`;
  });
}
function saveGeneratedTrip(state, district) {
  const result = SutraScrapbook.save({ title: `${district} Trip`, place: `${district} · ${state}`, type: 'Trip plan', symbol: '🧭' });
  if (result.added) {
    SutraJourney.add(district,state,'Trip plan','trip-planned');
    SutraWallet.add(25,'Trip itinerary created');
    toast('Trip saved to your scrapbook · +25 Sutra Coins ✦');
  } else {
    toast('This trip is already in your scrapbook.');
  }
}

function initStays() {
  fillStateSelect('stayState');
  const stateEl = document.getElementById('stayState');
  const typeEl = document.getElementById('stayType');
  const grid = document.getElementById('stayGrid');
  if (!stateEl || !typeEl || !grid) return;
  const render = () => {
    const state = stateEl.value;
    const type = typeEl.value;
    const items = SUTRA_DATA.stays.filter(x => (state === 'all' || x.state === state) && (type === 'all' || x.type === type));
    grid.innerHTML = items.map((x, i) => `<article class="stay-card"><div class="visual" style="background-image:url('${x.image}')"><span class="tag">${x.type}</span></div><div class="card-body"><h3>${x.name}</h3><p>${x.story}</p><div class="meta"><span>${x.city}, ${x.state}</span><b>${x.price}</b></div><div class="card-actions"><button class="small-btn" onclick="saveStay(${SUTRA_DATA.stays.indexOf(x)})">♡ Save</button><button class="small-btn primary" onclick="bookStay(${SUTRA_DATA.stays.indexOf(x)})">Book stay</button></div></div></article>`).join('');
  };
  render(); stateEl.addEventListener('change', render); typeEl.addEventListener('change', render);
}
function saveStay(index) {
  const x = SUTRA_DATA.stays[index];
  if (!x) return;
  const result = SutraScrapbook.save({ title: x.name, place: `${x.city} · ${x.state}`, type: 'Heritage stay', symbol: '🏨' });
  toast(result.added ? 'Saved to your scrapbook ✦' : 'Already saved in your scrapbook.');
}
function bookStay(index) {
  const x = SUTRA_DATA.stays[index];
  if (!x) return;
  if (typeof openInquiryModal !== 'function') { legacyBookStay(x); return; }
  openInquiryModal('stay', x.name, `${x.city} · ${x.state}`, () => {
    const result = SutraScrapbook.save({ title: x.name, place: `${x.city} · ${x.state}`, type: 'Heritage stay', symbol: '🏨' });
    toast(result.added ? 'Stay request confirmed · saved to scrapbook ✦' : 'Stay request confirmed · already in scrapbook.');
    SutraWallet.add(50, `Stay request: ${x.name}`);
  });
}
function legacyBookStay(x) {
  if (confirm(`Book ${x.name} in ${x.city}?`)) {
    const result = SutraScrapbook.save({ title: x.name, place: `${x.city} · ${x.state}`, type: 'Heritage stay', symbol: '🏨' });
    toast(result.added ? 'Stay request confirmed · saved to scrapbook ✦' : 'Stay request confirmed · already in scrapbook.');
    SutraWallet.add(50);
  }
}

function initFood() {
  fillStateSelect('foodState');
  const stateEl = document.getElementById('foodState');
  const searchEl = document.getElementById('foodSearch');
  const grid = document.getElementById('foodGrid');
  if (!stateEl || !searchEl || !grid) return;
  const render = () => {
    const state = stateEl.value;
    const q = searchEl.value.toLowerCase();
    const items = SUTRA_DATA.food.filter(x => (state === 'all' || x.state === state) && `${x.name} ${x.city} ${x.restaurant}`.toLowerCase().includes(q));
    grid.innerHTML = items.map(x => `<article class="food-card"><div class="visual" style="background-image:url('${x.image}')"><span class="tag">${x.state}</span></div><div class="card-body"><h3>${x.name}</h3><p>${x.story}</p><div class="meta"><span>${x.restaurant} · ${x.city}</span><b>${x.price}</b></div><div class="card-actions"><button class="small-btn primary" onclick="addFoodTrail(${SUTRA_DATA.food.indexOf(x)})">Add to food trail</button></div></div></article>`).join('');
  };
  render(); stateEl.addEventListener('change', render); searchEl.addEventListener('input', render);
}
function addFoodTrail(index) {
  const x = SUTRA_DATA.food[index];
  if (!x) return;
  const result = SutraScrapbook.save({ title: x.name, place: `${x.city} · ${x.state}`, type: 'Food trail', symbol: '🍛' });
  if (result.added) {
    SutraWallet.add(10);
    toast('Added to your food scrapbook · +10 Sutra Coins ✦');
  } else {
    toast('Already saved in your scrapbook.');
  }
}

function initEvents() {
  fillStateSelect('eventState');
  const stateEl = document.getElementById('eventState');
  const typeEl = document.getElementById('eventType');
  const grid = document.getElementById('eventGrid');
  if (!stateEl || !typeEl || !grid) return;
  const render = () => {
    const state = stateEl.value;
    const type = typeEl.value;
    const items = SUTRA_DATA.events.filter(x => (state === 'all' || x.state === state) && (type === 'all' || x.type === type));
    grid.innerHTML = items.map(x => `<article class="event-card"><div class="visual" style="background-image:url('${x.image}')"><span class="tag">${x.type}</span></div><div class="card-body"><h3>${x.name}</h3><p>${x.desc}</p><div class="meta"><span>${x.date} · ${x.city}</span><b>${x.price}</b></div><div class="card-actions"><button class="small-btn primary" onclick="bookEvent(${SUTRA_DATA.events.indexOf(x)})">Book ticket</button></div></div></article>`).join('');
  };
  render(); stateEl.addEventListener('change', render); typeEl.addEventListener('change', render);
}
function bookEvent(index) {
  const x = SUTRA_DATA.events[index];
  if (!x) return;
  if (confirm(`Book 1 ticket for ${x.name} — ${x.price}?`)) {
    const result = SutraScrapbook.save({ title: x.name, place: `${x.city} · ${x.state}`, type: 'Event ticket', symbol: '🎫' });
    toast(result.added ? 'Ticket booked and added to scrapbook! +50 Sutra Coins ✦' : 'Ticket booked! This event is already in your scrapbook.');
    SutraWallet.add(50);
  }
}

function initStore() {
  const grid = document.getElementById('offerGrid');
  if (!grid) return;
  grid.innerHTML = SUTRA_DATA.offers.map(x => `<article class="offer-card"><span class="tag">${x.cost} COINS</span><h3>${x.title}</h3><p>Prototype partner reward. Redemption creates a voucher in your Passport.</p><button class="small-btn primary" onclick="redeemOffer(${x.cost},'${x.code}','${x.title.replace(/'/g, "\\'")}')">Redeem</button></article>`).join('');
  const history=JSON.parse(localStorage.getItem(SutraWallet.historyKey())||'[]');const el=document.getElementById('coinHistory');if(el)el.innerHTML=history.slice(0,12).map(x=>`<div class="coin-history-row"><span>${x.amount>0?'+':''}${x.amount}</span><b>${x.label}</b><small>${new Date(x.date).toLocaleDateString('en-IN')}</small></div>`).join('')||'<p class="muted">No coin activity yet.</p>';
}
function redeemOffer(cost, code, title) {
  if (!SutraWallet.spend(cost,`Reward redeemed: ${title}`)) return;
  const email=(SutraAuth.user().email||'guest').toLowerCase();const key='sutra_vouchers_'+email;const arr=JSON.parse(localStorage.getItem(key)||'[]');arr.unshift({code,title,city:JSON.parse(localStorage.getItem('sutra_current_context')||'null')?.city||'India',date:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(arr));
  alert(`✓ Reward Redeemed\n\n${cost} Sutra Coins used.\nVoucher: ${code}\n\nAdded to your Passport.`);initStore();
}

function initStories() {
  const grid = document.getElementById('storyGrid');
  if (!grid) return;
  grid.innerHTML = SUTRA_DATA.stories.map(x => `<article class="story-card"><div class="story-symbol">${x.symbol}</div><p class="eyebrow">${x.place}</p><h2>${x.title}</h2><p>${x.text}</p><div class="quote">“${x.quote||'The best souvenirs are context, not objects.'}”</div><small class="tiny">Source: ${x.source||'Curated heritage content'}</small></article>`).join('');
}
function initContact() {
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', e => { e.preventDefault(); form.reset(); toast('Thank you — your story reached the SUTRA-GEO desk ✦'); });
}
