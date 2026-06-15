window.App = window.App || {};

App.Photos = (() => {
  const CATEGORIES = ['전체', '드레스', '헤어·메이크업', '꽃장식', '촬영 스타일', '식장 분위기', '기타'];
  let activeCat = '전체';
  let compareMode = false;
  let selectedIds = [];

  function render() {
    const photos = App.Data.getPhotos();
    const filtered = activeCat === '전체' ? photos : photos.filter(p => p.category === activeCat);

    document.getElementById('photosScreen').innerHTML = `
      <div class="page-header">
        <div class="page-title">참고사진</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm ${compareMode ? 'btn-primary' : 'btn-outline'}" onclick="App.Photos.toggleCompareMode()">
            ${compareMode ? '✕ 비교 종료' : '🔍 비교하기'}
          </button>
          ${!compareMode ? `
          <label class="btn btn-primary btn-sm" style="cursor:pointer">
            + 사진 추가
            <input type="file" accept="image/*" multiple style="display:none" onchange="App.Photos.upload(this)">
          </label>` : ''}
        </div>
      </div>

      <div class="cat-tabs mb-20">
        ${CATEGORIES.map(c => `<button class="cat-tab ${c === activeCat ? 'active' : ''}" onclick="App.Photos.setCategory('${c}')">${c}</button>`).join('')}
      </div>

      ${compareMode ? `<div class="compare-hint">비교할 사진을 2~4장 선택한 후, 아래의 "비교 보기"를 눌러주세요.</div>` : ''}

      ${filtered.length === 0
        ? `<div class="empty-state">
            <div style="font-size:48px;margin-bottom:12px">📷</div>
            <div style="font-size:16px;font-weight:600;margin-bottom:6px">사진이 없습니다</div>
            <div style="font-size:13px;color:var(--text-sub)">위의 + 버튼으로 참고 사진을 추가해보세요</div>
          </div>`
        : `<div class="photo-grid">
            ${filtered.map(renderPhotoItem).join('')}
            ${!compareMode ? `<label class="add-photo-btn" style="cursor:pointer">
              <span style="font-size:26px">＋</span>사진 추가
              <input type="file" accept="image/*" multiple style="display:none" onchange="App.Photos.upload(this)">
            </label>` : ''}
          </div>`
      }

      ${compareMode ? renderCompareBar() : ''}
    `;
  }

  function renderPhotoItem(p) {
    if (compareMode) {
      const selected = selectedIds.includes(p.id);
      return `
        <div class="photo-item ${selected ? 'selected' : ''}" onclick="App.Photos.toggleSelect('${p.id}')">
          <img src="${p.data}" style="width:100%;height:100%;object-fit:cover">
          <div class="photo-select-badge ${selected ? 'checked' : ''}">${selected ? '✓' : ''}</div>
          <div class="photo-cat-tag">${esc(p.category)}</div>
        </div>`;
    }
    return `
      <div class="photo-item" onclick="App.Photos.openDetail('${p.id}')">
        <img src="${p.data}" style="width:100%;height:100%;object-fit:cover">
        <div class="photo-overlay">
          <div style="text-align:center">
            <div style="font-size:12px;background:rgba(255,255,255,0.9);color:#333;border-radius:20px;padding:3px 10px;margin-bottom:6px">${esc(p.category)}</div>
            ${p.memo ? `<div style="font-size:11px;color:white">${esc(p.memo.substring(0,20))}${p.memo.length>20?'…':''}</div>` : ''}
          </div>
        </div>
      </div>`;
  }

  function renderCompareBar() {
    return `
      <div class="compare-bar">
        <span>${selectedIds.length}장 선택됨 (최대 4장)</span>
        <button class="btn btn-ghost btn-sm" onclick="App.Photos.clearSelection()">선택 해제</button>
        <button class="btn btn-primary btn-sm" ${selectedIds.length < 2 ? 'disabled' : ''} onclick="App.Photos.openCompareView()">비교 보기 (${selectedIds.length})</button>
      </div>`;
  }

  function toggleCompareMode() {
    compareMode = !compareMode;
    selectedIds = [];
    render();
  }

  function toggleSelect(id) {
    const idx = selectedIds.indexOf(id);
    if (idx >= 0) { selectedIds.splice(idx, 1); render(); return; }
    if (selectedIds.length >= 4) { alert('최대 4장까지 선택할 수 있어요.'); return; }
    selectedIds.push(id);
    render();
  }

  function clearSelection() {
    selectedIds = [];
    render();
  }

  function openCompareView() {
    const photos = App.Data.getPhotos();
    const selected = selectedIds.map(id => photos.find(p => p.id === id)).filter(Boolean);
    if (selected.length < 2) return;
    App.Modal.show({
      title: `사진 비교 (${selected.length}장)`,
      showConfirm: false,
      wide: true,
      content: `
        <div class="compare-view-grid cols-${selected.length}">
          ${selected.map(p => `
            <div class="compare-view-item">
              <img src="${p.data}" onclick="App.showImageViewer('${p.data}')">
              <div class="compare-view-cat">${esc(p.category)}</div>
              ${p.memo ? `<div class="compare-view-memo">${esc(p.memo)}</div>` : ''}
            </div>`).join('')}
        </div>`
    });
  }

  function setCategory(cat) { activeCat = cat; render(); }

  async function upload(input) {
    const cat = activeCat === '전체' ? await pickCategory() : activeCat;
    if (!cat) return;
    const files = Array.from(input.files);
    for (const file of files) {
      const data = await App.Data.compressImage(file);
      App.Data.addPhoto(cat, data, '');
    }
    render(); App.Home.render();
  }

  function pickCategory() {
    return new Promise(resolve => {
      App.Modal.show({
        title: '카테고리 선택',
        content: `
          <div class="form-group">
            <label class="form-label">카테고리</label>
            <select class="form-input" id="photoCat">
              ${CATEGORIES.filter(c => c !== '전체').map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>`,
        confirmText: '선택',
        onConfirm: () => {
          const cat = document.getElementById('photoCat').value;
          resolve(cat);
          App.Modal.hide();
        }
      });
      // Override hide to resolve null
      const orig = App.Modal.hide;
      App.Modal.hide = () => { orig(); App.Modal.hide = orig; resolve(null); };
    });
  }

  function openDetail(photoId) {
    const p = App.Data.getPhotos().find(p => p.id === photoId);
    if (!p) return;
    App.Modal.show({
      title: '사진 상세',
      showConfirm: false,
      content: `
        <img src="${p.data}" style="width:100%;border-radius:12px;margin-bottom:16px;max-height:50vh;object-fit:contain">
        <div class="form-group">
          <label class="form-label">카테고리</label>
          <select class="form-input" id="pCat">
            ${CATEGORIES.filter(c => c !== '전체').map(c => `<option ${c === p.category ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">메모</label>
          <textarea class="form-input" id="pMemo" rows="2" placeholder="참고 메모...">${esc(p.memo)}</textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
          <button class="btn btn-sm btn-danger" onclick="App.Photos.deletePhoto('${photoId}')">🗑️ 삭제</button>
          <button class="btn btn-sm btn-ghost" onclick="App.Modal.hide()">취소</button>
          <button class="btn btn-sm btn-primary" onclick="App.Photos.saveDetail('${photoId}')">저장</button>
        </div>`
    });
  }

  function saveDetail(photoId) {
    App.Data.updatePhoto(photoId, {
      category: document.getElementById('pCat').value,
      memo: document.getElementById('pMemo').value.trim()
    });
    App.Modal.hide(); render();
  }

  function deletePhoto(photoId) {
    if (!confirm('이 사진을 삭제하시겠어요?')) return;
    App.Data.deletePhoto(photoId);
    App.Modal.hide(); render(); App.Home.render();
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render, setCategory, upload, openDetail, saveDetail, deletePhoto,
           toggleCompareMode, toggleSelect, clearSelection, openCompareView };
})();
