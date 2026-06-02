window.App = window.App || {};

App.Budget = (() => {

  function render() {
    const { total, items } = App.Data.getBudget();
    const totalSpent = items.reduce((a, i) => a + i.spent, 0);
    const totalBudget = items.reduce((a, i) => a + i.budget, 0);
    const remain = total - totalSpent;
    const pct = total ? Math.min(Math.round((totalSpent / total) * 100), 100) : 0;

    document.getElementById('budgetScreen').innerHTML = `
      <div class="page-header">
        <div class="page-title">예산 관리</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" onclick="App.Budget.openSetTotal()">총예산 설정</button>
          <button class="btn btn-primary btn-sm" onclick="App.Budget.openAddItem()">+ 항목 추가</button>
        </div>
      </div>

      <div class="budget-summary">
        <div class="budget-stat">
          <div class="stat-label">총 예산</div>
          <div class="stat-value v-total">${fmtWon(total)}</div>
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
                  <td>${item.budget ? fmtWon(item.budget) : <span style="color:var(--text-sub)">미설정</span>}</td>
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

  function openSetTotal() {
    const { total } = App.Data.getBudget();
    App.Modal.show({
      title: '총 예산 설정',
      content: `
        <div class="form-group">
          <label class="form-label">총 예산 (원)</label>
          <input class="form-input" type="number" id="budgetTotal" value="${total || ''}" placeholder="예: 50000000">
          <div style="font-size:12px;color:var(--text-sub);margin-top:6px">예: 5천만 원 → 50000000</div>
        </div>`,
      onConfirm: () => {
        const v = Number(document.getElementById('budgetTotal').value);
        App.Data.updateBudgetTotal(v);
        App.Modal.hide(); render(); App.Home.render();
      }
    });
  }

  function openAddItem() {
    App.Modal.show({
      title: '예산 항목 추가',
      content: budgetItemForm(),
      confirmText: '추가',
      onConfirm: () => {
        const v = readItemForm();
        if (!v) return;
        App.Data.addBudgetItem(v.name);
        const items = App.Data.getBudget().items;
        const newItem = items[items.length - 1];
        App.Data.updateBudgetItem(newItem.id, { budget: v.budget, spent: v.spent });
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
        const v = readItemForm();
        if (!v) return;
        App.Data.updateBudgetItem(id, v);
        App.Modal.hide(); render(); App.Home.render();
      }
    });
  }

  function deleteItem(id) {
    const item = App.Data.getBudget().items.find(i => i.id === id);
    if (!confirm(`"${item?.name}" 항목을 삭제하시겠어요?`)) return;
    App.Data.deleteBudgetItem(id);
    render();
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
          <input class="form-input" type="number" id="bBudget" value="${item?.budget || ''}" placeholder="15000000">
        </div>
        <div class="form-group">
          <label class="form-label">지출 확정 (원)</label>
          <input class="form-input" type="number" id="bSpent" value="${item?.spent || ''}" placeholder="0">
        </div>
      </div>`;
  }

  function readItemForm() {
    const name = document.getElementById('bName').value.trim();
    if (!name) { alert('항목 이름을 입력해주세요.'); return null; }
    return { name, budget: Number(document.getElementById('bBudget').value) || 0, spent: Number(document.getElementById('bSpent').value) || 0 };
  }

  function fmtWon(n) {
    if (!n && n !== 0) return '—';
    if (n >= 100000000) return (n / 100000000).toFixed(n % 100000000 ? 1 : 0) + '억';
    if (n >= 10000) return Math.round(n / 10000) + '만 원';
    return n.toLocaleString() + '원';
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render, openSetTotal, openAddItem, openEditItem, deleteItem };
})();
