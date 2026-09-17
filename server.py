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
import base64
import subprocess
import shutil
import time
import requests
import edge_tts

# Resilient DNS fallback for Edge-TTS when local Wi-Fi router DNS fails
_ORIG_GETADDRINFO = socket.getaddrinfo
def _resilient_getaddrinfo(host, port, *args, **kwargs):
    try:
        return _ORIG_GETADDRINFO(host, port, *args, **kwargs)
    except socket.gaierror:
        if isinstance(host, str) and ('bing.com' in host or 'msedge.net' in host):
            return _ORIG_GETADDRINFO('150.171.27.10', port, *args, **kwargs)
        raise

socket.getaddrinfo = _resilient_getaddrinfo

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
DATA_DIR = os.path.join(BASE_DIR, "data")
CACHE_DIR = os.path.join(BASE_DIR, "audio_cache")
CELEBRITIES_DIR = os.path.join(PUBLIC_DIR, "audio", "celebrities")
DEFAULT_CELEBRITIES_DIR = os.path.join(DATA_DIR, "default_celebrities")
DONATIONS_FILE = os.path.join(DATA_DIR, "donations.json")
CONFIG_FILE = os.path.join(DATA_DIR, "config.json")
CLONED_VOICES_FILE = os.path.join(DATA_DIR, "cloned_voices.json")

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(CELEBRITIES_DIR, exist_ok=True)
os.makedirs(DEFAULT_CELEBRITIES_DIR, exist_ok=True)

def get_elevenlabs_api_key():
    env_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if env_key:
        return env_key
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                return cfg.get("elevenlabs_api_key", "").strip()
        except Exception:
            pass
    return ""

def set_elevenlabs_api_key(key):
    cfg = {}
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg = json.load(f)
        except Exception:
            cfg = {}
    cfg["elevenlabs_api_key"] = key.strip()
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)

def get_cloned_voices():
    if os.path.exists(CLONED_VOICES_FILE):
        try:
            with open(CLONED_VOICES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_cloned_voice(celeb_id, voice_id, name=""):
    voices = get_cloned_voices()
    voices[celeb_id] = {
        "voice_id": voice_id,
        "name": name,
        "updated_at": int(time.time())
    }
    with open(CLONED_VOICES_FILE, "w", encoding="utf-8") as f:
        json.dump(voices, f, indent=2, ensure_ascii=False)

def delete_cloned_voice(celeb_id):
    voices = get_cloned_voices()
    if celeb_id in voices:
        del voices[celeb_id]
        with open(CLONED_VOICES_FILE, "w", encoding="utf-8") as f:
            json.dump(voices, f, indent=2, ensure_ascii=False)
        return True
    return False

def check_elevenlabs_subscription(api_key):
    headers = {"xi-api-key": api_key}
    res = requests.get("https://api.elevenlabs.io/v1/user/subscription", headers=headers, timeout=12)
    if res.status_code != 200:
        err_msg = "Invalid ElevenLabs API Key"
        try:
            err_msg = res.json().get("detail", {}).get("message", res.text)
        except Exception:
            pass
        raise ValueError(err_msg)
    return res.json()

def clone_voice_with_elevenlabs(name, audio_bytes, filename="sample.mp3", api_key=None):
    if not api_key:
        api_key = get_elevenlabs_api_key()
    if not api_key:
        raise ValueError("ElevenLabs API Key not configured")

    url = "https://api.elevenlabs.io/v1/voices/add"
    headers = {"xi-api-key": api_key}
    files = [("files", (filename, audio_bytes, "audio/mpeg"))]
    data = {
        "name": name,
        "description": f"Cloned celebrity voice for Vinayaka Announcer"
    }
    res = requests.post(url, headers=headers, data=data, files=files, timeout=45)
    if res.status_code != 200:
        err_msg = "Failed to clone voice"
        try:
            raw_json = res.json()
            err_msg = raw_json.get("detail", {}).get("message", res.text)
        except Exception:
            err_msg = res.text

        if "instant voice cloning" in err_msg.lower() or "paid_plan_required" in err_msg.lower() or "can_not_use_instant_voice_cloning" in str(res.text):
            err_msg = "ElevenLabs ఉచిత (Free) ఖాతాలో మీ స్వంత MP3 నుండి వాయిస్ క్లోన్ చేయడానికి వారి 'Starter Plan' ($1) అవసరం. elevenlabs.io లో పైన కుడివైపున ఉన్న 'Upgrade' ($1) నొక్కండి. లేదా ఉచితంగా అందుబాటులో ఉన్న ElevenLabs AI వాయిస్ ఎంచుకోండి."
        raise RuntimeError(err_msg)
    
    return res.json().get("voice_id")

def generate_elevenlabs_tts(text: str, voice_id: str, output_path: str, api_key: str):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.85,
            "style": 0.35,
            "use_speaker_boost": True
        }
    }
    res = requests.post(url, headers=headers, json=payload, timeout=45)
    if res.status_code != 200:
        err_msg = "TTS generation failed"
        try:
            err_msg = res.json().get("detail", {}).get("message", res.text)
        except Exception:
            err_msg = res.text
        raise RuntimeError(f"ElevenLabs TTS Error ({res.status_code}): {err_msg}")

    with open(output_path, "wb") as f:
        f.write(res.content)

