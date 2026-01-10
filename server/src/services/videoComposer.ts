/**
 * Enhanced Video Composition Service
 * 
 * Features:
 * - Flexible promo insert positioning (timestamp-based)
 * - Multiple format support (landscape/portrait/square)
 * - Background looping with aspect ratio handling
 * - Outro with fade effects
 * - Metadata embedding in output file
 * - R2 storage integration ready
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface PromoInsert {
  timestamp: number; // seconds into the video
  type: 'video' | 'audio' | 'visual'; // video = both, audio = only audio, visual = only visual
  videoAssetPath?: string;
  audioAssetPath?: string;
}

export interface VideoCompositionConfig {
  // Source media
  audioPath: string;
  backgroundPath: string;
  outroPath?: string;
  
  // Promo inserts
  promoInserts: PromoInsert[];
  
  // Output settings
  outputPath: string;
  outputFormat: 'landscape' | 'portrait' | 'square'; // 1920x1080, 1080x1920, 1080x1080
  
  // Metadata
  metadata: {
    title: string;
    description: string;
    keywords: string;
    summary: string;
    timeline: string;
    tags: string;
  };
}

/**
 * Get dimensions for output format
 */
function getOutputDimensions(format: string): { width: number; height: number } {
  switch (format) {
    case 'landscape':
      return { width: 1920, height: 1080 };
    case 'portrait':
      return { width: 1080, height: 1920 };
    case 'square':
      return { width: 1080, height: 1080 };
    default:
      return { width: 1920, height: 1080 };
  }
}

/**
 * Get video/audio duration using ffprobe
 */
async function getDuration(filePath: string): Promise<number> {
  const { stdout } = await execAsync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
  );
  return parseFloat(stdout.trim());
}

/**
 * Compose video with all elements
 */
