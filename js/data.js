window.App = window.App || {};

App.Data = (() => {
  const KEY = 'mywedding_v1';

  const DEFAULT = {
    settings: { groomName: '', brideName: '', weddingDate: '', weddingTime: '', venue: '' },
    vendorCategories: ['예식장', '스튜디오', '드레스', '메이크업', '폐백·이바지', '기타'],
    timeline: [
      { id: 'stage-1', name: 'D-12개월 이상', period: '예산 협의 · 예식장 계약', order: 0, expanded: true,
        tasks: [
          { id: 't-1-1', name: '총 예산 협의', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-1-2', name: '결혼 날짜 · 지역 방향 결정', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-1-3', name: '예식장 투어 및 계약', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-1-4', name: '웨딩플래너 이용 여부 결정', done: false, doneDate: null, memo: '', dueDate: '' },
        ]
      },
      { id: 'stage-2', name: 'D-9~11개월', period: '스드메 · 신혼집 방향', order: 1, expanded: false,
        tasks: [
          { id: 't-2-1', name: '스드메 투어 및 계약', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-2-2', name: '신혼집 방향 결정 (매매/전세/월세)', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-2-3', name: '신혼여행 목적지 설정', done: false, doneDate: null, memo: '', dueDate: '' },
        ]
      },
      { id: 'stage-3', name: 'D-6~8개월', period: '신혼집 · 혼수 · 신혼여행 예약', order: 2, expanded: false,
        tasks: [
          { id: 't-3-1', name: '신혼집 계약', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-3-2', name: '혼수 목록 작성 및 쇼핑 시작', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-3-3', name: '예물·예단 협의', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-3-4', name: '신혼여행 상품 예약', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-3-5', name: '인테리어 방향 결정', done: false, doneDate: null, memo: '', dueDate: '' },
        ]
      },
      { id: 'stage-4', name: 'D-3~5개월', period: '청첩장 · 하객 명단 · 촬영', order: 3, expanded: false,
        tasks: [
          { id: 't-4-1', name: '청첩장 디자인 및 제작 주문', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-4-2', name: '하객 명단 1차 작성', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-4-3', name: '사회자·축가자 섭외', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-4-4', name: '웨딩 스튜디오 촬영', done: false, doneDate: null, memo: '', dueDate: '' },
        ]
      },
      { id: 'stage-5', name: 'D-1~2개월', period: '청첩장 발송 · RSVP · 식순 확정', order: 4, expanded: false,
        tasks: [
          { id: 't-5-1', name: '청첩장 발송 (6~8주 전 권장)', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-5-2', name: '하객 RSVP 관리', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-5-3', name: '폐백 음식·이바지 업체 계약', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-5-4', name: '식순 확정 및 사회자 전달', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-5-5', name: '좌석 배치도 작성', done: false, doneDate: null, memo: '', dueDate: '' },
        ]
      },
      { id: 'stage-6', name: '결혼 당일', period: '메이크업 · 폐백 · 신혼여행 출발', order: 5, expanded: false,
        tasks: [
          { id: 't-6-1', name: '헤어·메이크업', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-6-2', name: '폐백 진행', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-6-3', name: '역할 분담 최종 확인 (축의금, 가방 등)', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-6-4', name: '신혼여행 출발', done: false, doneDate: null, memo: '', dueDate: '' },
        ]
      },
      { id: 'stage-7', name: '결혼 후', period: '혼인신고 · 행정 처리', order: 6, expanded: false,
        tasks: [
          { id: 't-7-1', name: '혼인신고', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-7-2', name: '건강보험 피부양자 등록', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-7-3', name: '주민등록 주소 이전', done: false, doneDate: null, memo: '', dueDate: '' },
          { id: 't-7-4', name: '결혼 정산 (축의금 정리)', done: false, doneDate: null, memo: '', dueDate: '' },
        ]
      }
    ],
    vendors: [],
    photos: [],
    budget: {
      total: 0,
      incomeItems: [],
      items: [
        { id: 'bi-1', name: '예식장', budget: 0, spent: 0 },
        { id: 'bi-2', name: '스드메', budget: 0, spent: 0 },
        { id: 'bi-3', name: '예물·예단', budget: 0, spent: 0 },
        { id: 'bi-4', name: '혼수 (가전·가구)', budget: 0, spent: 0 },
        { id: 'bi-5', name: '신혼여행', budget: 0, spent: 0 },
        { id: 'bi-6', name: '청첩장', budget: 0, spent: 0 },
        { id: 'bi-7', name: '폐백·이바지', budget: 0, spent: 0 },
        { id: 'bi-8', name: '기타·예비비', budget: 0, spent: 0 },
      ]
    },
    guests: [],
    honeymoon: { destination: '', startDate: '', endDate: '', memo: '', items: [], costItems: [] }
  };

  let _data = null;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      _data = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT));
    } catch { _data = JSON.parse(JSON.stringify(DEFAULT)); }
    return _data;
  }

  function save() {
    _data.lastModified = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(_data)); }
    catch { alert('저장 공간이 부족합니다. 사진 일부를 삭제해 주세요.'); }
  }

  function get() { return _data || load(); }
  function getLastModified() { return get().lastModified || 0; }
  function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

  // Settings
  function saveSettings(s) { Object.assign(get().settings, s); save(); }

  // Vendor Categories
  function getVendorCategories() { return get().vendorCategories || [...DEFAULT.vendorCategories]; }
  function addVendorCategory(name) { const cats = getVendorCategories(); if (!cats.includes(name)) { cats.push(name); _data.vendorCategories = cats; save(); } }
  function renameVendorCategory(oldName, newName) {
    const cats = getVendorCategories(); const i = cats.indexOf(oldName); if (i < 0) return;
    cats[i] = newName;
    _data.vendors.forEach(v => { if (v.category === oldName) v.category = newName; });
    _data.vendorCategories = cats; save();
  }
  function deleteVendorCategory(name) {
    _data.vendorCategories = getVendorCategories().filter(c => c !== name);
    _data.vendors.forEach(v => { if (v.category === name) v.category = '기타'; });
    save();
  }

  // Timeline
  function getStages() { return get().timeline; }

  function addStage(name, period) {
    const s = { id: generateId(), name, period: period || '', order: _data.timeline.length, expanded: true, tasks: [] };
    _data.timeline.push(s); save(); return s;
  }

  function updateStage(id, u) {
    const s = _data.timeline.find(s => s.id === id);
    if (s) Object.assign(s, u); save();
  }

  function deleteStage(id) { _data.timeline = _data.timeline.filter(s => s.id !== id); save(); }

  function addTask(stageId, name) {
    const stage = _data.timeline.find(s => s.id === stageId);
    if (!stage) return;
    const t = { id: generateId(), name, done: false, doneDate: null, memo: '', dueDate: '' };
    stage.tasks.push(t); save(); return t;
  }

  function updateTask(stageId, taskId, u) {
    const stage = _data.timeline.find(s => s.id === stageId);
    const task = stage && stage.tasks.find(t => t.id === taskId);
    if (task) Object.assign(task, u); save();
  }

  function toggleTask(stageId, taskId) {
    const stage = _data.timeline.find(s => s.id === stageId);
    const task = stage && stage.tasks.find(t => t.id === taskId);
    if (task) {
      task.done = !task.done;
      task.doneDate = task.done ? new Date().toLocaleDateString('ko-KR') : null;
    }
    save();
  }

  function deleteTask(stageId, taskId) {
    const stage = _data.timeline.find(s => s.id === stageId);
    if (stage) { stage.tasks = stage.tasks.filter(t => t.id !== taskId); save(); }
  }

  // Vendors
  function getVendors() { return get().vendors; }

  function addVendor(v) {
    const vendor = { id: generateId(), category: v.category || '', name: v.name || '',
      price: v.price || '', contact: v.contact || '', consultDate: v.consultDate || '',
      memo: v.memo || '', status: v.status || 'review', tags: v.tags || [], confirmed: false,
      portfolio: [], docs: [], costItems: [], schedules: [] };
    _data.vendors.push(vendor); save(); return vendor;
  }

  function updateVendor(id, u) {
    const v = _data.vendors.find(v => v.id === id);
    if (v) Object.assign(v, u); save();
  }

  function setVendorConfirmed(id, confirmed) {
    const v = _data.vendors.find(v => v.id === id);
    if (!v) return;
    if (confirmed) {
      _data.vendors.forEach(o => { if (o.category === v.category && o.id !== v.id) o.confirmed = false; });
    }
    v.confirmed = confirmed;
    save();
  }

  function deleteVendor(id) { _data.vendors = _data.vendors.filter(v => v.id !== id); save(); }

  function addVendorPhoto(vendorId, type, data, name) {
    const v = _data.vendors.find(v => v.id === vendorId);
    if (!v) return;
    const p = { id: generateId(), name, data };
    (type === 'portfolio' ? v.portfolio : v.docs).push(p);
    save(); return p;
  }

  // Vendor Cost Items
  function addCostItem(vendorId, item) {
    const v = _data.vendors.find(v => v.id === vendorId);
    if (!v) return;
    if (!v.costItems) v.costItems = [];
    const ci = { id: generateId(), name: item.name || '', amount: Number(item.amount) || 0,
                 type: item.type || 'included', memo: item.memo || '' };
    v.costItems.push(ci); save(); return ci;
  }

  function updateCostItem(vendorId, itemId, u) {
    const v = _data.vendors.find(v => v.id === vendorId);
    const ci = v && (v.costItems || []).find(i => i.id === itemId);
    if (ci) Object.assign(ci, u); save();
  }

  function deleteCostItem(vendorId, itemId) {
    const v = _data.vendors.find(v => v.id === vendorId);
    if (v) { v.costItems = (v.costItems || []).filter(i => i.id !== itemId); save(); }
  }

  // Vendor Schedule Items
  function addScheduleItem(vendorId, item) {
    const v = _data.vendors.find(v => v.id === vendorId);
    if (!v) return;
    if (!v.schedules) v.schedules = [];
    const si = { id: generateId(), name: item.name || '', date: item.date || '', memo: item.memo || '' };
    v.schedules.push(si); save(); return si;
  }

  function updateScheduleItem(vendorId, itemId, u) {
    const v = _data.vendors.find(v => v.id === vendorId);
    const si = v && (v.schedules || []).find(i => i.id === itemId);
    if (si) Object.assign(si, u); save();
  }

  function deleteScheduleItem(vendorId, itemId) {
    const v = _data.vendors.find(v => v.id === vendorId);
    if (v) { v.schedules = (v.schedules || []).filter(i => i.id !== itemId); save(); }
  }

  function getVendorCostSummary() {
    const byCategory = {};
    let total = 0;
    for (const v of get().vendors) {
      const sum = (v.costItems || []).reduce((s, i) => s + (i.amount || 0), 0);
      total += sum;
      if (!byCategory[v.category]) byCategory[v.category] = { count: 0, total: 0 };
      byCategory[v.category].count += 1;
      byCategory[v.category].total += sum;
    }
    return { total, byCategory };
  }

  function deleteVendorPhoto(vendorId, type, photoId) {
    const v = _data.vendors.find(v => v.id === vendorId);
    if (!v) return;
    if (type === 'portfolio') v.portfolio = v.portfolio.filter(p => p.id !== photoId);
    else v.docs = v.docs.filter(p => p.id !== photoId);
    save();
  }

  // Reference Photos
  function getPhotos() { return get().photos; }

  function addPhoto(category, data, memo) {
    const p = { id: generateId(), category, data, memo: memo || '', createdAt: Date.now() };
    _data.photos.push(p); save(); return p;
  }

  function updatePhoto(id, u) {
    const p = _data.photos.find(p => p.id === id);
    if (p) Object.assign(p, u); save();
  }

  function deletePhoto(id) { _data.photos = _data.photos.filter(p => p.id !== id); save(); }

  // Budget
  function getBudget() { return get().budget; }
  function updateBudgetTotal(total) { _data.budget.total = Number(total); save(); }

  function updateBudgetItem(id, u) {
    const item = _data.budget.items.find(i => i.id === id);
    if (item) Object.assign(item, u); save();
  }

  function addBudgetItem(name) {
    const item = { id: generateId(), name, budget: 0, spent: 0 };
    _data.budget.items.push(item); save(); return item;
  }

  function deleteBudgetItem(id) { _data.budget.items = _data.budget.items.filter(i => i.id !== id); save(); }

  // Income Items
  function addIncomeItem(name, amount) {
    if (!_data.budget.incomeItems) _data.budget.incomeItems = [];
    const item = { id: generateId(), name, amount: Number(amount) || 0 };
    _data.budget.incomeItems.push(item); save(); return item;
  }

  function updateIncomeItem(id, u) {
    const item = (_data.budget.incomeItems || []).find(i => i.id === id);
    if (item) Object.assign(item, u); save();
  }

  function deleteIncomeItem(id) {
    _data.budget.incomeItems = (_data.budget.incomeItems || []).filter(i => i.id !== id); save();
  }

  // Guests
  function getGuests() { return get().guests || []; }

  function addGuest(g) {
    if (!_data.guests) _data.guests = [];
    const guest = { id: generateId(), name: g.name || '', side: g.side || 'groom',
      rsvp: g.rsvp || 'pending', tableNo: g.tableNo || '', gift: Number(g.gift) || 0, memo: g.memo || '' };
    _data.guests.push(guest); save(); return guest;
  }

  function updateGuest(id, u) {
    const g = (_data.guests || []).find(g => g.id === id);
    if (g) Object.assign(g, u); save();
  }

  function deleteGuest(id) {
    _data.guests = (_data.guests || []).filter(g => g.id !== id); save();
  }

  function getGuestSummary() {
    const guests = get().guests || [];
    let attending = 0, pending = 0, absent = 0, giftTotal = 0;
    for (const g of guests) {
      if (g.rsvp === 'attending') attending++;
      else if (g.rsvp === 'absent') absent++;
      else pending++;
      giftTotal += g.gift || 0;
    }
    return { total: guests.length, attending, pending, absent, giftTotal };
  }

  // Honeymoon
  function getHoneymoon() {
    if (!_data.honeymoon) _data.honeymoon = JSON.parse(JSON.stringify(DEFAULT.honeymoon));
    return _data.honeymoon;
  }

  function updateHoneymoonInfo(u) { Object.assign(getHoneymoon(), u); save(); }

  function addHoneymoonItem(item) {
    const h = getHoneymoon();
    const hi = { id: generateId(), title: item.title || '', date: item.date || '', memo: item.memo || '' };
    h.items.push(hi); save(); return hi;
  }

  function updateHoneymoonItem(itemId, u) {
    const h = getHoneymoon();
    const hi = h.items.find(i => i.id === itemId);
    if (hi) Object.assign(hi, u); save();
  }

  function deleteHoneymoonItem(itemId) {
    const h = getHoneymoon();
    h.items = h.items.filter(i => i.id !== itemId); save();
  }

  function addHoneymoonCost(item) {
    const h = getHoneymoon();
    const ci = { id: generateId(), name: item.name || '', amount: Number(item.amount) || 0, memo: item.memo || '' };
    h.costItems.push(ci); save(); return ci;
  }

  function updateHoneymoonCost(itemId, u) {
    const h = getHoneymoon();
    const ci = h.costItems.find(i => i.id === itemId);
    if (ci) Object.assign(ci, u); save();
  }

  function deleteHoneymoonCost(itemId) {
    const h = getHoneymoon();
    h.costItems = h.costItems.filter(i => i.id !== itemId); save();
  }

  function getHoneymoonCostTotal() {
    return getHoneymoon().costItems.reduce((s, i) => s + (i.amount || 0), 0);
  }

  // Progress
  function getProgress() {
    const stages = get().timeline;
    let total = 0, done = 0;
    stages.forEach(s => s.tasks.forEach(t => { total++; if (t.done) done++; }));
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  // Image compression (500px, 40% quality ≈ 10-15KB per image)
  // 실패 시(지원하지 않는 형식 등) null을 반환한다.
  async function compressImage(file) {
    // 아이폰 HEIC/HEIF 사진은 대부분 브라우저가 디코딩하지 못하므로 먼저 JPEG로 변환
    let srcFile = file;
    const isHeic = /\.(heic|heif)$/i.test(file.name || '') || /^image\/hei(c|f)/i.test(file.type || '');
    if (isHeic && typeof heic2any === 'function') {
      try {
        const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
        srcFile = Array.isArray(converted) ? converted[0] : converted;
      } catch (e) {
        // 변환 실패 시 원본 파일로 계속 진행 -> 아래에서 디코딩 실패 시 null 처리
      }
    }

    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          if (!img.naturalWidth || !img.naturalHeight) { resolve(null); return; }
          const MAX = 500;
          let w = img.width, h = img.height;
          if (w > MAX) { h = Math.round((MAX / w) * h); w = MAX; }
          if (h > MAX) { w = Math.round((MAX / h) * w); h = MAX; }
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL('image/jpeg', 0.40));
        };
        img.onerror = () => resolve(null);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(srcFile);
    });
  }

  // Cloud sync helpers (used by auth.js when Firebase is available)
  function exportForCloud() {
    const d = get();
    return { settings: d.settings, timeline: d.timeline, vendors: d.vendors,
             photos: d.photos, budget: d.budget, vendorCategories: d.vendorCategories || DEFAULT.vendorCategories,
             guests: d.guests || [], honeymoon: d.honeymoon || DEFAULT.honeymoon,
             lastModified: d.lastModified || 0 };
  }

  function importFromCloud(cloudData) {
    if (!cloudData) return;
    _data = { ...JSON.parse(JSON.stringify(DEFAULT)), ...cloudData };
    localStorage.setItem(KEY, JSON.stringify(_data));
  }

  // Local backup (JSON export/import)
  function exportBackup() {
    return JSON.parse(JSON.stringify(get()));
  }

  function importBackup(obj) {
    if (!obj) return;
    _data = { ...JSON.parse(JSON.stringify(DEFAULT)), ...obj };
    save();
  }

  return {
    load, get, save, generateId, saveSettings, getLastModified,
    getVendorCategories, addVendorCategory, renameVendorCategory, deleteVendorCategory,
    getStages, addStage, updateStage, deleteStage,
    addTask, updateTask, toggleTask, deleteTask,
    getVendors, addVendor, updateVendor, deleteVendor, setVendorConfirmed,
    addCostItem, updateCostItem, deleteCostItem, getVendorCostSummary,
    addScheduleItem, updateScheduleItem, deleteScheduleItem,
    addVendorPhoto, deleteVendorPhoto,
    getPhotos, addPhoto, updatePhoto, deletePhoto,
    getBudget, updateBudgetTotal, updateBudgetItem, addBudgetItem, deleteBudgetItem,
    addIncomeItem, updateIncomeItem, deleteIncomeItem,
    getGuests, addGuest, updateGuest, deleteGuest, getGuestSummary,
    getHoneymoon, updateHoneymoonInfo,
    addHoneymoonItem, updateHoneymoonItem, deleteHoneymoonItem,
    addHoneymoonCost, updateHoneymoonCost, deleteHoneymoonCost, getHoneymoonCostTotal,
    getProgress, compressImage, exportForCloud, importFromCloud, exportBackup, importBackup
  };
})();
