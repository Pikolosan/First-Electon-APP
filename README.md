# SoloCraft - Independent Project Builder

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/Electron-33.4.11-47848F?logo=electron)
![Node](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)
![License](https://img.shields.io/badge/license-MIT-green)

**A gamified desktop application for independent project management**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation)

</div>

---

<h2 id="overview">📖 Overview</h2>

SoloCraft is an Electron-based desktop application designed to help developers and creators build projects independently with minimal external assistance. Through a unique combination of mission-based task management, limited help resources, and mandatory learning documentation, SoloCraft encourages self-reliance while providing structured support.

**Philosophy**: Learn by doing. When you need help, you invest in your future knowledge by documenting what you learned.

---

<h2 id="features">✨ Features</h2>

### 🎯 Mission System
- **Create project missions** with customizable difficulty levels (Easy, Medium, Hard)
- **Define constraints** to challenge yourself and improve problem-solving skills
- **Set XP rewards** based on mission complexity
- **Optional punishment system** for failed missions (XP loss, ticket penalties)
- **Track mission status**: Active, Completed, or Failed

### 🎫 Limited Help Tickets
- **3 Help Tickets** per week for external assistance
- **2 Tutorial Tickets** per week for learning resources
- **Automatic weekly reset** to maintain the self-reliance challenge
- **Creates insight debt** when used, encouraging documentation

### 📝 Insight Debt Management
- **Mandatory learning documentation** after using tickets
- **Track outstanding debts** to ensure knowledge retention
- **View past insights** for reference and reflection
- **Clear debts** by writing what you learned

### 🏆 Gamification & Progress
- **XP System**: Earn experience points by completing missions
- **Level Progression**: 100 XP per level
- **Punishment Mechanics**: Natural penalties for mission failures
- **Badge System**: Framework ready for achievements (future implementation)

---

<h2 id="installation">🚀 Installation</h2>

### Prerequisites

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd solocraft-electron
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

### Development Mode

Run with developer tools enabled:
```bash
npm run dev
```

---

<h2 id="usage">💻 Usage</h2>

### Creating Your First Mission

1. Click **"+ Create Mission"** button
2. Fill in mission details:
   - **Title**: Brief, descriptive name
   - **Description**: What you're building or solving
   - **Difficulty**: Easy (10-20 XP), Medium (30-50 XP), Hard (60-100 XP)
   - **Constraints** (optional): Specific limitations or requirements
   - **XP Reward**: Based on estimated effort
   - **Punishment** (optional): Penalty for failure (e.g., "Lose 10 XP")
3. Click **"Create Mission"** to save

### Completing Missions

1. **Select a mission** from the missions table
2. Click **"✓ Complete"** when finished
3. Receive XP rewards and possible level-up

### Using Help Tickets

1. Click **"💡 Use Help Ticket"** or **"📚 Use Tutorial Ticket"**
2. Describe what you need help with
3. **Important**: This creates an insight debt that you must clear

### Clearing Insight Debt

1. Click **"✍ Write Insight"**
2. Select the debt to clear
3. Write what you learned from the help/tutorial
4. Submit to clear the debt

### Viewing Past Insights

Click **"👁 View Insights"** to review your learning history and past reflections.

---

<h2 id="project-structure">🏗️ Project Structure</h2>

```
solocraft-electron/
├── src/
│   ├── main/                      # Electron main process
│   │   ├── main.js               # Application entry point & lifecycle
│   │   ├── dataModels.js         # Mission, InsightDebt, UserProgress classes
│   │   └── storageManager.js     # JSON file persistence layer
│   └── preload/
│       └── preload.js            # Secure IPC bridge between main & renderer
├── public/                        # Frontend assets
│   ├── index.html                # Main application UI
│   ├── renderer.js               # UI logic and event handlers
│   └── styles.css                # Application styling
├── solocraft_data/               # User data (auto-created)
│   ├── missions.json             # Mission records
│   ├── insight_debts.json        # Debt tracking
│   └── user_progress.json        # XP, level, tickets
├── archive/                       # Original Python version
│   └── python-original/
├── package.json                   # Project configuration
└── README.md                      # This file
```

---

<h2 id="documentation">📚 Documentation</h2>

### Data Models