ELEVENLABS_FREE_PRESET_VOICES = {
    "balayya": "SOYHLrjzK2X1ezoPC6cr",      # Harry (Fierce Warrior)
    "baahubali": "JBFqnCBsd6RMkjVDRZzb",    # George (Regal Deep Narrator)
    "pawankalyan": "IKne3meq5aSn9XLyUdCD",  # Charlie (Energetic Punch)
    "chiranjeevi": "CwhRBWXzGAHq8TQ4Fs17",  # Roger (Resonant Baritone)
    "brahmanandam": "N2lVS1w4EtoT3dr4eOWO", # Callum (Animated)
}

CELEBRITY_PROFILES = [
    {
        "id": "balayya",
        "name": "నందమూరి బాలకృష్ణ (Balayya)",
        "badge": "🦁 బాలయ్య మాస్ డైలాగ్",
        "dialogue": "జై బాలయ్య! దెబ్బకు దయ్యం వదలాలి... మైక్ మోత మోగిపోవాలి! ఫ్లూట్ జింక ముందు ఊదు... సింహం ముందు కాదు! జై బాలయ్య!",
        "filename": "balayya.mp3"
    },
    {
        "id": "baahubali",
        "name": "బాహుబలి ప్రభాస్ (Prabhas)",
        "badge": "👑 బాహుబలి రాయల్ స్టైల్",
        "dialogue": "శ్రీ వినాయక మహారాజ్ దివ్య సమక్షంలో... అమరేంద్ర బాహుబలి అను నేను... స్వామివారి భక్తులకు సర్వదా శుభం కలగాలని ఆకాంక్షిస్తున్నాను! జై గణపతి దేవా!",
        "filename": "baahubali.mp3"
    },
    {
        "id": "pawankalyan",
        "name": "పవర్ స్టార్ పవన్ కళ్యాణ్ (Pawan Kalyan)",
        "badge": "⚡ పవన్ కళ్యాణ్ పవర్ పంచ్",
        "dialogue": "భక్తజనులందరికీ నా హృదయపూర్వక నమస్కారాలు! మనం చేసే ప్రతి మంచి సంకల్పంలో వినాయక స్వామి వారి ఆశీస్సులు ఉంటాయి... జై హింద్! బోలో గణపతి బప్పా మోరియా!",
        "filename": "pawankalyan.mp3"
    },
    {
        "id": "chiranjeevi",
        "name": "మెగాస్టార్ చిరంజీవి (Chiranjeevi)",
        "badge": "🌟 చిరంజీవి హీరో స్టైల్",
        "dialogue": "నమస్తే అండీ... మీ చిరంజీవిని. మన వినాయక చవితి పందిరిలో... మీ కుటుంబాలన్నీ ఆయురారోగ్య ఐశ్వర్యాలతో సదా సంతోషంగా వర్ధిల్లాలని మనసారా కోరుకుంటున్నాను. గణపతి మహారాజ్ కి జై!",
        "filename": "chiranjeevi.mp3"
    },
    {
        "id": "brahmanandam",
        "name": "హాస్య బ్రహ్మ బ్రహ్మానందం (Brahmanandam)",
        "badge": "🎭 బ్రహ్మానందం కామెడీ స్టైల్",
        "dialogue": "ఆహా... ఏమి భక్తి! ఏమి చందా! నేనండి మీ ఖాన్ దాదా... కాదు కాదు, మన వినాయక భక్తుడుని! ఆనందో బ్రహ్మ! బోలో గణపతి బప్పా మోరియా!",
        "filename": "brahmanandam.mp3"
    }
]

