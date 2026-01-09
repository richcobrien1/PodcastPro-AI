#!/usr/bin/env ts-node
/**
 * Automated Episode Generation Pipeline
 * 
 * 1. Collect AI news from feeds
 * 2. Generate podcast script (Alex & Jessica dialogue)
 * 3. Convert to audio with AI voices
 * 4. Create video (audio + background image)
 * 5. Transcribe with timestamps
 * 6. Extract metadata
 * 7. Upload to R2 with metadata
 * 
 * OUTPUT: Playable MP4 video file ready for publishing
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { composeVideo, loadVideoConfig } from './compose-video';

const execAsync = promisify(exec);

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  content: string;
  publishedAt: string;
}

interface PodcastScript {
  title: string;
  speakers: Array<{
    speaker: 'Alex' | 'Jessica';
    text: string;
    timestamp: string;
  }>;
  estimatedDuration: number;
}

interface EpisodeMetadata {
  fullTitle: string;
  primaryKeywords: string[];
  detailedDescription: string;
  timestamps: Array<{ time: string; title: string }>;
  hashtags: string[];
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY;
const R2_SECRET_KEY = process.env.R2_SECRET_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'public';

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY!,
    secretAccessKey: R2_SECRET_KEY!,
  },
});

/**
 * Step 1: Collect latest AI news
 */
async function collectNews(): Promise<NewsArticle[]> {
  console.log('📰 Collecting AI news...');
  
  try {
    // Run existing news collector
    const { stdout } = await execAsync('cd ../news-collector && node index.js');
    console.log('News collection output:', stdout);
    
    // Read the generated news file
    const newsFile = path.join(__dirname, '../news-collector/ai-now-daily-' + new Date().toISOString().split('T')[0] + '.json');
    const newsData = await fs.readFile(newsFile, 'utf-8');
    const articles = JSON.parse(newsData);
    
    console.log(`✅ Collected ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error('Failed to collect news:', error);
    throw error;
  }
}

/**
 * Step 2: Generate podcast script with GPT-4
 */
async function generateScript(articles: NewsArticle[]): Promise<PodcastScript> {
  console.log('✍️ Generating podcast script...');
  
  const newsContext = articles.map(a => `
Title: ${a.title}
Source: ${a.source}
Content: ${a.content}
---
  `).join('\n');

  const prompt = `You are creating a podcast script for "AI-Now - Deep Dive with Alex and Jessica".

CONTEXT: These are today's top AI news stories:
${newsContext}

INSTRUCTIONS:
1. Create an engaging 8-10 minute conversational podcast
2. Alex is the tech expert (male voice), Jessica is the business strategist (female voice)
3. Natural dialogue with interruptions, questions, reactions
4. Include timestamps every 2-3 minutes marking topic changes
5. Make it educational but accessible
6. Include specific companies, numbers, and implications

FORMAT your response as JSON:
{
  "title": "Date + Main Topic - Deep Dive with Alex and Jessica",
  "speakers": [
    {"speaker": "Alex", "text": "...", "timestamp": "0:00"},
    {"speaker": "Jessica", "text": "...", "timestamp": "0:00"},
    ...
  ],
  "estimatedDuration": 600
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are an expert podcast script writer specializing in AI and technology.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8
      })
    });

    const data = await response.json();
    const script = JSON.parse(data.choices[0].message.content);
    
    console.log(`✅ Generated script: ${script.title}`);
    console.log(`   ${script.speakers.length} dialogue segments`);
    
    return script;
  } catch (error) {
    console.error('Failed to generate script:', error);
    throw error;
  }
}

/**
 * Step 3: Convert script to audio using ElevenLabs or OpenAI TTS
 */
