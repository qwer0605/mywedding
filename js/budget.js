window.App = window.App || {};

App.Budget = (() => {

  function render() {
    const { total, items, incomeItems = [] } = App.Data.getBudget();
    const giftTotal = App.Data.getGuestSummary().giftTotal;
    const incomeSum = incomeItems.length > 0 ? incomeItems.reduce((a, i) => a + i.amount, 0) : total;
    const totalIncome = incomeSum + giftTotal;
    const totalSpent = items.reduce((a, i) => a + i.spent, 0);
    const totalBudget = items.reduce((a, i) => a + i.budget, 0);
    const remain = totalIncome - totalSpent;
    const pct = totalIncome ? Math.min(Math.round((totalSpent / totalIncome) * 100), 100) : 0;

    document.getElementById('budgetScreen').innerHTML = `
      <div class="page-header">
        <div class="page-title">예산 관리</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" onclick="App.Budget.openAddIncome()">+ 수입 추가</button>
          <button class="btn btn-primary btn-sm" onclick="App.Budget.openAddItem()">+ 지출 항목 추가</button>
        </div>
      </div>

      <div class="budget-summary">
        <div class="budget-stat">
          <div class="stat-label">총 수입</div>
          <div class="stat-value v-total">${fmtWon(totalIncome)}</div>
        </div>
        <div class="budget-stat">
          <div class="stat-label">지출 확정</div>
          <div class="stat-value v-spent">${fmtWon(totalSpent)}</div>
          <div class="stat-unit">${pct}%</div>
        </div>
        <div class="budget-stat">
          <div class="stat-label">남은 예산</div>
          <div class="stat-value ${remain >= 0 ? 'v-remain' : 'v-danger'}">${fmtWon(Math.abs(remain))}</div>
          <div class="stat-unit">${remain < 0 ? '⚠️ 초과' : '잔액'}</div>
        </div>
      </div>

      <div class="section-label" style="margin-top:20px">
        수입 내역
        <button class="btn btn-ghost btn-sm" style="margin-left:8px" onclick="App.Budget.openAddIncome()">+ 추가</button>
      </div>
      ${(incomeItems.length === 0 && giftTotal === 0)
        ? `<div style="color:var(--text-sub);font-size:13px;padding:10px 0 6px">수입 항목을 추가해 주세요. (본인 저축, 부모님 지원, 축의금 예상 등)</div>`
        : `<div class="income-list">
            ${incomeItems.map(item => `
              <div class="income-row">
                <span class="income-name">${esc(item.name)}</span>
                <span class="income-amount">${fmtWon(item.amount)}</span>
                <button class="task-btn" onclick="App.Budget.openEditIncome('${item.id}')">✏️</button>
                <button class="task-btn" onclick="App.Budget.deleteIncome('${item.id}')">🗑️</button>
              </div>`).join('')}
            ${giftTotal > 0 ? `
            <div class="income-row" style="cursor:pointer" onclick="App.showTab('guests')">
              <span class="income-name">💌 축의금 합계 (${App.Data.getGuests().filter(g => g.gift > 0).length}명)</span>
              <span class="income-amount">${fmtWon(giftTotal)}</span>
              <span style="width:64px"></span>
            </div>` : ''}
            <div class="income-row income-total-row">
              <span class="income-name" style="font-weight:700">합계</span>
              <span class="income-amount v-total" style="font-weight:700">${fmtWon(totalIncome)}</span>
              <span style="width:64px"></span>
            </div>
          </div>`}

      <div class="section-label" style="margin-top:20px">지출 항목</div>

      <div class="budget-table-wrap">
        <table class="budget-table">
          <thead>
            <tr>
              <th>항목</th>
              <th>계획 예산</th>
              <th>지출 확정</th>
              <th>잔액</th>
              <th style="width:140px">사용 비율</th>
              <th style="width:60px"></th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const itemRemain = item.budget - item.spent;
              const itemPct = item.budget ? Math.min(Math.round((item.spent / item.budget) * 100), 100) : 0;
              const overBudget = item.budget > 0 && item.spent > item.budget;
              return `
                <tr onclick="App.Budget.openEditItem('${item.id}')" style="cursor:pointer">
                  <td><strong>${esc(item.name)}</strong></td>
                  <td>${item.budget ? fmtWon(item.budget) : '<span style="color:var(--text-sub)">미설정</span>'}</td>
                  <td class="${item.spent > 0 ? 'spent-amt' : 'remain-amt'}">${item.spent ? fmtWon(item.spent) : '—'}</td>
                  <td class="${overBudget ? 'danger-amt' : 'remain-amt'}">${item.budget ? fmtWon(Math.abs(itemRemain)) + (overBudget ? ' 초과' : '') : '—'}</td>
                  <td>
                    <div class="bar-wrap"><div class="bar-fill ${overBudget ? 'over' : ''}" style="width:${itemPct}%"></div></div>
                    <div style="font-size:11px;color:var(--text-sub);margin-top:3px">${item.budget ? itemPct + '%' : ''}</div>
                  </td>
                  <td>
                    <button class="task-btn" onclick="event.stopPropagation();App.Budget.deleteItem('${item.id}')">🗑️</button>
                  </td>
                </tr>`;
            }).join('')}
            <tr style="background:var(--bg);font-weight:700">
              <td>합계</td>
              <td>${fmtWon(totalBudget)}</td>
              <td class="spent-amt">${fmtWon(totalSpent)}</td>
              <td class="${remain < 0 ? 'danger-amt' : 'remain-amt'}">${fmtWon(Math.abs(remain))}${remain < 0 ? ' 초과' : ''}</td>
              <td colspan="2">
                <div class="bar-wrap"><div class="bar-fill ${remain < 0 ? 'over' : ''}" style="width:${pct}%"></div></div>
                <div style="font-size:11px;color:var(--text-sub);margin-top:3px">수입 대비 ${pct}%</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="warning-box" style="margin-top:14px">
        <span>⚠️</span>
        <div>
          <strong>숨은 비용 주의</strong><br>
          예식장 봉사료·부가세, 스드메 추가 옵션비, 외부 업체 반입료 등은 계약서에 별도 명시됩니다. 계약 전 반드시 확인하세요.
        </div>
      </div>
    `;
  }

  function openAddIncome() {
    App.Modal.show({
      title: '수입 항목 추가',
      content: incomeItemForm(),
      confirmText: '추가',
      onConfirm: () => {
        const v = readIncomeItemForm(); if (!v) return;
        App.Data.addIncomeItem(v.name, v.amount);
        App.Modal.hide(); render(); App.Home.render();
      }
    });
  }

  function openEditIncome(id) {
    const item = (App.Data.getBudget().incomeItems || []).find(i => i.id === id);
    if (!item) return;
    App.Modal.show({
      title: '수입 항목 편집',
      content: incomeItemForm(item),
      confirmText: '저장',
      onConfirm: () => {
        const v = readIncomeItemForm(); if (!v) return;
        App.Data.updateIncomeItem(id, v);
        App.Modal.hide(); render(); App.Home.render();
      }
    });
  }

  function deleteIncome(id) {
    const item = (App.Data.getBudget().incomeItems || []).find(i => i.id === id);
    if (!confirm(`"${item?.name}" 수입 항목을 삭제하시겠어요?`)) return;
    App.Data.deleteIncomeItem(id); render(); App.Home.render();
  }

  function incomeItemForm(item) {
    return `
      <div class="form-group">
        <label class="form-label">항목 이름 *</label>
        <input class="form-input" id="iName" value="${esc(item?.name || '')}" placeholder="예: 본인 저축, 부모님 지원">
      </div>
      <div class="form-group">
        <label class="form-label">금액 (원)</label>
        <input class="form-input" type="text" inputmode="numeric" id="iAmount" value="${item?.amount ? Number(item.amount).toLocaleString('ko-KR') : ''}" placeholder="예: 20,000,000" oninput="App.Util.formatNumberInput(this)">
        <div style="font-size:12px;color:var(--text-sub);margin-top:6px">2천만 원 → 20,000,000</div>
      </div>`;
  }

  function readIncomeItemForm() {
    const name = document.getElementById('iName').value.trim();
    if (!name) { alert('항목 이름을 입력해주세요.'); return null; }
    return { name, amount: App.Util.parseNumberInput('iAmount') };
  }

  function openAddItem() {
    App.Modal.show({
      title: '예산 항목 추가',
      content: budgetItemForm(),
      confirmText: '추가',
      onConfirm: () => {
        const v = readItemForm(); if (!v) return;
        App.Data.addBudgetItem(v.name);
        const items = App.Data.getBudget().items;
        App.Data.updateBudgetItem(items[items.length - 1].id, { budget: v.budget, spent: v.spent });
        App.Modal.hide(); render();
      }
    });
  }

  function openEditItem(id) {
    const item = App.Data.getBudget().items.find(i => i.id === id);
    if (!item) return;
    App.Modal.show({
      title: '항목 편집',
      content: budgetItemForm(item),
      confirmText: '저장',
      onConfirm: () => {
        const v = readItemForm(); if (!v) return;
        App.Data.updateBudgetItem(id, v);
        App.Modal.hide(); render(); App.Home.render();
      }
    });
  }

  function deleteItem(id) {
    const item = App.Data.getBudget().items.find(i => i.id === id);
    if (!confirm(`"${item?.name}" 항목을 삭제하시겠어요?`)) return;
    App.Data.deleteBudgetItem(id); render();
  }

  function budgetItemForm(item) {
    return `
      <div class="form-group">
        <label class="form-label">항목 이름 *</label>
        <input class="form-input" id="bName" value="${esc(item?.name || '')}" placeholder="예: 예식장">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">계획 예산 (원)</label>
          <input class="form-input" type="text" inputmode="numeric" id="bBudget" value="${item?.budget ? Number(item.budget).toLocaleString('ko-KR') : ''}" placeholder="15,000,000" oninput="App.Util.formatNumberInput(this)">
        </div>
        <div class="form-group">
          <label class="form-label">지출 확정 (원)</label>
          <input class="form-input" type="text" inputmode="numeric" id="bSpent" value="${item?.spent ? Number(item.spent).toLocaleString('ko-KR') : ''}" placeholder="0" oninput="App.Util.formatNumberInput(this)">
        </div>
      </div>`;
  }

  function readItemForm() {
    const name = document.getElementById('bName').value.trim();
    if (!name) { alert('항목 이름을 입력해주세요.'); return null; }
    return { name, budget: App.Util.parseNumberInput('bBudget'), spent: App.Util.parseNumberInput('bSpent') };
  }

  function fmtWon(n) {
    if (!n && n !== 0) return '—';
    if (n >= 100000000) return (n / 100000000).toFixed(n % 100000000 ? 1 : 0) + '억 원';
    if (n >= 10000) return Math.round(n / 10000).toLocaleString() + '만 원';
    return n.toLocaleString() + '원';
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render, openAddIncome, openEditIncome, deleteIncome, openAddItem, openEditItem, deleteItem };
})();
