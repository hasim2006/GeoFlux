# generate_audio.py - Generates the complete 22-second audio track (stems, music, and SFX)

import math
import struct
import wave

SAMPLE_RATE = 44100
DURATION = 22.0
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)

def generate_spec_audio(output_wav="spec_audio.wav"):
    print(f"Generating 22-second master audio track ({output_wav})...")
    samples = [0.0] * TOTAL_SAMPLES

    def add_tone(freq, start_sec, dur_sec, vol=0.2, wave_type='sine'):
        start_idx = int(start_sec * SAMPLE_RATE)
        num_s = int(dur_sec * SAMPLE_RATE)
        for i in range(num_s):
            idx = start_idx + i
            if idx >= TOTAL_SAMPLES:
                break
            t = i / SAMPLE_RATE
            env = math.exp(-3.0 * (t / dur_sec)) # exponential decay
            if wave_type == 'sine':
                val = math.sin(2.0 * math.pi * freq * t)
            elif wave_type == 'triangle':
                val = 2.0 * abs(2.0 * (t * freq - math.floor(t * freq + 0.5))) - 1.0
            samples[idx] += val * env * vol

    # 1. 0.0s: Logo Tick (crisp pop at 880Hz -> 1760Hz)
    add_tone(1320, 0.05, 0.12, 0.35)

    # 2. 1.1s: Navigation Whoosh & Chime (C6 1046Hz, E6 1318Hz)
    add_tone(1046.5, 1.10, 0.5, 0.3)
    add_tone(1318.5, 1.25, 0.6, 0.3)

    # 3. 3.1s: Bicycle Freewheel & Bell (C7 2093Hz, E7 2637Hz)
    for c in range(5):
        add_tone(1800, 3.10 + c * 0.05, 0.02, 0.15)
    add_tone(2093, 3.35, 0.6, 0.4)
    add_tone(2637, 3.52, 0.7, 0.4)

    # 4. 8.8s: Galerie Vivienne Warm Arcade Harmonics (Fmaj9: 349Hz, 440Hz, 523Hz, 659Hz)
    for f in [349.2, 440.0, 523.2, 659.2]:
        add_tone(f, 8.80, 1.8, 0.12)

    # 5. 10.7s: Meet Friends Notification Ping (D5 587Hz -> A5 880Hz)
    add_tone(587.3, 10.70, 0.35, 0.35)
    add_tone(880.0, 10.82, 0.45, 0.35)

    # 6. 13.3s: Golden Hour Sunset Lift Chords (Gmaj9: 392Hz, 493Hz, 587Hz, 740Hz)
    for f in [392.0, 493.8, 587.3, 740.0]:
        add_tone(f, 13.30, 2.5, 0.15)

    # 7. 16.7s: Destination Arrival Double Chime (C5 -> E5 -> G5 -> C6)
    add_tone(523.2, 16.70, 0.6, 0.4)
    add_tone(659.2, 16.82, 0.6, 0.4)
    add_tone(783.9, 16.94, 0.7, 0.45)
    add_tone(1046.5, 17.08, 0.8, 0.5)

    # 8. 18.8s: Brand Lock-Up Signature Harmonic Chord (Cmaj9 warm swell)
    for f in [130.8, 261.6, 329.6, 392.0, 493.8, 587.3]:
        add_tone(f, 18.80, 2.8, 0.18)

    # 9. Steady 118 BPM electronic forward rhythm track (1.1s to 18.5s)
    bpm = 118
    beat_dur = 60.0 / bpm / 2
    step = 0
    scale = [110.0, 123.4, 130.8, 146.8, 164.8, 174.6, 196.0]
    curr_t = 1.10
    while curr_t < 18.5:
        pitch = scale[step % len(scale)]
        add_tone(pitch, curr_t, 0.18, 0.18, wave_type='triangle')
        step += 1
        curr_t += beat_dur

    # Normalize audio to prevent clipping (-1 dBTP)
    max_val = max(abs(s) for s in samples) or 1.0
    scale_factor = 0.88 / max_val

    # Write 16-bit PCM WAV file
    with wave.open(output_wav, "wb") as wf:
        wf.setnchannels(2) # Stereo
        wf.setsampwidth(2) # 16-bit
        wf.setframerate(SAMPLE_RATE)
        raw_bytes = bytearray()
        for s in samples:
            val = int(max(-32767, min(32767, s * scale_factor * 32767)))
            packed = struct.pack("<hh", val, val) # Left and Right channel
            raw_bytes.extend(packed)
        wf.writeframes(raw_bytes)

    print(f"Master audio successfully generated: {output_wav}")

if __name__ == "__main__":
    generate_spec_audio()

