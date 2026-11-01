# render_video.py - Headless 60 FPS frame-by-frame renderer using Playwright, Three.js, and ffmpeg

import os
import sys
import time
import subprocess
import threading
import http.server
import socketserver
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

# Ensure scripts dir is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

PORT = 8092
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DURATION = 22.0  # 22.00 seconds
FPS = 60
TOTAL_FRAMES = int(DURATION * FPS) # 1320 frames
WIDTH = 1920
HEIGHT = 1080
OUTPUT_MP4 = os.path.join(ROOT_DIR, "Google_Maps_Go_Like_You_Live_Here_1080p60.mp4")
AUDIO_WAV = os.path.join(ROOT_DIR, "spec_audio.wav")

class SilentHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)
    def log_message(self, format, *args):
        pass

def start_http_server():
    server = socketserver.TCPServer(("127.0.0.1", PORT), SilentHandler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    return server

def main():
    print("=" * 60)
    print(" Google Maps Spec Ad: 'Go like you live here.'")
    print(" 22s / 16:9 Master / Real-time 3D / 60 FPS Export Pipeline")
    print("=" * 60)

    # 1. Ensure master audio is generated
    if not os.path.exists(AUDIO_WAV):
        print(f"Generating audio track {AUDIO_WAV}...")
        import generate_audio
        generate_audio.generate_spec_audio(AUDIO_WAV)

    # 2. Start local HTTP server
    server = start_http_server()
    print(f"Local server started at http://127.0.0.1:{PORT}")

    ffmpeg_bin = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"Using ffmpeg at: {ffmpeg_bin}")

    # 3. Configure ffmpeg pipe process
    ffmpeg_cmd = [
        ffmpeg_bin,
        "-y",
        "-f", "image2pipe",
        "-vcodec", "png",
        "-r", str(FPS),
        "-i", "-",
        "-i", AUDIO_WAV,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "veryfast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "256k",
        "-shortest",
        OUTPUT_MP4
    ]

    ffmpeg_proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

    # 4. Launch Playwright Chromium
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            viewport={"width": WIDTH, "height": HEIGHT},
            device_scale_factor=1
        )

        url = f"http://127.0.0.1:{PORT}/index.html"
        print(f"Loading {url}...")
        page.goto(url, wait_until="networkidle")

        # Wait for app ready
        page.wait_for_function("typeof window.seekTimeline === 'function'", timeout=15000)
        time.sleep(1.0) # allow textures & shaders to settle

        print(f"Rendering {TOTAL_FRAMES} frames ({DURATION}s @ {FPS}fps) to {OUTPUT_MP4}...")
        start_time = time.time()

        # Step frame by frame
        for frame_idx in range(TOTAL_FRAMES):
            t = frame_idx / FPS
            page.evaluate(f"window.seekTimeline({t})")

            # Capture viewport screenshot buffer
            screenshot_bytes = page.screenshot(type="png")
            ffmpeg_proc.stdin.write(screenshot_bytes)

            if (frame_idx + 1) % 60 == 0 or frame_idx == TOTAL_FRAMES - 1:
                elapsed = time.time() - start_time
                pct = (frame_idx + 1) / TOTAL_FRAMES * 100
                fps_render = (frame_idx + 1) / (elapsed + 0.001)
                rem_sec = (TOTAL_FRAMES - frame_idx - 1) / (fps_render + 0.001)
                print(f"  Frame {frame_idx + 1:4d}/{TOTAL_FRAMES} [{pct:5.1f}%] - {t:4.2f}s - {fps_render:4.1f} fps - Est. {rem_sec:4.1f}s left")

        browser.close()

    ffmpeg_proc.stdin.close()
    ffmpeg_proc.wait()
    server.shutdown()

    print("=" * 60)
    print(f"SUCCESS! Master Video Exported: {OUTPUT_MP4}")
    if os.path.exists(OUTPUT_MP4):
        size_mb = os.path.getsize(OUTPUT_MP4) / (1024 * 1024)
        print(f"File Size: {size_mb:.2f} MB")
    print("=" * 60)

if __name__ == "__main__":
    main()