async function generateAudio(script: PodcastScript): Promise<string> {
  console.log('🎙️ Generating audio...');
  
  const audioSegments: Buffer[] = [];
  
  // Voice IDs
  const ALEX_VOICE = process.env.ELEVENLABS_ALEX_VOICE || 'onyx';
  const JESSICA_VOICE = process.env.ELEVENLABS_JESSICA_VOICE || 'nova';
  
  for (let i = 0; i < script.speakers.length; i++) {
    const segment = script.speakers[i];
    const voiceId = segment.speaker === 'Alex' ? ALEX_VOICE : JESSICA_VOICE;
    
    console.log(`  [${i+1}/${script.speakers.length}] ${segment.speaker}: "${segment.text.substring(0, 50)}..."`);
    
    try {
      // Use OpenAI TTS (high quality, reliable)
      if (!ELEVENLABS_API_KEY) {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'tts-1-hd',
            voice: voiceId,
            input: segment.text
          })
        });
        
        if (!response.ok) {
          throw new Error(`TTS failed: ${response.statusText}`);
        }
        
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        audioSegments.push(audioBuffer);
      } else {
        // Use ElevenLabs for better quality
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: segment.text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`ElevenLabs TTS failed: ${response.statusText}`);
        }
        
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        audioSegments.push(audioBuffer);
      }
    } catch (error) {
      console.error(`Failed to generate audio for segment ${i}:`, error);
      throw error;
    }
  }
  
  // Merge audio segments using ffmpeg
  const tempDir = path.join(__dirname, '../temp');
  await fs.mkdir(tempDir, { recursive: true });
  
  // Save individual segments
  for (let i = 0; i < audioSegments.length; i++) {
    await fs.writeFile(path.join(tempDir, `segment-${i}.mp3`), audioSegments[i]);
  }
  
  // Create concat file for ffmpeg
  const concatContent = audioSegments.map((_, i) => `file 'segment-${i}.mp3'`).join('\n');
  await fs.writeFile(path.join(tempDir, 'concat.txt'), concatContent);
  
  // Merge with ffmpeg
  const audioFile = path.join(tempDir, `audio-${Date.now()}.mp3`);
  await execAsync(`ffmpeg -f concat -safe 0 -i "${tempDir}/concat.txt" -c copy "${audioFile}"`);
  
  console.log(`✅ Audio merged: ${audioFile}`);
  return audioFile;
}

/**
 * Step 3.5: Create background image for video
 */
async function createBackgroundImage(title: string): Promise<string> {
  console.log('🎨 Creating background image...');
  
  const tempDir = path.join(__dirname, '../temp');
  const imageFile = path.join(tempDir, `bg-${Date.now()}.png`);
  
  // Create a simple gradient background with title using ffmpeg
  // 1920x1080 resolution, dark blue gradient, centered white text
  const escapedTitle = title.replace(/'/g, "'\\''");
  
  const ffmpegCmd = `ffmpeg -f lavfi -i color=c=0x1a1a2e:s=1920x1080:d=1 ` +
    `-vf "drawtext=fontfile=/Windows/Fonts/arial.ttf:text='${escapedTitle}':` +
    `fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:` +
    `shadowcolor=black:shadowx=2:shadowy=2" ` +
    `-frames:v 1 "${imageFile}"`;
  
  try {
    await execAsync(ffmpegCmd);
    console.log(`✅ Background image created: ${imageFile}`);
    return imageFile;
  } catch (error) {
    // Fallback: create solid color background without text (cross-platform)
    console.log('   Font not found, creating simple background...');
    await execAsync(`ffmpeg -f lavfi -i color=c=0x1a1a2e:s=1920x1080:d=1 -frames:v 1 "${imageFile}"`);
    console.log(`✅ Background image created: ${imageFile}`);
    return imageFile;
  }
}

/**
 * Step 3.6: Create video from audio + background image
 */
async function createVideo(audioPath: string, imagePath: string): Promise<string> {
  console.log('🎬 Creating video (audio + background)...');
  
  const tempDir = path.join(__dirname, '../temp');
  const videoFile = path.join(tempDir, `video-${Date.now()}.mp4`);
  
  // Combine static image + audio into MP4 video
  const ffmpegCmd = `ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" ` +
    `-c:v libx264 -tune stillimage -c:a aac -b:a 192k ` +
    `-pix_fmt yuv420p -shortest -movflags +faststart "${videoFile}"`;
  
  await execAsync(ffmpegCmd);
  
  console.log(`✅ Video created: ${videoFile}`);
  
  // Verify the video is playable
  const { stdout } = await execAsync(`ffprobe -v error -show_format -show_streams "${videoFile}"`);
  if (!stdout.includes('codec_name')) {
    throw new Error('Video creation failed - file is not a valid video');
  }
  
  console.log(`✅ Video verified as playable`);
  return videoFile;
}

/**
 * Step 4: Transcribe audio with Whisper API
 */
async function transcribeAudio(audioPath: string): Promise<string> {
  console.log('📝 Transcribing audio...');
  
  const formData = new FormData();
  const audioBuffer = await fs.readFile(audioPath);
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
  formData.append('file', audioBlob, 'episode.mp3');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities', 'word');
  
  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });
    
    const data = await response.json();
    console.log(`✅ Transcribed ${data.text.length} characters`);
    
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to transcribe:', error);
    throw error;
  }
}

/**
 * Step 5: Extract metadata using GPT-4 with Master Prompt
 */
