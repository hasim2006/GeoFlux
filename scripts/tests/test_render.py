import time
import socketserver
import http.server
import threading
from playwright.sync_api import sync_playwright

PORT = 8089

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def test():
    server = socketserver.TCPServer(("127.0.0.1", PORT), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()

    console_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        url = f"http://127.0.0.1:{PORT}/index.html"
        print(f"Navigating to {url}...")
        page.goto(url, wait_until="networkidle")

        # Check if app is initialized
        page.wait_for_function("typeof window.seekTimeline === 'function'", timeout=10000)
        print("window.seekTimeline initialized!")

        # Test seeking across key beats
        beats_to_test = [0.0, 1.5, 3.5, 6.0, 9.5, 12.0, 15.0, 17.5, 19.5, 21.0]
        for t in beats_to_test:
            page.evaluate(f"window.seekTimeline({t})")
            time.sleep(0.1)
            print(f"Seeked to {t}s successfully.")

        # Take a snapshot at Golden Hour (15.0s)
        page.screenshot(path="screenshot_golden_hour.png")
        print("Screenshot saved to screenshot_golden_hour.png")

        browser.close()
    server.shutdown()

    if console_errors:
        print("Page Errors detected:", console_errors)
        return False
    else:
        print("All tests passed with ZERO page errors!")
        return True

if __name__ == "__main__":
    test()

