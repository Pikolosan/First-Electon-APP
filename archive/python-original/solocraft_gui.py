"""
Main GUI application for SoloCraft.
Built with Tkinter for desktop application.
"""

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog, scrolledtext
from data_models import Mission, InsightDebt, UserProgress, Difficulty
from storage_manager import StorageManager


class SoloCraftApp:
    def __init__(self, root):
        self.root = root
        self.root.title("SoloCraft - Independent Project Builder")
        self.root.geometry("1300x850")
        
        # Modern color scheme
        self.colors = {
            'bg_primary': '#1a1d23',       # Dark blue-grey background
            'bg_secondary': '#242731',      # Slightly lighter panels
            'bg_tertiary': '#2c3038',       # Cards and sections
            'accent': '#64b5f6',            # Cool blue accent
            'accent_hover': '#42a5f5',      # Darker blue for hover
            'success': '#4caf50',           # Green for success
            'warning': '#ff9800',           # Orange for warnings
            'text_primary': '#ffffff',      # White text
            'text_secondary': '#b0bec5',    # Light grey text
            'text_muted': '#78909c',        # Muted text
            'border': '#37474f',            # Subtle borders
        }
        
        self.root.configure(bg=self.colors['bg_primary'])
        self.setup_styles()
        
        # Initialize storage manager
        self.storage = StorageManager()
        
        # Load user progress
        self.user_progress = self.storage.load_user_progress()
        
        # Check if tickets need reset
        if self.user_progress.should_reset_tickets():
            self.user_progress.reset_tickets()
            self.storage.save_user_progress(self.user_progress)
            messagebox.showinfo("Tickets Reset", "Your weekly tickets have been reset!")
        
        self.setup_ui()
        self.refresh_all_displays()
    
    def setup_styles(self):
        """Configure modern ttk styles."""
        style = ttk.Style()
        
        # Configure main style theme
        style.theme_use('clam')
        
        # Main frame style
        style.configure('Modern.TFrame', 
                       background=self.colors['bg_primary'])
        
        # Card frame style
        style.configure('Card.TFrame', 
                       background=self.colors['bg_tertiary'],
                       relief='flat',
                       borderwidth=1)
        
        # Modern label frame style
        style.configure('Modern.TLabelframe', 
                       background=self.colors['bg_secondary'],
                       foreground=self.colors['text_primary'],
                       relief='flat',
                       borderwidth=0)
        style.configure('Modern.TLabelframe.Label',
                       background=self.colors['bg_secondary'],
                       foreground=self.colors['text_primary'],
                       font=('Segoe UI', 11, 'bold'))
        
        # Button styles
        style.configure('Accent.TButton',
                       background=self.colors['accent'],
                       foreground='white',
                       borderwidth=0,
                       focuscolor='none',
                       font=('Segoe UI', 9, 'bold'))
        style.map('Accent.TButton',
                 background=[('active', self.colors['accent_hover'])])
        
        style.configure('Secondary.TButton',
                       background=self.colors['bg_tertiary'],
                       foreground=self.colors['text_primary'],
                       borderwidth=1,
                       bordercolor=self.colors['border'],
                       focuscolor='none',
                       font=('Segoe UI', 9))
        style.map('Secondary.TButton',
                 background=[('active', self.colors['border'])])
        
        # Label styles
        style.configure('Title.TLabel',
                       background=self.colors['bg_primary'],
                       foreground=self.colors['text_primary'],
                       font=('Segoe UI', 24, 'bold'))
        
        style.configure('Stats.TLabel',
                       background=self.colors['bg_primary'],
                       foreground=self.colors['accent'],
                       font=('Segoe UI', 11, 'bold'))
        
        style.configure('Secondary.TLabel',
                       background=self.colors['bg_secondary'],
                       foreground=self.colors['text_secondary'],
                       font=('Segoe UI', 9))
        
        # Treeview styles
        style.configure('Modern.Treeview',
                       background=self.colors['bg_tertiary'],
                       foreground=self.colors['text_primary'],
                       fieldbackground=self.colors['bg_tertiary'],
                       borderwidth=0,
                       font=('Segoe UI', 9))
        style.configure('Modern.Treeview.Heading',
                       background=self.colors['bg_secondary'],
                       foreground=self.colors['text_primary'],
                       font=('Segoe UI', 9, 'bold'),
                       relief='flat')
        
        # Scrollbar style
        style.configure('Modern.Vertical.TScrollbar',
                       background=self.colors['bg_secondary'],
                       troughcolor=self.colors['bg_tertiary'],
                       borderwidth=0,
                       arrowcolor=self.colors['text_secondary'])

    def setup_ui(self):
        """Set up the main user interface."""
        # Main container with modern styling
        main_frame = ttk.Frame(self.root, style='Modern.TFrame', padding="20")
        main_frame.grid(row=0, column=0, sticky="nsew")
        
        # Configure grid weights
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(0, weight=1)
        main_frame.grid_rowconfigure(1, weight=1)
        main_frame.grid_columnconfigure(1, weight=1)
        
        # Header with user stats
        self.setup_header(main_frame)
        
        # Left panel - Mission management
        self.setup_mission_panel(main_frame)
        
        # Right panel - Tickets and Insight Debt
        self.setup_tickets_panel(main_frame)

    def setup_header(self, parent):
        """Set up the header with user statistics."""
        header_frame = ttk.Frame(parent, style='Modern.TFrame')
        header_frame.grid(row=0, column=0, columnspan=2, sticky="we", pady=(0, 20))
        header_frame.grid_columnconfigure(1, weight=1)
        
        # Title with modern styling
        title_label = ttk.Label(header_frame, text="SoloCraft", style='Title.TLabel')
        title_label.grid(row=0, column=0, sticky=tk.W)
        
        # User stats with card-like appearance
        stats_frame = ttk.Frame(header_frame, style='Card.TFrame', padding="15")
        stats_frame.grid(row=0, column=1, sticky=tk.E)
        
        # Create stat cards
        self.xp_label = ttk.Label(stats_frame, text="XP: 0", style='Stats.TLabel')
        self.xp_label.grid(row=0, column=0, padx=15)
        
        self.level_label = ttk.Label(stats_frame, text="Level: 1", style='Stats.TLabel')
        self.level_label.grid(row=0, column=1, padx=15)
        
        self.help_tickets_label = ttk.Label(stats_frame, text="Help Tickets: 3", style='Stats.TLabel')
        self.help_tickets_label.grid(row=0, column=2, padx=15)
        
        self.tutorial_tickets_label = ttk.Label(stats_frame, text="Tutorial Tickets: 2", style='Stats.TLabel')
        self.tutorial_tickets_label.grid(row=0, column=3, padx=15)

    def setup_mission_panel(self, parent):
        """Set up the mission management panel."""
        mission_frame = ttk.LabelFrame(parent, text="🎯 Missions", style='Modern.TLabelframe', padding="20")
        mission_frame.grid(row=1, column=0, sticky="nsew", padx=(0, 10))
        mission_frame.grid_rowconfigure(1, weight=1)
        mission_frame.grid_columnconfigure(0, weight=1)
        
        # Modern action buttons with improved spacing
        button_frame = ttk.Frame(mission_frame, style='Modern.TFrame')
        button_frame.grid(row=0, column=0, sticky="we", pady=(0, 15))
        
        ttk.Button(button_frame, text="+ Create Mission", style='Accent.TButton',
                  command=self.create_mission).grid(row=0, column=0, padx=(0, 8), ipadx=10, ipady=5)
        ttk.Button(button_frame, text="✓ Complete", style='Secondary.TButton',
                  command=self.complete_mission).grid(row=0, column=1, padx=4, ipadx=10, ipady=5)
        ttk.Button(button_frame, text="✗ Fail", style='Secondary.TButton',
                  command=self.fail_mission).grid(row=0, column=2, padx=4, ipadx=10, ipady=5)
        ttk.Button(button_frame, text="🗑 Delete", style='Secondary.TButton',
                  command=self.delete_mission).grid(row=0, column=3, padx=(4, 0), ipadx=10, ipady=5)
        
        # Modern mission list with improved styling
        tree_container = ttk.Frame(mission_frame, style='Card.TFrame', padding="10")
        tree_container.grid(row=1, column=0, sticky="nsew")
        tree_container.grid_rowconfigure(0, weight=1)
        tree_container.grid_columnconfigure(0, weight=1)
        
        self.mission_tree = ttk.Treeview(tree_container, 
                                       columns=("title", "difficulty", "rewards", "status"), 
                                       show="headings", style='Modern.Treeview', height=12)
        self.mission_tree.grid(row=0, column=0, sticky="nsew")
        
        # Configure columns with better headers
        self.mission_tree.heading("title", text="📋 Mission Title")
        self.mission_tree.heading("difficulty", text="🎚 Level")
        self.mission_tree.heading("rewards", text="⭐ XP")
        self.mission_tree.heading("status", text="📊 Status")
        
        self.mission_tree.column("title", width=250, minwidth=200)
        self.mission_tree.column("difficulty", width=100, minwidth=80)
        self.mission_tree.column("rewards", width=80, minwidth=60)
        self.mission_tree.column("status", width=120, minwidth=100)
        
        # Modern scrollbar
        mission_scrollbar = ttk.Scrollbar(tree_container, orient=tk.VERTICAL, 
                                        command=self.mission_tree.yview, style='Modern.Vertical.TScrollbar')
        mission_scrollbar.grid(row=0, column=1, sticky="ns")
        self.mission_tree.configure(yscrollcommand=mission_scrollbar.set)

    def setup_tickets_panel(self, parent):
        """Set up the tickets and insight debt panel."""
        right_frame = ttk.Frame(parent, style='Modern.TFrame')
        right_frame.grid(row=1, column=1, sticky="nsew")
        right_frame.grid_rowconfigure(1, weight=1)
        right_frame.grid_columnconfigure(0, weight=1)
        
        # Modern ticket usage section
        ticket_frame = ttk.LabelFrame(right_frame, text="🎫 Use Tickets", 
                                    style='Modern.TLabelframe', padding="20")
        ticket_frame.grid(row=0, column=0, sticky="we", pady=(0, 10))
        ticket_frame.grid_columnconfigure(0, weight=1)
        
        button_frame = ttk.Frame(ticket_frame, style='Modern.TFrame')
        button_frame.grid(row=0, column=0, pady=10)
        
        ttk.Button(button_frame, text="💡 Use Help Ticket", style='Accent.TButton',
                  command=self.use_help_ticket).grid(row=0, column=0, padx=(0, 10), ipadx=15, ipady=8)
        ttk.Button(button_frame, text="📚 Use Tutorial Ticket", style='Secondary.TButton',
                  command=self.use_tutorial_ticket).grid(row=0, column=1, padx=(10, 0), ipadx=15, ipady=8)
        
        # Modern insight debt section
        debt_frame = ttk.LabelFrame(right_frame, text="📝 Insight Debt", 
                                  style='Modern.TLabelframe', padding="20")
        debt_frame.grid(row=1, column=0, sticky="nsew")
        debt_frame.grid_rowconfigure(1, weight=1)
        debt_frame.grid_columnconfigure(0, weight=1)
        
        # Modern debt action buttons
        debt_button_frame = ttk.Frame(debt_frame, style='Modern.TFrame')
        debt_button_frame.grid(row=0, column=0, sticky="we", pady=(0, 15))
        
        ttk.Button(debt_button_frame, text="✍ Write Insight", style='Accent.TButton',
                  command=self.write_insight).grid(row=0, column=0, padx=(0, 10), ipadx=15, ipady=8)
        ttk.Button(debt_button_frame, text="👁 View Insights", style='Secondary.TButton',
                  command=self.view_insights).grid(row=0, column=1, padx=(10, 0), ipadx=15, ipady=8)
        
        # Modern debt list container
        debt_container = ttk.Frame(debt_frame, style='Card.TFrame', padding="10")
        debt_container.grid(row=1, column=0, sticky="nsew")
        debt_container.grid_rowconfigure(0, weight=1)
        debt_container.grid_columnconfigure(0, weight=1)
        
        self.debt_tree = ttk.Treeview(debt_container, 
                                    columns=("type", "used_for", "status"), 
                                    show="headings", style='Modern.Treeview', height=8)
        self.debt_tree.grid(row=0, column=0, sticky="nsew")
        
        # Configure debt columns with icons
        self.debt_tree.heading("type", text="🎫 Type")
        self.debt_tree.heading("used_for", text="📊 Used For")
        self.debt_tree.heading("status", text="📊 Status")
        
        self.debt_tree.column("type", width=120, minwidth=100)
        self.debt_tree.column("used_for", width=180, minwidth=150)
        self.debt_tree.column("status", width=100, minwidth=80)
        
        # Modern scrollbar for debt list
        debt_scrollbar = ttk.Scrollbar(debt_container, orient=tk.VERTICAL, 
                                     command=self.debt_tree.yview, style='Modern.Vertical.TScrollbar')
        debt_scrollbar.grid(row=0, column=1, sticky="ns")
        self.debt_tree.configure(yscrollcommand=debt_scrollbar.set)

    def refresh_all_displays(self):
        """Refresh all UI displays with current data."""
        self.refresh_header()
        self.refresh_missions()
        self.refresh_debt()

    def refresh_header(self):
        """Update header statistics."""
        self.xp_label.config(text=f"XP: {self.user_progress.xp}")
        self.level_label.config(text=f"Level: {self.user_progress.level}")
        self.help_tickets_label.config(text=f"Help Tickets: {self.user_progress.help_tickets}")
        self.tutorial_tickets_label.config(text=f"Tutorial Tickets: {self.user_progress.tutorial_tickets}")

    def refresh_missions(self):
        """Refresh the mission list display."""
        # Clear existing items
        for item in self.mission_tree.get_children():
            self.mission_tree.delete(item)
        
        # Load and display missions
        missions = self.storage.load_missions()
        for mission in missions:
            if mission.completed:
                status = "Completed"
            elif mission.failed:
                status = "Failed"
            else:
                status = "Active"
            
            self.mission_tree.insert("", "end", values=(
                mission.title,
                mission.difficulty,
                mission.rewards,
                status
            ), tags=(mission.id,))

    def refresh_debt(self):
        """Refresh the insight debt list display."""
        # Clear existing items
        for item in self.debt_tree.get_children():
            self.debt_tree.delete(item)
        
        # Load and display active debts
        debts = self.storage.get_active_debts()
        for debt in debts:
            self.debt_tree.insert("", "end", values=(
                debt.ticket_type,
                debt.used_for,
                "Outstanding"
            ), tags=(debt.id,))

    def create_mission(self):
        """Open dialog to create a new mission."""
        dialog = MissionCreateDialog(self.root, self)
        self.root.wait_window(dialog.dialog)
        if dialog.result:
            mission = Mission(**dialog.result)
            self.storage.save_mission(mission)
            self.refresh_missions()
            self.show_modern_message("Success", "\ud83c\udf89 Mission created successfully!", "success")

    def complete_mission(self):
        """Complete the selected mission."""
        selection = self.mission_tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a mission to complete.")
            return
        
        # Get mission ID from tags
        item_tags = self.mission_tree.item(selection[0])['tags']
        if not item_tags:
            return
        
        mission_id = item_tags[0]
        missions = self.storage.load_missions()
        
        for mission in missions:
            if mission.id == mission_id and not mission.completed and not mission.failed:
                mission.complete_mission()
                self.storage.save_mission(mission)
                
                # Award XP
                level_up = self.user_progress.add_xp(mission.rewards)
                self.storage.save_user_progress(self.user_progress)
                
                msg = f"Mission completed! You earned {mission.rewards} XP."
                if level_up:
                    msg += f" \u2728 You leveled up to Level {self.user_progress.level}!"
                
                self.show_modern_message("Mission Completed", msg, "success")
                self.refresh_all_displays()
                return
        
        self.show_modern_message("Cannot Complete", "Mission is already completed or not found.", "warning")

    def fail_mission(self):
        """Fail the selected mission and apply punishment."""
        selection = self.mission_tree.selection()
        if not selection:
            messagebox.showwarning("No Selection", "Please select a mission to fail.")
            return
        
        # Get mission ID from tags
        item_tags = self.mission_tree.item(selection[0])['tags']
        if not item_tags:
            return
        
        mission_id = item_tags[0]
        missions = self.storage.load_missions()
        
        for mission in missions:
            if mission.id == mission_id and not mission.completed and not mission.failed:
                # Confirm mission failure
                confirm_msg = f"Are you sure you want to mark '{mission.title}' as failed?"
                if mission.punishment:
                    confirm_msg += f"\n\nPunishment will be applied: {mission.punishment}"
                
                if not messagebox.askyesno("Confirm Mission Failure", confirm_msg):
                    return
                
                # Fail the mission
                mission.fail_mission()
                self.storage.save_mission(mission)
                
                # Apply punishment
                punishment_effects = self.user_progress.apply_punishment(mission.punishment)
                self.storage.save_user_progress(self.user_progress)
                
                # Show punishment results
                if punishment_effects:
                    effects_text = "\n".join([f"• {effect}" for effect in punishment_effects])
                    msg = f"Mission '{mission.title}' failed!\n\nPunishments applied:\n{effects_text}"
                else:
                    msg = f"Mission '{mission.title}' failed!"
                
                self.show_modern_message("Mission Failed", msg, "warning")
                self.refresh_all_displays()
                return
        
        self.show_modern_message("Cannot Fail", "Mission is already completed, failed, or not found.", "warning")

    def delete_mission(self):
        """Delete the selected mission."""
        selection = self.mission_tree.selection()
        if not selection:
            self.show_modern_message("No Selection", "Please select a mission to delete.", "warning")
            return
        
        if messagebox.askyesno("Confirm Delete", "Are you sure you want to delete this mission?"):
            item_tags = self.mission_tree.item(selection[0])['tags']
            if item_tags:
                mission_id = item_tags[0]
                self.storage.delete_mission(mission_id)
                self.refresh_missions()
                self.show_modern_message("Success", "Mission deleted successfully!", "success")

    def use_help_ticket(self):
        """Use a help ticket and create insight debt."""
        if self.user_progress.help_tickets <= 0:
            messagebox.showwarning("No Tickets", "You have no help tickets remaining.")
            return
        
        purpose = simpledialog.askstring("Use Help Ticket", "What do you need help with?")
        if purpose:
            self.user_progress.use_help_ticket()
            self.storage.save_user_progress(self.user_progress)
            
            debt = InsightDebt("Help", purpose)
            self.storage.save_insight_debt(debt)
            
            self.refresh_all_displays()
            self.show_modern_message("Ticket Used", "Help ticket used! \ud83d\udcdd You now have an insight debt to clear.", "info")

    def use_tutorial_ticket(self):
        """Use a tutorial ticket and create insight debt."""
        if self.user_progress.tutorial_tickets <= 0:
            messagebox.showwarning("No Tickets", "You have no tutorial tickets remaining.")
            return
        
        purpose = simpledialog.askstring("Use Tutorial Ticket", "What tutorial do you need?")
        if purpose:
            self.user_progress.use_tutorial_ticket()
            self.storage.save_user_progress(self.user_progress)
            
            debt = InsightDebt("Tutorial", purpose)
            self.storage.save_insight_debt(debt)
            
            self.refresh_all_displays()
            self.show_modern_message("Ticket Used", "Tutorial ticket used! \ud83d\udcdd You now have an insight debt to clear.", "info")

    def write_insight(self):
        """Open dialog to write insight and clear debt."""
        debts = self.storage.get_active_debts()
        if not debts:
            self.show_modern_message("No Debts", "\ud83c\udf89 You have no outstanding insight debts!", "success")
            return
        
        # Let user select which debt to clear
        debt_options = [f"{debt.ticket_type} - {debt.used_for}" for debt in debts]
        
        dialog = InsightWriteDialog(self.root, debt_options, debts)
        self.root.wait_window(dialog.dialog)
        
        if dialog.result:
            selected_debt, insight_text = dialog.result
            selected_debt.clear_debt(insight_text)
            self.storage.save_insight_debt(selected_debt)
            
            self.refresh_debt()
            self.show_modern_message("Insight Recorded", "\u2728 Your insight has been recorded and the debt cleared!", "success")

    def view_insights(self):
        """View all recorded insights."""
        debts = self.storage.get_cleared_debts()
        if not debts:
            self.show_modern_message("No Insights", "You haven't recorded any insights yet.", "info")
            return
        
        # Create a new window to display insights
        insight_window = tk.Toplevel(self.root)
        insight_window.title("Your Insights")
        insight_window.geometry("600x500")
        
        text_area = scrolledtext.ScrolledText(insight_window, wrap=tk.WORD)
        text_area.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        for debt in debts:
            text_area.insert(tk.END, f"🎫 {debt.ticket_type} Ticket - {debt.used_for}\n")
            text_area.insert(tk.END, f"📅 Cleared on: {debt.cleared_at}\n\n")
            text_area.insert(tk.END, f"{debt.insight_entry}\n\n")
            text_area.insert(tk.END, "─" * 60 + "\n\n")
        
        text_area.config(state=tk.DISABLED)
    
    def show_modern_message(self, title, message, msg_type="info"):
        """Show a modern styled message dialog."""
        if msg_type == "success":
            messagebox.showinfo(title, message)
        elif msg_type == "warning":
            messagebox.showwarning(title, message)
        elif msg_type == "error":
            messagebox.showerror(title, message)
        else:
            messagebox.showinfo(title, message)


