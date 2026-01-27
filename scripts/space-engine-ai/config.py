"""
Space Engine AI Interface - Configuration
"""

import os
from pathlib import Path

# Space Engine Installation
SPACE_ENGINE_PATH = os.getenv(
    "SPACE_ENGINE_PATH", 
    "C:/Program Files/SpaceEngine/SpaceEngine.exe"
)

# Space Engine user data (where scripts are stored)
SPACE_ENGINE_DATA = os.getenv(
    "SPACE_ENGINE_DATA",
    os.path.expanduser("~/AppData/Roaming/SpaceEngine")
)

# Output settings
OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# Video settings
DEFAULT_RESOLUTION = "3840x2160"  # 4K
DEFAULT_FPS = 30
DEFAULT_CODEC = "libx264"
DEFAULT_CRF = 18  # Quality (lower = better, 18-23 recommended)

# Resolution presets (width x height)
RESOLUTION_PRESETS = {
    '1080p': (1920, 1080),    # Full HD
    '1440p': (2560, 1440),    # 2K / QHD
    '4k': (3840, 2160),       # 4K UHD (recommended)
    '5k': (5120, 2880),       # 5K
    '8k': (7680, 4320),       # 8K UHD (demanding)
    '16k': (15360, 8640),     # 16K (screenshots only, requires 24GB+ VRAM)
}

# GPU VRAM recommendations per resolution
VRAM_REQUIREMENTS = {
    '1080p': '4GB',
    '1440p': '6GB',
    '4k': '8GB',
    '5k': '10GB',
    '8k': '12GB+',
    '16k': '24GB+',
}

# Recording settings
RECORD_REALTIME = True  # Space Engine records in real-time
STARTUP_DELAY = 10  # Seconds to wait for SE to load

# AI Settings
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")  # or "anthropic"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# GUI Automation settings
GUI_DELAY = 0.5  # Delay between GUI actions (seconds)
SCREENSHOT_DEBUG = False  # Save screenshots for debugging

# Template directory
TEMPLATES_DIR = Path(__file__).parent / "templates"
TEMPLATES_DIR.mkdir(exist_ok=True)

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
