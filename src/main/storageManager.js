const fs = require('fs');
const path = require('path');
const { Project, Mission, InsightDebt, UserProgress } = require('./dataModels');

class StorageManager {
  constructor(dataDir = 'solocraft_data') {
    this.dataDir = dataDir;
    this.missionsFile = path.join(dataDir, 'missions.json');
    this.debtsFile = path.join(dataDir, 'insight_debts.json');
    this.progressFile = path.join(dataDir, 'user_progress.json');
    this.projectsFile = path.join(dataDir, 'projects.json');
    this.settingsFile = path.join(dataDir, 'settings.json');
    
    this.initFiles();
  }

  initFiles() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true});
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

    if (!fs.existsSync(this.projectsFile)) {
      const defaultProject = new Project('Default Project', 'Your first project');
      fs.writeFileSync(this.projectsFile, JSON.stringify([defaultProject.toJSON()], null, 2));
    }

    if (!fs.existsSync(this.settingsFile)) {
      const defaultSettings = { currentProjectId: null };
      fs.writeFileSync(this.settingsFile, JSON.stringify(defaultSettings, null, 2));
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

  saveProject(project) {
    const projects = this.loadProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }

    const projectsData = projects.map(p => p.toJSON());
    fs.writeFileSync(this.projectsFile, JSON.stringify(projectsData, null, 2));
  }

  loadProjects() {
    try {
      const data = fs.readFileSync(this.projectsFile, 'utf8');
      const projectsData = JSON.parse(data);
      return projectsData.map(d => Project.fromJSON(d));
    } catch (error) {
      return [];
    }
  }

  deleteProject(projectId) {
    const projects = this.loadProjects().filter(p => p.id !== projectId);
    const projectsData = projects.map(p => p.toJSON());
    fs.writeFileSync(this.projectsFile, JSON.stringify(projectsData, null, 2));
  }

  getCurrentProjectId() {
    try {
      const data = fs.readFileSync(this.settingsFile, 'utf8');
      const settings = JSON.parse(data);
      return settings.currentProjectId;
    } catch (error) {
      return null;
    }
  }

  setCurrentProjectId(projectId) {
    const settings = { currentProjectId: projectId };
    fs.writeFileSync(this.settingsFile, JSON.stringify(settings, null, 2));
  }

  getCurrentProject() {
    const currentId = this.getCurrentProjectId();
    const projects = this.loadProjects();
    
    if (currentId) {
      const project = projects.find(p => p.id === currentId);
      if (project) return project;
    }
    
    return projects.length > 0 ? projects[0] : null;
  }

  getProjectMissions(projectId) {
    return this.loadMissions().filter(m => m.projectId === projectId);
  }
}

module.exports = StorageManager;