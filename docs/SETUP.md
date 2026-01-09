# Automated Episode Generation Pipeline

Complete autonomous system that **replicates your exact Clipchamp workflow** - generates playable MP4 videos ready to publish.

## 🎯 What It Does (Your Workflow, Automated)

1. **Collects News** - Runs existing news-collector to gather latest AI articles
2. **Generates Script** - GPT-4 creates Alex & Jessica dialogue from news
3. **Synthesizes Audio** - OpenAI TTS or ElevenLabs converts script to podcast
4. **Composes Video** - ffmpeg builds the full MP4:
   - Background loop (your cyan AI circuit board image)
   - Podcast audio track
   - Promo inserts at 4:00 and end
   - 5-second outro with fade in/out
5. **Transcribes** - Whisper API creates timestamped transcript
6. **Extracts Metadata** - GPT-4 generates title, keywords, description, timestamps, hashtags
7. **Uploads** - Saves to R2 and metadata.json automatically

**OUTPUT:** Playable MP4 video file - exactly like your Clipchamp exports!

## 📦 Setup

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp ../.env.example .env
```

**Required:**
- `OPENAI_API_KEY` - For script generation, TTS, Whisper, and metadata extraction

**Optional (for better quality):**
- `ELEVENLABS_API_KEY` - For voice cloning
- `ELEVENLABS_ALEX_VOICE` - Voice ID for Alex
- `ELEVENLABS_JESSICA_VOICE` - Voice ID for Jessica

**R2 Upload:**
- `R2_ENDPOINT`
- `R2_ACCESS_KEY`
- `R2_SECRET_KEY`
- `R2_BUCKET_NAME`

### 3. Install ffmpeg

**Windows:**
```bash
choco install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

## 🚀 Usage

### First-Time Setup: Upload Your Assets

1. **Go to Video Assets Manager:**
   ```
   https://v2u.us/admin/video-assets
   ```

2. **Upload Your Assets:**
   - **Background** - Your cyan AI circuit board image/video
   - **Outro** - 5-second AI logo video (will auto-fade)
   - **Promo Audio** - Ad audio clips for insertions
   - **Promo Visuals** - Background images for ad segments

3. **Configure Promo Slots:**
   - Slot 1: Time = 240 (4:00 minutes)
   - Slot 2: Time = -5 (5 seconds before end)
   - Select which audio/visual to insert at each slot
   - Toggle enable/disable as needed

4. **Save Configuration**

### Generate Your First Episode

```bash
cd scripts
npm install
npm run generate-episode
```

**What happens:**
1. Collects today's AI news
2. Generates Alex & Jessica script
3. Creates audio with voices
4. **Composes video using YOUR assets** (background, promos, outro)
5. Transcribes and extracts metadata
6. Uploads to R2

**Result:** `temp/episode-[timestamp].mp4` - ready to play!

### Test Video Composition Only

```bash
# Test with your own audio file
ts-node compose-video.ts path/to/your-audio.mp3
```

This creates a test video using your configured assets without running the full pipeline.

**Using cron (Linux/Mac):**
```bash
# Run every day at 6 AM
0 6 * * * cd /path/to/v2u/scripts && npm run generate-episode
```

**Using Task Scheduler (Windows):**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 6:00 AM
4. Action: Start a program
   - Program: `cmd.exe`
   - Arguments: `/c cd C:\Users\richc\Projects\v2u\scripts && npm run generate-episode`

**Using Cloudflare Workers (Recommended):**
Create a scheduled worker that triggers the pipeline:

```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Trigger episode generation via webhook or direct execution
    await fetch('https://v2u.us/api/admin/generate-episode', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.ADMIN_SECRET}` }
    });
  }
};
```

## 🎙️ Voice Configuration

### OpenAI TTS (Default)

No additional setup required. Uses built-in voices:
- **Alex** - `onyx` (male, authoritative)
- **Jessica** - `nova` (female, conversational)

### ElevenLabs (Premium)

For voice cloning:

1. **Clone Voices:**
   - Upload 1-2 minutes of sample audio for each speaker
   - Save voice IDs to `.env`

2. **Configure:**
   ```bash
   ELEVENLABS_API_KEY=your_key
   ELEVENLABS_ALEX_VOICE=voice_id_1
   ELEVENLABS_JESSICA_VOICE=voice_id_2
   ```

## 📊 Pipeline Flow (Clipchamp → ffmpeg)

```
News Feeds
    ↓
[GPT-4] Generate Script → Alex & Jessica Dialogue
    ↓
[OpenAI TTS / ElevenLabs] Synthesize Audio → MP3
    ↓
[ffmpeg] Video Composition:
    • Load background (loop to audio duration)
    • Add podcast audio track  
    • Overlay promo visuals at configured times
    • Mix promo audio at configured times
    • Append outro with fade effects (1s in, 2s hold, 2s out)
    ↓
