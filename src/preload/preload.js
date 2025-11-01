console.log('[DEBUG] preload loaded ✅');
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getUserProgress: () => ipcRenderer.invoke('get-user-progress'),
  getMissions: () => ipcRenderer.invoke('get-missions'),
  getActiveDebts: () => ipcRenderer.invoke('get-active-debts'),
  getClearedDebts: () => ipcRenderer.invoke('get-cleared-debts'),
  createMission: (missionData) => ipcRenderer.invoke('create-mission', missionData),
  completeMission: (missionId) => ipcRenderer.invoke('complete-mission', missionId),
  failMission: (missionId) => ipcRenderer.invoke('fail-mission', missionId),
  deleteMission: (missionId) => ipcRenderer.invoke('delete-mission', missionId),
  useHelpTicket: (purpose) => ipcRenderer.invoke('use-help-ticket', purpose),
  useTutorialTicket: (purpose) => ipcRenderer.invoke('use-tutorial-ticket', purpose),
  writeInsight: (data) => ipcRenderer.invoke('write-insight', data),
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getCurrentProject: () => ipcRenderer.invoke('get-current-project'),
  createProject: (projectData) => ipcRenderer.invoke('create-project', projectData),
  updateProject: (projectData) => ipcRenderer.invoke('update-project', projectData),
  setCurrentProject: (projectId) => ipcRenderer.invoke('set-current-project', projectId),
  deleteProject: (projectId) => ipcRenderer.invoke('delete-project', projectId),
});