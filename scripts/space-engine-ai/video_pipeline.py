"""
Video Pipeline

Post-processing for Space Engine recordings:
- Format conversion
- Looping/extending
- Audio merging
- Quality optimization
"""

import subprocess
import shutil
from pathlib import Path
from typing import Optional

from config import OUTPUT_DIR, DEFAULT_CRF, DEFAULT_CODEC


class VideoProcessor:
    """Post-process Space Engine recordings"""
    
    def __init__(self):
        self.ffmpeg = shutil.which('ffmpeg')
        if not self.ffmpeg:
            print("Warning: FFmpeg not found in PATH")
    
    def process(self, input_path: Path, output_path: Path, 
                audio_path: Optional[Path] = None) -> Path:
        """Full processing pipeline"""
        
        if not input_path.exists():
            raise FileNotFoundError(f"Input video not found: {input_path}")
        
        # Step 1: Optimize video
        optimized = self._optimize(input_path)
        
        # Step 2: Add audio if provided
        if audio_path and audio_path.exists():
            optimized = self._merge_audio(optimized, audio_path)
        
        # Step 3: Move to final location
        shutil.move(str(optimized), str(output_path))
        
        return output_path
    
    def _optimize(self, input_path: Path) -> Path:
        """Optimize video for YouTube"""
        output = OUTPUT_DIR / f"optimized_{input_path.name}"
        
        cmd = [
            self.ffmpeg,
            '-i', str(input_path),
            '-c:v', DEFAULT_CODEC,
            '-crf', str(DEFAULT_CRF),
            '-preset', 'slow',
            '-profile:v', 'high',
            '-level', '4.1',
            '-movflags', '+faststart',  # Web optimization
            '-y',
            str(output)
        ]
        
        print(f"Optimizing video: {input_path.name}")
        subprocess.run(cmd, check=True)
        
        return output
    
    def _merge_audio(self, video_path: Path, audio_path: Path) -> Path:
        """Merge audio track with video"""
        output = OUTPUT_DIR / f"merged_{video_path.name}"
        
        cmd = [
            self.ffmpeg,
            '-i', str(video_path),
            '-i', str(audio_path),
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-map', '0:v:0',
            '-map', '1:a:0',
            '-shortest',
            '-y',
            str(output)
        ]
        
        print(f"Merging audio: {audio_path.name}")
        subprocess.run(cmd, check=True)
        
        # Clean up intermediate
        video_path.unlink()
        
        return output
    
    def loop_video(self, input_path: Path, target_duration: int, 
                   output_path: Optional[Path] = None) -> Path:
        """Loop video to reach target duration (in seconds)"""
        
        if not output_path:
            output_path = OUTPUT_DIR / f"looped_{input_path.name}"
        
        # Get input duration
        duration = self._get_duration(input_path)
        loops_needed = int(target_duration / duration) + 1
        
        print(f"Looping {input_path.name} {loops_needed}x to reach {target_duration}s")
        
        # Create concat file
        concat_file = OUTPUT_DIR / "concat_list.txt"
        with open(concat_file, 'w') as f:
            for _ in range(loops_needed):
                f.write(f"file '{input_path.absolute()}'\n")
        
        # Concat and trim
        cmd = [
            self.ffmpeg,
            '-f', 'concat',
            '-safe', '0',
            '-i', str(concat_file),
            '-t', str(target_duration),
            '-c', 'copy',
            '-y',
            str(output_path)
        ]
        
        subprocess.run(cmd, check=True)
        concat_file.unlink()
        
        return output_path
    
    def crossfade_loop(self, input_path: Path, target_duration: int,
                       fade_duration: float = 2.0) -> Path:
        """Create seamless loop with crossfade transitions"""
        
        output_path = OUTPUT_DIR / f"seamless_{input_path.name}"
        duration = self._get_duration(input_path)
        
        print(f"Creating seamless loop with {fade_duration}s crossfades")
        
        # Complex filter for crossfade
        # This creates a seamless loop by crossfading end to beginning
        
        filter_complex = f"""
        [0:v]split[main][fade];
        [fade]trim=start={duration - fade_duration},setpts=PTS-STARTPTS[fadeout];
        [main]trim=end={fade_duration},setpts=PTS-STARTPTS[fadein];
        [fadeout][fadein]xfade=transition=fade:duration={fade_duration}:offset=0[seamless];
        [0:v][seamless]concat=n=2:v=1[out]
        """
        
        cmd = [
            self.ffmpeg,
            '-stream_loop', str(int(target_duration / duration)),
            '-i', str(input_path),
            '-filter_complex', filter_complex.strip(),
            '-map', '[out]',
            '-t', str(target_duration),
            '-y',
            str(output_path)
        ]
        
        subprocess.run(cmd, check=True)
        
        return output_path
    
    def _get_duration(self, video_path: Path) -> float:
        """Get video duration in seconds"""
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            str(video_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    
    def add_thumbnail(self, video_path: Path, timestamp: float = 0) -> Path:
        """Extract thumbnail from video"""
        thumbnail_path = video_path.with_suffix('.jpg')
        
        cmd = [
            self.ffmpeg,
            '-i', str(video_path),
            '-ss', str(timestamp),
            '-vframes', '1',
            '-y',
            str(thumbnail_path)
        ]
        
        subprocess.run(cmd, check=True)
        return thumbnail_path


if __name__ == "__main__":
    processor = VideoProcessor()
    print(f"FFmpeg found: {processor.ffmpeg}")
    
    # Test with a sample if it exists
    sample = OUTPUT_DIR / "sample.mp4"
    if sample.exists():
        duration = processor._get_duration(sample)
        print(f"Sample duration: {duration}s")
