const express = require('express');
const cors = require('cors');
const path = require('path');
const StorageManager = require('./src/main/storageManager');
const { Mission, InsightDebt } = require('./src/main/dataModels');

const app = express();
const storage = new StorageManager();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/src', express.static('src'));

const userProgress = storage.loadUserProgress();
if (userProgress.shouldResetTickets()) {
  userProgress.resetTickets();
  storage.saveUserProgress(userProgress);
}

app.get('/api/user-progress', (req, res) => {
  const progress = storage.loadUserProgress();
  res.json(progress.toJSON());
});

app.get('/api/missions', (req, res) => {
  const missions = storage.loadMissions();
  res.json(missions.map(m => m.toJSON()));
});

app.get('/api/active-debts', (req, res) => {
  const debts = storage.getActiveDebts();
  res.json(debts.map(d => d.toJSON()));
});

app.get('/api/cleared-debts', (req, res) => {
  const debts = storage.getClearedDebts();
  res.json(debts.map(d => d.toJSON()));
});

app.post('/api/create-mission', (req, res) => {
  const missionData = req.body;
  const mission = new Mission(
    missionData.title,
    missionData.description,
    missionData.difficulty,
    missionData.constraints,
    missionData.rewards,
    missionData.punishment
  );
  storage.saveMission(mission);
  res.json({ success: true });
});

app.post('/api/complete-mission', (req, res) => {
  const { missionId } = req.body;
  const missions = storage.loadMissions();
  const mission = missions.find(m => m.id === missionId);
  
  if (mission && !mission.completed && !mission.failed) {
    mission.completeMission();
    storage.saveMission(mission);
    
    const progress = storage.loadUserProgress();
    const levelUp = progress.addXP(mission.rewards);
    storage.saveUserProgress(progress);
    
    res.json({ 
      success: true, 
      levelUp, 
      xp: mission.rewards,
      newLevel: progress.level 
    });
  } else {
    res.json({ success: false, message: 'Mission already completed or not found' });
  }
});

app.post('/api/fail-mission', (req, res) => {
  const { missionId } = req.body;
  const missions = storage.loadMissions();
  const mission = missions.find(m => m.id === missionId);
  
  if (mission && !mission.completed && !mission.failed) {
    mission.failMission();
    storage.saveMission(mission);
    
    const progress = storage.loadUserProgress();
    const effects = progress.applyPunishment(mission.punishment);
    storage.saveUserProgress(progress);
    
    res.json({ success: true, effects });
  } else {
    res.json({ success: false, message: 'Mission already completed, failed, or not found' });
  }
});

app.post('/api/delete-mission', (req, res) => {
  const { missionId } = req.body;
  storage.deleteMission(missionId);
  res.json({ success: true });
});

app.post('/api/use-help-ticket', (req, res) => {
  const { purpose } = req.body;
  const progress = storage.loadUserProgress();
  
  if (progress.helpTickets <= 0) {
    res.json({ success: false, message: 'No help tickets remaining' });
    return;
  }
  
  progress.useHelpTicket();
  storage.saveUserProgress(progress);
  
  const debt = new InsightDebt('Help', purpose);
  storage.saveInsightDebt(debt);
  
  res.json({ success: true });
});

app.post('/api/use-tutorial-ticket', (req, res) => {
  const { purpose } = req.body;
  const progress = storage.loadUserProgress();
  
  if (progress.tutorialTickets <= 0) {
    res.json({ success: false, message: 'No tutorial tickets remaining' });
    return;
  }
  
  progress.useTutorialTicket();
  storage.saveUserProgress(progress);
  
  const debt = new InsightDebt('Tutorial', purpose);
  storage.saveInsightDebt(debt);
  
  res.json({ success: true });
});

app.post('/api/write-insight', (req, res) => {
  const { debtId, insightText } = req.body;
  const debts = storage.loadInsightDebts();
  const debt = debts.find(d => d.id === debtId);
  
  if (debt && !debt.cleared) {
    debt.clearDebt(insightText);
    storage.saveInsightDebt(debt);
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Debt not found or already cleared' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SoloCraft server running on port ${PORT}`);
});