#### Mission
```javascript
{
  id: "uuid",
  title: "Build authentication system",
  description: "Implement JWT-based auth",
  difficulty: "Medium",
  constraints: "No external libraries for JWT",
  rewards: 40,
  punishment: "Lose 15 XP",
  completed: false,
  failed: false,
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

#### InsightDebt
```javascript
{
  id: "uuid",
  ticketType: "Help" | "Tutorial",
  usedFor: "Understanding async/await",
  insightEntry: "Learned that...",
  cleared: false,
  clearedAt: null,
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

#### UserProgress
```javascript
{
  xp: 150,
  level: 2,
  helpTickets: 2,
  tutorialTickets: 1,
  lastTicketReset: "2025-01-01T00:00:00.000Z",
  badges: []
}
```

### Game Mechanics

#### XP & Leveling
- **Level Formula**: `level = Math.floor(xp / 100) + 1`
- **Recommended XP Rewards**:
  - Easy missions: 10-20 XP
  - Medium missions: 30-50 XP
  - Hard missions: 60-100 XP

#### Punishment System
The app intelligently parses punishment text:
- **"Lose X XP"**: Deducts specified XP (may cause level drop)
- **"Lose help ticket"**: Reduces help tickets by 1
- **"Lose tutorial ticket"**: Reduces tutorial tickets by 1
- **Default**: If no specific punishment, loses 5 XP

#### Ticket Reset
- Tickets reset to default every **7 days**
- Default: 3 help tickets, 2 tutorial tickets
- Automatic notification on reset

### Data Persistence

All data is stored locally in JSON files within the `solocraft_data/` directory. The app automatically creates this directory on first run and saves changes immediately.

**Data Files**:
- `missions.json` - All mission data
- `insight_debts.json` - Debt tracking records
- `user_progress.json` - User statistics and progress

**Backup Recommendation**: Regularly backup the `solocraft_data/` directory to prevent data loss.

---

<h2 id="development">🔧 Development</h2>

### Technology Stack

- **Electron**: Cross-platform desktop framework
- **Node.js**: JavaScript runtime for main process
- **Vanilla JavaScript**: No frontend frameworks for simplicity
- **JSON File Storage**: Lightweight local persistence

### Architecture

SoloCraft follows Electron's standard architecture:

1. **Main Process** (`src/main/main.js`)
   - Application lifecycle management
   - Data persistence operations
   - IPC event handlers

2. **Renderer Process** (`public/renderer.js`)
   - UI rendering and interactions
   - User input handling
   - Display updates

3. **Preload Script** (`src/preload/preload.js`)
   - Secure IPC bridge via `contextBridge`
   - Exposes safe API to renderer process

### Adding New Features

1. **Data Model**: Update `src/main/dataModels.js`
2. **Storage**: Add methods in `src/main/storageManager.js`
3. **IPC Handlers**: Register in `src/main/main.js`
4. **Preload API**: Expose in `src/preload/preload.js`
5. **UI**: Implement in `public/index.html` and `public/renderer.js`

### Security Features

- ✅ **Context Isolation**: Renderer isolated from Node.js
- ✅ **No Node Integration**: Prevents security vulnerabilities
- ✅ **IPC Whitelisting**: Only approved channels allowed
- ✅ **Content Security Policy**: Configured for app security

---

## 🐛 Troubleshooting

### App Won't Start
- Verify Node.js 20+ is installed: `node --version`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`
- Check for port conflicts (if running in dev mode)

### Data Not Saving
- Ensure write permissions for `solocraft_data/` directory
- Check developer console (F12) for errors
- Verify disk space availability

### UI Not Responding
- Hard refresh: Close app and restart
- Clear application cache
- Check for JavaScript errors in DevTools (F12)

### Mission/Debt Tables Not Updating
- Refresh the view by switching tabs or restarting
- Check console for IPC communication errors

---

## 🛣️ Roadmap

Future enhancements planned:

- [ ] **Badge Achievement System** (data models ready)
- [ ] **Mission Templates** for common project types
- [ ] **Data Export/Import** (CSV, JSON)
- [ ] **Analytics Dashboard** with progress charts
- [ ] **Mission Categories** and filtering
- [ ] **Dark/Light Theme Toggle**
- [ ] **Cloud Sync** for multi-device support
- [ ] **AI-Powered** mission recommendations
- [ ] **Collaborative Mode** for team projects
- [ ] **Custom Punishment** rules engine

---

## 📜 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on the repository
- Check existing documentation
- Review troubleshooting guide above

---

<div align="center">
⭐ Star this repo if SoloCraft helps you build better!
