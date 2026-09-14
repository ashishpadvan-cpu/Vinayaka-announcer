#!/usr/bin/env python3
"""
Vinayaka Chavithi Donation Announcement Server
Provides Edge Neural Telugu TTS (te-IN-MohanNeural & te-IN-ShrutiNeural),
donation persistence, and mobile static web hosting for Android.
"""

import os
import sys
import json
import hashlib
import asyncio
import socket
import mimetypes
from urllib.parse import urlparse, parse_qs
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import time
import edge_tts

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
DATA_DIR = os.path.join(BASE_DIR, "data")
CACHE_DIR = os.path.join(BASE_DIR, "audio_cache")
DONATIONS_FILE = os.path.join(DATA_DIR, "donations.json")

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

def merge_donations(existing_list, incoming_list, deleted_ids=None):
    """Smart conflict-free merge of donations from multiple mobile devices."""
    if deleted_ids is None:
        del_set = set()
    else:
        del_set = set(deleted_ids)

    merged = {}
    for d in (existing_list or []):
        d_id = d.get("id")
        if d_id and d_id not in del_set:
            merged[d_id] = d

    for d in (incoming_list or []):
        d_id = d.get("id")
        if not d_id or d_id in del_set:
            continue
        if d_id not in merged:
            merged[d_id] = d
        else:
            existing = merged[d_id]
            incoming_time = d.get("updatedAt") or d.get("createdAt") or ""
            existing_time = existing.get("updatedAt") or existing.get("createdAt") or ""
            if incoming_time >= existing_time:
                merged[d_id] = d
            else:
                if "isRead" in d:
                    merged[d_id]["isRead"] = d["isRead"]

    # Sort newest first
    return sorted(merged.values(), key=lambda x: x.get("createdAt", ""), reverse=True)

# Ensure sample donations exist
if not os.path.exists(DONATIONS_FILE):
    with open(DONATIONS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

def get_local_ip():
    """Detect LAN IP address to allow Android phones on the same Wi-Fi to connect."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Does not actually connect, just resolves local routing interface
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

async def generate_tts(text: str, voice: str, rate: str, pitch: str, output_path: str):
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(output_path)

class AnnouncerRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS for Android WebViews and cross-origin mobile clients
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Range')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_HEAD(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/audio/"):
            filename = os.path.basename(path)
            file_path = os.path.join(CACHE_DIR, filename)
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(file_size))
                self.send_header('Accept-Ranges', 'bytes')
                self.end_headers()
                return
        return super().do_HEAD()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/network-info":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            local_ip = get_local_ip()
            info = {
                "ip": local_ip,
                "port": PORT,
                "url": f"http://{local_ip}:{PORT}",
                "localUrl": f"http://localhost:{PORT}"
            }
            self.wfile.write(json.dumps(info).encode('utf-8'))
            return

        elif path == "/api/voices":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            voices = [
                {
                    "id": "te-IN-MohanNeural",
                    "name": "మోహన్ (Mohan)",
                    "gender": "Male",
                    "label": "పురుష స్వరం (గంభీరమైన మైక్ ధ్వని)",
                    "default": True
                },
                {
                    "id": "te-IN-ShrutiNeural",
                    "name": "శృతి (Shruti)",
                    "gender": "Female",
                    "label": "స్త్రీ స్వరం (మధురమైన భక్తి భావం)",
                    "default": False
                }
            ]
            self.wfile.write(json.dumps(voices, ensure_ascii=False).encode('utf-8'))
            return

        elif path == "/api/donations":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                with open(DONATIONS_FILE, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.wfile.write(content.encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps([]).encode('utf-8'))
            return

        elif path.startswith("/api/audio/"):
            filename = os.path.basename(path)
            file_path = os.path.join(CACHE_DIR, filename)
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(file_size))
                self.send_header('Accept-Ranges', 'bytes')
                self.end_headers()
                with open(file_path, 'rb') as f:
                    while chunk := f.read(65536):
                        self.wfile.write(chunk)
                return
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"Audio file not found")
                return

        # Default fallback to static files in public/
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else "{}"

        if path == "/api/tts":
            try:
                data = json.loads(body)
                text = data.get("text", "").strip()
                voice = data.get("voice", "te-IN-MohanNeural")
                rate = data.get("rate", "+0%")
                pitch = data.get("pitch", "+0Hz")

                if not text:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Empty text"}).encode('utf-8'))
                    return

                # Create unique hash for caching
                hash_key = f"{text}_{voice}_{rate}_{pitch}"
                file_hash = hashlib.md5(hash_key.encode('utf-8')).hexdigest()
                filename = f"{file_hash}.mp3"
                file_path = os.path.join(CACHE_DIR, filename)

                if not os.path.exists(file_path):
                    # Generate TTS audio with edge-tts asynchronously
                    asyncio.run(generate_tts(text, voice, rate, pitch, file_path))
                    cached = False
                else:
                    cached = True

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                res = {
                    "status": "success",
                    "audioUrl": f"/api/audio/{filename}",
                    "cached": cached,
                    "text": text,
                    "voice": voice
                }
                self.wfile.write(json.dumps(res, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif path == "/api/donations/sync":
            try:
                payload = json.loads(body) if body else {}
                incoming_donations = payload.get("donations", []) if isinstance(payload, dict) else payload
                deleted_ids = payload.get("deletedIds", []) if isinstance(payload, dict) else []

                server_donations = []
                if os.path.exists(DONATIONS_FILE):
                    try:
                        with open(DONATIONS_FILE, 'r', encoding='utf-8') as f:
                            server_donations = json.load(f)
                    except Exception:
                        server_donations = []

                merged = merge_donations(server_donations, incoming_donations, deleted_ids)
                with open(DONATIONS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(merged, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                res = {
                    "status": "synced",
                    "count": len(merged),
                    "donations": merged,
                    "serverTime": int(time.time() * 1000)
                }
                self.wfile.write(json.dumps(res, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif path == "/api/donations":
            try:
                incoming_donations = json.loads(body) if body else []
                server_donations = []
                if os.path.exists(DONATIONS_FILE):
                    try:
                        with open(DONATIONS_FILE, 'r', encoding='utf-8') as f:
                            server_donations = json.load(f)
                    except Exception:
                        server_donations = []

                # Smart merge rather than overwrite
                merged = merge_donations(server_donations, incoming_donations)
                with open(DONATIONS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(merged, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "saved", "count": len(merged), "donations": merged}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

def run_server():
    server_address = ('0.0.0.0', PORT)
    httpd = ThreadingHTTPServer(server_address, AnnouncerRequestHandler)
    local_ip = get_local_ip()
    print("=" * 60)
    print("🕉️  శ్రీ వినాయక చవితి చందా & విరాళాల మైక్ అనౌన్స్‌మెంట్ యాప్")
    print("=" * 60)
    print(f"👉 Local Web Access:    http://localhost:{PORT}")
    print(f"📱 Android Phone Access: http://{local_ip}:{PORT}")
    print(f"🎙️  Telugu Voice Engine: Microsoft Edge Neural TTS")
    print(f"    - Mohan (మోహన్):  te-IN-MohanNeural (Male)")
    print(f"    - Shruti (శృతి):  te-IN-ShrutiNeural (Female)")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
