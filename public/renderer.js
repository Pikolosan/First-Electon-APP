let selectedMissionId = null;
let selectedDebtId = null;
let allMissions = [];

async function refreshAll() {
  await Promise.all([
    refreshUserProgress(),
    refreshMissions(),
    refreshDebts()
  ]);
}

async function refreshUserProgress() {
  const response = await fetch('/api/user-progress');
  const progress = await response.json();
  document.getElementById('xp-value').textContent = progress.xp;
  document.getElementById('level-value').textContent = progress.level;
  document.getElementById('help-tickets-value').textContent = progress.helpTickets;
  document.getElementById('tutorial-tickets-value').textContent = progress.tutorialTickets;
}

async function refreshMissions() {
  const response = await fetch('/api/missions');
  const missions = await response.json();
  allMissions = missions;
  const tbody = document.getElementById('missions-tbody');
  tbody.innerHTML = '';

  missions.forEach(mission => {
    const row = document.createElement('tr');
    row.dataset.id = mission.id;
    
    let status = 'Active';
    if (mission.completed) status = 'Completed';
    else if (mission.failed) status = 'Failed';

    row.innerHTML = `
      <td>${mission.title}</td>
      <td>${mission.difficulty}</td>
      <td>${mission.rewards}</td>
      <td>${status}</td>
    `;

    row.addEventListener('click', () => {
      document.querySelectorAll('#missions-tbody tr').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      selectedMissionId = mission.id;
      
      showMissionDetails(mission);
    });

    tbody.appendChild(row);
  });
}

async function refreshDebts() {
  const response = await fetch('/api/active-debts');
  const debts = await response.json();
  const tbody = document.getElementById('debt-tbody');
  tbody.innerHTML = '';

  debts.forEach(debt => {
    const row = document.createElement('tr');
    row.dataset.id = debt.id;

    row.innerHTML = `
      <td>${debt.ticketType}</td>
      <td>${debt.usedFor}</td>
      <td>Outstanding</td>
    `;

    row.addEventListener('click', () => {
      document.querySelectorAll('#debt-tbody tr').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      selectedDebtId = debt.id;
    });

    tbody.appendChild(row);
  });
}

