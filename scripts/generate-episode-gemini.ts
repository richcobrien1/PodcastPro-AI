#!/usr/bin/env ts-node
/**
 * Automated Episode Generation Pipeline - Gemini TTS Version
 * 
 * Uses Google's Gemini API for:
 * 1. Script generation (Gemini 2.5 Flash)
 * 2. Multi-speaker TTS (Gemini 2.5 Flash TTS) - NotebookLM quality!
 * 3. Metadata extraction
 * 
 * This replaces OpenAI/ElevenLabs with Google's native TTS which powers NotebookLM.
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { composeVideo, loadVideoConfig } from './compose-video';

const execAsync = promisify(exec);

// ============================================
// CONFIGURATION
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY;
const R2_SECRET_KEY = process.env.R2_SECRET_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'public';

// Gemini TTS Voice Options (30 available voices)
// See: https://ai.google.dev/gemini-api/docs/speech-generation#voice-options
const VOICE_CONFIG = {
  Alex: {
    name: 'Kore',        // Firm, authoritative - good for tech expert
    style: 'Tech expert who explains complex topics clearly. Confident and knowledgeable.'
  },
  Jessica: {
    name: 'Puck',        // Upbeat, engaging - good for business strategist  
    style: 'Business strategist who asks great questions. Curious and insightful.'
  }
};

// Alternative voice pairings to try:
// Alex: Orus (Firm), Charon (Informative), Fenrir (Excitable)
// Jessica: Aoede (Breezy), Zephyr (Bright), Leda (Youthful)

// ============================================
// INTERFACES
// ============================================

interface NewsArticle {
  title: string;
  url?: string;
  link?: string;
  source: string;
  content?: string;
  description?: string;
  publishedAt?: string;
  pubDate?: string;
}

interface PodcastScript {
  title: string;
  transcript: string;  // Full transcript with speaker labels
  estimatedDuration: number;
}

interface EpisodeMetadata {
  fullTitle: string;
  primaryKeywords: string[];
  detailedDescription: string;
  timestamps: Array<{ time: string; title: string }>;
  hashtags: string[];
}

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY!,
    secretAccessKey: R2_SECRET_KEY!,
  },
});

// ============================================
// STEP 1: COLLECT NEWS
// ============================================

async function collectNews(): Promise<NewsArticle[]> {
  console.log('📰 Collecting AI news...');
  
  try {
    const { stdout } = await execAsync('cd ../news-collector && node index.js');
    console.log('News collection output:', stdout);
    
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

// ============================================
// STEP 2: GENERATE SCRIPT WITH GEMINI
// ============================================

async function generateScript(articles: NewsArticle[]): Promise<PodcastScript> {
  console.log('✍️ Generating podcast script with Gemini...');
  
  const newsContext = articles.slice(0, 5).map(a => `
Title: ${a.title}
Source: ${a.source}
Summary: ${a.description || a.content || 'No description available'}
Link: ${a.link || a.url}
---
  `).join('\n');

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const prompt = `You are creating a podcast script for "AI-Now - Deep Dive with Alex and Jessica".

TODAY'S DATE: ${today}

TODAY'S TOP AI NEWS:
${newsContext}

CREATE A NATURAL PODCAST CONVERSATION:
- Alex is the tech expert (male) who explains the technical details
- Jessica is the business strategist (female) who asks insightful questions and connects to business impact
- They have natural chemistry with interruptions, reactions, and banter
- Duration: 10-12 minutes of content
- Include specific companies, numbers, and implications from the news
- Start with a hook that grabs attention
- End with key takeaways

FORMAT THE TRANSCRIPT EXACTLY LIKE THIS:
Alex: [Opening statement about today's topic]
Jessica: [Response or question]
Alex: [Continue the conversation]
...

IMPORTANT:
- Use ONLY "Alex:" and "Jessica:" as speaker labels
- Make it conversational and engaging, not robotic
- Include natural reactions like "Wow", "That's interesting", "Wait, let me get this straight..."
- Reference specific data points and company names from the news`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 8192,
        }
      })
    });

    const data = await response.json() as any;
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No response from Gemini: ' + JSON.stringify(data));
    }
    
    const transcript = data.candidates[0].content.parts[0].text;
    
    // Extract title from first line or generate one
    const title = `${today}, AI-Now - Deep Dive with Alex and Jessica`;
    
    console.log(`✅ Generated script: ${title}`);
    console.log(`   Transcript length: ${transcript.length} characters`);
    
    return {
      title,
      transcript,
      estimatedDuration: 600 // ~10 minutes
    };
  } catch (error) {
    console.error('Failed to generate script:', error);
    throw error;
  }
}

// ============================================
// STEP 3: GENERATE AUDIO WITH GEMINI TTS
// ============================================

async function generateAudio(script: PodcastScript): Promise<string> {
  console.log('🎙️ Generating audio with Gemini Multi-Speaker TTS...');
  console.log('   Using NotebookLM-quality voices!');
  
  const tempDir = path.join(__dirname, '../temp');
  await fs.mkdir(tempDir, { recursive: true });
  
  // Build the TTS prompt with director's notes for natural performance
  const ttsPrompt = `# AUDIO PROFILE: AI-Now Podcast Hosts

## THE SCENE: Professional Podcast Studio
A modern podcast studio with comfortable chairs, good acoustics, and an energetic vibe.
The hosts have been doing this show for months and have natural chemistry.

### DIRECTOR'S NOTES

Alex's Style:
- Confident tech expert who genuinely loves explaining complex topics
- Speaks clearly but with enthusiasm, not monotone
- Uses natural pauses for emphasis
- Occasionally gets excited about particularly cool tech developments

Jessica's Style:  
- Sharp business mind who asks the questions listeners are thinking
- Warm and engaging, makes complex topics accessible
- Natural reactions - laughs at jokes, expresses surprise at big numbers
- Keeps the conversation moving with good follow-up questions

Pacing:
- Conversational pace, not rushed
- Natural pauses between speakers
- Occasional overlapping enthusiasm is fine

### TRANSCRIPT
${script.transcript}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: ttsPrompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: 'Alex',
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: VOICE_CONFIG.Alex.name
                    }
                  }
                },
                {
                  speaker: 'Jessica',
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: VOICE_CONFIG.Jessica.name
                    }
                  }
                }
              ]
            }
          }
        }
      })
    });

    const data = await response.json() as any;
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No audio response from Gemini TTS: ' + JSON.stringify(data));
    }
    
    // Extract audio data (base64 encoded)
    const audioData = data.candidates[0].content.parts[0].inlineData.data;
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    // Save as WAV file (Gemini TTS outputs 24kHz PCM)
    const wavPath = path.join(tempDir, `audio-${Date.now()}.wav`);
    await writeWavFile(wavPath, audioBuffer);
    
    // Convert to MP3 for smaller file size
    const mp3Path = path.join(tempDir, `audio-${Date.now()}.mp3`);
    await execAsync(`ffmpeg -i "${wavPath}" -codec:a libmp3lame -b:a 192k "${mp3Path}"`);
    
    // Clean up WAV
    await fs.unlink(wavPath);
    
    console.log(`✅ Audio generated: ${mp3Path}`);
    return mp3Path;
    
  } catch (error) {
    console.error('Failed to generate audio:', error);
    throw error;
  }
}

// Helper to write WAV file from PCM data
async function writeWavFile(filePath: string, pcmData: Buffer): Promise<void> {
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;
  
  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  
  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);           // chunk size
  header.writeUInt16LE(1, 20);            // audio format (PCM)
  header.writeUInt16LE(numChannels, 22);  // channels
  header.writeUInt32LE(sampleRate, 24);   // sample rate
  header.writeUInt32LE(byteRate, 28);     // byte rate
  header.writeUInt16LE(blockAlign, 32);   // block align
  header.writeUInt16LE(bitsPerSample, 34);// bits per sample
  
  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  
  const wavBuffer = Buffer.concat([header, pcmData]);
  await fs.writeFile(filePath, wavBuffer);
}

// ============================================
// STEP 4: CREATE VIDEO
// ============================================

async function createVideo(audioPath: string): Promise<string> {
  console.log('🎬 Creating video with visual assets...');
  
  const videoConfig = await loadVideoConfig();
  const tempDir = path.join(__dirname, '../temp');
  const videoPath = path.join(tempDir, `episode-${Date.now()}.mp4`);
  
  await composeVideo(audioPath, videoConfig, videoPath);
  
  console.log(`✅ Video created: ${videoPath}`);
  return videoPath;
}

// ============================================
// STEP 5: EXTRACT METADATA WITH GEMINI
// ============================================

async function extractMetadata(script: PodcastScript): Promise<EpisodeMetadata> {
  console.log('🏷️ Extracting metadata with Gemini...');
  
  const today = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  const prompt = `Extract podcast metadata from this transcript:

TRANSCRIPT:
${script.transcript}

Generate JSON with this exact structure:
{
  "fullTitle": "${today}, AI-Now - [Main Topic] - Deep Dive with Alex and Jessica",
  "primaryKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "detailedDescription": "Multi-paragraph description highlighting key topics discussed...",
  "timestamps": [
    {"time": "0:00", "title": "Introduction"},
    {"time": "2:00", "title": "Topic 1"},
    {"time": "5:00", "title": "Topic 2"}
  ],
  "hashtags": ["#AI", "#Tech", "#Innovation", "#AINews"]
}

REQUIREMENTS:
- Title must include the date and main topic
- 5-7 primary keywords from the discussion
- Description with bullet points (•) for key topics
- Timestamps every 2-3 minutes
- 10-15 relevant hashtags`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      })
    });

    const data = await response.json() as any;
    const metadata = JSON.parse(data.candidates[0].content.parts[0].text);
    
    console.log(`✅ Extracted metadata: ${metadata.fullTitle}`);
    return metadata;
    
  } catch (error) {
    console.error('Failed to extract metadata:', error);
    throw error;
  }
}

// ============================================
// STEP 6: UPLOAD TO R2
// ============================================

async function uploadEpisode(videoPath: string, metadata: EpisodeMetadata): Promise<string> {
  console.log('☁️ Uploading to R2...');
  
  const date = new Date();
  const hash = crypto.randomBytes(4).toString('hex');
  const slug = metadata.fullTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 80);
  
  const r2Key = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${slug}-${hash}.mp4`;
  
  console.log(`  Uploading to: ${r2Key}`);
  
  const videoBuffer = await fs.readFile(videoPath);
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: r2Key,
    Body: videoBuffer,
    ContentType: 'video/mp4',
    CacheControl: 'public, max-age=31536000',
    Metadata: {
      'episode-title': metadata.fullTitle,
      'generated-by': 'gemini-tts-pipeline',
      'generation-date': new Date().toISOString()
    }
  });
  
  await r2Client.send(command);
  
  const accountId = R2_ENDPOINT?.match(/https:\/\/([^.]+)\.r2\./)?.[1];
  const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${R2_BUCKET}/${r2Key}`;
  
  console.log(`✅ Video uploaded to R2`);
  console.log(`   URL: ${publicUrl}`);
  
  // Save metadata
  const metadataPath = path.join(__dirname, '../data/episode-metadata.json');
  let existingMetadata: any[] = [];
  try {
    const existing = await fs.readFile(metadataPath, 'utf-8');
    existingMetadata = JSON.parse(existing);
  } catch { /* file doesn't exist yet */ }
  
  existingMetadata.unshift({
    ...metadata,
    videoUrl: publicUrl,
    r2Key,
    generatedAt: new Date().toISOString(),
    pipeline: 'gemini-tts'
  });
  
  await fs.writeFile(metadataPath, JSON.stringify(existingMetadata, null, 2));
  
  return publicUrl;
}

