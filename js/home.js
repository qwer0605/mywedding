window.App = window.App || {};

App.Home = (() => {
  function getDday() {
    const { weddingDate } = App.Data.get().settings;
    if (!weddingDate) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const wedding = new Date(weddingDate); wedding.setHours(0,0,0,0);
    return Math.ceil((wedding - today) / 86400000);
  }

  function getDdayLabel(dateStr) {
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(dateStr); d.setHours(0,0,0,0);
    const diff = Math.round((d - today) / 86400000);
    const text = diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
    const urgency = diff <= 0 ? 'danger' : diff <= 3 ? 'urgent' : 'normal';
    return { text, urgency };
  }

  function getUrgentItems() {
    const today = new Date(); today.setHours(0,0,0,0);
    const dated = [];

    for (const stage of App.Data.getStages()) {
      for (const task of stage.tasks) {
        if (!task.done && task.dueDate) {
          dated.push({ label: App.Util.esc(task.name), sub: App.Util.esc(stage.name), date: task.dueDate });
        }
      }
    }
    for (const v of App.Data.getVendors()) {
      for (const item of (v.schedules || [])) {
        if (item.date) {
          dated.push({ label: `${App.Util.esc(item.name)} · ${App.Util.esc(v.name)}`, sub: '업체 일정', date: item.date });
        }
      }
    }

    const upcoming = dated
      .filter(d => { const dt = new Date(d.date); dt.setHours(0,0,0,0); return dt >= today; })
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ ...d, ddayLabel: getDdayLabel(d.date) }));

    if (upcoming.length >= 10) return upcoming.slice(0, 10);

    const fallback = [];
    for (const stage of App.Data.getStages()) {
      for (const task of stage.tasks) {
        if (!task.done && !task.dueDate) fallback.push({ label: App.Util.esc(task.name), sub: App.Util.esc(stage.name), ddayLabel: null });
      }
    }
    return [...upcoming, ...fallback].slice(0, 10);
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
    const urgent = getUrgentItems();
    const vendors = App.Data.getVendors();
    const vendorCost = App.Data.getVendorCostSummary();
    const photos = App.Data.getPhotos();
    const budget = App.Data.getBudget();
    const totalSpent = budget.items.reduce((a, i) => a + i.spent, 0);
    const incomeSum = (budget.incomeItems || []).length > 0
      ? (budget.incomeItems || []).reduce((a, i) => a + i.amount, 0)
      : budget.total;
    const totalIncome = incomeSum + App.Data.getGuestSummary().giftTotal;
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
            : `<div class="todo-list">${urgent.map(item => `
              <div class="todo-item">
                <div class="todo-dot"></div>
                <div style="flex:1">
                  <div style="font-size:13px">${item.label}</div>
                  <div style="font-size:11px;color:var(--text-sub);margin-top:2px">${item.sub}${item.ddayLabel ? ` · <span style="color:${item.ddayLabel.urgency === 'danger' ? 'var(--danger)' : item.ddayLabel.urgency === 'urgent' ? 'var(--primary)' : 'var(--text-sub)'};font-weight:${item.ddayLabel.urgency === 'normal' ? '500' : '700'}">${item.ddayLabel.text}</span>` : ''}</div>
                </div>
              </div>`).join('')}</div>`}
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
          <div class="sub">${vendors.length}곳${vendorCost.total ? ' · ' + App.Util.fmtWon(vendorCost.total) : ' 등록'}</div>
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

      ${renderVendorCostCard(vendorCost)}
    `;
  }

  function renderVendorCostCard(vendorCost) {
    const cats = App.Data.getVendorCategories().filter(c => vendorCost.byCategory[c]);

    return `
      <div class="card vendor-cost-card">
        <div class="card-label">업체별 비용 현황</div>
        ${vendorCost.total === 0
          ? `<div style="color:var(--text-sub);font-size:13px;padding:8px 0">업체별 비용 항목을 등록하면 여기에 요약이 표시됩니다.</div>`
          : `${cats.map(c => {
              const { count, total } = vendorCost.byCategory[c];
              return `
                <div class="vendor-cost-row">
                  <span class="vendor-cost-name">${App.Util.esc(c)} <span style="color:var(--text-sub);font-weight:400">(${count}곳)</span></span>
                  <span class="vendor-cost-amount">${total ? App.Util.fmtWon(total) : '—'}</span>
                </div>`;
            }).join('')}
            <div class="vendor-cost-total-row">
              <span>전체 합계</span>
              <span>${App.Util.fmtWon(vendorCost.total)}</span>
            </div>`}
      </div>`;
  }

  return { render };
})();
