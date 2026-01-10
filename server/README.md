# PodcastProAI Backend API

Express + TypeScript backend for video composition and asset management.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Server runs on `http://localhost:3001` by default.

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and FFmpeg availability.

**Response:**
```json
{
  "status": "ok",
  "ffmpeg": true,
  "timestamp": "2026-01-10T..."
}
```

### Upload Asset
```
POST /api/assets/upload
Content-Type: multipart/form-data
```

**Body:**
- `file`: File upload (background, promo-video, promo-audio, outro)
- `type`: Asset type string

**Response:**
```json
{
  "success": true,
  "asset": {
    "id": "1736518800000",
    "name": "background.mp4",
    "type": "background",
    "path": "/uploads/xyz.mp4",
    "size": 5242880,
    "mimeType": "video/mp4"
  }
}
```

### List Assets
```
GET /api/assets?type=background
```

**Response:**
```json
{
  "assets": []
}
```

### Generate Video
```
POST /api/video/generate
Content-Type: application/json
```

**Body:**
```json
{
  "audioPath": "/path/to/audio.mp3",
  "backgroundPath": "/path/to/background.mp4",
  "outroPath": "/path/to/outro.mp4",
  "outputFormat": "landscape",
  "promoInserts": [
    {
      "timestamp": 240,
      "type": "video",
      "videoAssetPath": "/path/to/promo.mp4",
      "audioAssetPath": "/path/to/promo-audio.mp3"
    }
  ],
  "metadata": {
    "title": "Episode Title",
    "description": "Description",
    "keywords": "AI, Tech",
    "summary": "Summary",
    "timeline": "0:00 - Intro",
    "tags": "#AI #Tech"
  }
}
```

**Response:**
```json
{
  "success": true,
  "outputPath": "/temp/output-1736518800000.mp4",
  "metadata": { ... }
}
```

## Video Composition Service

### Features

- **Multi-format output**: landscape (1920x1080), portrait (1080x1920), square (1080x1080)
- **Background looping**: Auto-extends to match audio duration
- **Promo inserts**: Unlimited timestamp-based overlays
- **Audio mixing**: Combine podcast audio with promo tracks
- **Outro with fades**: 1s fade in, 2s hold, 2s fade out
- **Smart scaling**: Maintains aspect ratio, adds padding

### Configuration

```typescript
interface VideoCompositionConfig {
  audioPath: string;
  backgroundPath: string;
  outroPath?: string;
  promoInserts: PromoInsert[];
  outputFormat: 'landscape' | 'portrait' | 'square';
  outputPath: string;
  metadata: {
    title: string;
    description: string;
    keywords: string;
    summary: string;
    timeline: string;
    tags: string;
  };
}
```

### Promo Insert Types

```typescript
interface PromoInsert {
  timestamp: number;          // seconds into the video
  type: 'video' | 'audio' | 'visual';
  videoAssetPath?: string;    // for visual/video overlay
  audioAssetPath?: string;    // for audio mixing
}
```

## Environment Variables

See `.env.example` for required configuration:

```bash
PORT=3001
NODE_ENV=development
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

## Dependencies

**Core:**
- Express 4.18.2 - Web framework
- TypeScript 5.3.3 - Type safety
- Multer 1.4.5 - File uploads
- CORS 2.8.5 - Cross-origin requests

**Dev:**
- TSX 4.7.0 - TypeScript execution
- @types/* - Type definitions

**External:**
- FFmpeg 8.0+ - Video processing
- FFprobe - Media analysis

## Development

```bash
# Watch mode with auto-reload
npm run dev

# Type checking
npx tsc --noEmit

# Build
npm run build
```

## Production Deployment

1. Build TypeScript: `npm run build`
2. Set environment variables
3. Start server: `npm start`

## Integration with Frontend

Frontend React app runs on `http://localhost:5173`
Backend API runs on `http://localhost:3001`

CORS is enabled for local development.

## Next Steps

- [ ] Integrate Cloudflare R2 for asset storage
- [ ] Add Clerk authentication middleware
- [ ] Implement template save/load
- [ ] Add video processing queue
- [ ] Implement progress tracking
- [ ] Add webhook notifications

---

**Version**: 1.0.0  
**Last Updated**: January 10, 2026