class MissionCreateDialog:
    def __init__(self, parent, app):
        self.result = None
        self.app = app
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("Create New Mission")
        self.dialog.geometry("450x580")
        self.dialog.configure(bg=app.colors['bg_primary'])
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Center the dialog
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        self.setup_dialog()

    def setup_dialog(self):
        """Set up the mission creation dialog."""
        # Modern dialog styling
        style = ttk.Style()
        style.configure('Dialog.TFrame', background=self.app.colors['bg_secondary'])
        style.configure('Dialog.TLabel', 
                       background=self.app.colors['bg_secondary'],
                       foreground=self.app.colors['text_primary'],
                       font=('Segoe UI', 10))
        style.configure('Dialog.TEntry',
                       fieldbackground=self.app.colors['bg_tertiary'],
                       foreground=self.app.colors['text_primary'],
                       bordercolor=self.app.colors['border'])
        
        main_frame = ttk.Frame(self.dialog, style='Dialog.TFrame', padding="25")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Dialog title
        title_label = ttk.Label(main_frame, text="\ud83c\udfaf Create New Mission", 
                               font=('Segoe UI', 16, 'bold'),
                               background=self.app.colors['bg_secondary'],
                               foreground=self.app.colors['accent'])
        title_label.pack(anchor=tk.W, pady=(0, 20))
        
        # Mission title input
        ttk.Label(main_frame, text="Mission Title:", style='Dialog.TLabel').pack(anchor=tk.W, pady=(0, 5))
        self.title_entry = ttk.Entry(main_frame, width=45, style='Dialog.TEntry')
        self.title_entry.pack(fill=tk.X, pady=(0, 15))
        
        # Description input with modern styling
        ttk.Label(main_frame, text="Description:", style='Dialog.TLabel').pack(anchor=tk.W, pady=(0, 5))
        self.description_text = tk.Text(main_frame, height=6, width=45,
                                      bg=self.app.colors['bg_tertiary'],
                                      fg=self.app.colors['text_primary'],
                                      insertbackground=self.app.colors['accent'],
                                      selectbackground=self.app.colors['accent'],
                                      relief='flat', borderwidth=1,
                                      font=('Segoe UI', 9))
        self.description_text.pack(fill=tk.X, pady=(0, 15))
        
        # Difficulty selection with better styling
        ttk.Label(main_frame, text="Difficulty Level:", style='Dialog.TLabel').pack(anchor=tk.W, pady=(0, 5))
        self.difficulty_var = tk.StringVar(value="Easy")
        difficulty_frame = ttk.Frame(main_frame, style='Dialog.TFrame')
        difficulty_frame.pack(fill=tk.X, pady=(0, 15))
        
        difficulties = [("Easy", "Easy"), ("Medium", "Medium"), ("Hard", "Hard")]
        for value, text in difficulties:
            ttk.Radiobutton(difficulty_frame, text=text, variable=self.difficulty_var, 
                           value=value).pack(side=tk.LEFT, padx=(0, 15))
        
        # Constraints input
        ttk.Label(main_frame, text="Constraints (e.g., max 2 help tickets):", style='Dialog.TLabel').pack(anchor=tk.W, pady=(0, 5))
        self.constraints_entry = ttk.Entry(main_frame, width=45, style='Dialog.TEntry')
        self.constraints_entry.pack(fill=tk.X, pady=(0, 15))
        
        # XP Rewards input
        ttk.Label(main_frame, text="\u2b50 XP Reward:", style='Dialog.TLabel').pack(anchor=tk.W, pady=(0, 5))
        self.rewards_var = tk.IntVar(value=50)
        rewards_frame = ttk.Frame(main_frame, style='Dialog.TFrame')
        rewards_frame.pack(fill=tk.X, pady=(0, 15))
        
        ttk.Spinbox(rewards_frame, from_=10, to=500, textvariable=self.rewards_var, width=15).pack(side=tk.LEFT)
        
        # Optional punishment input
        ttk.Label(main_frame, text="Punishment (optional):", style='Dialog.TLabel').pack(anchor=tk.W, pady=(0, 5))
        self.punishment_entry = ttk.Entry(main_frame, width=45, style='Dialog.TEntry')
        self.punishment_entry.pack(fill=tk.X, pady=(0, 20))
        
        # Action buttons with modern styling
        button_frame = ttk.Frame(main_frame, style='Dialog.TFrame')
        button_frame.pack(fill=tk.X)
        
        ttk.Button(button_frame, text="\u2713 Create Mission", style='Accent.TButton',
                  command=self.create_mission).pack(side=tk.RIGHT, padx=(10, 0), ipadx=15, ipady=8)
        ttk.Button(button_frame, text="Cancel", style='Secondary.TButton',
                  command=self.dialog.destroy).pack(side=tk.RIGHT, ipadx=15, ipady=8)

    def create_mission(self):
        """Create the mission with entered data."""
        title = self.title_entry.get().strip()
        description = self.description_text.get("1.0", tk.END).strip()
        
        if not title or not description:
            messagebox.showwarning("Missing Information", "Please fill in title and description.")
            return
        
        self.result = {
            'title': title,
            'description': description,
            'difficulty': self.difficulty_var.get(),
            'constraints': self.constraints_entry.get().strip(),
            'rewards': self.rewards_var.get(),
            'punishment': self.punishment_entry.get().strip() or None
        }
        
        self.dialog.destroy()