def ensure_default_celebrities_backup():
    """Ensure baseline celebrity audio clips are saved in DATA_DIR for instant resets."""
    for p in CELEBRITY_PROFILES:
        src = os.path.join(CELEBRITIES_DIR, p["filename"])
        dst = os.path.join(DEFAULT_CELEBRITIES_DIR, p["filename"])
        if os.path.exists(src) and not os.path.exists(dst):
            try:
                shutil.copyfile(src, dst)
            except Exception:
                pass

def get_celebrities_info():
    ensure_default_celebrities_backup()
    res = []
    for p in CELEBRITY_PROFILES:
        filepath = os.path.join(CELEBRITIES_DIR, p["filename"])
        exists = os.path.exists(filepath)
        size = os.path.getsize(filepath) if exists else 0
        mtime = int(os.path.getmtime(filepath)) if exists else 0
        res.append({
            "id": p["id"],
            "name": p["name"],
            "badge": p["badge"],
            "dialogue": p["dialogue"],
            "audioUrl": f"/audio/celebrities/{p['filename']}?t={mtime}",
            "exists": exists,
            "size": size,
            "mtime": mtime
        })
    return res

def merge_audio_clips(clip1_path: str, clip2_path: str, output_path: str):
    """Concatenates two audio files smoothly via ffmpeg."""
    cmd = [
        "ffmpeg", "-y",
        "-i", clip1_path,
        "-i", clip2_path,
        "-filter_complex", "[0:a][1:a]concat=n=2:v=0:a=1[out]",
        "-map", "[out]",
        "-b:a", "192k",
        output_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)


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
                query = parse_qs(parsed.query)
                is_download = ('download' in query or 'dl' in query)
                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(file_size))
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('X-Content-Type-Options', 'nosniff')
                if is_download:
                    raw_name = query.get('name', [filename])[0].strip()
                    if not raw_name.lower().endswith('.mp3'):
                        raw_name += '.mp3'
                    from urllib.parse import quote
                    safe_utf8 = quote(raw_name, safe='')
                    ascii_clean = "".join(c for c in raw_name.replace('.mp3', '') if c.isascii() and (c.isalnum() or c in '_-')).strip('_- ')
                    if not ascii_clean:
                        ascii_clean = "Vinayaka_Announcement"
                    ascii_filename = f"{ascii_clean}.mp3"
                    self.send_header('Content-Disposition', f'attachment; filename="{ascii_filename}"; filename*=UTF-8\'\'{safe_utf8}')
                    self.send_header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length')
                self.end_headers()
                return

        if path.endswith(".apk") or path == "/download-apk":
            apk_name = os.path.basename(path)
            if not apk_name or not apk_name.endswith('.apk'):
                apk_name = "Vinayaka_Announcer.apk"
            apk_path = os.path.join(BASE_DIR, apk_name)
            if not os.path.exists(apk_path):
                candidates = [os.path.join(BASE_DIR, f) for f in os.listdir(BASE_DIR) if f.endswith('.apk')]
                if candidates:
                    apk_path = candidates[0]
                    apk_name = os.path.basename(apk_path)
            if os.path.exists(apk_path):
                file_size = os.path.getsize(apk_path)
                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.android.package-archive')
                self.send_header('Content-Length', str(file_size))
                self.send_header('Content-Disposition', f'attachment; filename="{apk_name}"')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.send_header('Pragma', 'no-cache')
                self.send_header('Expires', '0')
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
                },
                {
                    "id": "celebrity-balayya",
                    "name": "🦁 బాలయ్య మాస్ (Balayya Mass Style)",
                    "baseVoice": "te-IN-MohanNeural",
                    "gender": "Male",
                    "label": "గాండ్రించే గంభీర స్వరం & మాస్ డైలాగ్స్",
                    "rate": "+6%",
                    "pitch": "-4Hz",
                    "isCelebrity": True
                },
                {
                    "id": "celebrity-baahubali",
                    "name": "👑 బాహుబలి ప్రభాస్ (Prabhas Baahubali)",
                    "baseVoice": "te-IN-MohanNeural",
                    "gender": "Male",
                    "label": "గ్రాండ్ రాయల్ బేస్ స్వరం & గంభీరత",
                    "rate": "-4%",
                    "pitch": "-8Hz",
                    "isCelebrity": True
                },
                {
                    "id": "celebrity-pawankalyan",
                    "name": "⚡ పవన్ కళ్యాణ్ (Pawan Kalyan Style)",
                    "baseVoice": "te-IN-MohanNeural",
                    "gender": "Male",
                    "label": "హై ఎనర్జీ పవర్ పంచ్ స్వరం",
                    "rate": "+15%",
                    "pitch": "+2Hz",
                    "isCelebrity": True
                },
                {
                    "id": "celebrity-chiranjeevi",
                    "name": "🌟 మెగాస్టార్ చిరంజీవి (Chiranjeevi Heroic)",
                    "baseVoice": "te-IN-MohanNeural",
                    "gender": "Male",
                    "label": "రాయల్ వార్మ్ బారిటోన్ & ఆప్యాయత",
                    "rate": "+2%",
                    "pitch": "-2Hz",
                    "isCelebrity": True
                },
                {
                    "id": "celebrity-brahmanandam",
                    "name": "🎭 బ్రహ్మానందం కామెడీ (Brahmanandam Fun)",
                    "baseVoice": "te-IN-MohanNeural",
                    "gender": "Male",
                    "label": "కామెడీ కింగ్ సరదా హావభావాలు",
                    "rate": "+12%",
                    "pitch": "+12Hz",
                    "isCelebrity": True
                }
            ]
            self.wfile.write(json.dumps(voices, ensure_ascii=False).encode('utf-8'))
            return

        elif path == "/api/celebrities":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            info = get_celebrities_info()
            self.wfile.write(json.dumps(info, ensure_ascii=False).encode('utf-8'))
            return

        elif path == "/api/voice-cloning/config":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            api_key = get_elevenlabs_api_key()
            has_key = bool(api_key)
            sub_info = None
            if has_key:
                try:
                    sub_info = check_elevenlabs_subscription(api_key)
                except Exception as e:
                    sub_info = {"error": str(e)}
            cloned = get_cloned_voices()
            res = {
                "hasApiKey": has_key,
                "maskedKey": (api_key[:4] + "..." + api_key[-4:]) if len(api_key) > 8 else ("****" if has_key else ""),
                "subscription": sub_info,
                "clonedVoices": cloned
            }
            self.wfile.write(json.dumps(res, ensure_ascii=False).encode('utf-8'))
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
                query = parse_qs(parsed.query)
                is_download = ('download' in query or 'dl' in query)
                self.send_response(200)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(file_size))
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('X-Content-Type-Options', 'nosniff')
                if is_download:
                    raw_name = query.get('name', [filename])[0].strip()
                    if not raw_name.lower().endswith('.mp3'):
                        raw_name += '.mp3'
                    from urllib.parse import quote
                    safe_utf8 = quote(raw_name, safe='')
                    ascii_clean = "".join(c for c in raw_name.replace('.mp3', '') if c.isascii() and (c.isalnum() or c in '_-')).strip('_- ')
                    if not ascii_clean:
                        ascii_clean = "Vinayaka_Announcement"
                    ascii_filename = f"{ascii_clean}.mp3"
                    self.send_header('Content-Disposition', f'attachment; filename="{ascii_filename}"; filename*=UTF-8\'\'{safe_utf8}')
                    self.send_header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length')
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

        # Direct APK downloads from root directory
        elif path.endswith(".apk") or path == "/download-apk":
            apk_name = os.path.basename(path)
            if not apk_name or not apk_name.endswith('.apk'):
                apk_name = "Vinayaka_Announcer.apk"
            apk_path = os.path.join(BASE_DIR, apk_name)
            if not os.path.exists(apk_path):
                candidates = [os.path.join(BASE_DIR, f) for f in os.listdir(BASE_DIR) if f.endswith('.apk')]
                if candidates:
                    apk_path = candidates[0]
                    apk_name = os.path.basename(apk_path)
            if os.path.exists(apk_path):
                file_size = os.path.getsize(apk_path)
                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.android.package-archive')
                self.send_header('Content-Length', str(file_size))
                self.send_header('Content-Disposition', f'attachment; filename="{apk_name}"')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.send_header('Pragma', 'no-cache')
                self.send_header('Expires', '0')
                self.end_headers()
                with open(apk_path, 'rb') as f:
                    while chunk := f.read(65536):
                        self.wfile.write(chunk)
                return
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"APK file not found")
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
                celeb_intro = data.get("celebIntro")
                use_clone = data.get("useClone", True)

                if not text:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Empty text"}).encode('utf-8'))
                    return

                # 1. Resolve voice engine: ElevenLabs Cloned/Preset Voice OR Edge Neural TTS
                api_key = get_elevenlabs_api_key()
                cloned_voices = get_cloned_voices()
                celeb_key = str(data.get("celebId") or celeb_intro or voice).replace("celebrity-", "").strip().lower()

                speech_path = None
                file_hash = None
                cached = False

                # Check if ElevenLabs voice actor or custom clone can be used
                if use_clone and api_key:
                    el_voice_id = None
                    if celeb_key in cloned_voices and cloned_voices[celeb_key].get("voice_id"):
                        el_voice_id = cloned_voices[celeb_key]["voice_id"]
                    elif celeb_key in ELEVENLABS_FREE_PRESET_VOICES:
                        el_voice_id = ELEVENLABS_FREE_PRESET_VOICES[celeb_key]

                    if el_voice_id:
                        hash_key = f"el_{el_voice_id}_{text}"
                        file_hash = hashlib.md5(hash_key.encode('utf-8')).hexdigest()
                        speech_filename = f"{file_hash}.mp3"
                        el_speech_path = os.path.join(CACHE_DIR, speech_filename)
                        try:
                            if os.path.exists(el_speech_path):
                                cached = True
                            else:
                                generate_elevenlabs_tts(text, el_voice_id, el_speech_path, api_key)
                                cached = False
                            speech_path = el_speech_path
                        except Exception as el_err:
                            print(f"ElevenLabs TTS error, falling back to Edge-TTS: {el_err}")
                            speech_path = None

                # 2. Fallback to Microsoft Edge Neural TTS if ElevenLabs was not used or failed
                if not speech_path:
                    hash_key = f"{text}_{voice}_{rate}_{pitch}"
                    file_hash = hashlib.md5(hash_key.encode('utf-8')).hexdigest()
                    speech_filename = f"{file_hash}.mp3"
                    edge_speech_path = os.path.join(CACHE_DIR, speech_filename)
                    if os.path.exists(edge_speech_path):
                        cached = True
                    else:
                        asyncio.run(generate_tts(text, voice, rate, pitch, edge_speech_path))
                        cached = False
                    speech_path = edge_speech_path

                final_filename = speech_filename

                # If authentic celebrity intro audio is requested, merge with TTS speech
                if celeb_intro:
                    c_key = str(celeb_intro).replace("celebrity-", "").strip().lower()
                    intro_path = os.path.join(CELEBRITIES_DIR, f"{c_key}.mp3")
                    if os.path.exists(intro_path):
                        mtime = int(os.path.getmtime(intro_path))
                        merged_key = f"celeb_merged_{c_key}_{mtime}_{file_hash}"
                        merged_hash = hashlib.md5(merged_key.encode('utf-8')).hexdigest()
                        merged_filename = f"{merged_hash}.mp3"
                        merged_path = os.path.join(CACHE_DIR, merged_filename)
                        if not os.path.exists(merged_path):
                            merge_audio_clips(intro_path, speech_path, merged_path)
                        final_filename = merged_filename

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                res = {
                    "status": "success",
                    "audioUrl": f"/api/audio/{final_filename}",
                    "cached": cached,
                    "text": text,
                    "voice": voice,
                    "celebIntro": celeb_intro if celeb_intro else None,
                    "isCloned": False
                }
                self.wfile.write(json.dumps(res, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif path.startswith("/api/celebrity-clip/"):
            subpath = path.replace("/api/celebrity-clip/", "").strip()
            if subpath.endswith("/reset"):
                celeb_id = subpath.replace("/reset", "").strip().lower()
                def_src = os.path.join(DEFAULT_CELEBRITIES_DIR, f"{celeb_id}.mp3")
                target = os.path.join(CELEBRITIES_DIR, f"{celeb_id}.mp3")
                if os.path.exists(def_src):
                    shutil.copyfile(def_src, target)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "status": "reset",
                        "id": celeb_id,
                        "audioUrl": f"/audio/celebrities/{celeb_id}.mp3?t={int(time.time())}"
                    }).encode('utf-8'))
                else:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Default audio not found"}).encode('utf-8'))
                return

            celeb_id = subpath.strip().lower()
            try:
                data = json.loads(body)
                raw_b64 = data.get("audioBase64", "")
                if "," in raw_b64:
                    raw_b64 = raw_b64.split(",", 1)[1]
                audio_bytes = base64.b64decode(raw_b64)
                if not audio_bytes:
                    raise ValueError("Empty audio payload")

                temp_path = os.path.join(CELEBRITIES_DIR, f"temp_{celeb_id}")
                target_path = os.path.join(CELEBRITIES_DIR, f"{celeb_id}.mp3")

                # Make sure we have a backup of original before overwriting
                ensure_default_celebrities_backup()

                with open(temp_path, "wb") as f:
                    f.write(audio_bytes)

                # Transcode to high quality 192k MP3 via ffmpeg
                subprocess.run(
                    ["ffmpeg", "-y", "-i", temp_path, "-b:a", "192k", target_path],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True
                )
                if os.path.exists(temp_path):
                    os.remove(temp_path)

                mtime = int(os.path.getmtime(target_path))
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "uploaded",
                    "id": celeb_id,
                    "audioUrl": f"/audio/celebrities/{celeb_id}.mp3?t={mtime}"
                }).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif path == "/api/voice-cloning/config":
            try:
                data = json.loads(body)
                api_key = data.get("apiKey", "").strip()
                if not api_key:
                    set_elevenlabs_api_key("")
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "cleared"}).encode('utf-8'))
                    return
                # Validate key
                sub_info = check_elevenlabs_subscription(api_key)
                set_elevenlabs_api_key(api_key)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "saved",
                    "tier": sub_info.get("tier"),
                    "character_count": sub_info.get("character_count"),
                    "character_limit": sub_info.get("character_limit")
                }).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif path == "/api/voice-cloning/clone":
            try:
                data = json.loads(body)
                celeb_id = data.get("celebId", "").strip().lower()
                name = data.get("name", "").strip() or f"Celebrity {celeb_id.title()}"
                audio_bytes = None
                if raw_b64:
                    if "," in raw_b64:
                        raw_b64 = raw_b64.split(",", 1)[1]
                    try:
                        audio_bytes = base64.b64decode(raw_b64)
                    except Exception:
                        audio_bytes = None

                # Fallback to existing server celebrity audio if base64 not provided
                if not audio_bytes:
                    server_clip = os.path.join(CELEBRITIES_DIR, f"{celeb_id}.mp3")
                    if os.path.exists(server_clip):
                        with open(server_clip, "rb") as f:
                            audio_bytes = f.read()

                if not audio_bytes:
                    raise ValueError("ఆడియో ఫైల్ దొరకలేదు. దయచేసి MP3 ఆడియో ఫైల్ ఎంచుకోండి.")

                api_key = get_elevenlabs_api_key()
                if not api_key:
                    raise ValueError("ElevenLabs API Key is not configured. Please enter your API Key first.")

                voice_id = clone_voice_with_elevenlabs(name, audio_bytes, f"{celeb_id}.mp3", api_key)
                save_cloned_voice(celeb_id, voice_id, name)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "success",
                    "celebId": celeb_id,
                    "voice_id": voice_id,
                    "name": name
                }).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        elif path.startswith("/api/voice-cloning/delete/"):
            celeb_id = path.replace("/api/voice-cloning/delete/", "").strip().lower()
            delete_cloned_voice(celeb_id)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "deleted", "celebId": celeb_id}).encode('utf-8'))
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
