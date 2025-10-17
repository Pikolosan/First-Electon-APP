const { randomUUID } = require('crypto');

class Difficulty {
  static EASY = 'Easy';
  static MEDIUM = 'Medium';
  static HARD = 'Hard';
}

class Mission {
  constructor(title, description, difficulty, constraints, rewards, punishment = null, missionId = null) {
    this.id = missionId || randomUUID();
    this.title = title;
    this.description = description;
    this.difficulty = difficulty;
    this.constraints = constraints;
    this.rewards = parseInt(rewards);
    this.punishment = punishment;
    this.createdAt = new Date().toISOString();
    this.completed = false;
    this.completedAt = null;
    this.failed = false;
    this.failedAt = null;
  }

  completeMission() {
    this.completed = true;
    this.completedAt = new Date().toISOString();
  }

  failMission() {
    this.failed = true;
    this.failedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      difficulty: this.difficulty,
      constraints: this.constraints,
      rewards: this.rewards,
      punishment: this.punishment,
      createdAt: this.createdAt,
      completed: this.completed,
      completedAt: this.completedAt,
      failed: this.failed,
      failedAt: this.failedAt
    };
  }

  static fromJSON(data) {
    const mission = new Mission(
      data.title,
      data.description,
      data.difficulty,
      data.constraints,
      data.rewards,
      data.punishment,
      data.id
    );
    mission.createdAt = data.createdAt;
    mission.completed = data.completed;
    mission.completedAt = data.completedAt;
    mission.failed = data.failed || false;
    mission.failedAt = data.failedAt;
    return mission;
  }
}

class InsightDebt {
  constructor(ticketType, usedFor, debtId = null) {
    this.id = debtId || randomUUID();
    this.ticketType = ticketType;
    this.usedFor = usedFor;
    this.createdAt = new Date().toISOString();
    this.cleared = false;
    this.insightEntry = null;
    this.clearedAt = null;
  }

  clearDebt(insightEntry) {
    this.cleared = true;
    this.insightEntry = insightEntry;
    this.clearedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      ticketType: this.ticketType,
      usedFor: this.usedFor,
      createdAt: this.createdAt,
      cleared: this.cleared,
      insightEntry: this.insightEntry,
      clearedAt: this.clearedAt
    };
  }

  static fromJSON(data) {
    const debt = new InsightDebt(data.ticketType, data.usedFor, data.id);
    debt.createdAt = data.createdAt;
    debt.cleared = data.cleared;
    debt.insightEntry = data.insightEntry;
    debt.clearedAt = data.clearedAt;
    return debt;
  }
}

class UserProgress {
  constructor() {
    this.xp = 0;
    this.helpTickets = 3;
    this.tutorialTickets = 2;
    this.lastTicketReset = new Date().toISOString();
    this.level = 1;
    this.badges = [];
  }

  addXP(amount) {
    this.xp += amount;
    const newLevel = Math.floor(this.xp / 100) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      return true;
    }
    return false;
  }

  applyPunishment(punishmentText) {
    const punishmentEffects = [];
    
    if (!punishmentText) {
      return punishmentEffects;
    }

    const punishmentLower = punishmentText.toLowerCase();

    if (punishmentLower.includes('xp') || punishmentLower.includes('experience')) {
      const xpMatch = punishmentLower.match(/(\d+)\s*xp/);
      const xpLoss = xpMatch ? parseInt(xpMatch[1]) : 10;
      
      const oldXP = this.xp;
      this.xp = Math.max(0, this.xp - xpLoss);
      
      const newLevel = Math.max(1, Math.floor(this.xp / 100) + 1);
      if (newLevel < this.level) {
        this.level = newLevel;
        punishmentEffects.push(`Lost ${oldXP - this.xp} XP and dropped to Level ${this.level}`);
      } else {
        punishmentEffects.push(`Lost ${oldXP - this.xp} XP`);
      }
    }

    if (punishmentLower.includes('ticket')) {
      let ticketsLost = 0;
      if (punishmentLower.includes('help') && this.helpTickets > 0) {
        this.helpTickets -= 1;
        ticketsLost += 1;
        punishmentEffects.push('Lost 1 help ticket');
      }
      if (punishmentLower.includes('tutorial') && this.tutorialTickets > 0) {
        this.tutorialTickets -= 1;
        ticketsLost += 1;
        punishmentEffects.push('Lost 1 tutorial ticket');
      }

      if (ticketsLost === 0 && (this.helpTickets > 0 || this.tutorialTickets > 0)) {
        if (this.helpTickets > 0) {
          this.helpTickets -= 1;
          punishmentEffects.push('Lost 1 help ticket');
        } else if (this.tutorialTickets > 0) {
          this.tutorialTickets -= 1;
          punishmentEffects.push('Lost 1 tutorial ticket');
        }
      }
    }

    if (punishmentEffects.length === 0) {
      const oldXP = this.xp;
      this.xp = Math.max(0, this.xp - 5);
      punishmentEffects.push(`Lost ${oldXP - this.xp} XP (default punishment)`);
    }

    return punishmentEffects;
  }

  useHelpTicket() {
    if (this.helpTickets > 0) {
      this.helpTickets -= 1;
      return true;
    }
    return false;
  }

  useTutorialTicket() {
    if (this.tutorialTickets > 0) {
      this.tutorialTickets -= 1;
      return true;
    }
    return false;
  }

  shouldResetTickets() {
    const lastReset = new Date(this.lastTicketReset);
    const daysSinceReset = (new Date() - lastReset) / (1000 * 60 * 60 * 24);
    return daysSinceReset >= 7;
  }

  resetTickets() {
    this.helpTickets = 3;
    this.tutorialTickets = 2;
    this.lastTicketReset = new Date().toISOString();
  }

  toJSON() {
    return {
      xp: this.xp,
      helpTickets: this.helpTickets,
      tutorialTickets: this.tutorialTickets,
      lastTicketReset: this.lastTicketReset,
      level: this.level,
      badges: this.badges
    };
  }

  static fromJSON(data) {
    const progress = new UserProgress();
    progress.xp = data.xp || 0;
    progress.helpTickets = data.helpTickets || 3;
    progress.tutorialTickets = data.tutorialTickets || 2;
    progress.lastTicketReset = data.lastTicketReset || new Date().toISOString();
    progress.level = data.level || 1;
    progress.badges = data.badges || [];
    return progress;
  }
}

module.exports = { Difficulty, Mission, InsightDebt, UserProgress };
