#!/usr/bin/env python3
"""
Space Engine AI Interface - Main CLI Entry Point

Generate cinematic space videos from natural language prompts or templates.

Usage:
    python main.py --template black_hole --duration 600
    python main.py --prompt "Slow approach to a black hole with orange accretion disk"
    python main.py --batch scenes.json
"""

import click
from pathlib import Path
from rich.console import Console
from rich.panel import Panel

from config import OUTPUT_DIR, TEMPLATES_DIR
from ai_composer import AIComposer
from gui_automation import SpaceEngineController
from video_pipeline import VideoProcessor

console = Console()


@click.group()
def cli():
    """Space Engine AI Interface - Automated space video generation"""
    pass


@cli.command()
@click.option('--template', '-t', type=click.Choice(['black_hole', 'asteroid_belt', 'galaxy_collision']),
              help='Use a pre-built template')
@click.option('--prompt', '-p', type=str, help='Natural language description')
@click.option('--duration', '-d', type=int, default=600, help='Video duration in seconds (default: 600)')
@click.option('--output', '-o', type=str, help='Output filename')
@click.option('--resolution', '-r', type=click.Choice(['1080p', '1440p', '4k', '5k', '8k']), 
              default='4k', help='Video resolution preset (default: 4k)')
@click.option('--preview', is_flag=True, help='Preview settings without rendering')
def generate(template, prompt, duration, output, resolution, preview):
    """Generate a space video from template or prompt"""
    
    from config import RESOLUTION_PRESETS, VRAM_REQUIREMENTS
    
    console.print(Panel.fit("🚀 Space Engine AI Interface", style="bold blue"))
    
    if not template and not prompt:
        console.print("[red]Error: Must specify --template or --prompt[/red]")
        return
    
    # Get resolution dimensions
    width, height = RESOLUTION_PRESETS.get(resolution, (3840, 2160))
    resolution_str = f"{width}x{height}"
    vram_needed = VRAM_REQUIREMENTS.get(resolution, '8GB')
    
    if resolution in ['8k', '5k']:
        console.print(f"[yellow]⚠️  {resolution.upper()} requires {vram_needed} VRAM. Render will be slow.[/yellow]")
    
    # Initialize components
    composer = AIComposer()
    controller = SpaceEngineController()
    processor = VideoProcessor()
    
    # Generate SE Script
    if template:
        console.print(f"[cyan]Using template:[/cyan] {template}")
        script_path = TEMPLATES_DIR / f"{template}.se"
        if not script_path.exists():
            console.print(f"[yellow]Template not found, generating from AI...[/yellow]")
            script_content = composer.from_template(template, duration=duration)
            script_path.write_text(script_content)
    else:
        console.print(f"[cyan]Generating from prompt:[/cyan] {prompt}")
        script_content = composer.from_prompt(prompt, duration=duration)
        script_path = TEMPLATES_DIR / "custom_scene.se"
        script_path.write_text(script_content)
    
    # Set output filename
    if not output:
        output = f"{template or 'custom'}_{resolution}_{duration}s.mp4"
    output_path = OUTPUT_DIR / output
    
    # Show preview
    console.print("\n[bold]Scene Configuration:[/bold]")
    console.print(f"  Script: {script_path}")
    console.print(f"  Duration: {duration}s ({duration // 60} min)")
    console.print(f"  Resolution: {resolution.upper()} ({resolution_str})")
    console.print(f"  VRAM Required: {vram_needed}")
    console.print(f"  Output: {output_path}")
    
    if preview:
        console.print("\n[yellow]Preview mode - no rendering[/yellow]")
        return
    
    # Execute pipeline
    console.print("\n[bold green]Starting render pipeline...[/bold green]")
    
    try:
        # Step 1: Launch Space Engine and load script
        console.print("[dim]1/4 Launching Space Engine...[/dim]")
        controller.launch()
        
        # Step 2: Load script and configure
        console.print("[dim]2/4 Loading script...[/dim]")
        controller.load_script(script_path)
        controller.configure_recording(resolution, duration)
        
        # Step 3: Record
        console.print("[dim]3/4 Recording (this takes real-time)...[/dim]")
        raw_video = controller.start_recording(duration)
        
        # Step 4: Post-process
        console.print("[dim]4/4 Post-processing...[/dim]")
        processor.process(raw_video, output_path)
        
        console.print(f"\n[bold green]✓ Complete![/bold green] Output: {output_path}")
        
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise


@cli.command()
@click.argument('scenes_file', type=click.Path(exists=True))
def batch(scenes_file):
    """Process multiple scenes from a JSON file"""
    import json
    
    console.print(Panel.fit("🎬 Batch Processing", style="bold blue"))
    
    with open(scenes_file) as f:
        scenes = json.load(f)
    
    console.print(f"Found {len(scenes)} scenes to process")
    
    for i, scene in enumerate(scenes, 1):
        console.print(f"\n[cyan]Scene {i}/{len(scenes)}:[/cyan] {scene.get('name', 'Unnamed')}")
        # Process each scene...
        # TODO: Implement batch processing


@cli.command()
def templates():
    """List available templates"""
    console.print(Panel.fit("📁 Available Templates", style="bold blue"))
    
    template_info = {
        'black_hole': 'Interstellar-style black hole with accretion disk and gravitational lensing',
        'asteroid_belt': 'POV drift through asteroid field with tumbling rocks',
        'galaxy_collision': 'Two spiral galaxies merging in slow motion',
    }
    
    for name, desc in template_info.items():
        path = TEMPLATES_DIR / f"{name}.se"
        status = "✓" if path.exists() else "○"
        console.print(f"  {status} [bold]{name}[/bold]")
        console.print(f"    {desc}")


@cli.command()
def status():
    """Check Space Engine installation and dependencies"""
    from config import SPACE_ENGINE_PATH
    import shutil
    
    console.print(Panel.fit("🔧 System Status", style="bold blue"))
    
    # Check Space Engine
    se_exists = Path(SPACE_ENGINE_PATH).exists()
    console.print(f"  Space Engine: {'✓' if se_exists else '✗'} {SPACE_ENGINE_PATH}")
    
    # Check FFmpeg
    ffmpeg_exists = shutil.which('ffmpeg') is not None
    console.print(f"  FFmpeg: {'✓' if ffmpeg_exists else '✗'}")
    
    # Check API keys
    from config import OPENAI_API_KEY, ANTHROPIC_API_KEY
    console.print(f"  OpenAI API: {'✓' if OPENAI_API_KEY else '✗'}")
    console.print(f"  Anthropic API: {'✓' if ANTHROPIC_API_KEY else '✗'}")


if __name__ == '__main__':
    cli()
