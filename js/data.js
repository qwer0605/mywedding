window.App = window.App || {};

App.Data = (() => {
  const KEY = 'mywedding_v1';

  const DEFAULT = {
    settings: { groomName: '', brideName: '', weddingDate: '', weddingTime: '', venue: '' },
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
    }
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
    try { localStorage.setItem(KEY, JSON.stringify(_data)); }
    catch { alert('저장 공간이 부족합니다. 사진 일부를 삭제해 주세요.'); }
  }

  function get() { return _data || load(); }
  function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }

  // Settings
  function saveSettings(s) { Object.assign(get().settings, s); save(); }

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
      memo: v.memo || '', status: v.status || 'review', tags: v.tags || [],
      portfolio: [], docs: [] };
    _data.vendors.push(vendor); save(); return vendor;
  }

  function updateVendor(id, u) {
    const v = _data.vendors.find(v => v.id === id);
    if (v) Object.assign(v, u); save();
  }

  function deleteVendor(id) { _data.vendors = _data.vendors.filter(v => v.id !== id); save(); }

  function addVendorPhoto(vendorId, type, data, name) {
    const v = _data.vendors.find(v => v.id === vendorId);
    if (!v) return;
    const p = { id: generateId(), name, data };
    (type === 'portfolio' ? v.portfolio : v.docs).push(p);
    save(); return p;
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

  // Progress
  function getProgress() {
    const stages = get().timeline;
    let total = 0, done = 0;
    stages.forEach(s => s.tasks.forEach(t => { total++; if (t.done) done++; }));
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  // Image compression
  async function compressImage(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const MAX = 900;
          let w = img.width, h = img.height;
          if (w > MAX) { h = Math.round((MAX / w) * h); w = MAX; }
          if (h > MAX) { w = Math.round((MAX / h) * w); h = MAX; }
          const c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL('image/jpeg', 0.72));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  return {
    load, get, save, generateId, saveSettings,
    getStages, addStage, updateStage, deleteStage,
    addTask, updateTask, toggleTask, deleteTask,
    getVendors, addVendor, updateVendor, deleteVendor,
    addVendorPhoto, deleteVendorPhoto,
    getPhotos, addPhoto, updatePhoto, deletePhoto,
    getBudget, updateBudgetTotal, updateBudgetItem, addBudgetItem, deleteBudgetItem,
    getProgress, compressImage
  };
})();
