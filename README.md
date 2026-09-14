# 🕉️ శ్రీ వినాయక చవితి చందా & విరాళాల మైక్ అనౌన్స్‌మెంట్ యాప్
### Vinayaka Chavithi Ganesh Pandal Donation Mic Announcer (Android & Web)

A specialized festival announcement application created for Ganesh Chaturthi (వినాయక చవితి) pandals and festival committees. It delivers realistic human voice announcements in Telugu for both **Male (మోహన్ - Mohan)** and **Female (శృతి - Shruti)** voices, reading devotees' donations in the form of **Money (నగదు)** and **Items (వస్తువులు)** with pandal loudspeaker echo effects and temple bell chimes.

---

## 🌟 Key Features

1. **Realistic Human Voices in Telugu**:
   - 👨 **మోహన్ (Mohan - Male Voice)**: Resonant, deep temple speaker style (`te-IN-MohanNeural`).
   - 👩 **శృతి (Shruti - Female Voice)**: Melodious, respectful devotional tone (`te-IN-ShrutiNeural`).
   - Rate & Pitch controls.
   - Offline fallback to device-native Web Speech API.

2. **Pandal Sound Effects & Soundboard**:
   - 🔔 **Temple Bell (గంట నాదం)**: Multi-harmonic authentic brass temple bell chime before announcements.
   - 🐚 **Shankham (శంఖ ధ్వని)**: Sacred conch blast for special/large donations and kickoff.
   - 📢 **Loudspeaker Echo / Reverb (మైక్ సెట్ ఎకో)**: PA horn speaker reverb filter via Web Audio API.
   - 🎵 **Devotional Ambient Drone (నేపథ్య భక్తి నాదం)**: Soft devotional drone with auto-ducking during speech.

3. **Complete Donation Types**:
   - 💰 **నగదు చందాలు (Money)**: E.g., ₹501, ₹1,116, ₹2,500, ₹5,116, ₹10,001, ₹25,000, ₹50,000.
   - 🎁 **వస్తు రూప విరాళాలు (Items)**: E.g., 5kg / 21kg లడ్డూ, 25kg / 50kg బియ్యం బస్తాలు, వెండి గొడుగు, పట్టు వస్త్రాలు, పూజా ద్రవ్యాలు, పండ్లు.
   - 🤝 **నగదు + వస్తువు (Combo)**: For devotees offering both cash and items together.

4. **Announcement Engines & Controls**:
   - 📢 **"అన్ని విరాళాలు వరుసగా చదవండి" (Read All Donations)**: Continuous loop with configurable pause countdown between devotees and live card highlighting.
   - ⚡ **ఒక్కరిని చదవండి (Instant Single Announcement)**: One-tap button on any card.
   - ⬇️ **ఆడియో డౌన్‌లోడ్ (Download MP3)**: Export announcement audio for USB playback on amplifier soundboxes.
   - 🔍 **శోధన మరియు ఫిల్టర్లు (Search & Filter)**: Filter by Money, Items, Unread, Read, or search by name and place.

---

## 🚀 How to Run

### Step 1: Start the Server
```bash
python3 server.py
```

Output:
```text
============================================================
🕉️  శ్రీ వినాయక చవితి చందా & విరాళాల మైక్ అనౌన్స్‌మెంట్ యాప్
============================================================
👉 Local Web Access:    http://localhost:8080
📱 Android Phone Access: http://192.168.x.x:8080
🎙️  Telugu Voice Engine: Microsoft Edge Neural TTS
    - Mohan (మోహన్):  te-IN-MohanNeural (Male)
    - Shruti (శృతి):  te-IN-ShrutiNeural (Female)
============================================================
```

### Step 2: Use on Android Phone
1. Connect your Android phone to the same Wi-Fi as your computer.
2. Open Chrome on Android and navigate to the `http://<YOUR-IP>:8080` (or scan the QR code inside the app).
3. Tap the **three dots menu (⋮)** in Chrome and select **"Install app"** or **"Add to Home screen"**.
4. The app will install directly onto your Android phone's home screen as a full-screen native Android app!

## 📦 Generated Android APK

The native Android APK has been compiled and is ready for installation:
- **File**: [`Vinayaka_Announcer.apk`](file:///Users/ashishpavanvasana/Documents/Documents/Projects/announement_app/Vinayaka_Announcer.apk)
- **Path**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Size**: ~4.0 MB
- **Direct Web Download**: Tap **"⬇️ డౌన్‌లోడ్ APK"** in the app header or visit `http://<YOUR-IP>:8080/Vinayaka_Announcer.apk` directly on your Android phone to install!

---

## 📱 Building Native Android APK (Capacitor)

If you wish to compile a standalone `.apk` using Android Studio:
```bash
# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Add Android platform
npx cap add android

# 3. Copy web assets and build
npx cap copy android
npx cap open android
```
This will open Android Studio, where you can click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
