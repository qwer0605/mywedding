window.App = window.App || {};

App.Home = (() => {
  function getDday() {
    const { weddingDate } = App.Data.get().settings;
    if (!weddingDate) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const wedding = new Date(weddingDate); wedding.setHours(0,0,0,0);
    return Math.ceil((wedding - today) / 86400000);
  }

  function getUrgentTasks() {
    const stages = App.Data.getStages();
    const pending = [];
    for (const stage of stages) {
      for (const task of stage.tasks) {
        if (!task.done) pending.push({ stage: stage.name, task });
      }
      if (pending.length >= 3) break;
    }
    return pending.slice(0, 3);
  }

  function fmt(n) {
    if (n === null) return '—';
    if (n < 0) return `D+${Math.abs(n)}`;
    if (n === 0) return '오늘';
    return `D-${n}`;
  }

  function render() {
    const { groomName, brideName, weddingDate, weddingTime } = App.Data.get().settings;
    const dday = getDday();
    const { total, done, pct } = App.Data.getProgress();
    const urgent = getUrgentTasks();
    const vendors = App.Data.getVendors();
    const photos = App.Data.getPhotos();
    const budget = App.Data.getBudget();
    const totalSpent = budget.items.reduce((a, i) => a + i.spent, 0);
    const totalIncome = (budget.incomeItems || []).length > 0
      ? (budget.incomeItems || []).reduce((a, i) => a + i.amount, 0)
      : budget.total;
    const budgetPct = totalIncome ? Math.round((totalSpent / totalIncome) * 100) : 0;

    const dateStr = weddingDate
      ? new Date(weddingDate).toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'short' })
        + (weddingTime ? ` · ${weddingTime}` : '')
      : '날짜 미설정';

    const ddayNum = dday === null ? '—' : dday < 0 ? Math.abs(dday) : dday;
    const ddaySign = dday === null ? '' : dday < 0 ? 'D+' : dday === 0 ? '' : 'D-';
    const ddayLabel = dday === 0 ? '오늘이에요!' : '';

    document.getElementById('homeScreen').innerHTML = `
      <div class="dday-card">
        <div class="dday-names">${groomName || '신랑'} 💕 ${brideName || '신부'}</div>
        <div class="dday-row">
          <div class="dday-sign">${ddaySign}</div>
          <div class="dday-number">${ddayNum}</div>
        </div>
        ${ddayLabel ? `<div class="dday-today">${ddayLabel}</div>` : ''}
        <div class="dday-date">${dateStr}</div>
        <button class="btn btn-ghost btn-sm" style="margin-top:14px;font-size:12px" onclick="App.showSetup()">⚙️ 정보 수정</button>
      </div>

      <div class="home-grid">
        <div class="card">
          <div class="card-label">전체 진행률</div>
          <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>
          <div class="progress-info">
            <span>완료 ${done} / 전체 ${total}항목</span>
            <span style="font-weight:700;color:var(--primary)">${pct}%</span>
          </div>
        </div>

        <div class="card">
          <div class="card-label">지금 해야 할 것</div>
          ${urgent.length === 0
            ? '<div style="color:var(--text-sub);font-size:13px;padding:8px 0">모든 항목 완료 🎉</div>'
            : urgent.map(({ stage, task }) => `
              <div class="todo-item">
                <div class="todo-dot"></div>
                <div style="flex:1">
                  <div style="font-size:13px">${task.name}</div>
                  <div style="font-size:11px;color:var(--text-sub);margin-top:2px">${stage}</div>
                </div>
              </div>`).join('')}
        </div>
      </div>

      <div class="quick-grid">
        <div class="quick-card" onclick="App.showTab('timeline')">
          <div class="icon">📅</div>
          <div class="name">타임라인</div>
          <div class="sub">${pct}% 완료</div>
        </div>
        <div class="quick-card" onclick="App.showTab('vendor')">
          <div class="icon">🏢</div>
          <div class="name">업체 관리</div>
          <div class="sub">${vendors.length}곳 등록</div>
        </div>
        <div class="quick-card" onclick="App.showTab('photos')">
          <div class="icon">📷</div>
          <div class="name">참고사진</div>
          <div class="sub">${photos.length}장 저장</div>
        </div>
        <div class="quick-card" onclick="App.showTab('budget')">
          <div class="icon">💰</div>
          <div class="name">예산</div>
          <div class="sub">${budgetPct}% 지출</div>
        </div>
      </div>
    `;
  }

  return { render };
})();
