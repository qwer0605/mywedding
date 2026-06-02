window.App = window.App || {};

App.Timeline = (() => {

  function render() {
    const stages = App.Data.getStages();
    document.getElementById('timelineScreen').innerHTML = `
      <div class="page-header">
        <div class="page-title">타임라인</div>
        <button class="btn btn-outline btn-sm" onclick="App.Timeline.openAddStage()">+ 단계 추가</button>
      </div>
      <div id="stageList">
        ${stages.map(renderStage).join('')}
      </div>
    `;
  }

  function renderStage(stage) {
    const done = stage.tasks.filter(t => t.done).length;
    const total = stage.tasks.length;
    const badgeCls = done === total && total > 0 ? 'done' : '';
    return `
      <div class="timeline-stage" id="stage-${stage.id}">
        <div class="stage-header" onclick="App.Timeline.toggleStage('${stage.id}')">
          <span class="stage-arrow ${stage.expanded ? 'open' : ''}">▶</span>
          <span class="stage-name">${esc(stage.name)}</span>
          <span class="stage-period">${esc(stage.period)}</span>
          <span class="stage-badge ${badgeCls}">${done} / ${total} 완료</span>
        </div>
        <div class="stage-body ${stage.expanded ? 'open' : ''}">
          ${stage.tasks.map(t => renderTask(stage.id, t)).join('')}
          <div class="stage-footer">
            <div class="stage-add" onclick="App.Timeline.openAddTask('${stage.id}')">＋ 항목 추가</div>
            <div style="margin-left:auto;display:flex;gap:6px;">
              <button class="btn btn-ghost btn-sm" onclick="App.Timeline.openEditStage('${stage.id}')">단계 편집</button>
              <button class="btn btn-sm btn-danger" onclick="App.Timeline.deleteStage('${stage.id}')">삭제</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderTask(stageId, task) {
    return `
      <div class="task-item" id="task-${task.id}">
        <div class="task-check ${task.done ? 'done' : ''}" onclick="App.Timeline.toggleTask('${stageId}','${task.id}')">
          ${task.done ? '✓' : ''}
        </div>
        <div style="flex:1">
          <div class="task-name ${task.done ? 'done' : ''}">${esc(task.name)}</div>
          ${task.memo ? `<div class="task-memo">${esc(task.memo)}</div>` : ''}
          ${task.dueDate ? `<div class="task-meta">📅 ${task.dueDate}</div>` : ''}
          ${task.done && task.doneDate ? `<div class="task-meta" style="color:var(--success)">✓ ${task.doneDate} 완료</div>` : ''}
        </div>
        <div class="task-actions">
          <button class="task-btn" onclick="App.Timeline.openEditTask('${stageId}','${task.id}')">✏️</button>
          <button class="task-btn" onclick="App.Timeline.deleteTask('${stageId}','${task.id}')">🗑️</button>
        </div>
      </div>`;
  }

  function toggleStage(stageId) {
    const stage = App.Data.getStages().find(s => s.id === stageId);
    if (!stage) return;
    App.Data.updateStage(stageId, { expanded: !stage.expanded });
    render();
  }

  function toggleTask(stageId, taskId) {
    App.Data.toggleTask(stageId, taskId);
    render();
    App.Home.render();
  }

  function openAddStage() {
    App.Modal.show({
      title: '새 단계 추가',
      content: `
        <div class="form-group">
          <label class="form-label">단계 이름 *</label>
          <input class="form-input" id="stageName" placeholder="예: D-14개월 이상">
        </div>
        <div class="form-group">
          <label class="form-label">부제 (선택)</label>
          <input class="form-input" id="stagePeriod" placeholder="예: 상견례 · 초기 기획">
        </div>`,
      onConfirm: () => {
        const name = document.getElementById('stageName').value.trim();
        if (!name) { alert('단계 이름을 입력해주세요.'); return; }
        App.Data.addStage(name, document.getElementById('stagePeriod').value.trim());
        App.Modal.hide(); render();
      }
    });
  }

  function openEditStage(stageId) {
    const stage = App.Data.getStages().find(s => s.id === stageId);
    if (!stage) return;
    App.Modal.show({
      title: '단계 편집',
      content: `
        <div class="form-group">
          <label class="form-label">단계 이름 *</label>
          <input class="form-input" id="stageName" value="${esc(stage.name)}">
        </div>
        <div class="form-group">
          <label class="form-label">부제</label>
          <input class="form-input" id="stagePeriod" value="${esc(stage.period)}">
        </div>`,
      onConfirm: () => {
        const name = document.getElementById('stageName').value.trim();
        if (!name) { alert('단계 이름을 입력해주세요.'); return; }
        App.Data.updateStage(stageId, { name, period: document.getElementById('stagePeriod').value.trim() });
        App.Modal.hide(); render();
      }
    });
  }

  function deleteStage(stageId) {
    const stage = App.Data.getStages().find(s => s.id === stageId);
    if (!stage) return;
    if (!confirm(`"${stage.name}" 단계를 삭제하시겠어요?\n포함된 항목 ${stage.tasks.length}개도 함께 삭제됩니다.`)) return;
    App.Data.deleteStage(stageId);
    render(); App.Home.render();
  }

  function openAddTask(stageId) {
    App.Modal.show({
      title: '항목 추가',
      content: `
        <div class="form-group">
          <label class="form-label">할 일 *</label>
          <input class="form-input" id="taskName" placeholder="예: 예식장 투어 예약">
        </div>
        <div class="form-group">
          <label class="form-label">예정일 (선택)</label>
          <input class="form-input" type="date" id="taskDue">
        </div>
        <div class="form-group">
          <label class="form-label">메모 (선택)</label>
          <textarea class="form-input" id="taskMemo" rows="2" placeholder="추가 메모..."></textarea>
        </div>`,
      onConfirm: () => {
        const name = document.getElementById('taskName').value.trim();
        if (!name) { alert('할 일을 입력해주세요.'); return; }
        const task = App.Data.addTask(stageId, name);
        App.Data.updateTask(stageId, task.id, {
          dueDate: document.getElementById('taskDue').value,
          memo: document.getElementById('taskMemo').value.trim()
        });
        App.Modal.hide(); render(); App.Home.render();
      }
    });
  }

  function openEditTask(stageId, taskId) {
    const stage = App.Data.getStages().find(s => s.id === stageId);
    const task = stage && stage.tasks.find(t => t.id === taskId);
    if (!task) return;
    App.Modal.show({
      title: '항목 편집',
      content: `
        <div class="form-group">
          <label class="form-label">할 일 *</label>
          <input class="form-input" id="taskName" value="${esc(task.name)}">
        </div>
        <div class="form-group">
          <label class="form-label">예정일</label>
          <input class="form-input" type="date" id="taskDue" value="${task.dueDate || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">메모</label>
          <textarea class="form-input" id="taskMemo" rows="2">${esc(task.memo)}</textarea>
        </div>`,
      onConfirm: () => {
        const name = document.getElementById('taskName').value.trim();
        if (!name) { alert('할 일을 입력해주세요.'); return; }
        App.Data.updateTask(stageId, taskId, {
          name,
          dueDate: document.getElementById('taskDue').value,
          memo: document.getElementById('taskMemo').value.trim()
        });
        App.Modal.hide(); render();
      }
    });
  }

  function deleteTask(stageId, taskId) {
    if (!confirm('이 항목을 삭제하시겠어요?')) return;
    App.Data.deleteTask(stageId, taskId);
    render(); App.Home.render();
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render, toggleStage, toggleTask, openAddStage, openEditStage, deleteStage, openAddTask, openEditTask, deleteTask };
})();