async function extractMetadata(script: PodcastScript, transcript: string): Promise<EpisodeMetadata> {
  console.log('🏷️ Extracting metadata...');
  
  const masterPrompt = `Extract podcast metadata from this transcript:

TRANSCRIPT:
${transcript}

EXTRACT the following in JSON format:
{
  "fullTitle": "Date + Main Topic - Deep Dive with Alex and Jessica",
  "primaryKeywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "detailedDescription": "Multi-paragraph description with bullet points (•) highlighting key topics",
  "timestamps": [
    {"time": "0:00", "title": "Topic name"},
    {"time": "2:15", "title": "Next topic"}
  ],
  "hashtags": ["#Keyword1", "#Keyword2", ...]
}

REQUIREMENTS:
- Title must include today's date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
- 4-6 primary keywords (Agentic AI, Infrastructure, etc.)
- Description with 3-5 bullet points using • symbol
- Timestamps every 2-3 minutes marking topic changes
- 10-15 relevant hashtags including company names, technologies, concepts`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a metadata extraction expert for podcast episodes.' },
          { role: 'user', content: masterPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      })
    });

    const data = await response.json();
    const metadata = JSON.parse(data.choices[0].message.content);
    
    console.log(`✅ Extracted metadata for: ${metadata.fullTitle}`);
    return metadata;
  } catch (error) {
    console.error('Failed to extract metadata:', error);
    throw error;
  }
}

/**
 * Step 6: Upload video to R2 and save metadata
 */
async function uploadEpisode(videoPath: string, metadata: EpisodeMetadata): Promise<string> {
  console.log('☁️ Uploading to R2...');
  
  // Generate R2 key based on date with hash for uniqueness
  const date = new Date();
  const hash = crypto.randomBytes(4).toString('hex');
  const slug = metadata.fullTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 80); // Limit length
  
  const r2Key = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${slug}-${hash}.mp4`;
  
  console.log(`  Uploading to: ${r2Key}`);
  
  // Upload video file to R2
  const videoBuffer = await fs.readFile(videoPath);
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    Body: videoBuffer,
    ContentType: 'video/mp4',
    CacheControl: 'public, max-age=31536000',
    Metadata: {
      'episode-title': metadata.fullTitle,
      'generated-by': 'automated-pipeline',
      'generation-date': new Date().toISOString()
    }
  });
  
  await r2Client.send(command);
  
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || R2_ENDPOINT?.match(/https:\/\/([^.]+)\.r2\./)?.[1];
  const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${R2_BUCKET}/${r2Key}`;
  
  console.log(`✅ Video uploaded to R2`);
  console.log(`   URL: ${publicUrl}`);
  
  // Save metadata to episode-metadata.json
  const metadataPath = path.join(__dirname, '../website/data/episode-metadata.json');
  let existingMetadata: Record<string, EpisodeMetadata> = {};
  
  try {
    const content = await fs.readFile(metadataPath, 'utf-8');
    existingMetadata = JSON.parse(content);
  } catch {
    // File doesn't exist yet, will create new
  }
  
  existingMetadata[r2Key] = metadata;
  await fs.writeFile(metadataPath, JSON.stringify(existingMetadata, null, 2));
  
  console.log(`✅ Metadata saved to episode-metadata.json`);
  console.log(`   Key: ${r2Key}`);
  
  return publicUrl;
}

/**
 * Main pipeline
 */
async function main() {
  console.log('🚀 Starting automated episode generation...\n');
  console.log('============================================\n');
  
  try {
    // Step 1: Collect news
    const articles = await collectNews();
    
    // Step 2: Generate script
    const script = await generateScript(articles);
    
    // Step 3: Generate audio (Alex & Jessica dialogue)
    const audioPath = await generateAudio(script);
    
    // Step 3.5: Load video configuration (backgrounds, promos, outro)
    const videoConfig = await loadVideoConfig();
    
    // Step 3.6: Compose final video with Clipchamp-style workflow
    const tempDir = path.join(__dirname, '../temp');
    const videoPath = path.join(tempDir, `episode-${Date.now()}.mp4`);
    await composeVideo(audioPath, videoConfig, videoPath);
    
    console.log('\n📹 VIDEO CREATED SUCCESSFULLY!');
    console.log(`   File: ${videoPath}`);
    console.log(`   Format: MP4 with background, promos, and outro`);
    console.log(`   You can play this video RIGHT NOW!\n`);
    
    // Step 4: Transcribe
    const transcript = await transcribeAudio(audioPath);
    
    // Step 5: Extract metadata
    const metadata = await extractMetadata(script, transcript);
    
    // Step 6: Upload to R2
    const publicUrl = await uploadEpisode(videoPath, metadata);
    
    console.log('\n============================================');
    console.log('✅ PIPELINE COMPLETE!');
    console.log('============================================\n');
    console.log(`📺 Title: ${metadata.fullTitle}`);
    console.log(`🎯 Keywords: ${metadata.primaryKeywords.join(', ')}`);
    console.log(`🔗 URL: ${publicUrl}`);
    console.log(`📁 Local: ${videoPath}`);
    console.log('\n💡 You can now:');
    console.log(`   1. Play the video locally: ${videoPath}`);
    console.log(`   2. Access via API: https://v2u.us/api/episodes`);
    console.log(`   3. Stream from R2: ${publicUrl}`);
    
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as generateEpisode };
