"""
Space Engine GUI Automation

Controls Space Engine through GUI automation since there's no native API.
Uses PyAutoGUI for mouse/keyboard control.
"""

import time
import subprocess
from pathlib import Path
from typing import Optional

try:
    import pyautogui
    import pygetwindow as gw
except ImportError:
    print("GUI automation requires: pip install pyautogui pygetwindow")
    pyautogui = None
    gw = None

from config import (
    SPACE_ENGINE_PATH, 
    STARTUP_DELAY, 
    GUI_DELAY,
    OUTPUT_DIR,
    SCREENSHOT_DEBUG
)


class SpaceEngineController:
    """Controls Space Engine through GUI automation"""
    
    def __init__(self):
        self.process: Optional[subprocess.Popen] = None
        self.window = None
        
        if pyautogui:
            # Safety settings
            pyautogui.FAILSAFE = True  # Move mouse to corner to abort
            pyautogui.PAUSE = GUI_DELAY
    
    def launch(self) -> bool:
        """Launch Space Engine application"""
        se_path = Path(SPACE_ENGINE_PATH)
        
        if not se_path.exists():
            raise FileNotFoundError(f"Space Engine not found at: {se_path}")
        
        print(f"Launching Space Engine from: {se_path}")
        self.process = subprocess.Popen([str(se_path)])
        
        # Wait for startup
        print(f"Waiting {STARTUP_DELAY}s for Space Engine to load...")
        time.sleep(STARTUP_DELAY)
        
        # Find window
        self.window = self._find_window()
        if self.window:
            self.window.activate()
            print(f"Space Engine window found: {self.window.title}")
            return True
        
        print("Warning: Could not find Space Engine window")
        return False
    
    def _find_window(self):
        """Find Space Engine window"""
        if not gw:
            return None
            
        windows = gw.getWindowsWithTitle("SpaceEngine")
        if windows:
            return windows[0]
        
        # Try alternative names
        for title in ["Space Engine", "SE"]:
            windows = gw.getWindowsWithTitle(title)
            if windows:
                return windows[0]
        
        return None
    
    def _screenshot(self, name: str):
        """Save debug screenshot"""
        if SCREENSHOT_DEBUG and pyautogui:
            screenshot = pyautogui.screenshot()
            screenshot.save(OUTPUT_DIR / f"debug_{name}.png")
    
    def load_script(self, script_path: Path) -> bool:
        """Load an SE Script file"""
        if not pyautogui:
            print("PyAutoGUI not available - simulating script load")
            return True
        
        print(f"Loading script: {script_path}")
        
        # Open console with ~ key
        pyautogui.press('`')
        time.sleep(0.5)
        
        # Type run command
        pyautogui.typewrite(f'run "{script_path}"', interval=0.02)
        pyautogui.press('enter')
        
        time.sleep(1)
        
        # Close console
        pyautogui.press('`')
        
        self._screenshot("after_script_load")
        return True
    
    def configure_recording(self, resolution: str = "3840x2160", duration: int = 600):
        """Configure recording settings"""
        width, height = resolution.split('x')
        
        print(f"Configuring recording: {resolution} @ 30fps, {duration}s")
        
        if not pyautogui:
            return
        
        # Open settings menu (F2 in Space Engine)
        pyautogui.press('f2')
        time.sleep(0.5)
        
        # Navigate to video settings
        # Note: Actual key sequence depends on SE version
        # This is a placeholder - needs calibration
        
        pyautogui.press('escape')
        self._screenshot("after_config")
    
    def start_recording(self, duration: int) -> Path:
        """Start recording and wait for completion"""
        output_file = OUTPUT_DIR / f"recording_{int(time.time())}.mp4"
        
        print(f"Starting recording for {duration}s...")
        print("Note: Recording happens in real-time")
        
        if not pyautogui:
            print(f"Simulating {duration}s recording...")
            time.sleep(min(duration, 5))  # Don't actually wait in simulation
            return output_file
        
        # Start recording (F9 in Space Engine)
        pyautogui.press('f9')
        
        # Wait for recording duration
        # Show progress
        for i in range(duration):
            if i % 60 == 0:
                print(f"  Recording: {i // 60}m / {duration // 60}m")
            time.sleep(1)
        
        # Stop recording
        pyautogui.press('f9')
        time.sleep(2)
        
        self._screenshot("after_recording")
        
        # Find the output file (Space Engine saves to its own location)
        # We'll need to copy/move it
        return self._find_recording()
    
    def _find_recording(self) -> Optional[Path]:
        """Find the most recent recording file"""
        # Space Engine typically saves to:
        # %USERPROFILE%/Documents/SpaceEngine/screenshots/
        
        from config import SPACE_ENGINE_DATA
        recordings_dir = Path(SPACE_ENGINE_DATA) / "screenshots"
        
        if not recordings_dir.exists():
            return None
        
        # Find most recent video file
        video_files = list(recordings_dir.glob("*.mp4"))
        if video_files:
            return max(video_files, key=lambda p: p.stat().st_mtime)
        
        return None
    
    def close(self):
        """Close Space Engine"""
        if self.process:
            self.process.terminate()
            self.process = None
        
        if self.window and pyautogui:
            pyautogui.hotkey('alt', 'f4')
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# Keyboard shortcuts reference for Space Engine
SE_HOTKEYS = {
    'console': '`',
    'settings': 'F2',
    'screenshot': 'F6',
    'record': 'F9',
    'pause': 'Space',
    'speed_up': ']',
    'slow_down': '[',
    'reset_speed': '\\',
    'free_camera': 'F',
    'track_object': 'T',
    'go_to': 'G',
    'search': 'Shift+F3',
}


if __name__ == "__main__":
    # Test GUI automation
    controller = SpaceEngineController()
    
    print("Testing Space Engine controller...")
    print(f"Space Engine path: {SPACE_ENGINE_PATH}")
    print(f"Path exists: {Path(SPACE_ENGINE_PATH).exists()}")
    
    # Don't actually launch in test mode
    print("\nHotkeys reference:")
    for action, key in SE_HOTKEYS.items():
        print(f"  {action}: {key}")
