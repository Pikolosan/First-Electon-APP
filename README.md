# SoloCraft - Independent Project Builder (Electron Edition)

## Overview

SoloCraft is a desktop application built with Electron that helps users build projects independently with minimal external assistance. The app implements a mission-based system where users create project tasks, manage limited help resources through a ticket system, and track their learning through insight debt management. The application encourages self-reliance while providing structured support through gamification mechanics including XP, levels, and achievement tracking.

**Current Status**: Fully functional Electron desktop application with complete punishment system implementation.

## User Preferences

Preferred communication style: Simple, everyday language.

## Technology Stack

### Frontend
- **Electron**: Cross-platform desktop application framework
- **HTML/CSS/JavaScript**: Modern web technologies for UI
- **IPC (Inter-Process Communication)**: Secure communication between main and renderer processes

### Backend
- **Node.js**: JavaScript runtime for main process logic
- **File System (fs)**: Local JSON file-based persistence

### Architecture
- **Main Process**: Handles app lifecycle, data management, and system operations
- **Renderer Process**: Manages UI and user interactions
- **Preload Script**: Secure bridge for IPC communication

## Core Features

### Mission System
- Create project tasks with difficulty levels, constraints, rewards, and optional punishments
- Track mission progress (Active, Completed, Failed)
- XP rewards for completed missions
- Punishment system for failed missions

### Ticket System
- Limited help tickets (3) and tutorial tickets (2)
- Weekly automatic reset
- Creates insight debt when tickets are used

### Insight Debt Management
- Mandatory learning documentation after using tickets
- Track and view past insights
- Clear debts by writing learning reflections

### Progress Tracking
- XP accumulation (100 XP per level)
- Level progression
- Badge system (ready for future implementation)

## Project Structure

```
solocraft-electron/
├── src/
│   ├── main/               # Main process (Node.js)
│   │   ├── main.js        # Electron app entry point
│   │   ├── dataModels.js  # Mission, InsightDebt, UserProgress classes
│   │   └── storageManager.js  # JSON file persistence
│   ├── renderer/          # Renderer process (Browser)
│   │   └── renderer.js    # UI logic and interactions
│   └── preload/           # Security bridge
│       └── preload.js     # IPC communication setup
├── public/                # Static assets
│   ├── index.html        # Main UI
│   └── styles.css        # Application styling
├── solocraft_data/       # Data storage (JSON files)
│   ├── missions.json
│   ├── insight_debts.json
│   └── user_progress.json
├── package.json          # Node.js configuration
└── README.md            # This file
```

## Setup and Installation

### Prerequisites
- Node.js 20.x or higher
- npm (comes with Node.js)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Application**
   ```bash
   npm start
   ```

3. **Development Mode** (with DevTools)
   ```bash
   npm run dev
   ```

## Data Models

### Mission
- **Properties**: title, description, difficulty, constraints, rewards, punishment
- **Status**: Active, Completed, or Failed
- **Methods**: completeMission(), failMission()

### InsightDebt
- **Properties**: ticketType (Help/Tutorial), usedFor, insightEntry
- **Status**: Outstanding or Cleared
- **Methods**: clearDebt(insightText)

### UserProgress
- **Properties**: xp, level, helpTickets, tutorialTickets, badges
- **Methods**: addXP(), applyPunishment(), useHelpTicket(), useTutorialTicket()

## Data Persistence

All user data is automatically saved to JSON files in the `solocraft_data/` directory:
- `missions.json` - All mission data
- `insight_debts.json` - All insight debt records
- `user_progress.json` - User stats and progress

Data persists between sessions automatically.

## Current Data State
- **User Progress**: Level 1, 50 XP, 1 help ticket, 2 tutorial tickets
- **Missions**: 0 active missions
- **Insight Debts**: 2 cleared debts (both help tickets)

## Game Mechanics

### XP and Leveling
- Earn XP by completing missions
- 100 XP required per level
- Current formula: Level = floor(XP / 100) + 1

### Punishment System
The app parses punishment text to apply penalties:
- **XP Loss**: "Lose 10 XP" removes XP (can cause level drop)
- **Ticket Loss**: "Lose help ticket" or "Lose tutorial ticket"
- **Default**: If no specific punishment, loses 5 XP

### Ticket Reset
- Tickets automatically reset every 7 days
- Reset to default: 3 help tickets, 2 tutorial tickets
- Notification shown on reset

## Security Features

- **Context Isolation**: Renderer process is isolated from Node.js
- **No Node Integration**: Prevents security vulnerabilities
- **IPC Whitelisting**: Only approved channels can communicate
- **Sandboxing**: Disabled for compatibility (--no-sandbox flag required in containerized environments)

## Deployment Notes

### Running in Replit
The app is configured to run in Replit's environment with:
- System dependencies for GTK/X11 support
- Sandbox and GPU disabled for compatibility
- VNC output for GUI display

### Building for Distribution
To package the app for distribution:

```bash
npm install electron-builder --save-dev
npm run build
```

## Keyboard Shortcuts
- Click to select missions or debts
- Forms support Tab navigation
- Enter to submit forms
- Escape to close modals (via close button)

## Troubleshooting

### App Won't Start
- Ensure Node.js 20+ is installed
- Run `npm install` to install dependencies
- Check that port 5000 isn't in use

### Data Not Saving
- Ensure write permissions for `solocraft_data/` directory
- Check console for file system errors

### Missing Dependencies
- Run `npm install` again
- Delete `node_modules/` and `package-lock.json`, then reinstall

## Future Enhancements

Potential features for future development:
- Badge achievement system (data models ready)
- Mission templates
- Data export/import (CSV, JSON)
- Analytics dashboard
- AI-powered mission recommendations
- Cloud sync capabilities

## Development

### Code Style
- ES6+ JavaScript
- Async/await for asynchronous operations
- Modular architecture with clear separation of concerns

### Adding New Features
1. Update data models in `src/main/dataModels.js`
2. Add storage methods in `src/main/storageManager.js`
3. Create IPC handlers in `src/main/main.js`
4. Add API methods in `src/preload/preload.js`
5. Implement UI in `public/index.html` and `src/renderer/renderer.js`

## License

MIT

## Support

For issues or questions, please refer to the development guide or create an issue in the repository.
"# First-Electon-APP" 
