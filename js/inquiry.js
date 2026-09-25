// SUTRA-GEO booking/experience inquiry capture
// Lightweight lead-capture step in front of the existing prototype "booking"
// simulation (SutraScrapbook.save + coin reward). Stores inquiries locally
// so a demo can show "My bookings" on the profile page. Production would
// send this to a real booking/CRM backend instead of localStorage.

function ensureInquiryModal() {
  if (document.getElementById('inquiryBackdrop')) return;
  const el = document.createElement('div');
  el.id = 'inquiryBackdrop';
  el.className = 'inquiry-backdrop';
  el.innerHTML = `<div class="inquiry-card">
    <p class="eyebrow">CONFIRM YOUR REQUEST</p>
    <h3 id="inquiryTitle">Experience</h3>
    <p class="muted" id="inquirySubtitle"></p>
    <form id="inquiryForm" class="stack-form">
      <label>Your name<input id="inquiryName" required placeholder="Full name"></label>
      <label>Phone or email<input id="inquiryContact" required placeholder="For confirmation only"></label>
      <label>Preferred date<input id="inquiryDate" type="date"></label>
      <div class="inquiry-actions">
        <button type="button" class="btn btn-ghost" id="inquiryCancel">Cancel</button>
        <button type="submit" class="btn btn-primary full">Confirm request</button>
      </div>
    </form>
    <p class="tiny">Prototype only: this saves a local request record. No real booking or payment is made.</p>
  </div>`;
  document.body.appendChild(el);
  document.getElementById('inquiryCancel').addEventListener('click', closeInquiryModal);
  el.addEventListener('click', (e) => { if (e.target === el) closeInquiryModal(); });
}
function closeInquiryModal() {
  const el = document.getElementById('inquiryBackdrop');
  if (el) el.classList.remove('open');
}
function saveInquiry(record) {
  const email = (window.SutraAuth ? SutraAuth.user().email : 'guest') || 'guest';
  const key = 'sutra_inquiries_' + email.toLowerCase();
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.unshift({ id: `inq-${Date.now()}`, ...record, created: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
}
function getInquiries() {
  const email = (window.SutraAuth ? SutraAuth.user().email : 'guest') || 'guest';
  try { return JSON.parse(localStorage.getItem('sutra_inquiries_' + email.toLowerCase()) || '[]'); } catch (e) { return []; }
}
// type: 'stay' | 'experience'. onConfirm receives {name, contact, date} and
// should perform the existing prototype scrapbook/coin reward logic.
function openInquiryModal(type, title, place, onConfirm) {
  ensureInquiryModal();
  document.getElementById('inquiryTitle').textContent = title;
  document.getElementById('inquirySubtitle').textContent = place || '';
  const backdrop = document.getElementById('inquiryBackdrop');
  const form = document.getElementById('inquiryForm');
  backdrop.classList.add('open');
  const handler = (e) => {
    e.preventDefault();
    const record = {
      type, title, place,
      name: document.getElementById('inquiryName').value.trim(),
      contact: document.getElementById('inquiryContact').value.trim(),
      date: document.getElementById('inquiryDate').value || ''
    };
    saveInquiry(record);
    closeInquiryModal();
    form.removeEventListener('submit', handler);
    if (typeof onConfirm === 'function') onConfirm(record);
  };
  form.addEventListener('submit', handler);
}
window.openInquiryModal = openInquiryModal;
window.getInquiries = getInquiries;
