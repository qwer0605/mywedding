window.App = window.App || {};

App.Vendor = (() => {
  const STATUS_MAP = {
    review:  { label: '🔍 검토중',   cls: 's-review' },
    done:    { label: '✓ 계약완료', cls: 's-done' },
    contact: { label: '📞 상담예정', cls: 's-contact' }
  };
  let activeCat = '전체';
  let activeStatus = '전체';

  function getCategories() { return ['전체', ...App.Data.getVendorCategories()]; }

  function render() {
    const vendors = App.Data.getVendors();
    const cats = getCategories();
    // activeCat이 삭제된 경우 '전체'로 초기화
    if (!cats.includes(activeCat)) activeCat = '전체';

    const catFiltered = activeCat === '전체' ? vendors : vendors.filter(v => v.category === activeCat);
    const filtered = activeStatus === '전체' ? catFiltered : catFiltered.filter(v => (v.status || 'review') === activeStatus);
    const sameCat = activeCat !== '전체' && catFiltered.length >= 2;

    const counts = { review: 0, contact: 0, done: 0 };
    catFiltered.forEach(v => { counts[v.status || 'review']++; });

    document.getElementById('vendorScreen').innerHTML = `
      <div class="page-header">
        <div class="page-title">업체 관리</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" onclick="App.Vendor.openManageCategories()">⚙️ 카테고리</button>
          <button class="btn btn-primary btn-sm" onclick="App.Vendor.openAdd()">+ 업체 추가</button>
        </div>
      </div>

      ${renderCategoryOverview(vendors, cats)}

      <div class="cat-tabs">
        ${cats.map(c => `<button class="cat-tab ${c === activeCat ? 'active' : ''}" onclick="App.Vendor.setCategory('${esc(c)}')">${esc(c)}</button>`).join('')}
      </div>

      <div class="cat-tabs">
        <button class="cat-tab ${activeStatus === '전체' ? 'active' : ''}" onclick="App.Vendor.setStatus('전체')">전체 상태 <span class="cat-tab-count">${catFiltered.length}</span></button>
        <button class="cat-tab ${activeStatus === 'review' ? 'active' : ''}" onclick="App.Vendor.setStatus('review')">🔍 검토중 <span class="cat-tab-count">${counts.review}</span></button>
        <button class="cat-tab ${activeStatus === 'contact' ? 'active' : ''}" onclick="App.Vendor.setStatus('contact')">📞 상담예정 <span class="cat-tab-count">${counts.contact}</span></button>
        <button class="cat-tab ${activeStatus === 'done' ? 'active' : ''}" onclick="App.Vendor.setStatus('done')">✓ 계약완료 <span class="cat-tab-count">${counts.done}</span></button>
      </div>

      ${sameCat ? renderCompare(catFiltered) : ''}

      <div class="section-label">
        ${activeCat === '전체' ? '전체 업체 목록' : esc(activeCat) + ' 목록'}
        <span style="font-size:13px;color:var(--text-sub);font-weight:400">${filtered.length}곳</span>
      </div>
      ${activeStatus === '전체' ? renderGroupedVendors(filtered) : renderVendorGrid(filtered, true)}
    `;
  }

  // 상태 필터가 '전체'일 때: 확정 → 검토중 → 상담중 → 계약완료 순으로 그룹 표시
  const STATUS_GROUPS = [
    { label: '⭐ 확정',    match: v => v.confirmed },
    { label: '🔍 검토중',  match: v => !v.confirmed && (v.status || 'review') === 'review' },
    { label: '📞 상담중',  match: v => !v.confirmed && v.status === 'contact' },
    { label: '✓ 계약완료', match: v => !v.confirmed && v.status === 'done' },
  ];

  function renderGroupedVendors(vendors) {
    const groups = STATUS_GROUPS.map(g => ({ label: g.label, list: vendors.filter(g.match) }))
      .filter(g => g.list.length > 0);

    return `
      ${groups.map(g => `
        <div class="vendor-group-label">${g.label} <span class="cat-tab-count">${g.list.length}</span></div>
        ${renderVendorGrid(g.list)}`).join('')}
      ${renderVendorGrid([], true)}`;
  }

  function renderVendorGrid(vendors, showAddBtn) {
    return `
      <div class="vendor-grid">
        ${vendors.map(v => renderCard(v)).join('')}
        ${showAddBtn ? `<button class="add-vendor-btn" onclick="App.Vendor.openAdd()">
          <span style="font-size:28px">＋</span>업체 추가
        </button>` : ''}
      </div>`;
  }

  function renderCategoryOverview(vendors, cats) {
    const realCats = cats.filter(c => c !== '전체');
    if (realCats.length === 0) return '';

    return `
      <div class="card mb-20">
        <div class="card-label">카테고리별 확정 현황</div>
        <div class="confirm-overview">
          ${realCats.map(c => {
            const list = vendors.filter(v => v.category === c);
            const confirmed = list.find(v => v.confirmed);
            return `
              <div class="confirm-overview-row" onclick="App.Vendor.setCategory('${esc(c)}')">
                <span class="confirm-overview-cat">${esc(c)}</span>
                ${confirmed
                  ? `<span class="confirm-overview-vendor">⭐ ${esc(confirmed.name)}</span>`
                  : list.length > 0
                    ? `<span class="confirm-overview-pending">미확정 · ${list.length}곳 검토중</span>`
                    : `<span class="confirm-overview-empty">미등록</span>`}
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function renderCompare(vendors) {
    const fields = [
      { key: 'price', label: '견적/금액' },
      { key: 'consultDate', label: '상담일' },
      { key: 'contact', label: '연락처' },
    ];
    return `
      <div class="compare-wrap mb-28">
        <div class="section-label" style="padding:16px 16px 0">
          ${esc(activeCat)} 견적 비교
          <span style="font-size:13px;color:var(--text-sub);font-weight:400">${vendors.length}곳</span>
        </div>
        <table class="compare-table">
          <thead>
            <tr>
              <th style="width:110px">항목</th>
              ${vendors.map(v => `<th>${esc(v.name)}${v.confirmed ? ' <span class="rec">확정</span>' : v.status === 'done' ? ' <span class="rec">계약</span>' : ''}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${fields.map(f => `
              <tr>
                <td class="row-label">${f.label}</td>
                ${vendors.map(v => `<td>${esc(v[f.key]) || '—'}</td>`).join('')}
              </tr>`).join('')}
            <tr>
              <td class="row-label">메모</td>
              ${vendors.map(v => `<td style="font-size:12px;color:var(--text-sub)">${esc(v.memo) || '—'}</td>`).join('')}
            </tr>
            <tr>
              <td class="row-label">상태</td>
              ${vendors.map(v => {
                const s = STATUS_MAP[v.status] || STATUS_MAP.review;
                return `<td><span class="vendor-status ${s.cls}">${s.label}</span></td>`;
              }).join('')}
            </tr>
          </tbody>
        </table>
      </div>`;
  }

  function calcCostTotal(v) {
    const items = v.costItems || [];
    return items.reduce((sum, i) => sum + (i.amount || 0), 0);
  }

  function fmtWon(n) {
    if (!n) return '—';
    if (n >= 100000000) return (n / 100000000).toFixed(n % 100000000 ? 1 : 0) + '억 원';
    if (n >= 10000) return Math.round(n / 10000).toLocaleString() + '만 원';
    return n.toLocaleString() + '원';
  }

  function renderCard(v) {
    const s = STATUS_MAP[v.status] || STATUS_MAP.review;
    const allPhotos = [...(v.portfolio || []), ...(v.docs || [])];
    const thumbs = allPhotos.slice(0, 3);
    const costItems = v.costItems || [];
    const total = calcCostTotal(v);
    const includedTotal = costItems.filter(i => i.type === 'included').reduce((s, i) => s + i.amount, 0);

    // 비용 항목이 있으면 합산, 없으면 텍스트 가격 표시
    const priceDisplay = costItems.length > 0
      ? `<div class="vendor-price">${fmtWon(total)}
           <span style="font-size:12px;font-weight:400;color:var(--text-sub)">
             (포함 ${fmtWon(includedTotal)} · ${costItems.length}개 항목)
           </span>
         </div>`
      : `<div class="vendor-price">${esc(v.price) || '<span style="color:var(--text-sub);font-size:14px;font-weight:400">금액 미입력</span>'}</div>`;

    // 일정 목록 (등록된 모든 일정을 날짜순으로 표시)
    const schedules = [...(v.schedules || [])].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
    const scheduleHTML = schedules.length > 0
      ? `<div class="vendor-schedule-list">${schedules.map(si => `
          <div class="vendor-schedule-item"><span>📅 ${esc(si.name)}</span><span>${esc(si.date) || '날짜 미정'}</span></div>`).join('')}</div>`
      : (v.consultDate ? `<div class="vendor-schedule-item"><span>📅 상담일</span><span>${esc(v.consultDate)}</span></div>` : '');

    return `
      <div class="vendor-card ${v.confirmed ? 'confirmed' : ''}" onclick="App.Vendor.openDetail('${v.id}')">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px">
          <div class="vendor-cat">${esc(v.category)}</div>
          <div style="display:flex;gap:4px;align-items:center">
            <span class="vendor-status ${s.cls}">${s.label}</span>
            <button class="confirm-star ${v.confirmed ? 'active' : ''}" onclick="event.stopPropagation();App.Vendor.toggleConfirmed('${v.id}')" title="${v.confirmed ? '확정 해제' : '이 업체로 확정'}">⭐</button>
          </div>
        </div>
        <div class="vendor-name">${esc(v.name)}${v.confirmed ? ' <span class="confirm-badge">확정</span>' : ''}</div>
        ${priceDisplay}
        <div class="vendor-tags">${(v.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div style="font-size:12px;color:var(--text-sub);margin-bottom:2px">
          ${v.contact ? '📞 ' + esc(v.contact) : ''}
        </div>
        ${scheduleHTML}
        <div class="vendor-photo-strip">
          <div class="vendor-photo-strip-label">
            사진·서류
            <span>${allPhotos.length > 0 ? allPhotos.length + '장' : ''}</span>
          </div>
          <div class="vendor-photo-row">
            ${thumbs.map(p => `
              <div class="vendor-thumb" onclick="event.stopPropagation();App.showImageViewer('${p.data}')">
                <img src="${p.data}" style="width:100%;height:100%;object-fit:cover" onerror="App.markImgBroken(this)">
              </div>`).join('')}
            <label class="vendor-thumb-add" onclick="event.stopPropagation()" title="사진 추가">
              ＋
              <input type="file" accept="image/*" multiple style="display:none"
                onchange="App.Vendor.quickUpload('${v.id}', this)">
            </label>
          </div>
        </div>
      </div>`;
  }

  function setCategory(cat) { activeCat = cat; render(); }
  function setStatus(status) { activeStatus = status; render(); }

  function toggleConfirmed(vendorId) {
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    if (!v) return;
    App.Data.setVendorConfirmed(vendorId, !v.confirmed);
    render();
  }

  // ── 카테고리 관리 모달 ──
  function openManageCategories() {
    function catListHTML() {
      const cats = App.Data.getVendorCategories();
      return cats.map((c, i) => `
        <div class="cat-manage-row" id="catrow-${i}">
          <span class="cat-manage-name">${esc(c)}</span>
          <div style="display:flex;gap:4px">
            <button class="task-btn" onclick="App.Vendor.promptRenameCategory(${i})">✏️</button>
            <button class="task-btn" onclick="App.Vendor.promptDeleteCategory(${i})" ${cats.length <= 1 ? 'disabled' : ''}>🗑️</button>
          </div>
        </div>`).join('');
    }

    App.Modal.show({
      title: '⚙️ 카테고리 관리',
      showConfirm: false,
      content: `
        <div id="catManageList" style="margin-bottom:16px">${catListHTML()}</div>
        <div style="display:flex;gap:8px">
          <input class="form-input" id="newCatInput" placeholder="새 카테고리 이름" style="flex:1">
          <button class="btn btn-primary btn-sm" onclick="App.Vendor.addCategory()">추가</button>
        </div>
        <div style="margin-top:16px;text-align:right">
          <button class="btn btn-ghost" onclick="App.Modal.hide()">닫기</button>
        </div>`
    });
  }

  function refreshCatManageList() {
    const el = document.getElementById('catManageList');
    if (!el) return;
    const cats = App.Data.getVendorCategories();
    el.innerHTML = cats.map((c, i) => `
      <div class="cat-manage-row" id="catrow-${i}">
        <span class="cat-manage-name">${esc(c)}</span>
        <div style="display:flex;gap:4px">
          <button class="task-btn" onclick="App.Vendor.promptRenameCategory(${i})">✏️</button>
          <button class="task-btn" onclick="App.Vendor.promptDeleteCategory(${i})" ${cats.length <= 1 ? 'disabled' : ''}>🗑️</button>
        </div>
      </div>`).join('');
  }

  function addCategory() {
    const input = document.getElementById('newCatInput');
    const name = input ? input.value.trim() : '';
    if (!name) { alert('카테고리 이름을 입력해주세요.'); return; }
    if (App.Data.getVendorCategories().includes(name)) { alert('이미 존재하는 카테고리입니다.'); return; }
    App.Data.addVendorCategory(name);
    if (input) input.value = '';
    refreshCatManageList();
    render();
  }

  function promptRenameCategory(idx) {
    const cats = App.Data.getVendorCategories();
    const oldName = cats[idx];
    const newName = prompt(`카테고리 이름 변경\n현재: "${oldName}"`, oldName);
    if (!newName || newName.trim() === oldName) return;
    if (cats.includes(newName.trim())) { alert('이미 존재하는 카테고리입니다.'); return; }
    App.Data.renameVendorCategory(oldName, newName.trim());
    refreshCatManageList();
    render();
  }

  function promptDeleteCategory(idx) {
    const cats = App.Data.getVendorCategories();
    const name = cats[idx];
    if (!confirm(`"${name}" 카테고리를 삭제하시겠어요?\n해당 업체들은 '기타'로 이동됩니다.`)) return;
    App.Data.deleteVendorCategory(name);
    refreshCatManageList();
    render();
  }

  // ── 업체 추가/편집 ──
  function openAdd() {
    App.Modal.show({
      title: '업체 추가',
      content: vendorForm(),
      confirmText: '추가',
      onConfirm: () => {
        const v = readVendorForm(); if (!v) return;
        App.Data.addVendor(v);
        App.Modal.hide(); render();
      }
    });
  }

  // ── 업체 상세 ──
  function openDetail(vendorId) {
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    if (!v) return;
    const s = STATUS_MAP[v.status] || STATUS_MAP.review;

    App.Modal.show({
      title: v.name,
      showConfirm: false,
      content: `
        <div style="margin-bottom:12px">
          <span style="font-size:12px;color:var(--text-sub)">${esc(v.category)}</span>
          <span class="vendor-status ${s.cls}" style="margin-left:8px">${s.label}</span>
        </div>

        <div class="modal-section">
          <div class="modal-section-title">
            기본 정보
            <button class="btn btn-ghost btn-sm" onclick="App.Vendor.openEdit('${v.id}')">✏️ 편집</button>
          </div>
          <div class="modal-info-row">
            <div class="modal-info-item"><div class="modal-info-label">금액</div><div class="modal-info-value">${esc(v.price) || '—'}</div></div>
            <div class="modal-info-item"><div class="modal-info-label">상담일</div><div class="modal-info-value">${esc(v.consultDate) || '—'}</div></div>
            <div class="modal-info-item"><div class="modal-info-label">연락처</div><div class="modal-info-value">${esc(v.contact) || '—'}</div></div>
          </div>
          ${v.memo ? `<div class="modal-memo">${esc(v.memo)}</div>` : ''}
        </div>

        <div class="modal-section">
          <div class="modal-section-title">
            💰 비용 내역
            <button class="btn btn-outline btn-sm" onclick="App.Vendor.openAddCostItem('${v.id}')">+ 항목 추가</button>
          </div>
          <div id="costItems-${v.id}">
            ${renderCostItems(v)}
          </div>
        </div>

        <div class="modal-section">
          <div class="modal-section-title">
            📅 일정 관리
            <button class="btn btn-outline btn-sm" onclick="App.Vendor.openAddScheduleItem('${v.id}')">+ 일정 추가</button>
          </div>
          <div id="scheduleItems-${v.id}">
            ${renderScheduleItems(v)}
          </div>
        </div>

        <div class="modal-section">
          <div class="modal-section-title">
            포트폴리오 사진
            <label class="btn btn-outline btn-sm" style="cursor:pointer">
              + 사진 추가
              <input type="file" accept="image/*" multiple style="display:none"
                onchange="App.Vendor.uploadPhoto('${v.id}','portfolio',this)">
            </label>
          </div>
          <div class="modal-photo-grid" id="portfolio-${v.id}">
            ${renderPhotoGrid(v.portfolio, v.id, 'portfolio')}
          </div>
        </div>

        <div class="modal-section">
          <div class="modal-section-title">
            서류 (견적서·계약서)
            <label class="btn btn-outline btn-sm" style="cursor:pointer">
              + 서류 추가
              <input type="file" accept="image/*" multiple style="display:none"
                onchange="App.Vendor.uploadPhoto('${v.id}','docs',this)">
            </label>
          </div>
          <div class="modal-photo-grid" id="docs-${v.id}">
            ${renderPhotoGrid(v.docs, v.id, 'docs')}
          </div>
        </div>

        <div style="border-top:1px solid var(--border);padding-top:14px;display:flex;justify-content:flex-end">
          <button class="btn btn-sm btn-danger" onclick="App.Vendor.deleteVendor('${v.id}')">업체 삭제</button>
        </div>`
    });
  }

  // ── 비용 내역 렌더 ──
  function renderCostItems(v) {
    const items = v.costItems || [];
    if (items.length === 0) {
      return `<div class="cost-empty">항목이 없습니다. + 항목 추가를 눌러 비용을 입력하세요.</div>`;
    }

    const included = items.filter(i => i.type === 'included');
    const extra    = items.filter(i => i.type === 'extra');
    const includedSum = included.reduce((s, i) => s + i.amount, 0);
    const extraSum    = extra.reduce((s, i) => s + i.amount, 0);
    const total = includedSum + extraSum;

    return `
      <table class="cost-table">
        <thead>
          <tr>
            <th>항목</th>
            <th style="text-align:right">금액</th>
            <th>구분</th>
            <th>메모</th>
            <th style="width:60px"></th>
          </tr>
        </thead>
        <tbody>
          ${items.map(ci => `
            <tr class="cost-row" id="ci-${ci.id}">
              <td><strong>${esc(ci.name)}</strong></td>
              <td style="text-align:right;font-weight:600">${fmtWon(ci.amount)}</td>
              <td><span class="cost-type-${ci.type}">${ci.type === 'included' ? '✓ 포함' : '+ 추가옵션'}</span></td>
              <td style="font-size:12px;color:var(--text-sub)">${esc(ci.memo)}</td>
              <td style="display:flex;gap:2px">
                <button class="task-btn" onclick="App.Vendor.openEditCostItem('${v.id}','${ci.id}')">✏️</button>
                <button class="task-btn" onclick="App.Vendor.removeCostItem('${v.id}','${ci.id}')">🗑️</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div class="cost-summary">
        <div class="cost-summary-row">
          <span>기본 포함 합계</span>
          <span>${fmtWon(includedSum)}</span>
        </div>
        ${extraSum > 0 ? `<div class="cost-summary-row">
          <span>추가 옵션 합계</span>
          <span>${fmtWon(extraSum)}</span>
        </div>` : ''}
        <div class="cost-summary-total">
          <span>전체 합계</span>
          <span>${fmtWon(total)}</span>
        </div>
      </div>`;
  }

  function refreshCostItems(vendorId) {
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    const el = document.getElementById(`costItems-${vendorId}`);
    if (v && el) el.innerHTML = renderCostItems(v);
    render(); // 카드 총액도 갱신
  }

  function openAddCostItem(vendorId) {
    App.Modal.show({
      title: '비용 항목 추가',
      content: costItemForm(),
      confirmText: '추가',
      onConfirm: () => {
        const item = readCostItemForm(); if (!item) return;
        App.Data.addCostItem(vendorId, item);
        App.Modal.hide();
        refreshCostItems(vendorId);
        // 상세 모달 다시 열기
        openDetail(vendorId);
      }
    });
  }

  function openEditCostItem(vendorId, itemId) {
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    const ci = v && (v.costItems || []).find(i => i.id === itemId);
    if (!ci) return;
    App.Modal.show({
      title: '비용 항목 편집',
      content: costItemForm(ci),
      confirmText: '저장',
      onConfirm: () => {
        const item = readCostItemForm(); if (!item) return;
        App.Data.updateCostItem(vendorId, itemId, item);
        App.Modal.hide();
        refreshCostItems(vendorId);
        openDetail(vendorId);
      }
    });
  }

  function removeCostItem(vendorId, itemId) {
    if (!confirm('이 항목을 삭제하시겠어요?')) return;
    App.Data.deleteCostItem(vendorId, itemId);
    refreshCostItems(vendorId);
    openDetail(vendorId);
  }

  function costItemForm(ci) {
    return `
      <div class="form-group">
        <label class="form-label">항목 이름 *</label>
        <input class="form-input" id="ciName" value="${esc(ci?.name || '')}" placeholder="예: 기본 촬영, 야외 촬영">
      </div>
      <div class="form-group">
        <label class="form-label">금액 (원)</label>
        <input class="form-input" type="text" inputmode="numeric" id="ciAmount" value="${ci?.amount ? Number(ci.amount).toLocaleString('ko-KR') : ''}" placeholder="예: 1,000,000" oninput="App.Util.formatNumberInput(this)">
        <div style="font-size:12px;color:var(--text-sub);margin-top:4px">100만 원 → 1,000,000</div>
      </div>
      <div class="form-group">
        <label class="form-label">구분</label>
        <div style="display:flex;gap:12px;margin-top:6px">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px">
            <input type="radio" name="ciType" value="included" ${!ci || ci.type === 'included' ? 'checked' : ''}>
            ✓ 기본 포함
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:14px">
            <input type="radio" name="ciType" value="extra" ${ci?.type === 'extra' ? 'checked' : ''}>
            + 추가 옵션
          </label>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">메모 (선택)</label>
        <input class="form-input" id="ciMemo" value="${esc(ci?.memo || '')}" placeholder="예: 인당 4만원, 10% 별도 등">
      </div>`;
  }

  function readCostItemForm() {
    const name = document.getElementById('ciName').value.trim();
    if (!name) { alert('항목 이름을 입력해주세요.'); return null; }
    const typeEl = document.querySelector('input[name="ciType"]:checked');
    return {
      name,
      amount: App.Util.parseNumberInput('ciAmount'),
      type: typeEl ? typeEl.value : 'included',
      memo: document.getElementById('ciMemo').value.trim()
    };
  }

  // ── 일정 관리 렌더 ──
  function renderScheduleItems(v) {
    const items = [...(v.schedules || [])].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
    if (items.length === 0) {
      return `<div class="cost-empty">등록된 일정이 없습니다. + 일정 추가를 눌러 상담일·촬영일 등을 입력하세요.</div>`;
    }

    return `
      <table class="cost-table">
        <thead>
          <tr>
            <th>일정명</th>
            <th>날짜</th>
            <th>메모</th>
            <th style="width:60px"></th>
          </tr>
        </thead>
        <tbody>
          ${items.map(si => `
            <tr class="cost-row" id="si-${si.id}">
              <td><strong>${esc(si.name)}</strong></td>
              <td>${esc(si.date) || '—'}</td>
              <td style="font-size:12px;color:var(--text-sub)">${esc(si.memo)}</td>
              <td style="display:flex;gap:2px">
                <button class="task-btn" onclick="App.Vendor.openEditScheduleItem('${v.id}','${si.id}')">✏️</button>
                <button class="task-btn" onclick="App.Vendor.removeScheduleItem('${v.id}','${si.id}')">🗑️</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  function refreshScheduleItems(vendorId) {
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    const el = document.getElementById(`scheduleItems-${vendorId}`);
    if (v && el) el.innerHTML = renderScheduleItems(v);
  }

  function openAddScheduleItem(vendorId) {
    App.Modal.show({
      title: '일정 추가',
      content: scheduleItemForm(),
      confirmText: '추가',
      onConfirm: () => {
        const item = readScheduleItemForm(); if (!item) return;
        App.Data.addScheduleItem(vendorId, item);
        App.Modal.hide();
        refreshScheduleItems(vendorId);
        openDetail(vendorId);
      }
    });
  }

  function openEditScheduleItem(vendorId, itemId) {
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    const si = v && (v.schedules || []).find(i => i.id === itemId);
    if (!si) return;
    App.Modal.show({
      title: '일정 편집',
      content: scheduleItemForm(si),
      confirmText: '저장',
      onConfirm: () => {
        const item = readScheduleItemForm(); if (!item) return;
        App.Data.updateScheduleItem(vendorId, itemId, item);
        App.Modal.hide();
        refreshScheduleItems(vendorId);
        openDetail(vendorId);
      }
    });
  }

  function removeScheduleItem(vendorId, itemId) {
    if (!confirm('이 일정을 삭제하시겠어요?')) return;
    App.Data.deleteScheduleItem(vendorId, itemId);
    refreshScheduleItems(vendorId);
    openDetail(vendorId);
  }

  function scheduleItemForm(si) {
    return `
      <div class="form-group">
        <label class="form-label">일정명 *</label>
        <input class="form-input" id="siName" value="${esc(si?.name || '')}" placeholder="예: 상담, 촬영, 계약금 납부">
      </div>
      <div class="form-group">
        <label class="form-label">날짜</label>
        <input class="form-input" type="date" id="siDate" value="${si?.date || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">메모 (선택)</label>
        <input class="form-input" id="siMemo" value="${esc(si?.memo || '')}" placeholder="예: 오전 11시, 준비물 등">
      </div>`;
  }

  function readScheduleItemForm() {
    const name = document.getElementById('siName').value.trim();
    if (!name) { alert('일정명을 입력해주세요.'); return null; }
    return {
      name,
      date: document.getElementById('siDate').value,
      memo: document.getElementById('siMemo').value.trim()
    };
  }

  function renderPhotoGrid(photos, vendorId, type) {
    if (!photos || photos.length === 0) {
      return `<div style="color:var(--text-sub);font-size:13px;padding:6px 0">사진 없음</div>`;
    }
    return photos.map(p => `
      <div class="modal-photo-item" onclick="App.showImageViewer('${p.data}')">
        <img src="${p.data}" style="width:100%;height:100%;object-fit:cover;border-radius:10px" onerror="App.markImgBroken(this)">
        <button class="modal-photo-delete" onclick="event.stopPropagation();App.Vendor.deletePhoto('${vendorId}','${type}','${p.id}')">🗑️</button>
      </div>`).join('');
  }

  // 목록 카드에서 바로 업로드
  async function quickUpload(vendorId, input) {
    const files = Array.from(input.files);
    const failed = [];
    for (const file of files) {
      const data = await App.Data.compressImage(file);
      if (!data) { failed.push(file.name); continue; }
      App.Data.addVendorPhoto(vendorId, 'portfolio', data, file.name);
    }
    render();
    if (failed.length) alert(`다음 파일을 처리할 수 없습니다:\n${failed.join('\n')}\n\n다른 형식(JPEG/PNG)으로 다시 시도해주세요.`);
  }

  async function uploadPhoto(vendorId, type, input) {
    const files = Array.from(input.files);
    const failed = [];
    for (const file of files) {
      const data = await App.Data.compressImage(file);
      if (!data) { failed.push(file.name); continue; }
      App.Data.addVendorPhoto(vendorId, type, data, file.name);
    }
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    const portfolioEl = document.getElementById(`portfolio-${vendorId}`);
    const docsEl = document.getElementById(`docs-${vendorId}`);
    if (portfolioEl) portfolioEl.innerHTML = renderPhotoGrid(v.portfolio, vendorId, 'portfolio');
    if (docsEl) docsEl.innerHTML = renderPhotoGrid(v.docs, vendorId, 'docs');
    render();
    if (failed.length) alert(`다음 파일을 처리할 수 없습니다:\n${failed.join('\n')}\n\n다른 형식(JPEG/PNG)으로 다시 시도해주세요.`);
  }

  function deletePhoto(vendorId, type, photoId) {
    if (!confirm('이 사진을 삭제하시겠어요?')) return;
    App.Data.deleteVendorPhoto(vendorId, type, photoId);
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    const el = document.getElementById(`${type}-${vendorId}`);
    if (el) el.innerHTML = renderPhotoGrid(type === 'portfolio' ? v.portfolio : v.docs, vendorId, type);
    render();
  }

  function openEdit(vendorId) {
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    if (!v) return;
    App.Modal.show({
      title: '업체 편집',
      content: vendorForm(v),
      confirmText: '저장',
      onConfirm: () => {
        const u = readVendorForm(); if (!u) return;
        App.Data.updateVendor(vendorId, u);
        App.Modal.hide(); render();
      }
    });
  }

  function deleteVendor(vendorId) {
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    if (!confirm(`"${v?.name}" 업체를 삭제하시겠어요?`)) return;
    App.Data.deleteVendor(vendorId);
    App.Modal.hide(); render();
  }

  function vendorForm(v) {
    const cats = App.Data.getVendorCategories();
    return `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">카테고리 *</label>
          <select class="form-input" id="vCat">
            ${cats.map(c => `<option ${v && v.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">상태</label>
          <select class="form-input" id="vStatus">
            <option value="review"  ${!v || v.status === 'review'  ? 'selected' : ''}>🔍 검토중</option>
            <option value="contact" ${v && v.status === 'contact'  ? 'selected' : ''}>📞 상담예정</option>
            <option value="done"    ${v && v.status === 'done'     ? 'selected' : ''}>✓ 계약완료</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">업체명 *</label>
        <input class="form-input" id="vName" value="${esc(v?.name || '')}" placeholder="예: A 스튜디오">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">견적/금액</label>
          <input class="form-input" id="vPrice" value="${esc(v?.price || '')}" placeholder="예: 150만 원">
        </div>
        <div class="form-group">
          <label class="form-label">상담일</label>
          <input class="form-input" type="date" id="vDate" value="${v?.consultDate || ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">연락처</label>
        <input class="form-input" id="vContact" value="${esc(v?.contact || '')}" placeholder="010-0000-0000">
      </div>
      <div class="form-group">
        <label class="form-label">태그 (쉼표로 구분)</label>
        <input class="form-input" id="vTags" value="${(v?.tags || []).join(', ')}" placeholder="예: 야외 촬영, 원본 제공">
      </div>
      <div class="form-group">
        <label class="form-label">메모</label>
        <textarea class="form-input" id="vMemo" rows="3" placeholder="주의사항, 협의 내용 등...">${esc(v?.memo || '')}</textarea>
      </div>`;
  }

  function readVendorForm() {
    const name = document.getElementById('vName').value.trim();
    if (!name) { alert('업체명을 입력해주세요.'); return null; }
    return {
      category:    document.getElementById('vCat').value,
      status:      document.getElementById('vStatus').value,
      name,
      price:       document.getElementById('vPrice').value.trim(),
      consultDate: document.getElementById('vDate').value,
      contact:     document.getElementById('vContact').value.trim(),
      tags:        document.getElementById('vTags').value.split(',').map(t => t.trim()).filter(Boolean),
      memo:        document.getElementById('vMemo').value.trim()
    };
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return {
    render, setCategory, setStatus, toggleConfirmed,
    openManageCategories, addCategory, promptRenameCategory, promptDeleteCategory,
    openAdd, openDetail, openEdit, deleteVendor,
    openAddCostItem, openEditCostItem, removeCostItem,
    openAddScheduleItem, openEditScheduleItem, removeScheduleItem,
    quickUpload, uploadPhoto, deletePhoto
  };
})();
