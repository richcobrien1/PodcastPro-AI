import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { composeVideo, validateFFmpeg, type VideoCompositionConfig } from './services/videoComposer.js';
import { requireAuth, checkAuth, getUserId } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(express.json());

// Health check (public)
app.get('/api/health', async (req, res) => {
  const ffmpegOk = await validateFFmpeg();
  res.json({
    status: 'ok',
    ffmpeg: ffmpegOk,
    timestamp: new Date().toISOString()
  });
});

// Upload asset endpoint (protected)
app.post('/api/assets/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = getUserId(req);
    const { type } = req.body; // background, promo-video, promo-audio, outro
    
    // In production, upload to R2 with user-specific path: /users/{userId}/assets/{type}/
    // For now, just return local path
    
    res.json({
      success: true,
      asset: {
        id: Date.now().toString(),
        userId,
        name: req.file.originalname,
        type: type || 'unknown',
        path: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate video endpoint (protected)
app.post('/api/video/generate', requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const config = req.body as Partial<VideoCompositionConfig>;
    
    // Validate required fields
    if (!config.audioPath || !config.backgroundPath) {
      return res.status(400).json({
        error: 'Missing required fields: audioPath, backgroundPath'
      });
    }

    // Set defaults
    const fullConfig: VideoCompositionConfig = {
      audioPath: config.audioPath,
      backgroundPath: config.backgroundPath,
      outroPath: config.outroPath,
      promoInserts: config.promoInserts || [],
      outputFormat: config.outputFormat || 'landscape',
      outputPath: config.outputPath || path.join(__dirname, '../../temp', `output-${userId}-${Date.now()}.mp4`),
      metadata: config.metadata || {
        title: '',
        description: '',
        keywords: '',
        summary: '',
        timeline: '',
        tags: ''
      }
    };

    // Ensure output directory exists
    await fs.mkdir(path.dirname(fullConfig.outputPath), { recursive: true });

    // Compose video
    await composeVideo(fullConfig);

    // In production, upload to R2 with user-specific path: /users/{userId}/videos/{videoId}.mp4
    
    res.json({
      success: true,
      userId,
      outputPath: fullConfig.outputPath,
      metadata: fullConfig.metadata
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List assets (protected)
app.get('/api/assets', requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { type } = req.query;
  
  // In production, query user's assets from R2/database
  // For now, return empty array
  
  res.json({
    userId,
    assets: []
  });
});

// Get user info (protected)
app.get('/api/user', requireAuth, (req, res) => {
  const userId = getUserId(req);
  
  // In production, fetch user data from database
  
  res.json({
    userId,
    // Add more user data as needed
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 PodcastProAI Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Auth: Clerk (required for protected endpoints)`);
  console.log(`\n📡 Available endpoints:`);
  console.log(`   GET  /api/health          - Health check (public)`);
  console.log(`   POST /api/assets/upload   - Upload asset (protected)`);
  console.log(`   GET  /api/assets          - List assets (protected)`);
  console.log(`   POST /api/video/generate  - Generate video (protected)`);
  console.log(`   GET  /api/user            - Get user info (protected)`);
  console.log();
});
