#!/usr/bin/env python3
"""
Quick test of Gemini TTS API for podcast generation.
This bypasses all the TypeScript complexity.
"""

import os
import json
import wave
import struct
import base64
from pathlib import Path

# API key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def test_gemini_tts():
    """Test the Gemini TTS API with a simple multi-speaker prompt."""
    
    import urllib.request
    import urllib.error
    
    print("🎙️ Testing Gemini Multi-Speaker TTS...")
    
    # Simple test transcript
    transcript = """Alex: Hey Jessica, welcome to AI Deep Dive! Today we're talking about the latest in AI news.
Jessica: Thanks Alex! I'm excited to dive in. What's the big story today?
Alex: Well, Apple just announced they're partnering with Google to bring Gemini to Siri.
Jessica: Wow, that's huge! How do you think that will change the assistant landscape?
Alex: It could be a game-changer. Siri has always been behind, but with Gemini's capabilities...
Jessica: Right, it finally might be competitive. What else is happening?
Alex: Tech CEOs were at Davos this week, and AI was the dominant topic.
Jessica: Not surprising. It seems like everyone wants to talk about AI these days.
Alex: Exactly. That's all for today's quick update!
Jessica: Thanks for listening everyone. See you next time on AI Deep Dive with Alex and Jessica!"""

    # Build the request
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": transcript}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "multiSpeakerVoiceConfig": {
                    "speakerVoiceConfigs": [
                        {
                            "speaker": "Alex",
                            "voiceConfig": {
                                "prebuiltVoiceConfig": {"voiceName": "Kore"}
                            }
                        },
                        {
                            "speaker": "Jessica", 
                            "voiceConfig": {
                                "prebuiltVoiceConfig": {"voiceName": "Puck"}
                            }
                        }
                    ]
                }
            }
        }
    }
    
    print(f"  Sending request to Gemini TTS...")
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            if 'candidates' not in data or not data['candidates']:
                print(f"❌ No candidates in response: {json.dumps(data, indent=2)}")
                return False
            
            # Extract audio
            audio_data = data['candidates'][0]['content']['parts'][0]['inlineData']['data']
            audio_bytes = base64.b64decode(audio_data)
            
            # Save as WAV
            output_dir = Path(__file__).parent / "temp"
            output_dir.mkdir(exist_ok=True)
            wav_path = output_dir / "test-gemini-tts.wav"
            
            # Write WAV file (Gemini outputs 24kHz 16-bit mono PCM)
            with wave.open(str(wav_path), 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)
                wav_file.setframerate(24000)
                wav_file.writeframes(audio_bytes)
            
            print(f"✅ Audio saved to: {wav_path}")
            print(f"   Size: {len(audio_bytes) / 1024:.1f} KB")
            print(f"   Duration: ~{len(audio_bytes) / (24000 * 2):.1f} seconds")
            print(f"\n🎉 SUCCESS! Play the file to hear NotebookLM-quality audio!")
            return True
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"❌ HTTP Error {e.code}: {error_body}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_gemini_tts()
