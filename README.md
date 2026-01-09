# PodcastPro-AI 🎙️

**Fully automated podcast video generation with AI voices, professional editing, and zero manual work.**

Transform news feeds into polished podcast videos in minutes - complete with AI hosts, branded backgrounds, promotional inserts, and professional production quality.

## 🎯 What It Does

PodcastPro-AI automates your entire podcast production workflow:

1. **Collects Content** - Aggregates news from RSS feeds and APIs
2. **Writes Scripts** - GPT-4 generates natural dialogue between AI hosts
3. **Synthesizes Voices** - OpenAI TTS or ElevenLabs creates realistic audio
4. **Composes Videos** - ffmpeg builds professional MP4s with:
   - Looping backgrounds
   - Promotional inserts at custom timestamps
   - Branded outros with fade effects
5. **Extracts Metadata** - Auto-generates titles, descriptions, keywords, timestamps, hashtags
6. **Publishes Automatically** - Uploads to cloud storage with metadata

**Output:** Broadcast-ready MP4 videos - no editing required.

## ✨ Features

### Core Automation
- ✅ **AI Script Writing** - Natural dialogue generation with GPT-4
- ✅ **Voice Synthesis** - Realistic AI voices (OpenAI TTS + ElevenLabs support)
- ✅ **Video Composition** - Professional editing pipeline with ffmpeg
- ✅ **Metadata Extraction** - SEO-optimized titles, descriptions, tags
- ✅ **Cloud Publishing** - Cloudflare R2 integration

### Visual Asset Manager
- ✅ **Custom Backgrounds** - Upload and manage looping visuals
- ✅ **Promotional Inserts** - Audio + visual ads at custom timestamps
- ✅ **Branded Outros** - Fade in/out effects (1s in, 2s hold, 2s out)
- ✅ **Public/Private Outputs** - Configurable access control
- ✅ **Web Dashboard** - Drag-and-drop asset management

### Enterprise Features
- ✅ **Batch Processing** - Generate multiple episodes
- ✅ **Scheduled Automation** - Daily cron jobs
- ✅ **API-First Design** - RESTful endpoints
- ✅ **Multi-Tenant Ready** - Separate configs per user
- ✅ **Error Recovery** - Automatic retries and logging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- ffmpeg installed
- OpenAI API key

### Installation

```bash
# Clone repository
git clone https://github.com/richcobrien1/PodcastPro-AI.git
cd PodcastPro-AI

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### Generate Your First Episode

```bash
npm run generate-episode
```

**Output:** `temp/episode-[timestamp].mp4` - ready to play!

## 📖 Documentation

- **[Setup Guide](docs/SETUP.md)** - Complete installation and configuration
- **[API Reference](docs/API.md)** - Endpoint documentation
- **[Video Composition](docs/VIDEO_COMPOSITION.md)** - ffmpeg workflow details

## 🎨 Asset Management

1. **Start the web dashboard:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:3000/admin/video-assets`

3. **Upload your assets:**
   - Background images/videos (loop throughout episode)
   - Promo audio clips (for ad insertions)
   - Promo visuals (background ads)
   - Outro videos (5-second branded ending)

4. **Configure insertion points:**
   - Set timestamps for promo placements
   - Enable/disable individual slots
   - Choose public/private output

## 🏗️ Architecture

```
┌─────────────────┐
│  News Feeds     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GPT-4 Script   │
│  Generation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Voice Synth    │
│  (TTS)          │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Video Composition Engine   │
│  • Background loop          │
│  • Audio track              │
│  • Promo overlays          │
│  • Outro with fades        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│  Whisper API    │
│  Transcription  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GPT-4 Metadata │
│  Extraction     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  R2 Upload      │
│  + Metadata     │
└─────────────────┘
```

## 💼 Use Cases

### Content Creators
- Daily news podcasts
- Educational series
- Product reviews
- Industry updates

### Agencies
- Client podcast production
- White-label services
- Batch content generation
- Multi-brand management

### Businesses
- Internal communications
- Training materials
- Product announcements
- Thought leadership

## 🛠️ Technology Stack

- **Backend:** Node.js, TypeScript
- **Frontend:** Next.js 15, React, Tailwind CSS
- **AI:** OpenAI GPT-4, Whisper, TTS
- **Voice:** ElevenLabs (optional)
- **Video:** ffmpeg
- **Storage:** Cloudflare R2
- **Deployment:** Vercel/Cloudflare Workers

## 📊 Pricing (SaaS Model)

### Basic - $49/month
- 4 episodes/month
- Standard voices
- Basic backgrounds
- Email support

### Pro - $149/month
- Unlimited episodes
- Voice cloning
- Custom promos & outros
- Priority support
- API access

### Enterprise - $499/month
- White-label branding
- Multi-user accounts
- Dedicated infrastructure
- Custom integrations
- SLA guarantees

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

Copyright © 2026 PodcastPro-AI. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4, Whisper, and TTS APIs
- ElevenLabs for premium voice synthesis
- Cloudflare for R2 storage
- ffmpeg community

## 📧 Contact

- **Website:** [v2u.us](https://v2u.us)
- **GitHub:** [github.com/richcobrien1/PodcastPro-AI](https://github.com/richcobrien1/PodcastPro-AI)

## ⭐ Star This Repo

If PodcastPro-AI helps you automate podcast production, give it a star!

---

**Built with ❤️ for content creators who want to focus on ideas, not editing.**
