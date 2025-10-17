"""
Storage manager for SoloCraft application.
Handles JSON file operations for missions, insight debts, and user progress.
"""

import json
import os
from data_models import Mission, InsightDebt, UserProgress


class StorageManager:
    def __init__(self, data_dir="solocraft_data"):
        self.data_dir = data_dir
        self.missions_file = os.path.join(data_dir, "missions.json")
        self.debts_file = os.path.join(data_dir, "insight_debts.json")
        self.progress_file = os.path.join(data_dir, "user_progress.json")
        
        # Create data directory if it doesn't exist
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        
        # Initialize files if they don't exist
        self._init_files()

    def _init_files(self):
        """Initialize JSON files with default data if they don't exist."""
        if not os.path.exists(self.missions_file):
            with open(self.missions_file, 'w') as f:
                json.dump([], f)
        
        if not os.path.exists(self.debts_file):
            with open(self.debts_file, 'w') as f:
                json.dump([], f)
        
        if not os.path.exists(self.progress_file):
            default_progress = UserProgress()
            with open(self.progress_file, 'w') as f:
                json.dump(default_progress.to_dict(), f, indent=2)

    def save_mission(self, mission):
        """Save a mission to the missions file."""
        missions = self.load_missions()
        # Check if mission exists (update) or add new
        for i, existing_mission in enumerate(missions):
            if existing_mission.id == mission.id:
                missions[i] = mission
                break
        else:
            missions.append(mission)
        
        # Save to file
        missions_data = [m.to_dict() for m in missions]
        with open(self.missions_file, 'w') as f:
            json.dump(missions_data, f, indent=2)

    def load_missions(self):
        """Load all missions from the missions file."""
        try:
            with open(self.missions_file, 'r') as f:
                missions_data = json.load(f)
            return [Mission.from_dict(data) for data in missions_data]
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def delete_mission(self, mission_id):
        """Delete a mission by ID."""
        missions = self.load_missions()
        missions = [m for m in missions if m.id != mission_id]
        missions_data = [m.to_dict() for m in missions]
        with open(self.missions_file, 'w') as f:
            json.dump(missions_data, f, indent=2)

    def save_insight_debt(self, debt):
        """Save an insight debt to the debts file."""
        debts = self.load_insight_debts()
        # Check if debt exists (update) or add new
        for i, existing_debt in enumerate(debts):
            if existing_debt.id == debt.id:
                debts[i] = debt
                break
        else:
            debts.append(debt)
        
        # Save to file
        debts_data = [d.to_dict() for d in debts]
        with open(self.debts_file, 'w') as f:
            json.dump(debts_data, f, indent=2)

    def load_insight_debts(self):
        """Load all insight debts from the debts file."""
        try:
            with open(self.debts_file, 'r') as f:
                debts_data = json.load(f)
            return [InsightDebt.from_dict(data) for data in debts_data]
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def save_user_progress(self, progress):
        """Save user progress to the progress file."""
        with open(self.progress_file, 'w') as f:
            json.dump(progress.to_dict(), f, indent=2)

    def load_user_progress(self):
        """Load user progress from the progress file."""
        try:
            with open(self.progress_file, 'r') as f:
                progress_data = json.load(f)
            return UserProgress.from_dict(progress_data)
        except (FileNotFoundError, json.JSONDecodeError):
            return UserProgress()

    def get_active_missions(self):
        """Get all active (non-completed) missions."""
        missions = self.load_missions()
        return [m for m in missions if not m.completed]

    def get_completed_missions(self):
        """Get all completed missions."""
        missions = self.load_missions()
        return [m for m in missions if m.completed]

    def get_active_debts(self):
        """Get all active (non-cleared) insight debts."""
        debts = self.load_insight_debts()
        return [d for d in debts if not d.cleared]

    def get_cleared_debts(self):
        """Get all cleared insight debts."""
        debts = self.load_insight_debts()
        return [d for d in debts if d.cleared]