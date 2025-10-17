const fs = require('fs');
const path = require('path');
const { Mission, InsightDebt, UserProgress } = require('./dataModels');

class StorageManager {
  constructor(dataDir = 'solocraft_data') {
    this.dataDir = dataDir;
    this.missionsFile = path.join(dataDir, 'missions.json');
    this.debtsFile = path.join(dataDir, 'insight_debts.json');
    this.progressFile = path.join(dataDir, 'user_progress.json');
    
    this.initFiles();
  }

  initFiles() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    if (!fs.existsSync(this.missionsFile)) {
      fs.writeFileSync(this.missionsFile, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(this.debtsFile)) {
      fs.writeFileSync(this.debtsFile, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(this.progressFile)) {
      const defaultProgress = new UserProgress();
      fs.writeFileSync(this.progressFile, JSON.stringify(defaultProgress.toJSON(), null, 2));
    }
  }

  saveMission(mission) {
    const missions = this.loadMissions();
    const index = missions.findIndex(m => m.id === mission.id);
    
    if (index >= 0) {
      missions[index] = mission;
    } else {
      missions.push(mission);
    }

    const missionsData = missions.map(m => m.toJSON());
    fs.writeFileSync(this.missionsFile, JSON.stringify(missionsData, null, 2));
  }

  loadMissions() {
    try {
      const data = fs.readFileSync(this.missionsFile, 'utf8');
      const missionsData = JSON.parse(data);
      return missionsData.map(d => Mission.fromJSON(d));
    } catch (error) {
      return [];
    }
  }

  deleteMission(missionId) {
    const missions = this.loadMissions().filter(m => m.id !== missionId);
    const missionsData = missions.map(m => m.toJSON());
    fs.writeFileSync(this.missionsFile, JSON.stringify(missionsData, null, 2));
  }

  saveInsightDebt(debt) {
    const debts = this.loadInsightDebts();
    const index = debts.findIndex(d => d.id === debt.id);
    
    if (index >= 0) {
      debts[index] = debt;
    } else {
      debts.push(debt);
    }

    const debtsData = debts.map(d => d.toJSON());
    fs.writeFileSync(this.debtsFile, JSON.stringify(debtsData, null, 2));
  }

  loadInsightDebts() {
    try {
      const data = fs.readFileSync(this.debtsFile, 'utf8');
      const debtsData = JSON.parse(data);
      return debtsData.map(d => InsightDebt.fromJSON(d));
    } catch (error) {
      return [];
    }
  }

  saveUserProgress(progress) {
    fs.writeFileSync(this.progressFile, JSON.stringify(progress.toJSON(), null, 2));
  }

  loadUserProgress() {
    try {
      const data = fs.readFileSync(this.progressFile, 'utf8');
      const progressData = JSON.parse(data);
      return UserProgress.fromJSON(progressData);
    } catch (error) {
      return new UserProgress();
    }
  }

  getActiveMissions() {
    return this.loadMissions().filter(m => !m.completed);
  }

  getCompletedMissions() {
    return this.loadMissions().filter(m => m.completed);
  }

  getActiveDebts() {
    return this.loadInsightDebts().filter(d => !d.cleared);
  }

  getClearedDebts() {
    return this.loadInsightDebts().filter(d => d.cleared);
  }
}

module.exports = StorageManager;