function showMissionDetails(mission) {
  let status = 'Active';
  if (mission.completed) status = 'Completed ✓';
  else if (mission.failed) status = 'Failed ✗';
  
  const content = `
    <div class="mission-details">
      <div class="detail-row">
        <strong>Title:</strong> ${mission.title}
      </div>
      <div class="detail-row">
        <strong>Description:</strong> ${mission.description}
      </div>
      <div class="detail-row">
        <strong>Difficulty:</strong> ${mission.difficulty}
      </div>
      <div class="detail-row">
        <strong>XP Reward:</strong> ${mission.rewards}
      </div>
      ${mission.constraints ? `<div class="detail-row"><strong>Constraints:</strong> ${mission.constraints}</div>` : ''}
      ${mission.punishment ? `<div class="detail-row"><strong>Punishment:</strong> ${mission.punishment}</div>` : ''}
      <div class="detail-row">
        <strong>Status:</strong> ${status}
      </div>
      <div class="detail-row">
        <strong>Created:</strong> ${new Date(mission.createdAt).toLocaleString()}
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;

  showModal('Mission Details', content);
}

function showModal(title, content) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  
  modalBody.innerHTML = `<h3>${title}</h3>${content}`;
  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function showMessage(type, message) {
  alert(message);
}

document.querySelector('.close').addEventListener('click', closeModal);

window.addEventListener('click', (event) => {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
});

document.getElementById('create-mission-btn').addEventListener('click', () => {
  const content = `
    <form id="mission-form">
      <div class="form-group">
        <label>Mission Title</label>
        <input type="text" id="mission-title" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="mission-description" required></textarea>
      </div>
      <div class="form-group">
        <label>Difficulty</label>
        <select id="mission-difficulty">
          <option value="Easy">Easy</option>
          <option value="Medium" selected>Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>
      <div class="form-group">
        <label>Constraints (optional)</label>
        <textarea id="mission-constraints"></textarea>
      </div>
      <div class="form-group">
        <label>XP Reward</label>
        <input type="number" id="mission-rewards" value="30" min="0" required>
      </div>
      <div class="form-group">
        <label>Punishment (optional)</label>
        <input type="text" id="mission-punishment" placeholder="e.g., Lose 10 XP">
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Mission</button>
      </div>
    </form>
  `;

  showModal('Create New Mission', content);

  document.getElementById('mission-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const missionData = {
      title: document.getElementById('mission-title').value,
      description: document.getElementById('mission-description').value,
      difficulty: document.getElementById('mission-difficulty').value,
      constraints: document.getElementById('mission-constraints').value,
      rewards: parseInt(document.getElementById('mission-rewards').value),
      punishment: document.getElementById('mission-punishment').value || null
    };

    const response = await fetch('/api/create-mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(missionData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      closeModal();
      showMessage('success', 'Mission created successfully! 🎯');
      await refreshMissions();
    }
  });
});

document.getElementById('complete-mission-btn').addEventListener('click', async () => {
  if (!selectedMissionId) {
    showMessage('warning', 'Please select a mission to complete.');
    return;
  }

  const response = await fetch('/api/complete-mission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ missionId: selectedMissionId })
  });
  
  const result = await response.json();
  
  if (result.success) {
    let message = `Mission completed! 🎉\nYou earned ${result.xp} XP!`;
    if (result.levelUp) {
      message += `\n\n🎊 LEVEL UP! You are now Level ${result.newLevel}!`;
    }
    showMessage('success', message);
    selectedMissionId = null;
    await refreshAll();
  } else {
    showMessage('warning', result.message);
  }
});

document.getElementById('fail-mission-btn').addEventListener('click', async () => {
  if (!selectedMissionId) {
    showMessage('warning', 'Please select a mission to fail.');
    return;
  }

  if (!confirm('Are you sure you want to mark this mission as failed? Punishment will be applied.')) {
    return;
  }

  const response = await fetch('/api/fail-mission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ missionId: selectedMissionId })
  });
  
  const result = await response.json();
  
  if (result.success) {
    let message = 'Mission failed!';
    if (result.effects && result.effects.length > 0) {
      message += '\n\nPunishments applied:\n• ' + result.effects.join('\n• ');
    }
    showMessage('warning', message);
    selectedMissionId = null;
    await refreshAll();
  } else {
    showMessage('warning', result.message);
  }
});

document.getElementById('delete-mission-btn').addEventListener('click', async () => {
  if (!selectedMissionId) {
    showMessage('warning', 'Please select a mission to delete.');
    return;
  }

  if (!confirm('Are you sure you want to delete this mission?')) {
    return;
  }

  const response = await fetch('/api/delete-mission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ missionId: selectedMissionId })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showMessage('success', 'Mission deleted successfully!');
    selectedMissionId = null;
    await refreshMissions();
  }
});

document.getElementById('use-help-ticket-btn').addEventListener('click', async () => {
  const purpose = prompt('What do you need help with?');
  
  if (!purpose) return;

  const response = await fetch('/api/use-help-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purpose })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showMessage('info', 'Help ticket used! 📝 You now have an insight debt to clear.');
    await refreshAll();
  } else {
    showMessage('warning', result.message);
  }
});

document.getElementById('use-tutorial-ticket-btn').addEventListener('click', async () => {
  const purpose = prompt('What tutorial do you need?');
  
  if (!purpose) return;

  const response = await fetch('/api/use-tutorial-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purpose })
  });
  
  const result = await response.json();
  
  if (result.success) {
    showMessage('info', 'Tutorial ticket used! 📝 You now have an insight debt to clear.');
    await refreshAll();
  } else {
    showMessage('warning', result.message);
  }
});

document.getElementById('write-insight-btn').addEventListener('click', async () => {
  const response = await fetch('/api/active-debts');
  const debts = await response.json();
  
  if (debts.length === 0) {
    showMessage('success', '🎉 You have no outstanding insight debts!');
    return;
  }

  const content = `
    <form id="insight-form">
      <div class="form-group">
        <label>Select Debt to Clear</label>
        <select id="debt-select" required>
          ${debts.map(d => `<option value="${d.id}">${d.ticketType} - ${d.usedFor}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Write Your Insight</label>
        <textarea id="insight-text" required rows="6" placeholder="What did you learn?"></textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit Insight</button>
      </div>
    </form>
  `;

  showModal('Write Insight', content);

  document.getElementById('insight-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const debtId = document.getElementById('debt-select').value;
    const insightText = document.getElementById('insight-text').value;

    const response = await fetch('/api/write-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ debtId, insightText })
    });
    
    const result = await response.json();
    
    if (result.success) {
      closeModal();
      showMessage('success', '✨ Your insight has been recorded and the debt cleared!');
      await refreshDebts();
    } else {
      showMessage('warning', result.message);
    }
  });
});

document.getElementById('view-insights-btn').addEventListener('click', async () => {
  const response = await fetch('/api/cleared-debts');
  const clearedDebts = await response.json();
  
  if (clearedDebts.length === 0) {
    showMessage('info', 'You haven\'t recorded any insights yet.');
    return;
  }

  const content = `
    <div class="insights-container">
      ${clearedDebts.map(debt => `
        <div class="insight-item">
          <div class="insight-header">
            <span>${debt.ticketType} - ${debt.usedFor}</span>
            <span>${new Date(debt.clearedAt).toLocaleDateString()}</span>
          </div>
          <div class="insight-content">${debt.insightEntry}</div>
        </div>
      `).join('')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `;

  showModal('Your Insights', content);
});

refreshAll();
