const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const StorageManager = require('./storageManager');
const { Mission, InsightDebt } = require('./dataModels');

let mainWindow;
const storage = new StorageManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const userProgress = storage.loadUserProgress();
  
  if (userProgress.shouldResetTickets()) {
    userProgress.resetTickets();
    storage.saveUserProgress(userProgress);
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('get-user-progress', () => {
  return storage.loadUserProgress().toJSON();
});

ipcMain.handle('get-missions', () => {
  const missions = storage.loadMissions();
  return missions.map(m => m.toJSON());
});

ipcMain.handle('get-active-debts', () => {
  const debts = storage.getActiveDebts();
  return debts.map(d => d.toJSON());
});

ipcMain.handle('get-cleared-debts', () => {
  const debts = storage.getClearedDebts();
  return debts.map(d => d.toJSON());
});

ipcMain.handle('create-mission', (event, missionData) => {
  const mission = new Mission(
    missionData.title,
    missionData.description,
    missionData.difficulty,
    missionData.constraints,
    missionData.rewards,
    missionData.punishment
  );
  storage.saveMission(mission);
  return { success: true };
});

ipcMain.handle('complete-mission', (event, missionId) => {
  const missions = storage.loadMissions();
  const mission = missions.find(m => m.id === missionId);
  
  if (mission && !mission.completed && !mission.failed) {
    mission.completeMission();
    storage.saveMission(mission);
    
    const progress = storage.loadUserProgress();
    const levelUp = progress.addXP(mission.rewards);
    storage.saveUserProgress(progress);
    
    return { 
      success: true, 
      levelUp, 
      xp: mission.rewards,
      newLevel: progress.level 
    };
  }
  
  return { success: false, message: 'Mission already completed or not found' };
});

ipcMain.handle('fail-mission', (event, missionId) => {
  const missions = storage.loadMissions();
  const mission = missions.find(m => m.id === missionId);
  
  if (mission && !mission.completed && !mission.failed) {
    mission.failMission();
    storage.saveMission(mission);
    
    const progress = storage.loadUserProgress();
    const effects = progress.applyPunishment(mission.punishment);
    storage.saveUserProgress(progress);
    
    return { success: true, effects };
  }
  
  return { success: false, message: 'Mission already completed, failed, or not found' };
});

ipcMain.handle('delete-mission', (event, missionId) => {
  storage.deleteMission(missionId);
  return { success: true };
});

ipcMain.handle('use-help-ticket', (event, purpose) => {
  const progress = storage.loadUserProgress();
  
  if (progress.helpTickets <= 0) {
    return { success: false, message: 'No help tickets remaining' };
  }
  
  progress.useHelpTicket();
  storage.saveUserProgress(progress);
  
  const debt = new InsightDebt('Help', purpose);
  storage.saveInsightDebt(debt);
  
  return { success: true };
});

ipcMain.handle('use-tutorial-ticket', (event, purpose) => {
  const progress = storage.loadUserProgress();
  
  if (progress.tutorialTickets <= 0) {
    return { success: false, message: 'No tutorial tickets remaining' };
  }
  
  progress.useTutorialTicket();
  storage.saveUserProgress(progress);
  
  const debt = new InsightDebt('Tutorial', purpose);
  storage.saveInsightDebt(debt);
  
  return { success: true };
});

ipcMain.handle('write-insight', (event, { debtId, insightText }) => {
  const debts = storage.loadInsightDebts();
  const debt = debts.find(d => d.id === debtId);
  
  if (debt && !debt.cleared) {
    debt.clearDebt(insightText);
    storage.saveInsightDebt(debt);
    return { success: true };
  }
  
  return { success: false, message: 'Debt not found or already cleared' };
});