[Whisper API] Transcribe → Timestamped transcript
    ↓
[GPT-4] Extract Metadata → Title, keywords, description, timestamps, hashtags
    ↓
[R2 Upload] Save to Cloudflare R2
    ↓
[Save Metadata] Update episode-metadata.json
    ↓
✅ Playable MP4 Video Published on v2u.us
```

## 🔧 Troubleshooting

### Audio Generation Fails
- **Check API keys** - Verify OpenAI/ElevenLabs keys are valid
- **Check ffmpeg** - Run `ffmpeg -version` to verify installation
- **Rate limits** - ElevenLabs has character limits per month

### Transcription Fails
- **File size** - Whisper API has 25MB limit, compress audio if needed
- **Format** - Ensure audio is MP3/WAV/M4A format

### R2 Upload Fails
- **Verify credentials** - Check R2_ACCESS_KEY and R2_SECRET_KEY
- **Check bucket** - Ensure R2_BUCKET_NAME exists and is public

### Script Quality Issues
- **Adjust temperature** - Lower for more factual, higher for creative
- **Refine prompt** - Edit the script generation prompt in `generate-episode.ts`
- **Use GPT-4** - Don't use GPT-3.5 for script generation

## 📝 Customization

### Modify Script Style

Edit the script generation prompt in `generate-episode.ts`:

```typescript
const prompt = `You are creating a podcast script for "AI-Now"...`;
```

### Adjust Episode Length

Change `estimatedDuration` in the prompt:
```typescript
"estimatedDuration": 600  // 10 minutes (in seconds)
```

### Add More Speakers

Extend the speaker array with additional voices:
```typescript
{"speaker": "Expert", "text": "...", "timestamp": "5:00"}
```

## 🎯 Master Prompt Template

The metadata extraction uses this template:

```
Extract podcast metadata from this transcript:

TRANSCRIPT:
[Full transcript here]

EXTRACT the following in JSON format:
{
  "fullTitle": "Date + Main Topic - Deep Dive with Alex and Jessica",
  "primaryKeywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "detailedDescription": "Multi-paragraph description with bullet points (•)",
  "timestamps": [
    {"time": "0:00", "title": "Introduction"},
    {"time": "2:15", "title": "Next topic"}
  ],
  "hashtags": ["#AI", "#Tech", "#Innovation"]
}
```

You can customize this in the `extractMetadata()` function.

## 🔄 Next Steps

1. **Run First Episode:**
   ```bash
   npm run generate-episode
   ```

2. **Verify Output:**
   - Check `website/data/episode-metadata.json` for metadata
   - Verify audio file in R2 bucket
   - Test API endpoint: `https://v2u.us/api/episodes`

3. **Schedule Automation:**
   - Set up cron job or Cloudflare Worker
   - Configure monitoring and alerts
   - Test error handling

4. **Optimize Voices:**
   - Upload sample audio to ElevenLabs
   - Clone Alex & Jessica voices
   - Update `.env` with voice IDs

## 📞 Support

Issues? Check:
- [OpenAI Status](https://status.openai.com/)
- [ElevenLabs Docs](https://docs.elevenlabs.io/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)

## 🎉 You're Ready!

The entire pipeline is autonomous. Just set it and forget it!

---

## 💼 Business Opportunity

This system is **production-ready for customers**:

### Turn This Into a Product

1. **Multi-Tenant Video Assets**
   - Each customer uploads their own backgrounds, promos, outros
   - Separate R2 buckets per customer
   - Custom branding per account

2. **Pricing Tiers**
   - **Basic** - 4 episodes/month, standard voices
   - **Pro** - Unlimited episodes, voice cloning, custom promos
   - **Enterprise** - White-label, API access, priority processing

3. **Features to Add**
   - Web dashboard for asset management ✅ (already built!)
   - Episode scheduling calendar
   - Analytics (plays, engagement)
   - Multi-platform auto-posting (YouTube, Spotify, etc.)
   - Team collaboration

4. **Revenue Streams**
   - Monthly subscriptions ($49/$149/$499)
   - Per-episode pricing
   - Premium voice cloning ($20/voice)
   - Storage overages ($0.10/GB)
   - Custom integrations

### What's Already Built

✅ Video composition engine (Clipchamp replacement)  
✅ Asset management UI  
✅ R2 storage integration  
✅ Metadata extraction  
✅ Public/private output support  
✅ Promo insertion system  

### Next Steps for Customer Launch

1. Add user authentication (Clerk/Auth0)
2. Add billing (Stripe integration)
3. Add usage tracking
4. Create landing page + pricing
5. Set up customer onboarding

**You've built the hard part.** The video pipeline works. Now wrap it in a SaaS!