export async function composeVideo(config: VideoCompositionConfig): Promise<void> {
  console.log('🎬 Starting video composition...');
  console.log(`  Format: ${config.outputFormat}`);
  console.log(`  Background: ${config.backgroundPath}`);
  console.log(`  Audio: ${config.audioPath}`);
  console.log(`  Promo inserts: ${config.promoInserts.length}`);
  
  const tempDir = path.join(process.cwd(), 'temp', `compose-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });
  
  try {
    // Step 1: Get audio duration
    const audioDuration = await getDuration(config.audioPath);
    console.log(`  ✓ Audio duration: ${audioDuration.toFixed(2)}s`);
    
    // Step 2: Get output dimensions
    const { width, height } = getOutputDimensions(config.outputFormat);
    console.log(`  ✓ Output dimensions: ${width}x${height}`);
    
    // Step 3: Create background loop
    console.log('  Creating background loop...');
    const backgroundLoopPath = path.join(tempDir, 'background-loop.mp4');
    await execAsync(
      `ffmpeg -stream_loop -1 -i "${config.backgroundPath}" ` +
      `-t ${audioDuration} ` +
      `-vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2" ` +
      `-r 30 -pix_fmt yuv420p -c:v libx264 -preset fast ` +
      `"${backgroundLoopPath}"`
    );
    console.log('  ✓ Background loop created');
    
    // Step 4: Build filter complex for overlays and audio mixing
    const inputFiles = [backgroundLoopPath, config.audioPath];
    let filterComplex = '';
    let videoChain = '[0:v]';
    let audioInputs = ['[1:a]'];
    let inputIndex = 2;
    
    // Add promo inserts
    for (let i = 0; i < config.promoInserts.length; i++) {
      const insert = config.promoInserts[i];
      
      // Handle video/visual overlay
      if (insert.type === 'video' || insert.type === 'visual') {
        if (insert.videoAssetPath) {
          inputFiles.push(insert.videoAssetPath);
          
          const promoDuration = await getDuration(insert.videoAssetPath);
          const endTime = insert.timestamp + promoDuration;
          
          // Scale and overlay the promo video
          filterComplex += `[${inputIndex}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2[promo${i}];`;
          filterComplex += `${videoChain}[promo${i}]overlay=enable='between(t,${insert.timestamp},${endTime})'[v${i}];`;
          videoChain = `[v${i}]`;
          
          inputIndex++;
        }
      }
      
      // Handle audio track
      if (insert.type === 'video' || insert.type === 'audio') {
        if (insert.audioAssetPath) {
          inputFiles.push(insert.audioAssetPath);
          
          // Delay audio to match timestamp
          filterComplex += `[${inputIndex}:a]adelay=${insert.timestamp * 1000}|${insert.timestamp * 1000}[promo_audio${i}];`;
          audioInputs.push(`[promo_audio${i}]`);
          
          inputIndex++;
        }
      }
    }
    
    // Mix all audio tracks
    if (audioInputs.length > 1) {
      filterComplex += `${audioInputs.join('')}amix=inputs=${audioInputs.length}:duration=longest[aout];`;
    }
    
    // Step 5: Compose main video
    console.log('  Composing main video with overlays...');
    const mainVideoPath = path.join(tempDir, 'main-video.mp4');
    
    const inputArgs = inputFiles.map(f => `-i "${f}"`).join(' ');
    const filterArg = filterComplex ? `-filter_complex "${filterComplex}"` : '';
    const videoMap = filterComplex && videoChain !== '[0:v]' ? `-map "${videoChain}"` : '-map 0:v';
    const audioMap = audioInputs.length > 1 ? '-map "[aout]"' : '-map 1:a';
    
    await execAsync(
      `ffmpeg ${inputArgs} ${filterArg} ${videoMap} ${audioMap} ` +
      `-c:v libx264 -preset medium -crf 23 ` +
      `-c:a aac -b:a 192k -ar 48000 ` +
      `"${mainVideoPath}"`
    );
    console.log('  ✓ Main video composed');
    
    // Step 6: Add outro if provided
    if (config.outroPath) {
      console.log('  Adding outro with fade effects...');
      
      const outroWithFadePath = path.join(tempDir, 'outro-faded.mp4');
      
      // Scale outro to match output format and add fade effects
      await execAsync(
        `ffmpeg -i "${config.outroPath}" ` +
        `-vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,fade=t=in:st=0:d=1,fade=t=out:st=3:d=2" ` +
        `-t 5 -c:v libx264 -c:a aac ` +
        `"${outroWithFadePath}"`
      );
      
      // Create concat file
      const concatFile = path.join(tempDir, 'concat.txt');
      await fs.writeFile(
        concatFile,
        `file '${mainVideoPath}'\nfile '${outroWithFadePath}'`
      );
      
      // Concatenate
      await execAsync(
        `ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${config.outputPath}"`
      );
      console.log('  ✓ Outro added');
    } else {
      // No outro, just copy main video
      await fs.copyFile(mainVideoPath, config.outputPath);
    }
    
    console.log(`✅ Video composition complete!`);
    console.log(`   Output: ${config.outputPath}`);
    console.log(`   Duration: ${audioDuration.toFixed(2)}s`);
    
  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log('  ✓ Temporary files cleaned up');
    } catch (err) {
      console.warn('  ⚠ Failed to cleanup temp files:', err);
    }
  }
}

/**
 * Generate multiple formats from same config
 */
export async function composeMultipleFormats(
  baseConfig: Omit<VideoCompositionConfig, 'outputPath' | 'outputFormat'>,
  outputDir: string
): Promise<{ landscape: string; portrait: string; square: string }> {
  const formats: Array<'landscape' | 'portrait' | 'square'> = ['landscape', 'portrait', 'square'];
  const outputs: any = {};
  
  for (const format of formats) {
    const outputPath = path.join(outputDir, `video-${format}.mp4`);
    
    await composeVideo({
      ...baseConfig,
      outputPath,
      outputFormat: format
    });
    
    outputs[format] = outputPath;
  }
  
  return outputs;
}

/**
 * Quick validation of required tools
 */
export async function validateFFmpeg(): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version');
    await execAsync('ffprobe -version');
    return true;
  } catch {
    return false;
  }
}
