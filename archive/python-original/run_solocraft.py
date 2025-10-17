#!/usr/bin/env python3
"""
Main launcher script for SoloCraft desktop application.
"""

import sys
import os

def main():
    """Main function to run SoloCraft desktop application."""
    print("Starting SoloCraft - Independent Project Builder...")
    
    try:
        # Import and run the SoloCraft application
        from solocraft_gui import main as solocraft_main
        solocraft_main()
        
    except KeyboardInterrupt:
        print("\nSoloCraft closed by user.")
    except ImportError as e:
        print(f"Error importing SoloCraft modules: {e}")
        print("Please ensure all required files are present.")
        sys.exit(1)
    except Exception as e:
        print(f"Error running SoloCraft: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()