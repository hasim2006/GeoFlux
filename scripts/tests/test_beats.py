import os
import time
import socketserver
import http.server
import threading
from playwright.sync_api import sync_playwright

PORT = 8090
os.makedirs("preview", exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def capture_beats():
    server = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()

    beats = [
        ("01_logo_reveal", 0.5),
        ("02_navigation_dive", 2.2),
        ("03_get_a_bike", 4.2),
        ("04_rain_ahead", 6.8),
        ("05_galerie_vivienne", 9.8),
        ("06_meet_friends", 11.8),
        ("07_golden_hour", 15.2),
        ("08_arrival_reveal", 17.6),
        ("09_brand_lockup", 19.5),
        ("10_end_card", 21.2)
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})

        page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
        page.wait_for_function("typeof window.seekTimeline === 'function'")
        time.sleep(1.0)

        for name, t in beats:
            page.evaluate(f"window.seekTimeline({t})")
            time.sleep(0.3)
            out_path = f"preview/{name}.png"
            page.screenshot(path=out_path)
            print(f"Captured beat {name} at {t}s -> {out_path}")

        browser.close()
    server.shutdown()
    print("All beat previews captured!")

if __name__ == "__main__":
    capture_beats()