class InsightWriteDialog:
    def __init__(self, parent, debt_options, debts):
        self.result = None
        self.debts = debts
        self.dialog = tk.Toplevel(parent)
        self.dialog.title("Write Insight Entry")
        self.dialog.geometry("500x600")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Center the dialog
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        self.setup_dialog(debt_options)

    def setup_dialog(self, debt_options):
        """Set up the insight writing dialog."""
        main_frame = ttk.Frame(self.dialog, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Debt selection
        ttk.Label(main_frame, text="Select debt to clear:").pack(anchor=tk.W, pady=(0, 5))
        self.debt_var = tk.StringVar(value=debt_options[0] if debt_options else "")
        debt_combo = ttk.Combobox(main_frame, textvariable=self.debt_var, values=debt_options, 
                                 state="readonly", width=50)
        debt_combo.pack(fill=tk.X, pady=(0, 10))
        
        # Insight entry
        ttk.Label(main_frame, text="Write your insight:").pack(anchor=tk.W, pady=(0, 5))
        ttk.Label(main_frame, text="What did you learn? How will you apply this knowledge?", 
                 font=("Arial", 9, "italic")).pack(anchor=tk.W, pady=(0, 5))
        
        self.insight_text = scrolledtext.ScrolledText(main_frame, height=15, width=50)
        self.insight_text.pack(fill=tk.BOTH, expand=True, pady=(0, 15))
        
        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X)
        
        ttk.Button(button_frame, text="Save Insight", command=self.save_insight).pack(side=tk.RIGHT, padx=(5, 0))
        ttk.Button(button_frame, text="Cancel", command=self.dialog.destroy).pack(side=tk.RIGHT)

    def save_insight(self):
        """Save the insight entry."""
        insight_text = self.insight_text.get("1.0", tk.END).strip()
        
        if not insight_text:
            messagebox.showwarning("Empty Insight", "Please write your insight before saving.")
            return
        
        # Find selected debt
        selected_option = self.debt_var.get()
        debt_index = 0
        
        for i, debt in enumerate(self.debts):
            if f"{debt.ticket_type} - {debt.used_for}" == selected_option:
                debt_index = i
                break
        
        self.result = (self.debts[debt_index], insight_text)
        self.dialog.destroy()


def main():
    """Main entry point for the SoloCraft application."""
    root = tk.Tk()
    app = SoloCraftApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()