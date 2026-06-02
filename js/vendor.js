window.App = window.App || {};

App.Vendor = (() => {
  const CATEGORIES = ['전체', '예식장', '스튜디오', '드레스', '메이크업', '폐백·이바지', '기타'];
  const STATUS_MAP = { review: { label: '🔍 검토중', cls: 's-review' }, done: { label: '✓ 계약완료', cls: 's-done' }, contact: { label: '📞 상담예정', cls: 's-contact' } };
  let activeCat = '전체';

  function render() {
    const vendors = App.Data.getVendors();
    const filtered = activeCat === '전체' ? vendors : vendors.filter(v => v.category === activeCat);
    const sameCat = activeCat !== '전체' && filtered.length >= 2;

    document.getElementById('vendorScreen').innerHTML = `
      <div class="page-header">
        <div class="page-title">업체 관리</div>
        <button class="btn btn-primary btn-sm" onclick="App.Vendor.openAdd()">+ 업체 추가</button>
      </div>

      <div class="cat-tabs">
        ${CATEGORIES.map(c => `<button class="cat-tab ${c === activeCat ? 'active' : ''}" onclick="App.Vendor.setCategory('${c}')">${c}</button>`).join('')}
      </div>

      ${sameCat ? renderCompare(filtered) : ''}

      <div class="section-label">
        ${activeCat === '전체' ? '전체 업체 목록' : activeCat + ' 목록'}
        <span style="font-size:13px;color:var(--text-sub);font-weight:400">${filtered.length}곳</span>
      </div>
      <div class="vendor-grid">
        ${filtered.map(renderCard).join('')}
        <button class="add-vendor-btn" onclick="App.Vendor.openAdd()">
          <span style="font-size:28px">＋</span>업체 추가
        </button>
      </div>
    `;
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
          ${activeCat} 견적 비교
          <span style="font-size:13px;color:var(--text-sub);font-weight:400">${vendors.length}곳</span>
        </div>
        <table class="compare-table">
          <thead>
            <tr>
              <th style="width:110px">항목</th>
              ${vendors.map(v => `<th>${esc(v.name)}${v.status === 'done' ? ' <span class="rec">계약</span>' : ''}</th>`).join('')}
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

  function renderCard(v) {
    const s = STATUS_MAP[v.status] || STATUS_MAP.review;
    const photoCount = (v.portfolio || []).length + (v.docs || []).length;
    const thumbs = [...(v.portfolio || []).slice(0, 2), ...(v.docs || []).slice(0, 1)];
    return `
      <div class="vendor-card" onclick="App.Vendor.openDetail('${v.id}')">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px">
          <div class="vendor-cat">${esc(v.category)}</div>
          <span class="vendor-status ${s.cls}">${s.label}</span>
        </div>
        <div class="vendor-name">${esc(v.name)}</div>
        <div class="vendor-price">${esc(v.price) || '금액 미입력'}</div>
        <div class="vendor-tags">
          ${(v.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}
        </div>
        <div style="font-size:12px;color:var(--text-sub);margin-bottom:2px">
          ${v.contact ? '📞 ' + esc(v.contact) : ''}
          ${v.consultDate ? '📅 ' + esc(v.consultDate) : ''}
        </div>
        <div class="vendor-photo-strip">
          <div class="vendor-photo-strip-label">
            사진·서류
            <span onclick="event.stopPropagation();App.Vendor.openDetail('${v.id}')">${photoCount > 0 ? photoCount + '장' : '+ 추가'}</span>
          </div>
          <div class="vendor-photo-row">
            ${thumbs.map(p => `<div class="vendor-thumb"><img src="${p.data}" style="width:100%;height:100%;object-fit:cover"></div>`).join('')}
            <button class="vendor-thumb-add" onclick="event.stopPropagation();App.Vendor.openDetail('${v.id}')">＋</button>
          </div>
        </div>
      </div>`;
  }

  function setCategory(cat) { activeCat = cat; render(); }

  function openAdd() {
    App.Modal.show({
      title: '업체 추가',
      content: vendorForm(),
      confirmText: '추가',
      onConfirm: () => {
        const v = readVendorForm();
        if (!v) return;
        App.Data.addVendor(v);
        App.Modal.hide(); render();
      }
    });
  }

  function openDetail(vendorId) {
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    if (!v) return;
    const s = STATUS_MAP[v.status] || STATUS_MAP.review;

    App.Modal.show({
      title: v.name,
      showConfirm: false,
      content: `
        <div style="margin-bottom:6px">
          <span class="vendor-cat">${esc(v.category)}</span>
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
            포트폴리오 사진
            <label class="btn btn-outline btn-sm" style="cursor:pointer">
              + 사진 추가
              <input type="file" accept="image/*" multiple style="display:none" onchange="App.Vendor.uploadPhoto('${v.id}','portfolio',this)">
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
              <input type="file" accept="image/*" multiple style="display:none" onchange="App.Vendor.uploadPhoto('${v.id}','docs',this)">
            </label>
          </div>
          <div class="modal-photo-grid" id="docs-${v.id}">
            ${renderPhotoGrid(v.docs, v.id, 'docs')}
          </div>
        </div>

        <div style="border-top:1px solid var(--border);padding-top:14px;display:flex;justify-content:flex-end">
          <button class="btn btn-sm btn-danger" onclick="App.Vendor.deleteVendor('${v.id}')">업체 삭제</button>
        </div>
      `
    });
  }

  function renderPhotoGrid(photos, vendorId, type) {
    if (!photos || photos.length === 0) return `<div style="color:var(--text-sub);font-size:13px;padding:8px 0">사진 없음</div>`;
    return photos.map(p => `
      <div class="modal-photo-item" onclick="App.showImageViewer('${p.data}')">
        <img src="${p.data}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">
        <div class="photo-overlay">
          <button onclick="event.stopPropagation();App.Vendor.deletePhoto('${vendorId}','${type}','${p.id}')"
            style="background:rgba(255,255,255,0.9);border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:14px">🗑️</button>
        </div>
      </div>`).join('');
  }

  async function uploadPhoto(vendorId, type, input) {
    const files = Array.from(input.files);
    for (const file of files) {
      const data = await App.Data.compressImage(file);
      App.Data.addVendorPhoto(vendorId, type, data, file.name);
    }
    // refresh the photo grids inside the modal
    const v = App.Data.getVendors().find(v => v.id === vendorId);
    const portfolioEl = document.getElementById(`portfolio-${vendorId}`);
    const docsEl = document.getElementById(`docs-${vendorId}`);
    if (portfolioEl) portfolioEl.innerHTML = renderPhotoGrid(v.portfolio, vendorId, 'portfolio');
    if (docsEl) docsEl.innerHTML = renderPhotoGrid(v.docs, vendorId, 'docs');
    render();
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
        const u = readVendorForm();
        if (!u) return;
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
    return `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">카테고리 *</label>
          <select class="form-input" id="vCat">
            ${['예식장','스튜디오','드레스','메이크업','폐백·이바지','기타'].map(c =>
              `<option ${v && v.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">상태</label>
          <select class="form-input" id="vStatus">
            <option value="review" ${!v || v.status === 'review' ? 'selected' : ''}>🔍 검토중</option>
            <option value="contact" ${v && v.status === 'contact' ? 'selected' : ''}>📞 상담예정</option>
            <option value="done" ${v && v.status === 'done' ? 'selected' : ''}>✓ 계약완료</option>
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
        <label class="form-label">태그 (쉼표 구분)</label>
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
      category: document.getElementById('vCat').value,
      status: document.getElementById('vStatus').value,
      name,
      price: document.getElementById('vPrice').value.trim(),
      consultDate: document.getElementById('vDate').value,
      contact: document.getElementById('vContact').value.trim(),
      tags: document.getElementById('vTags').value.split(',').map(t => t.trim()).filter(Boolean),
      memo: document.getElementById('vMemo').value.trim()
    };
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render, setCategory, openAdd, openDetail, openEdit, deleteVendor, uploadPhoto, deletePhoto };
})();
