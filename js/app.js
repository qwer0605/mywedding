window.App = window.App || {};

// ── Modal system ──
App.Modal = (() => {
  const overlay = () => document.getElementById('modalOverlay');
  const box = () => document.getElementById('modalBox');

  function show({ title, content, onConfirm, confirmText = '저장', showConfirm = true, wide = false }) {
    box().innerHTML = `
      <div class="modal-head">
        <div class="modal-title">${title}</div>
        <button class="modal-close" onclick="App.Modal.hide()">✕</button>
      </div>
      <div class="modal-body">${content}</div>
      ${showConfirm ? `
        <div class="modal-foot">
          <button class="btn btn-ghost" onclick="App.Modal.hide()">취소</button>
          <button class="btn btn-primary" id="modalConfirmBtn">${confirmText}</button>
        </div>` : ''}
    `;
    box().classList.toggle('wide', wide);
    overlay().classList.add('open');
    if (onConfirm) document.getElementById('modalConfirmBtn').onclick = onConfirm;
    overlay().onclick = e => { if (e.target === overlay()) hide(); };
  }

  function hide() {
    overlay().classList.remove('open');
    box().classList.remove('wide');
    box().innerHTML = '';
  }

  return { show, hide };
})();

// ── Image viewer ──
App.showImageViewer = (src) => {
  App.Modal.show({
    title: '사진 보기',
    showConfirm: false,
    content: `<img src="${src}" style="width:100%;border-radius:12px;max-height:70vh;object-fit:contain">`
  });
};

// ── Tab navigation ──
App.showTab = (tab) => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tab + 'Screen').classList.add('active');
  document.querySelector(`.nav-tab[data-tab="${tab}"]`).classList.add('active');
  // Render on demand
  if (tab === 'home') App.Home.render();
  if (tab === 'timeline') App.Timeline.render();
  if (tab === 'vendor') App.Vendor.render();
  if (tab === 'photos') App.Photos.render();
  if (tab === 'budget') App.Budget.render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ── Setup modal ──
App.showSetup = () => {
  const s = App.Data.get().settings;
  App.Modal.show({
    title: '💍 결혼 정보 설정',
    content: `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">신랑 이름</label>
          <input class="form-input" id="sGroom" value="${esc(s.groomName)}" placeholder="신랑">
        </div>
        <div class="form-group">
          <label class="form-label">신부 이름</label>
          <input class="form-input" id="sBride" value="${esc(s.brideName)}" placeholder="신부">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">결혼 날짜 *</label>
          <input class="form-input" type="date" id="sDate" value="${s.weddingDate || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">예식 시간</label>
          <input class="form-input" type="time" id="sTime" value="${s.weddingTime || ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">예식장 (선택)</label>
        <input class="form-input" id="sVenue" value="${esc(s.venue)}" placeholder="예: 그랜드 웨딩홀">
      </div>`,
    confirmText: '저장',
    onConfirm: () => {
      const date = document.getElementById('sDate').value;
      if (!date) { alert('결혼 날짜를 선택해주세요.'); return; }
      App.Data.saveSettings({
        groomName: document.getElementById('sGroom').value.trim(),
        brideName: document.getElementById('sBride').value.trim(),
        weddingDate: date,
        weddingTime: document.getElementById('sTime').value,
        venue: document.getElementById('sVenue').value.trim()
      });
      App.Modal.hide();
      document.getElementById('setupOverlay').classList.remove('open');
      App.Home.render();
    }
  });
};

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Data save hook: 저장할 때마다 클라우드도 자동 동기화 ──
const _origSave = App.Data.save.bind(App.Data);
App.Data.save = function() { _origSave(); App.Auth.scheduleSync(); };

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  App.Data.load();
  App.Auth.init();   // Firebase 초기화 (설정 없으면 무시됨)

  const { weddingDate } = App.Data.get().settings;
  if (!weddingDate) {
    document.getElementById('setupOverlay').classList.add('open');
    document.getElementById('setupStartBtn').onclick = () => {
      document.getElementById('setupOverlay').classList.remove('open');
      App.showSetup();
    };
  }

  App.Home.render();
});
