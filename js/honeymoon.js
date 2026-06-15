window.App = window.App || {};

App.Honeymoon = (() => {
  function render() {
    const h = App.Data.getHoneymoon();
    const costTotal = App.Data.getHoneymoonCostTotal();

    document.getElementById('honeymoonScreen').innerHTML = `
      <div class="page-header">
        <div class="page-title">신혼여행</div>
        <button class="btn btn-ghost btn-sm" onclick="App.Honeymoon.openEditInfo()">✏️ 편집</button>
      </div>

      <div class="card mb-20">
        <div class="modal-info-row">
          <div class="modal-info-item"><div class="modal-info-label">여행지</div><div class="modal-info-value">${App.Util.esc(h.destination) || '—'}</div></div>
          <div class="modal-info-item"><div class="modal-info-label">기간</div><div class="modal-info-value">${h.startDate || '—'} ~ ${h.endDate || '—'}</div></div>
        </div>
        ${h.memo ? `<div class="modal-memo" style="margin-top:12px">${App.Util.esc(h.memo)}</div>` : ''}
      </div>

      <div class="section-label">
        📅 일정
        <button class="btn btn-outline btn-sm" onclick="App.Honeymoon.openAddItem()">+ 일정 추가</button>
      </div>
      <div id="honeymoonItems" class="mb-20">${renderItems(h)}</div>

      <div class="section-label">
        💰 경비
        <button class="btn btn-outline btn-sm" onclick="App.Honeymoon.openAddCost()">+ 항목 추가</button>
      </div>
      <div id="honeymoonCosts">${renderCosts(h, costTotal)}</div>
    `;
  }

  function renderItems(h) {
    const items = [...(h.items || [])].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
    if (items.length === 0) {
      return `<div class="cost-empty">등록된 일정이 없습니다. + 일정 추가를 눌러 입력하세요.</div>`;
    }
    return `
      <table class="cost-table">
        <thead>
          <tr><th>제목</th><th>날짜</th><th>메모</th><th style="width:60px"></th></tr>
        </thead>
        <tbody>
          ${items.map(i => `
            <tr class="cost-row">
              <td><strong>${App.Util.esc(i.title)}</strong></td>
              <td>${App.Util.esc(i.date) || '—'}</td>
              <td style="font-size:12px;color:var(--text-sub)">${App.Util.esc(i.memo)}</td>
              <td style="display:flex;gap:2px">
                <button class="task-btn" onclick="App.Honeymoon.openEditItem('${i.id}')">✏️</button>
                <button class="task-btn" onclick="App.Honeymoon.removeItem('${i.id}')">🗑️</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  function renderCosts(h, total) {
    const items = h.costItems || [];
    if (items.length === 0) {
      return `<div class="cost-empty">등록된 경비가 없습니다. + 항목 추가를 눌러 입력하세요.</div>`;
    }
    return `
      <table class="cost-table">
        <thead>
          <tr><th>항목</th><th style="text-align:right">금액</th><th>메모</th><th style="width:60px"></th></tr>
        </thead>
        <tbody>
          ${items.map(ci => `
            <tr class="cost-row">
              <td><strong>${App.Util.esc(ci.name)}</strong></td>
              <td style="text-align:right;font-weight:600">${App.Util.fmtWon(ci.amount)}</td>
              <td style="font-size:12px;color:var(--text-sub)">${App.Util.esc(ci.memo)}</td>
              <td style="display:flex;gap:2px">
                <button class="task-btn" onclick="App.Honeymoon.openEditCost('${ci.id}')">✏️</button>
                <button class="task-btn" onclick="App.Honeymoon.removeCost('${ci.id}')">🗑️</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div class="cost-summary">
        <div class="cost-summary-total">
          <span>전체 합계</span>
          <span>${App.Util.fmtWon(total)}</span>
        </div>
      </div>`;
  }

  function refreshItems() {
    const el = document.getElementById('honeymoonItems');
    if (el) el.innerHTML = renderItems(App.Data.getHoneymoon());
  }

  function refreshCosts() {
    const el = document.getElementById('honeymoonCosts');
    if (el) el.innerHTML = renderCosts(App.Data.getHoneymoon(), App.Data.getHoneymoonCostTotal());
  }

  // ── 기본 정보 ──
  function openEditInfo() {
    const h = App.Data.getHoneymoon();
    App.Modal.show({
      title: '신혼여행 정보 편집',
      content: `
        <div class="form-group">
          <label class="form-label">여행지</label>
          <input class="form-input" id="hDestination" value="${App.Util.esc(h.destination)}" placeholder="예: 몰디브">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">출발일</label>
            <input class="form-input" type="date" id="hStart" value="${h.startDate || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">귀국일</label>
            <input class="form-input" type="date" id="hEnd" value="${h.endDate || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">메모</label>
          <textarea class="form-input" id="hMemo" rows="3" placeholder="항공편, 호텔 정보 등...">${App.Util.esc(h.memo)}</textarea>
        </div>`,
      confirmText: '저장',
      onConfirm: () => {
        App.Data.updateHoneymoonInfo({
          destination: document.getElementById('hDestination').value.trim(),
          startDate: document.getElementById('hStart').value,
          endDate: document.getElementById('hEnd').value,
          memo: document.getElementById('hMemo').value.trim()
        });
        App.Modal.hide(); render();
      }
    });
  }

  // ── 일정 ──
  function openAddItem() {
    App.Modal.show({
      title: '일정 추가',
      content: itemForm(),
      confirmText: '추가',
      onConfirm: () => {
        const item = readItemForm(); if (!item) return;
        App.Data.addHoneymoonItem(item);
        App.Modal.hide(); refreshItems();
      }
    });
  }

  function openEditItem(id) {
    const i = (App.Data.getHoneymoon().items || []).find(i => i.id === id);
    if (!i) return;
    App.Modal.show({
      title: '일정 편집',
      content: itemForm(i),
      confirmText: '저장',
      onConfirm: () => {
        const item = readItemForm(); if (!item) return;
        App.Data.updateHoneymoonItem(id, item);
        App.Modal.hide(); refreshItems();
      }
    });
  }

  function removeItem(id) {
    if (!confirm('이 일정을 삭제하시겠어요?')) return;
    App.Data.deleteHoneymoonItem(id); refreshItems();
  }

  function itemForm(i) {
    return `
      <div class="form-group">
        <label class="form-label">제목 *</label>
        <input class="form-input" id="hiTitle" value="${App.Util.esc(i?.title || '')}" placeholder="예: 호텔 체크인, 스노클링 투어">
      </div>
      <div class="form-group">
        <label class="form-label">날짜</label>
        <input class="form-input" type="date" id="hiDate" value="${i?.date || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">메모 (선택)</label>
        <input class="form-input" id="hiMemo" value="${App.Util.esc(i?.memo || '')}" placeholder="예: 오후 3시, 예약번호 등">
      </div>`;
  }

  function readItemForm() {
    const title = document.getElementById('hiTitle').value.trim();
    if (!title) { alert('제목을 입력해주세요.'); return null; }
    return {
      title,
      date: document.getElementById('hiDate').value,
      memo: document.getElementById('hiMemo').value.trim()
    };
  }

  // ── 경비 ──
  function openAddCost() {
    App.Modal.show({
      title: '경비 항목 추가',
      content: costForm(),
      confirmText: '추가',
      onConfirm: () => {
        const item = readCostForm(); if (!item) return;
        App.Data.addHoneymoonCost(item);
        App.Modal.hide(); refreshCosts();
      }
    });
  }

  function openEditCost(id) {
    const ci = (App.Data.getHoneymoon().costItems || []).find(i => i.id === id);
    if (!ci) return;
    App.Modal.show({
      title: '경비 항목 편집',
      content: costForm(ci),
      confirmText: '저장',
      onConfirm: () => {
        const item = readCostForm(); if (!item) return;
        App.Data.updateHoneymoonCost(id, item);
        App.Modal.hide(); refreshCosts();
      }
    });
  }

  function removeCost(id) {
    if (!confirm('이 항목을 삭제하시겠어요?')) return;
    App.Data.deleteHoneymoonCost(id); refreshCosts();
  }

  function costForm(ci) {
    return `
      <div class="form-group">
        <label class="form-label">항목 이름 *</label>
        <input class="form-input" id="hcName" value="${App.Util.esc(ci?.name || '')}" placeholder="예: 항공권, 숙박, 현지 경비">
      </div>
      <div class="form-group">
        <label class="form-label">금액 (원)</label>
        <input class="form-input" type="text" inputmode="numeric" id="hcAmount" value="${ci?.amount ? Number(ci.amount).toLocaleString('ko-KR') : ''}" placeholder="예: 1,500,000" oninput="App.Util.formatNumberInput(this)">
      </div>
      <div class="form-group">
        <label class="form-label">메모 (선택)</label>
        <input class="form-input" id="hcMemo" value="${App.Util.esc(ci?.memo || '')}" placeholder="예: 2인 기준">
      </div>`;
  }

  function readCostForm() {
    const name = document.getElementById('hcName').value.trim();
    if (!name) { alert('항목 이름을 입력해주세요.'); return null; }
    return {
      name,
      amount: App.Util.parseNumberInput('hcAmount'),
      memo: document.getElementById('hcMemo').value.trim()
    };
  }

  return {
    render, openEditInfo,
    openAddItem, openEditItem, removeItem,
    openAddCost, openEditCost, removeCost
  };
})();