// ============================================
// MAIN PIPELINE
// ============================================

async function main() {
  console.log('\n🚀 Starting Gemini TTS Episode Generation...');
  console.log('============================================');
  console.log('Using Google Gemini for NotebookLM-quality audio!\n');
  
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY or GOOGLE_API_KEY not set!');
    console.error('   Get your API key at: https://aistudio.google.com/apikey');
    process.exit(1);
  }
  
  try {
    // Step 1: Collect news
    const articles = await collectNews();
    
    // Step 2: Generate script
    const script = await generateScript(articles);
    
    // Step 3: Generate audio with Gemini TTS
    const audioPath = await generateAudio(script);
    
    // Step 4: Create video
    const videoPath = await createVideo(audioPath);
    
    // Step 5: Extract metadata
    const metadata = await extractMetadata(script);
    
    // Step 6: Upload to R2
    const publicUrl = await uploadEpisode(videoPath, metadata);
    
    console.log('\n============================================');
    console.log('✅ PIPELINE COMPLETE!');
    console.log('============================================\n');
    console.log(`📺 Title: ${metadata.fullTitle}`);
    console.log(`🎯 Keywords: ${metadata.primaryKeywords.join(', ')}`);
    console.log(`🔗 URL: ${publicUrl}`);
    console.log(`📁 Local: ${videoPath}`);
    console.log('\n🎉 Episode ready for publishing!');
    
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as generateEpisodeGemini };
