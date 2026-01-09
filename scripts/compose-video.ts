#!/usr/bin/env ts-node
/**
 * Video Composition Engine
 * 
 * Replicates the Clipchamp workflow:
 * 1. Background loop (cyan AI circuit board)
 * 2. Podcast audio track
 * 3. Promo inserts at configured timestamps
 * 4. 5-second outro with fade effects
 * 
 * Uses ffmpeg to assemble everything automatically
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface VideoAsset {
  id: string;
  name: string;
  type: 'background' | 'promo-audio' | 'promo-visual' | 'outro';
  url: string;
  duration?: number;
  enabled: boolean;
  insertAt?: number;
}

interface VideoConfig {
  assets: VideoAsset[];
  defaultBackground: string;
  defaultOutro: string;
  promoSlots: Array<{
    time: number;
    audioAssetId?: string;
    visualAssetId?: string;
    enabled: boolean;
  }>;
  outputType: 'public' | 'private';
}

/**
 * Compose final video from podcast audio + visual assets
 */
export async function composeVideo(
  audioPath: string,
  config: VideoConfig,
  outputPath: string
): Promise<void> {
  console.log('🎬 Composing video...');
  
  // Get audio duration
  const { stdout: probeOutput } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`
  );
  const audioDuration = parseFloat(probeOutput.trim());
  console.log(`  Audio duration: ${audioDuration}s`);
  
  // Find assets
  const backgroundAsset = config.assets.find(a => a.id === config.defaultBackground);
  const outroAsset = config.assets.find(a => a.id === config.defaultOutro);
  
  if (!backgroundAsset) {
    throw new Error('No default background configured');
  }
  
  const tempDir = path.join(__dirname, '../temp');
  await fs.mkdir(tempDir, { recursive: true });
  
  // Step 1: Create background video loop (extends to match audio duration)
  const backgroundLoopPath = path.join(tempDir, 'background-loop.mp4');
  await execAsync(`ffmpeg -loop 1 -i "${backgroundAsset.url}" -t ${audioDuration} -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -r 30 -pix_fmt yuv420p "${backgroundLoopPath}"`);
  console.log('  ✓ Background loop created');
  
  // Step 2: Build filter complex for video composition
  let filterComplex = '';
  let inputFiles = [backgroundLoopPath, audioPath];
  let inputIndex = 2; // Start after background and audio
  
  // Add promo visuals
  const enabledPromos = config.promoSlots.filter(slot => slot.enabled);
  const promoOverlays: string[] = [];
  
  for (let i = 0; i < enabledPromos.length; i++) {
    const slot = enabledPromos[i];
    const visualAsset = slot.visualAssetId 
      ? config.assets.find(a => a.id === slot.visualAssetId)
      : null;
    
    if (visualAsset) {
      inputFiles.push(visualAsset.url);
      const insertTime = slot.time < 0 ? audioDuration + slot.time : slot.time;
      
      // Get promo visual duration
      const { stdout: promoProbe } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${visualAsset.url}"`
      );
      const promoDuration = parseFloat(promoProbe.trim());
      
      promoOverlays.push(
        `[0:v][${inputIndex}:v]overlay=enable='between(t,${insertTime},${insertTime + promoDuration})':x=(W-w)/2:y=(H-h)/2[v${i}]`
      );
      inputIndex++;
    }
  }
  
  // Build complete filter chain
  let videoOutput = '[0:v]';
  if (promoOverlays.length > 0) {
    filterComplex = promoOverlays.join(';');
    videoOutput = `[v${enabledPromos.length - 1}]`;
  }
  
  // Step 3: Mix audio tracks (podcast + promo audio)
  const audioTracks = ['[1:a]']; // Main podcast audio
  
  for (const slot of enabledPromos) {
    const audioAsset = slot.audioAssetId
      ? config.assets.find(a => a.id === slot.audioAssetId)
      : null;
    
    if (audioAsset) {
      inputFiles.push(audioAsset.url);
      const insertTime = slot.time < 0 ? audioDuration + slot.time : slot.time;
      audioTracks.push(`[${inputIndex}:a]adelay=${insertTime * 1000}|${insertTime * 1000}[a${inputIndex}]`);
      inputIndex++;
    }
  }
  
  const audioMix = audioTracks.length > 1
    ? `${audioTracks.join(';')};${audioTracks.map((_, i) => `[a${i}]`).join('')}amix=inputs=${audioTracks.length}:duration=longest[aout]`
    : '';
  
  if (audioMix) {
    filterComplex += (filterComplex ? ';' : '') + audioMix;
  }
  
  // Step 4: Compose main video
  const mainVideoPath = path.join(tempDir, 'main-video.mp4');
  const inputArgs = inputFiles.map(f => `-i "${f}"`).join(' ');
  const filterArg = filterComplex ? `-filter_complex "${filterComplex}"` : '';
  const mapArgs = audioMix ? `-map "${videoOutput}" -map "[aout]"` : `-map 0:v -map 1:a`;
  
  await execAsync(
    `ffmpeg ${inputArgs} ${filterArg} ${mapArgs} -c:v libx264 -preset fast -c:a aac -b:a 192k "${mainVideoPath}"`
  );
  console.log('  ✓ Main video composed');
  
  // Step 5: Add outro with fade effects (if configured)
  if (outroAsset) {
    console.log('  Adding outro with fade...');
    
    // Create fade-in/fade-out outro (1s fade in, 2s hold, 2s fade out = 5s total)
    const outroWithFadePath = path.join(tempDir, 'outro-faded.mp4');
    await execAsync(
      `ffmpeg -i "${outroAsset.url}" -vf "fade=t=in:st=0:d=1,fade=t=out:st=3:d=2" -t 5 -c:v libx264 -c:a aac "${outroWithFadePath}"`
    );
    
    // Concatenate main video + outro
    const concatFile = path.join(tempDir, 'concat.txt');
    await fs.writeFile(concatFile, `file '${mainVideoPath}'\nfile '${outroWithFadePath}'`);
    
    await execAsync(
      `ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`
    );
    console.log('  ✓ Outro added');
  } else {
    // No outro, just copy main video
    await fs.copyFile(mainVideoPath, outputPath);
  }
  
  console.log(`✅ Video composition complete: ${outputPath}`);
}

/**
 * Load video configuration
 */
export async function loadVideoConfig(): Promise<VideoConfig> {
  const configPath = path.join(__dirname, '../website/data/video-config.json');
  
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Return default config
    return {
      assets: [],
      defaultBackground: '',
      defaultOutro: '',
      promoSlots: [
        { time: 240, enabled: true }, // 4:00
        { time: -5, enabled: true }   // 5s before end
      ],
      outputType: 'public'
    };
  }
}

// Test function
async function test() {
  const config = await loadVideoConfig();
  const testAudioPath = process.argv[2] || './test-audio.mp3';
  const outputPath = './test-output.mp4';
  
  await composeVideo(testAudioPath, config, outputPath);
  console.log(`\n🎉 Test complete! Video saved to: ${outputPath}`);
}

if (require.main === module) {
  test().catch(console.error);
}
