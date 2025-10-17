# SoloCraft Development Guide: How to Modify and Extend

## Overview

This guide explains how to modify, extend, and customize SoloCraft. Whether you want to change the UI, add new features, or modify core functionality, this document provides the roadmap for development.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [UI Modifications](#ui-modifications)
3. [Core Functionality Changes](#core-functionality-changes)
4. [Adding New Features](#adding-new-features)
5. [Data Model Extensions](#data-model-extensions)
6. [Storage System Modifications](#storage-system-modifications)
7. [Common Extension Examples](#common-extension-examples)
8. [Testing and Debugging](#testing-and-debugging)
9. [Deployment Considerations](#deployment-considerations)

## Development Environment Setup

### 1. Prerequisites
```bash
# Ensure Python 3.11+ is installed
python --version

# Install development dependencies (if adding any)
pip install pytest  # For testing (optional)
```

### 2. File Structure Understanding
```
SoloCraft/
├── solocraft_gui.py      # Main UI - modify for interface changes
├── data_models.py        # Data structures - extend for new data types
├── storage_manager.py    # Persistence - modify for new storage needs
├── run_solocraft.py      # Main application launcher
├── solocraft_data/       # Data files - backup before major changes
└── README.md            # Documentation - keep updated
```

### 3. Development Workflow
1. **Backup Data**: Always backup `solocraft_data/` before major changes
2. **Test Changes**: Create test missions to verify modifications
3. **Incremental Development**: Make small changes and test frequently
4. **Documentation**: Update relevant `.md` files with changes

## UI Modifications

### 1. Changing Colors and Styling

#### Color Scheme Modification
Located in `solocraft_gui.py` in the `SoloCraftApp.__init__()` method:

```python
# Modify the colors dictionary
self.colors = {
    'bg_primary': '#1a1d23',       # Change main background
    'bg_secondary': '#242731',      # Change panel backgrounds  
    'bg_tertiary': '#2c3038',       # Change card backgrounds
    'accent': '#64b5f6',            # Change accent color (buttons, highlights)
    'success': '#4caf50',           # Change success message color
    'warning': '#ff9800',           # Change warning message color
    'text_primary': '#ffffff',      # Change primary text color
    'text_secondary': '#b0bec5',    # Change secondary text color
}
```

#### Font Changes
Modify font settings in the `setup_styles()` method:

```python
# Example: Change font family
font=('Arial', 11, 'bold')  # Replace 'Segoe UI' with your preferred font

# Example: Change font sizes
font=('Segoe UI', 14, 'bold')  # Increase from 11 to 14
```

### 2. Adding New UI Elements

#### Adding New Buttons
1. **Find the button container** in the relevant `setup_*_panel()` method
2. **Add your button** following the existing pattern:

```python
# Example: Adding a new button to mission panel
ttk.Button(button_frame, text="📊 Analytics", style='Secondary.TButton',
          command=self.show_analytics).grid(row=0, column=4, padx=4, ipadx=10, ipady=5)
```

3. **Implement the callback method**:

```python
def show_analytics(self):
    """Show mission analytics dialog."""
    # Your implementation here
    pass
```

#### Adding New Panels
1. **Create panel setup method**:

```python
def setup_analytics_panel(self, parent):
    """Set up analytics panel."""
    analytics_frame = ttk.LabelFrame(parent, text="📊 Analytics", 
                                   style='Modern.TLabelframe', padding="20")
    analytics_frame.grid(row=2, column=0, columnspan=2, sticky="we", pady=10)
    
    # Add your analytics content here
```

2. **Call from main setup**:

```python
def setup_ui(self):
    # Existing setup code...
    self.setup_analytics_panel(main_frame)
```

### 3. Modifying Window Layout

#### Changing Window Size
In `SoloCraftApp.__init__()`:

```python
self.root.geometry("1500x950")  # Increase from 1300x850
```

#### Rearranging Panels
Modify the grid positions in `setup_ui()`:

```python
# Example: Stack panels vertically instead of side-by-side
self.setup_mission_panel(main_frame).grid(row=1, column=0, columnspan=2)
self.setup_tickets_panel(main_frame).grid(row=2, column=0, columnspan=2)
```

### 4. Custom Dialog Creation

#### Creating New Dialog Windows
Follow the pattern of `MissionCreateDialog`:

```python
class MyCustomDialog:
    def __init__(self, parent, app):
        self.result = None
        self.app = app
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("My Custom Dialog")
        self.dialog.geometry("400x300")
        # Configure dialog...
        self.setup_dialog()
    
    def setup_dialog(self):
        # Add your dialog content
        pass
```

## Core Functionality Changes

### 1. Modifying XP and Level System

#### Changing XP per Level
In `data_models.py`, `UserProgress.add_xp()`:

```python
def add_xp(self, amount):
    self.xp += amount
    new_level = (self.xp // 150) + 1  # Change from 100 to 150 XP per level
    # Rest of method...
```

#### Custom Level Calculation
```python
def add_xp(self, amount):
    self.xp += amount
    # Custom exponential level system
    new_level = 1
    xp_required = 100
    temp_xp = self.xp
    
    while temp_xp >= xp_required:
        temp_xp -= xp_required
        new_level += 1
        xp_required = int(xp_required * 1.2)  # 20% increase each level
    
    if new_level > self.level:
        self.level = new_level
        return True
    return False
```

### 2. Modifying Ticket System

#### Changing Ticket Quantities
In `data_models.py`, `UserProgress.__init__()`:

```python
def __init__(self):
    self.xp = 0
    self.help_tickets = 5      # Increase from 3
    self.tutorial_tickets = 4   # Increase from 2
    # Rest of initialization...
```

And in `reset_tickets()`:

```python
def reset_tickets(self):
    self.help_tickets = 5      # Match new initial values
    self.tutorial_tickets = 4
    self.last_ticket_reset = datetime.now().isoformat()
```

#### Adding New Ticket Types
1. **Add to UserProgress**:

```python
def __init__(self):
    # Existing fields...
    self.research_tickets = 3  # New ticket type
```

2. **Add usage method**:

```python
def use_research_ticket(self):
    if self.research_tickets > 0:
        self.research_tickets -= 1
        return True
    return False
```

3. **Update serialization**:

```python
def to_dict(self):
    return {
        # Existing fields...
        'research_tickets': self.research_tickets,
    }

@classmethod
def from_dict(cls, data):
    progress = cls()
    # Existing assignments...
    progress.research_tickets = data.get('research_tickets', 3)
    return progress
```

### 3. Modifying Punishment System

#### Adding New Punishment Types
In `UserProgress.apply_punishment()`:

```python
def apply_punishment(self, punishment_text):
    # Existing code...
    
    # Add new punishment type - level loss
    if "level" in punishment_lower and "lose" in punishment_lower:
        if self.level > 1:
            self.level -= 1
            # Recalculate XP to match new level
            self.xp = (self.level - 1) * 100
            punishment_effects.append(f"Dropped to Level {self.level}")
    
    # Add new punishment type - temporary ticket reduction
    if "freeze" in punishment_lower and "ticket" in punishment_lower:
        # Could implement a temporary freeze system
        punishment_effects.append("Tickets frozen for this session")
```

#### More Sophisticated Punishment Parsing
```python
import re

def apply_punishment(self, punishment_text):
    punishment_effects = []
    if not punishment_text:
        return punishment_effects
    
    # Use regex for better parsing
    xp_pattern = r'lose\s+(\d+)\s*xp'
    level_pattern = r'lose\s+(\d+)\s*level'
    ticket_pattern = r'lose\s+(\d+)\s*(help|tutorial)?\s*ticket'
    
    # XP loss with specific amounts
    xp_match = re.search(xp_pattern, punishment_text.lower())
    if xp_match:
        xp_loss = int(xp_match.group(1))
        self.xp = max(0, self.xp - xp_loss)
        punishment_effects.append(f"Lost {xp_loss} XP")
    
    # Level loss
    level_match = re.search(level_pattern, punishment_text.lower())
    if level_match:
        levels_lost = int(level_match.group(1))
        self.level = max(1, self.level - levels_lost)
        punishment_effects.append(f"Lost {levels_lost} level(s)")
    
    return punishment_effects
```

## Adding New Features

### 1. Badge System Implementation

#### Step 1: Define Badge Data Structure
Add to `data_models.py`:

```python
class Badge:
    def __init__(self, badge_id, name, description, criteria, unlocked=False):
        self.id = badge_id
        self.name = name
        self.description = description
        self.criteria = criteria  # Dict describing unlock conditions
        self.unlocked = unlocked
        self.unlocked_at = None
    
    def unlock(self):
        self.unlocked = True
        self.unlocked_at = datetime.now().isoformat()
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'criteria': self.criteria,
            'unlocked': self.unlocked,
            'unlocked_at': self.unlocked_at
        }
    
    @classmethod
    def from_dict(cls, data):
        badge = cls(
            badge_id=data['id'],
            name=data['name'],
            description=data['description'],
            criteria=data['criteria']
        )
        badge.unlocked = data.get('unlocked', False)
        badge.unlocked_at = data.get('unlocked_at')
        return badge
```

#### Step 2: Add Badge Management to UserProgress
```python
class UserProgress:
    def __init__(self):
        # Existing fields...
        self.earned_badges = []  # List of badge IDs
        self.all_badges = self._initialize_badges()
    
    def _initialize_badges(self):
        """Initialize all available badges."""
        return [
            Badge("first_mission", "First Steps", "Complete your first mission", 
                  {"type": "mission_count", "count": 1}),
            Badge("level_up", "Rising Star", "Reach level 5", 
                  {"type": "level", "level": 5}),
            Badge("streak", "Consistent", "Complete 5 missions in a row", 
                  {"type": "completion_streak", "count": 5}),
        ]
    
    def check_badge_unlocks(self):
        """Check if any badges should be unlocked and return newly earned ones."""
        newly_earned = []
        
        for badge in self.all_badges:
            if not badge.unlocked and badge.id not in self.earned_badges:
                if self._check_badge_criteria(badge):
                    badge.unlock()
                    self.earned_badges.append(badge.id)
                    newly_earned.append(badge)
        
        return newly_earned
    
    def _check_badge_criteria(self, badge):
        """Check if badge criteria are met."""
        criteria = badge.criteria
        
        if criteria["type"] == "level":
            return self.level >= criteria["level"]
        elif criteria["type"] == "mission_count":
            # Would need to check with storage manager
            return False  # Implement based on your needs
        
        return False
```

#### Step 3: Add Badge UI Panel
```python
def setup_badge_panel(self, parent):
    """Set up badge display panel."""
    badge_frame = ttk.LabelFrame(parent, text="🏆 Badges", 
                               style='Modern.TLabelframe', padding="20")
    badge_frame.grid(row=3, column=0, columnspan=2, sticky="we", pady=10)
    
    # Badge display area
    self.badge_display = ttk.Frame(badge_frame, style='Modern.TFrame')
    self.badge_display.pack(fill=tk.BOTH, expand=True)
    
    self.refresh_badges()

def refresh_badges(self):
    """Refresh badge display."""
    # Clear existing badge widgets
    for widget in self.badge_display.winfo_children():
        widget.destroy()
    
    # Display earned badges
    for i, badge_id in enumerate(self.user_progress.earned_badges):
        badge = next(b for b in self.user_progress.all_badges if b.id == badge_id)
        badge_label = ttk.Label(self.badge_display, text=f"🏆 {badge.name}", 
                               style='Stats.TLabel')
        badge_label.grid(row=i//3, column=i%3, padx=10, pady=5)
```

### 2. AI-Powered Feedback System

#### Step 1: Install AI Library
```bash
pip install openai  # or your preferred AI library
```

#### Step 2: Add AI Integration
```python
# Add to solocraft_gui.py
import openai

class AIFeedbackSystem:
    def __init__(self, api_key):
        openai.api_key = api_key
    
    def generate_mission_feedback(self, mission, user_progress):
        """Generate AI feedback for mission planning."""
        prompt = f"""
        User is planning a mission: {mission.title}
        Description: {mission.description}
        Difficulty: {mission.difficulty}
        User Level: {user_progress.level}
        User XP: {user_progress.xp}
        
        Provide helpful feedback on the mission plan, including:
        1. Whether the difficulty matches the user's level
        2. Suggestions for constraints to make it more challenging
        3. Recommended XP reward range
        4. Potential learning outcomes
        """
        
        try:
            response = openai.Completion.create(
                engine="text-davinci-003",
                prompt=prompt,
                max_tokens=200
            )
            return response.choices[0].text.strip()
        except Exception as e:
            return f"AI feedback unavailable: {str(e)}"
```

#### Step 3: Integrate with Mission Creation
```python
def create_mission(self):
    """Enhanced mission creation with AI feedback."""
    dialog = MissionCreateDialog(self.root, self)
    
    # Add AI feedback button to dialog
    if hasattr(self, 'ai_system'):
        ai_button = ttk.Button(dialog.main_frame, text="🤖 Get AI Feedback", 
                              command=lambda: self.show_ai_feedback(dialog))
        ai_button.pack(pady=10)
    
    self.root.wait_window(dialog.dialog)
    # Rest of existing method...

def show_ai_feedback(self, dialog):
    """Show AI feedback for current mission draft."""
    # Get current values from dialog
    title = dialog.title_entry.get()
    description = dialog.description_text.get("1.0", tk.END)
    # ... get other fields
    
    # Create temporary mission for feedback
    temp_mission = Mission(title, description, "Medium", "", 0)
    feedback = self.ai_system.generate_mission_feedback(temp_mission, self.user_progress)
    
    # Show feedback in popup
    messagebox.showinfo("AI Feedback", feedback)
```

### 3. Export and Share System

#### Step 1: Add Export Functionality
```python
import json
from datetime import datetime

class DataExporter:
    def __init__(self, storage_manager):
        self.storage = storage_manager
    
    def export_missions_csv(self, filename=None):
        """Export missions to CSV format."""
        if not filename:
            filename = f"solocraft_missions_{datetime.now().strftime('%Y%m%d')}.csv"
        
        missions = self.storage.load_missions()
        
        with open(filename, 'w', newline='') as csvfile:
            import csv
            writer = csv.writer(csvfile)
            writer.writerow(['Title', 'Description', 'Difficulty', 'Status', 'XP', 'Created', 'Completed'])
            
            for mission in missions:
                status = 'Completed' if mission.completed else ('Failed' if mission.failed else 'Active')
                writer.writerow([
                    mission.title, mission.description, mission.difficulty,
                    status, mission.rewards, mission.created_at, mission.completed_at
                ])
        
        return filename
    
    def export_progress_summary(self):
        """Export user progress summary."""
        progress = self.storage.load_user_progress()
        missions = self.storage.load_missions()
        
        summary = {
            'user_stats': {
                'level': progress.level,
                'xp': progress.xp,
                'tickets_remaining': progress.help_tickets + progress.tutorial_tickets
            },
            'mission_stats': {
                'total': len(missions),
                'completed': len([m for m in missions if m.completed]),
                'failed': len([m for m in missions if m.failed]),
                'active': len([m for m in missions if not m.completed and not m.failed])
            }
        }
        
        filename = f"solocraft_summary_{datetime.now().strftime('%Y%m%d')}.json"
        with open(filename, 'w') as f:
            json.dump(summary, f, indent=2)
        
        return filename
```

#### Step 2: Add Export UI
```python
def setup_export_menu(self):
    """Add export options to the UI."""
    menubar = tk.Menu(self.root)
    self.root.config(menu=menubar)
    
    file_menu = tk.Menu(menubar, tearoff=0)
    menubar.add_cascade(label="File", menu=file_menu)
    
    file_menu.add_command(label="Export Missions (CSV)", command=self.export_missions)
    file_menu.add_command(label="Export Progress Summary", command=self.export_progress)
    file_menu.add_separator()
    file_menu.add_command(label="Import Missions", command=self.import_missions)

def export_missions(self):
    """Export missions with file dialog."""
    from tkinter import filedialog
    
    filename = filedialog.asksaveasfilename(
        defaultextension=".csv",
        filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
    )
    
    if filename:
        exporter = DataExporter(self.storage)
        exporter.export_missions_csv(filename)
        self.show_modern_message("Export Complete", f"Missions exported to {filename}", "success")
```

### 4. Mission Templates System

#### Step 1: Define Template Structure
```python
class MissionTemplate:
    def __init__(self, template_id, name, description_template, 
                 default_difficulty, suggested_constraints, suggested_rewards):
        self.id = template_id
        self.name = name
        self.description_template = description_template
        self.default_difficulty = default_difficulty
        self.suggested_constraints = suggested_constraints
        self.suggested_rewards = suggested_rewards
    
    def create_mission_from_template(self, custom_values=None):
        """Create a mission using this template."""
        values = custom_values or {}
        
        return {
            'title': values.get('title', f"Mission from {self.name}"),
            'description': self.description_template.format(**values),
            'difficulty': values.get('difficulty', self.default_difficulty),
            'constraints': values.get('constraints', self.suggested_constraints),
            'rewards': values.get('rewards', self.suggested_rewards),
            'punishment': values.get('punishment', '')
        }
```

#### Step 2: Add Template Storage
```python
# Add to storage_manager.py
def load_templates(self):
    """Load mission templates."""
    templates_file = os.path.join(self.data_dir, "templates.json")
    try:
        with open(templates_file, 'r') as f:
            templates_data = json.load(f)
        return [MissionTemplate.from_dict(data) for data in templates_data]
    except (FileNotFoundError, json.JSONDecodeError):
        return self._get_default_templates()

def _get_default_templates(self):
    """Get default mission templates."""
    return [
        MissionTemplate(
            "web_project", 
            "Web Development Project",
            "Build a {project_type} using {technology_stack}",
            "Medium",
            "No frameworks, only vanilla code",
            50
        ),
        MissionTemplate(
            "learning_challenge",
            "Learning Challenge", 
            "Learn {topic} by {method}",
            "Easy",
            "No tutorials, only documentation",
            30
        )
    ]
```

## Data Model Extensions

### 1. Adding New Data Types

#### Step 1: Create New Model Class
```python
# Add to data_models.py
class Project:
    """Represents a larger project containing multiple missions."""
    def __init__(self, project_id, name, description, mission_ids=None):
        self.id = project_id or str(uuid.uuid4())
        self.name = name
        self.description = description
        self.mission_ids = mission_ids or []
        self.created_at = datetime.now().isoformat()
        self.completed = False
    
    def add_mission(self, mission_id):
        if mission_id not in self.mission_ids:
            self.mission_ids.append(mission_id)
    
    def remove_mission(self, mission_id):
        if mission_id in self.mission_ids:
            self.mission_ids.remove(mission_id)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'mission_ids': self.mission_ids,
            'created_at': self.created_at,
            'completed': self.completed
        }
    
    @classmethod
    def from_dict(cls, data):
        project = cls(
            project_id=data['id'],
            name=data['name'],
            description=data['description'],
            mission_ids=data.get('mission_ids', [])
        )
        project.created_at = data['created_at']
        project.completed = data.get('completed', False)
        return project
```

#### Step 2: Add Storage Support
```python
# Add to storage_manager.py
def __init__(self, data_dir="solocraft_data"):
    # Existing initialization...
    self.projects_file = os.path.join(data_dir, "projects.json")
    
def _init_files(self):
    # Existing file initialization...
    if not os.path.exists(self.projects_file):
        with open(self.projects_file, 'w') as f:
            json.dump([], f)

def save_project(self, project):
    """Save a project to the projects file."""
    projects = self.load_projects()
    # Update or add project
    for i, existing_project in enumerate(projects):
        if existing_project.id == project.id:
            projects[i] = project
            break
    else:
        projects.append(project)
    
    # Save to file
    projects_data = [p.to_dict() for p in projects]
    with open(self.projects_file, 'w') as f:
        json.dump(projects_data, f, indent=2)

def load_projects(self):
    """Load all projects from the projects file."""
    try:
        with open(self.projects_file, 'r') as f:
            projects_data = json.load(f)
        return [Project.from_dict(data) for data in projects_data]
    except (FileNotFoundError, json.JSONDecodeError):
        return []
```

### 2. Extending Existing Models

#### Adding Fields to Mission
```python
# In data_models.py Mission class
def __init__(self, title, description, difficulty, constraints, rewards, 
             punishment=None, mission_id=None, tags=None, priority=None):
    # Existing initialization...
    self.tags = tags or []          # New: categorization tags
    self.priority = priority or "Medium"  # New: priority level
    self.estimated_hours = None     # New: time estimation
    self.actual_hours = None        # New: actual time tracking

def start_work(self):
    """Mark mission as started and begin time tracking."""
    self.work_started_at = datetime.now().isoformat()

def log_work_session(self, hours_worked):
    """Log hours worked on this mission."""
    if self.actual_hours is None:
        self.actual_hours = 0
    self.actual_hours += hours_worked
```

Don't forget to update `to_dict()` and `from_dict()` methods when adding new fields!

## Storage System Modifications

### 1. Database Migration Support

#### Version Control for Data
```python
# Add to storage_manager.py
class StorageManager:
    CURRENT_VERSION = "1.2"
    
    def __init__(self, data_dir="solocraft_data"):
        # Existing initialization...
        self.version_file = os.path.join(data_dir, "version.json")
        self._check_and_migrate()
    
    def _check_and_migrate(self):
        """Check data version and migrate if necessary."""
        current_version = self._get_data_version()
        
        if current_version != self.CURRENT_VERSION:
            self._migrate_data(current_version, self.CURRENT_VERSION)
            self._save_data_version(self.CURRENT_VERSION)
    
    def _get_data_version(self):
        """Get current data version."""
        try:
            with open(self.version_file, 'r') as f:
                version_data = json.load(f)
            return version_data.get('version', '1.0')
        except (FileNotFoundError, json.JSONDecodeError):
            return '1.0'
    
    def _migrate_data(self, from_version, to_version):
        """Migrate data between versions."""
        if from_version == '1.0' and to_version >= '1.1':
            self._migrate_1_0_to_1_1()
        if from_version <= '1.1' and to_version >= '1.2':
            self._migrate_1_1_to_1_2()
    
    def _migrate_1_0_to_1_1(self):
        """Add failed status to missions."""
        missions = self.load_missions()
        for mission in missions:
            if not hasattr(mission, 'failed'):
                mission.failed = False
                mission.failed_at = None
        # Save migrated missions
        for mission in missions:
            self.save_mission(mission)
```

### 2. Alternative Storage Backends

#### SQLite Database Backend
```python
import sqlite3

class SQLiteStorageManager:
    def __init__(self, db_path="solocraft.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize SQLite database with tables."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create missions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS missions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                difficulty TEXT,
                constraints TEXT,
                rewards INTEGER,
                punishment TEXT,
                created_at TEXT,
                completed BOOLEAN,
                completed_at TEXT,
                failed BOOLEAN,
                failed_at TEXT
            )
        ''')
        
        # Create user_progress table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_progress (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                xp INTEGER,
                level INTEGER,
                help_tickets INTEGER,
                tutorial_tickets INTEGER,
                last_ticket_reset TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_mission(self, mission):
        """Save mission to SQLite database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO missions 
            (id, title, description, difficulty, constraints, rewards, punishment,
             created_at, completed, completed_at, failed, failed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            mission.id, mission.title, mission.description, mission.difficulty,
            mission.constraints, mission.rewards, mission.punishment,
            mission.created_at, mission.completed, mission.completed_at,
            mission.failed, mission.failed_at
        ))
        
        conn.commit()
        conn.close()
```

## Common Extension Examples

### 1. Time Tracking Feature

```python
# Add to Mission class
def start_work_session(self):
    """Start a work session."""
    self.current_session_start = datetime.now().isoformat()

def end_work_session(self):
    """End work session and log time."""
    if hasattr(self, 'current_session_start'):
        start_time = datetime.fromisoformat(self.current_session_start)
        session_duration = (datetime.now() - start_time).total_seconds() / 3600
        
        if not hasattr(self, 'work_sessions'):
            self.work_sessions = []
        
        self.work_sessions.append({
            'start': self.current_session_start,
            'end': datetime.now().isoformat(),
            'duration_hours': session_duration
        })
        
        delattr(self, 'current_session_start')
        return session_duration
    return 0

def get_total_work_time(self):
    """Get total hours worked on this mission."""
    if not hasattr(self, 'work_sessions'):
        return 0
    return sum(session['duration_hours'] for session in self.work_sessions)
```

### 2. Mission Dependencies

```python
# Add to Mission class
def __init__(self, title, description, difficulty, constraints, rewards, 
             punishment=None, mission_id=None, dependencies=None):
    # Existing initialization...
    self.dependencies = dependencies or []  # List of mission IDs

def can_start(self, storage_manager):
    """Check if mission can be started (all dependencies completed)."""
    if not self.dependencies:
        return True
    
    missions = storage_manager.load_missions()
    mission_dict = {m.id: m for m in missions}
    
    for dep_id in self.dependencies:
        if dep_id not in mission_dict or not mission_dict[dep_id].completed:
            return False
    
    return True

def get_blocking_dependencies(self, storage_manager):
    """Get list of uncompleted dependencies."""
    missions = storage_manager.load_missions()
    mission_dict = {m.id: m for m in missions}
    
    blocking = []
    for dep_id in self.dependencies:
        if dep_id not in mission_dict or not mission_dict[dep_id].completed:
            blocking.append(dep_id)
    
    return blocking
```

### 3. Team/Collaboration Features

```python
# Add new data model
class TeamMember:
    def __init__(self, member_id, name, role="Collaborator"):
        self.id = member_id
        self.name = name
        self.role = role
        self.joined_at = datetime.now().isoformat()

class CollaborativeMission(Mission):
    def __init__(self, title, description, difficulty, constraints, rewards,
                 punishment=None, mission_id=None, team_members=None):
        super().__init__(title, description, difficulty, constraints, rewards,
                        punishment, mission_id)
        self.team_members = team_members or []
        self.shared = True
    
    def add_team_member(self, member):
        """Add a team member to the mission."""
        if member.id not in [m.id for m in self.team_members]:
            self.team_members.append(member)
    
    def complete_mission(self, completed_by=None):
        """Complete mission with team member attribution."""
        super().complete_mission()
        self.completed_by = completed_by
```

## Testing and Debugging

### 1. Creating Test Data

```python
# Create a test data generator
def create_test_data():
    """Create sample data for testing."""
    storage = StorageManager("test_data")
    
    # Create test missions
    test_missions = [
        Mission("Learn Python", "Complete Python tutorial", "Easy", 
               "No Stack Overflow", 30, "Lose 10 XP"),
        Mission("Build Website", "Create portfolio website", "Medium",
               "No frameworks", 50, "Lose 1 help ticket"),
        Mission("Deploy App", "Deploy to production", "Hard",
               "No deployment tools", 100, "Lose 20 XP and 1 ticket")
    ]
    
    for mission in test_missions:
        storage.save_mission(mission)
    
    # Create test user progress
    progress = UserProgress()
    progress.xp = 150
    progress.level = 2
    storage.save_user_progress(progress)
    
    print("Test data created in test_data/ directory")

if __name__ == "__main__":
    create_test_data()
```

### 2. Debug Mode

```python
# Add to solocraft_gui.py
class SoloCraftApp:
    def __init__(self, root, debug_mode=False):
        self.debug_mode = debug_mode
        # Existing initialization...
        
        if self.debug_mode:
            self.setup_debug_panel()
    
    def setup_debug_panel(self):
        """Add debug controls to the interface."""
        debug_frame = ttk.LabelFrame(self.root, text="🔧 Debug Controls")
        debug_frame.pack(side=tk.BOTTOM, fill=tk.X, padx=20, pady=10)
        
        ttk.Button(debug_frame, text="Add 100 XP", 
                  command=lambda: self.debug_add_xp(100)).pack(side=tk.LEFT, padx=5)
        ttk.Button(debug_frame, text="Reset Tickets", 
                  command=self.debug_reset_tickets).pack(side=tk.LEFT, padx=5)
        ttk.Button(debug_frame, text="Create Test Mission", 
                  command=self.debug_create_test_mission).pack(side=tk.LEFT, padx=5)
    
    def debug_add_xp(self, amount):
        """Debug: Add XP to user."""
        self.user_progress.add_xp(amount)
        self.storage.save_user_progress(self.user_progress)
        self.refresh_all_displays()
    
    def debug_reset_tickets(self):
        """Debug: Reset all tickets."""
        self.user_progress.reset_tickets()
        self.storage.save_user_progress(self.user_progress)
        self.refresh_all_displays()

# Run in debug mode
if __name__ == "__main__":
    import sys
    debug = "--debug" in sys.argv
    
    root = tk.Tk()
    app = SoloCraftApp(root, debug_mode=debug)
    root.mainloop()
```

### 3. Logging System

```python
import logging

# Add to each module
def setup_logging(debug_mode=False):
    """Set up logging configuration."""
    level = logging.DEBUG if debug_mode else logging.INFO
    
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('solocraft.log'),
            logging.StreamHandler()
        ]
    )

# Use in methods
class SoloCraftApp:
    def __init__(self, root):
        self.logger = logging.getLogger(__name__)
        # Existing initialization...
    
    def complete_mission(self):
        self.logger.info(f"Attempting to complete mission")
        # Existing method logic...
        self.logger.info(f"Mission {mission.title} completed successfully")
```

## Deployment Considerations

### 1. Packaging for Distribution

```python
# setup.py for pip installation
from setuptools import setup, find_packages

setup(
    name="solocraft",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        # Add any external dependencies
    ],
    entry_points={
        'console_scripts': [
            'solocraft=solocraft_gui:main',
        ],
    },
    python_requires='>=3.11',
)
```

### 2. Configuration Management

```python
# config.py
import json
import os

class Config:
    def __init__(self, config_file="config.json"):
        self.config_file = config_file
        self.config = self.load_config()
    
    def load_config(self):
        """Load configuration from file."""
        defaults = {
            "data_directory": "solocraft_data",
            "xp_per_level": 100,
            "default_help_tickets": 3,
            "default_tutorial_tickets": 2,
            "ticket_reset_days": 7,
            "theme": "dark",
            "auto_save": True
        }
        
        try:
            with open(self.config_file, 'r') as f:
                user_config = json.load(f)
            defaults.update(user_config)
        except (FileNotFoundError, json.JSONDecodeError):
            self.save_config(defaults)
        
        return defaults
    
    def save_config(self, config=None):
        """Save configuration to file."""
        config = config or self.config
        with open(self.config_file, 'w') as f:
            json.dump(config, f, indent=2)
    
    def get(self, key, default=None):
        """Get configuration value."""
        return self.config.get(key, default)
    
    def set(self, key, value):
        """Set configuration value."""
        self.config[key] = value
        self.save_config()
```

### 3. Cross-Platform Considerations

```python
# platform_utils.py
import platform
import os

def get_data_directory():
    """Get appropriate data directory for the platform."""
    system = platform.system()
    
    if system == "Windows":
        return os.path.join(os.environ['APPDATA'], 'SoloCraft')
    elif system == "Darwin":  # macOS
        return os.path.join(os.path.expanduser('~'), 'Library', 'Application Support', 'SoloCraft')
    else:  # Linux and others
        return os.path.join(os.path.expanduser('~'), '.solocraft')

def ensure_data_directory():
    """Ensure data directory exists."""
    data_dir = get_data_directory()
    os.makedirs(data_dir, exist_ok=True)
    return data_dir
```

This development guide provides a comprehensive foundation for modifying and extending SoloCraft. Start with small changes and gradually work toward larger features. Always backup your data before making significant modifications!