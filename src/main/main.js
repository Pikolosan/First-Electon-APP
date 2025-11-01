const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const StorageManager = require('./storageManager');
const { Project, Mission, InsightDebt } = require('./dataModels');

let mainWindow;
const storage = new StorageManager();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    webPreferences: {
      preload: path.resolve(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
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
  const projects = storage.loadProjects();
  
  projects.forEach(project => {
    if (project.shouldResetTickets()) {
      project.resetTickets();
      storage.saveProject(project);
    }
  });

  if (storage.getCurrentProjectId() === null && projects.length > 0) {
    storage.setCurrentProjectId(projects[0].id);
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
  const progress = storage.loadUserProgress();
  const currentProject = storage.getCurrentProject();
  
  return {
    ...progress.toJSON(),
    helpTickets: currentProject ? currentProject.getAvailableHelpTickets() : 0,
    tutorialTickets: currentProject ? currentProject.getAvailableTutorialTickets() : 0
  };
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
  const currentProject = storage.getCurrentProject();
  
  if (!currentProject) {
    return { success: false, message: 'No project selected' };
  }

  const mission = new Mission(
    missionData.title,
    missionData.description,
    missionData.difficulty,
    missionData.constraints,
    missionData.rewards,
    missionData.punishment,
    currentProject.id
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
  console.log('[DEBUG] use-help-ticket triggered with:', purpose);
  const currentProject = storage.getCurrentProject();
  
  if (!currentProject) {
    return { success: false, message: 'No project selected' };
  }
  
  if (currentProject.getAvailableHelpTickets() <= 0) {
    return { success: false, message: 'No help tickets remaining for this project' };
  }
  
  currentProject.useHelpTicket();
  storage.saveProject(currentProject);
  
  const debt = new InsightDebt('Help', purpose);
  storage.saveInsightDebt(debt);
  
  return { success: true };
});

ipcMain.handle('use-tutorial-ticket', (event, purpose) => {
  const currentProject = storage.getCurrentProject();
  
  if (!currentProject) {
    return { success: false, message: 'No project selected' };
  }
  
  if (currentProject.getAvailableTutorialTickets() <= 0) {
    return { success: false, message: 'No tutorial tickets remaining for this project' };
  }
  
  currentProject.useTutorialTicket();
  storage.saveProject(currentProject);
  
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
ipcMain.handle('get-projects', () => {
  const projects = storage.loadProjects();
  return projects.map(p => p.toJSON());
});

ipcMain.handle('get-current-project', () => {
  const project = storage.getCurrentProject();
  return project ? project.toJSON() : null;
});

ipcMain.handle('create-project', (event, projectData) => {
  const project = new Project(
    projectData.name,
    projectData.description,
    projectData.helpTicketLimit,
    projectData.tutorialTicketLimit
  );
  storage.saveProject(project);
  return { success: true, projectId: project.id };
});

ipcMain.handle('update-project', (event, projectData) => {
  const projects = storage.loadProjects();
  const project = projects.find(p => p.id === projectData.id);
  
  if (!project) {
    return { success: false, message: 'Project not found' };
  }
  
  project.name = projectData.name || project.name;
  project.description = projectData.description !== undefined ? projectData.description : project.description;
  project.helpTicketLimit = projectData.helpTicketLimit !== undefined ? projectData.helpTicketLimit : project.helpTicketLimit;
  project.tutorialTicketLimit = projectData.tutorialTicketLimit !== undefined ? projectData.tutorialTicketLimit : project.tutorialTicketLimit;
  
  storage.saveProject(project);
  return { success: true };
});

ipcMain.handle('set-current-project', (event, projectId) => {
  storage.setCurrentProjectId(projectId);
  return { success: true };
});

ipcMain.handle('delete-project', (event, projectId) => {
  const projects = storage.loadProjects();
  
  if (projects.length <= 1) {
    return { success: false, message: 'Cannot delete the last project' };
  }
  
  const currentId = storage.getCurrentProjectId();
  storage.deleteProject(projectId);
  
  if (currentId === projectId) {
    const remainingProjects = storage.loadProjects();
    if (remainingProjects.length > 0) {
      storage.setCurrentProjectId(remainingProjects[0].id);
    }
  }
  
  return { success: true };
});