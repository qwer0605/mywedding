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
  if (tab === 'guests') App.Guests.render();
  if (tab === 'photos') App.Photos.render();
  if (tab === 'budget') App.Budget.render();
  if (tab === 'honeymoon') App.Honeymoon.render();
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

// ── 설정 모달 (정보 수정 + 데이터 백업) ──
App.showSettings = () => {
  App.Modal.show({
    title: '⚙️ 설정',
    showConfirm: false,
    content: `
      <div class="form-group">
        <button class="btn btn-outline" style="width:100%" onclick="App.Modal.hide(); App.showSetup();">💍 결혼 정보 수정</button>
      </div>
      <div class="modal-section">
        <div class="modal-section-title">데이터 백업</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline btn-sm" style="flex:1" onclick="App.exportBackup()">⬇️ 내보내기 (JSON)</button>
          <button class="btn btn-outline btn-sm" style="flex:1" onclick="document.getElementById('backupFileInput').click()">⬆️ 가져오기</button>
          <input type="file" id="backupFileInput" accept=".json" style="display:none" onchange="App.importBackup(this)">
        </div>
        <div style="font-size:12px;color:var(--text-sub);margin-top:8px">전체 데이터를 JSON 파일로 저장하거나, 백업 파일에서 복원할 수 있어요.</div>
      </div>
      <div style="text-align:right;margin-top:12px">
        <button class="btn btn-ghost" onclick="App.Modal.hide()">닫기</button>
      </div>`
  });
};

App.exportBackup = () => {
  const data = App.Data.exportBackup();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `mywedding_backup_${today}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

App.importBackup = (input) => {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!confirm('현재 데이터를 백업 파일의 내용으로 덮어씁니다. 계속하시겠어요?')) { input.value = ''; return; }
      App.Data.importBackup(data);
      App.Modal.hide();
      location.reload();
    } catch {
      alert('올바른 백업 파일이 아닙니다.');
    }
  };
  reader.readAsText(file);
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
