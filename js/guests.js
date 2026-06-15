window.App = window.App || {};

App.Guests = (() => {
  const RSVP_MAP = {
    pending:   { label: '미정',  cls: 'g-pending' },
    attending: { label: '참석',  cls: 'g-attending' },
    absent:    { label: '불참',  cls: 'g-absent' }
  };
  const SIDE_MAP = {
    groom: { label: '신랑측', cls: 'g-side-groom' },
    bride: { label: '신부측', cls: 'g-side-bride' }
  };
  let activeSide = '전체';

  function render() {
    const guests = App.Data.getGuests();
    const summary = App.Data.getGuestSummary();
    const filtered = activeSide === '전체' ? guests : guests.filter(g => g.side === activeSide);

    document.getElementById('guestsScreen').innerHTML = `
      <div class="page-header">
        <div class="page-title">하객 관리</div>
        <button class="btn btn-primary btn-sm" onclick="App.Guests.openAdd()">+ 하객 추가</button>
      </div>

      <div class="budget-summary">
        <div class="budget-stat">
          <div class="stat-label">총 하객</div>
          <div class="stat-value v-total">${summary.total}명</div>
        </div>
        <div class="budget-stat">
          <div class="stat-label">참석 확정</div>
          <div class="stat-value v-remain">${summary.attending}명</div>
          <div class="stat-unit">미정 ${summary.pending} · 불참 ${summary.absent}</div>
        </div>
        <div class="budget-stat">
          <div class="stat-label">축의금 합계</div>
          <div class="stat-value v-spent">${App.Util.fmtWon(summary.giftTotal)}</div>
        </div>
      </div>

      <div class="cat-tabs">
        <button class="cat-tab ${activeSide === '전체' ? 'active' : ''}" onclick="App.Guests.setSide('전체')">전체</button>
        <button class="cat-tab ${activeSide === 'groom' ? 'active' : ''}" onclick="App.Guests.setSide('groom')">신랑측</button>
        <button class="cat-tab ${activeSide === 'bride' ? 'active' : ''}" onclick="App.Guests.setSide('bride')">신부측</button>
      </div>

      ${filtered.length === 0
        ? `<div class="cost-empty">하객이 없습니다. + 하객 추가를 눌러 등록하세요.</div>`
        : `<table class="cost-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>구분</th>
                <th>RSVP</th>
                <th>테이블</th>
                <th style="text-align:right">축의금</th>
                <th>메모</th>
                <th style="width:60px"></th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(g => {
                const side = SIDE_MAP[g.side] || SIDE_MAP.groom;
                const rsvp = RSVP_MAP[g.rsvp] || RSVP_MAP.pending;
                return `
                  <tr class="cost-row">
                    <td><strong>${App.Util.esc(g.name)}</strong></td>
                    <td><span class="vendor-status ${side.cls}">${side.label}</span></td>
                    <td><span class="vendor-status ${rsvp.cls}">${rsvp.label}</span></td>
                    <td>${App.Util.esc(g.tableNo) || '—'}</td>
                    <td style="text-align:right;font-weight:600">${g.gift ? App.Util.fmtWon(g.gift) : '—'}</td>
                    <td style="font-size:12px;color:var(--text-sub)">${App.Util.esc(g.memo)}</td>
                    <td style="display:flex;gap:2px">
                      <button class="task-btn" onclick="App.Guests.openEdit('${g.id}')">✏️</button>
                      <button class="task-btn" onclick="App.Guests.removeGuest('${g.id}')">🗑️</button>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>`}
    `;
  }

  function setSide(side) { activeSide = side; render(); }

  function openAdd() {
    App.Modal.show({
      title: '하객 추가',
      content: guestForm(),
      confirmText: '추가',
      onConfirm: () => {
        const g = readGuestForm(); if (!g) return;
        App.Data.addGuest(g);
        App.Modal.hide(); render(); App.Home.render();
      }
    });
  }

  function openEdit(id) {
    const g = App.Data.getGuests().find(g => g.id === id);
    if (!g) return;
    App.Modal.show({
      title: '하객 편집',
      content: guestForm(g),
      confirmText: '저장',
      onConfirm: () => {
        const u = readGuestForm(); if (!u) return;
        App.Data.updateGuest(id, u);
        App.Modal.hide(); render(); App.Home.render();
      }
    });
  }

  function removeGuest(id) {
    const g = App.Data.getGuests().find(g => g.id === id);
    if (!confirm(`"${g?.name}" 님을 삭제하시겠어요?`)) return;
    App.Data.deleteGuest(id); render(); App.Home.render();
  }

  function guestForm(g) {
    return `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">이름 *</label>
          <input class="form-input" id="gName" value="${App.Util.esc(g?.name || '')}" placeholder="예: 홍길동">
        </div>
        <div class="form-group">
          <label class="form-label">구분</label>
          <select class="form-input" id="gSide">
            <option value="groom" ${!g || g.side === 'groom' ? 'selected' : ''}>신랑측</option>
            <option value="bride" ${g && g.side === 'bride' ? 'selected' : ''}>신부측</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">RSVP</label>
          <select class="form-input" id="gRsvp">
            <option value="pending"   ${!g || g.rsvp === 'pending'   ? 'selected' : ''}>미정</option>
            <option value="attending" ${g && g.rsvp === 'attending' ? 'selected' : ''}>참석</option>
            <option value="absent"    ${g && g.rsvp === 'absent'    ? 'selected' : ''}>불참</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">테이블 번호</label>
          <input class="form-input" id="gTable" value="${App.Util.esc(g?.tableNo || '')}" placeholder="예: 5">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">축의금 (원)</label>
        <input class="form-input" type="text" inputmode="numeric" id="gGift" value="${g?.gift ? Number(g.gift).toLocaleString('ko-KR') : ''}" placeholder="예: 100,000" oninput="App.Util.formatNumberInput(this)">
      </div>
      <div class="form-group">
        <label class="form-label">메모 (선택)</label>
        <input class="form-input" id="gMemo" value="${App.Util.esc(g?.memo || '')}" placeholder="예: 직장 동료, 가족 등">
      </div>`;
  }

  function readGuestForm() {
    const name = document.getElementById('gName').value.trim();
    if (!name) { alert('이름을 입력해주세요.'); return null; }
    return {
      name,
      side: document.getElementById('gSide').value,
      rsvp: document.getElementById('gRsvp').value,
      tableNo: document.getElementById('gTable').value.trim(),
      gift: App.Util.parseNumberInput('gGift'),
      memo: document.getElementById('gMemo').value.trim()
    };
  }

  return { render, setSide, openAdd, openEdit, removeGuest };
})();
