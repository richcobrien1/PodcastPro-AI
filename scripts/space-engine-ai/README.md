# Space Engine AI Interface

Automated video generation pipeline for Space Engine using AI-powered scene composition.

## 🎯 Purpose

Convert natural language prompts into cinematic space videos:
```
"Create a 10-minute black hole approach with gravitational lensing"
    → AI generates SE Script
    → GUI automation loads and runs script
    → Exports 4K video ready for post-processing
```

## 📁 Structure

```
space-engine-ai/
├── README.md
├── requirements.txt
├── config.py              # Paths, settings
├── main.py                # CLI entry point
├── ai_composer.py         # Natural language → SE Script
├── gui_automation.py      # PyAutoGUI control layer
├── video_pipeline.py      # Export + post-processing
├── templates/             # Pre-built SE Script templates
│   ├── black_hole.se
│   ├── asteroid_belt.se
│   └── galaxy_collision.se
└── output/                # Generated videos
```

## 🚀 Quick Start

### Prerequisites
1. **Space Engine Pro** ($25) - [spaceengine.org](https://spaceengine.org)
2. **Python 3.10+**
3. **FFmpeg** in PATH

### Installation
```bash
cd scripts/space-engine-ai
pip install -r requirements.txt
```

### Usage

#### Generate from template:
```bash
python main.py --template black_hole --duration 600 --output "black_hole_4hr.mp4"
```

#### Generate from natural language:
```bash
python main.py --prompt "Slow approach to a supermassive black hole with orange accretion disk"
```

#### Batch generation:
```bash
python main.py --batch scenes.json
```

## 🎬 Templates

### 1. Black Hole (`black_hole.se`)
- Interstellar-style gravitational lensing
- Slow approach with accretion disk
- Configurable: mass, distance, speed

### 2. Asteroid Belt (`asteroid_belt.se`)
- POV drift through debris field
- Tumbling rocks, sun glints
- Configurable: density, lighting, speed

### 3. Galaxy Collision (`galaxy_collision.se`)
- Two spiral galaxies merging
- Timelapse millions of years
- Configurable: galaxy types, viewing angle

## ⚙️ Configuration

Edit `config.py`:
```python
SPACE_ENGINE_PATH = "C:/Program Files/SpaceEngine/SpaceEngine.exe"
OUTPUT_DIR = "./output"
DEFAULT_RESOLUTION = "3840x2160"  # 4K
DEFAULT_FPS = 30
```

## 🤖 AI Composer

The AI composer uses GPT-4/Claude to convert natural language into SE Script:

**Input:** "Black hole with blue accretion disk, approaching from above"

**Output:** SE Script with camera paths, object selection, render settings

## 🔧 GUI Automation

Since Space Engine lacks an API, we use PyAutoGUI to:
1. Launch Space Engine
2. Load SE Script files
3. Configure render settings
4. Start recording
5. Wait for completion
6. Export video

## 📊 Workflow

```
┌─────────────────┐
│ Natural Language│
│    or Template  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  AI Composer    │ → Generates SE Script
└────────┬────────┘
         ▼
┌─────────────────┐
│ GUI Automation  │ → Controls Space Engine
└────────┬────────┘
         ▼
┌─────────────────┐
│ Video Pipeline  │ → FFmpeg post-processing
└────────┬────────┘
         ▼
┌─────────────────┐
│  4K Video Out   │ → Ready for YouTube
└─────────────────┘
```

## 🎵 Audio Integration

Output videos are silent. Combine with:
- Suno/Udio ambient generation
- FFmpeg audio merge in `video_pipeline.py`

## ⚠️ Limitations

- Requires Space Engine Pro license for commercial use
- GUI automation needs screen focus (can't run headless)
- Recording is real-time (10 min video = 10 min render)

## 📝 TODO

- [ ] Basic template system
- [ ] GUI automation skeleton
- [ ] AI prompt → SE Script conversion
- [ ] FFmpeg post-processing
- [ ] Batch queue system
- [ ] Audio merge integration

---

*Created: January 27, 2026*
