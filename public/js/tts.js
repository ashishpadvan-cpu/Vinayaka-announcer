// Celebrity & Neural Voice Persona Configurations
window.CELEBRITY_PERSONAS = {
  'mohan': {
    id: 'mohan',
    name: 'మోహన్ (Mohan)',
    voice: 'te-IN-MohanNeural',
    gender: 'Male',
    rate: '+0%',
    pitch: '+0Hz',
    badge: 'పురుష స్వరం (గంభీరమైన మైక్ ధ్వని)',
    intro: '',
    outro: ''
  },
  'shruti': {
    id: 'shruti',
    name: 'శృతి (Shruti)',
    voice: 'te-IN-ShrutiNeural',
    gender: 'Female',
    rate: '-2%',
    pitch: '+0Hz',
    badge: 'స్త్రీ స్వరం (మధురమైన భక్తి భావం)',
    intro: '',
    outro: ''
  },
  'balayya': {
    id: 'balayya',
    name: '🦁 బాలయ్య మాస్ (Balayya Mass Style)',
    voice: 'te-IN-MohanNeural',
    gender: 'Male',
    rate: '+6%',
    pitch: '-4Hz',
    badge: 'గాండ్రించే గంభీర స్వరం & మాస్ డైలాగ్స్',
    intro: 'జై బాలయ్య! దెబ్బకు దయ్యం వదలాలి... మైక్ మోత మోగిపోవాలి! సాక్షాత్తు ఆ వినాయక స్వామి వారి కృపాకటాక్షాలతో...',
    outro: 'ఫ్లూట్ జింక ముందు ఊదు... సింహం ముందు కాదు! భక్తులందరూ గట్టిగా జై కొట్టండి... జై బాలయ్య! బోలో గణపతి బప్పా మోరియా!'
  },
  'baahubali': {
    id: 'baahubali',
    name: '👑 బాహుబలి ప్రభాస్ (Prabhas Baahubali)',
    voice: 'te-IN-MohanNeural',
    gender: 'Male',
    rate: '-4%',
    pitch: '-8Hz',
    badge: 'గ్రాండ్ రాయల్ బేస్ స్వరం & గంభీరత',
    intro: 'శ్రీ వినాయక మహారాజ్ దివ్య సమక్షంలో... మాహిష్మతీ సామ్రాజ్య భక్తితో చేయబడుతున్న ప్రకటన...',
    outro: 'అమరేంద్ర బాహుబలి అను నేను... స్వామివారి భక్తులకు సర్వదా శుభం కలగాలని ఆకాంక్షిస్తున్నాను! జై గణపతి దేవా!'
  },
  'pawankalyan': {
    id: 'pawankalyan',
    name: '⚡ పవన్ కళ్యాణ్ (Pawan Kalyan Style)',
    voice: 'te-IN-MohanNeural',
    gender: 'Male',
    rate: '+15%',
    pitch: '+2Hz',
    badge: 'హై ఎనర్జీ పవర్ పంచ్ స్వరం',
    intro: 'భక్తజనులందరికీ నా హృదయపూర్వక నమస్కారాలు... మన వినాయక మండపం వద్ద ఈరోజు ఒక గొప్ప విశేషం...',
    outro: 'మనం చేసే ప్రతి మంచి సంకల్పంలో వినాయక స్వామి వారి ఆశీస్సులు ఉంటాయి... జై హింద్! బోలో గణపతి బప్పా మోరియా!'
  },
  'chiranjeevi': {
    id: 'chiranjeevi',
    name: '🌟 మెగాస్టార్ చిరంజీవి (Chiranjeevi Heroic)',
    voice: 'te-IN-MohanNeural',
    gender: 'Male',
    rate: '+2%',
    pitch: '-2Hz',
    badge: 'రాయల్ వార్మ్ బారిటోన్ & ఆప్యాయత',
    intro: 'నమస్తే అండీ... మీ చిరంజీవిని. మన వినాయక చవితి పందిరిలో స్వామివారి దివ్య సమక్షంలో...',
    outro: 'మీ కుటుంబాలన్నీ ఆయురారోగ్య ఐశ్వర్యాలతో సదా సంతోషంగా వర్ధిల్లాలని మనసారా కోరుకుంటున్నాను. గణపతి మహారాజ్ కి జై!'
  },
  'brahmanandam': {
    id: 'brahmanandam',
    name: '🎭 బ్రహ్మానందం కామెడీ (Brahmanandam Fun)',
    voice: 'te-IN-MohanNeural',
    gender: 'Male',
    rate: '+12%',
    pitch: '+12Hz',
    badge: 'కామెడీ కింగ్ సరదా హావభావాలు',
    intro: 'ఆహా... ఏమి భక్తి! ఏమి చందా! నేనండి మీ ఖాన్ దాదా... కాదు కాదు, మన వినాయక భక్తుడుని!',
    outro: 'ఇంత గొప్ప మనసుతో విరాళం ఇచ్చినందుకు స్వామివారు వీరికి కోట్ల రూపాయల ఐశ్వర్యం ఇవ్వాలని ఆశిస్తున్నాం... ఆనందో బ్రహ్మ! బోలో గణపతి బప్పా మోరియా!'
  }
};

class TeluguTTSAnnouncer {
  constructor() {
    this.selectedVoice = 'te-IN-MohanNeural'; // Default: Mohan (Male)
    this.selectedPersona = 'mohan';
    const savedCelebDialogues = localStorage.getItem('vinayaka_include_celeb_dialogues');
    this.includeCelebrityDialogues = savedCelebDialogues !== null ? (savedCelebDialogues === 'true') : true;
    this.rate = '+0%';
    this.pitch = '+0Hz';
    this.currentAudio = null;
    this.isPlaying = false;
    this.templateStyle = 'traditional'; // 'traditional', 'quick', 'celebration'
    this.useVoiceClone = true; // Use ElevenLabs cloned voice for custom text when available
    this.clonedVoices = {};
    this.hasVoiceCloningApiKey = false;
    this.voiceCloningSub = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * Selects voice persona (Mohan, Shruti, Balayya, Baahubali, etc.)
   */
  setPersona(personaKey, includeDialogues = null) {
    if (!window.CELEBRITY_PERSONAS) return null;
    const persona = window.CELEBRITY_PERSONAS[personaKey];
    if (persona) {
      this.selectedPersona = personaKey;
      this.selectedVoice = persona.voice;
      this.rate = persona.rate;
      this.pitch = persona.pitch;
      if (includeDialogues !== null) {
        this.includeCelebrityDialogues = Boolean(includeDialogues);
      } else if (personaKey !== 'mohan' && personaKey !== 'shruti') {
        this.includeCelebrityDialogues = true;
      }
      return persona;
    }
    return null;
  }

  /**
   * Resolves the server base URL for API calls
   */
  getServerBaseUrl() {
    const saved = localStorage.getItem('vinayaka_server_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
    const isNativeCapacitor = (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) ||
                              (window.location && (window.location.origin === 'http://localhost' || window.location.origin === 'capacitor://localhost'));
    if (isNativeCapacitor) {
      // Running inside Android APK: connect to live cloud server or saved IP
      return 'https://vinayaka-announcer.onrender.com';
    }
    // In web browser (localhost:8080, 127.0.0.1:8080, LAN IP, or Render web domain)
    if (window.location && window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http')) {
      return window.location.origin;
    }
    return 'https://vinayaka-announcer.onrender.com';
  }

  /**
   * Fetches ElevenLabs Voice Cloning configuration and active cloned voices
   */
  async fetchVoiceCloningConfig() {
    try {
      const serverUrl = this.getServerBaseUrl();
      const res = await fetch(`${serverUrl}/api/voice-cloning/config`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        this.hasVoiceCloningApiKey = Boolean(data.hasApiKey);
        this.clonedVoices = data.clonedVoices || {};
        this.voiceCloningSub = data.subscription || null;
        return data;
      }
    } catch (e) {
      console.warn("fetchVoiceCloningConfig error:", e);
    }
    return { hasApiKey: false, clonedVoices: {}, subscription: null };
  }

  /**
   * Saves or updates ElevenLabs API key
   */
  async saveVoiceCloningApiKey(apiKey) {
    const serverUrl = this.getServerBaseUrl();
    const res = await fetch(`${serverUrl}/api/voice-cloning/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: apiKey.trim() })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'API Key validation failed');
    }
    await this.fetchVoiceCloningConfig();
    return data;
  }

  /**
   * Clones a celebrity voice using an uploaded MP3 file or existing server file
   */
  async cloneCelebrityVoice(celebId, file = null, name = '') {
    const serverUrl = this.getServerBaseUrl();
    const key = (celebId || this.selectedPersona).replace('celebrity-', '').trim().toLowerCase();
    let audioBase64 = '';

    if (file) {
      audioBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("ఆడియో ఫైల్ చదవడం విఫలమైంది"));
        reader.readAsDataURL(file);
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for voice cloning model creation

    try {
      const res = await fetch(`${serverUrl}/api/voice-cloning/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          celebId: key,
          name: name || `Vinayaka ${key.toUpperCase()} Voice`,
          audioBase64: audioBase64
        })
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Voice cloning failed');
      }
      await this.fetchVoiceCloningConfig();
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error("వాయిస్ క్లోనింగ్ టైమౌట్ అయింది. దయచేసి ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.");
      }
      throw err;
    }
  }

  /**
   * Deletes a cloned voice from ElevenLabs & server
   */
  async deleteClonedVoice(celebId) {
    const serverUrl = this.getServerBaseUrl();
    const key = (celebId || this.selectedPersona).replace('celebrity-', '').trim().toLowerCase();
    const res = await fetch(`${serverUrl}/api/voice-cloning/delete/${key}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Delete failed");
    await this.fetchVoiceCloningConfig();
    return true;
  }

  /**
   * Returns true if the celebrity currently has an active cloned voice
   */
  isCelebrityCloned(celebId) {
    const key = (celebId || this.selectedPersona).replace('celebrity-', '').trim().toLowerCase();
    return Boolean(this.clonedVoices && this.clonedVoices[key] && this.clonedVoices[key].voice_id);
  }

  /**
   * Converts numbers (e.g. 5116) to authentic Telugu spoken words
   */
  numberToTeluguWords(n) {
    if (isNaN(n) || n <= 0) return '';
    const ones = ['', 'ఒక', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది', 'పది',
      'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పద్దెనిమిది', 'పంతొమ్మిది'];
    const tens = ['', '', 'ఇరవై', 'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'డెబ్బై', 'ఎనభై', 'తొంబై'];

    const convert = (num) => {
      if (num === 0) return '';
      if (num < 20) return ones[num];
      if (num < 100) {
        const t = tens[Math.floor(num / 10)];
        const r = num % 10;
        return r === 0 ? t : `${t} ${ones[r]}`;
      }
      if (num < 1000) {
        const hDigit = Math.floor(num / 100);
        const rem = num % 100;
        if (hDigit === 1) {
          if (rem === 0) return 'వంద';
          if (rem === 16) return 'నూట పదహారు';
          return `నూట ${convert(rem)}`;
        } else {
          const hPrefix = `${ones[hDigit]} వందల`;
          if (rem === 0) return `${ones[hDigit]} వందలు`;
          if (rem === 16) return `${hPrefix} పదహారు`;
          return `${hPrefix} ${convert(rem)}`;
        }
      }
      if (num < 100000) {
        const thCount = Math.floor(num / 1000);
        const rem = num % 1000;
        const thWord = thCount === 1 ? 'వెయ్యి' : `${convert(thCount)} వేల`;
        if (rem === 0) return thCount === 1 ? 'వెయ్యి' : `${convert(thCount)} వేలు`;
        return `${thWord} ${convert(rem)}`;
      }
      if (num < 10000000) {
        const lCount = Math.floor(num / 100000);
        const rem = num % 100000;
        const lWord = lCount === 1 ? 'లక్ష' : `${convert(lCount)} లక్షల`;
        if (rem === 0) return lCount === 1 ? 'ఒక లక్ష' : `${convert(lCount)} లక్షలు`;
        return `${lWord} ${convert(rem)}`;
      }
      return num.toLocaleString('en-IN');
    };

    return convert(n);
  }

  /**
   * Generates the authentic Telugu pandal loudspeaker announcement script
   */
  generateAnnouncementScript(donation) {
    // If the devotee has their own custom edited matter, use it directly (resolving any tags)
    if (donation.customScript && donation.customScript.trim()) {
      let script = donation.customScript.trim();
      if (script.includes('{') && script.includes('}')) {
        const name = (donation.name || 'భక్తుడు').trim();
        const place = donation.place ? donation.place.trim() : '';
        const gothram = donation.gothram ? donation.gothram.trim() : '';
        const purpose = donation.purpose ? donation.purpose.trim() : 'స్వామివారి నిత్య పూజ మరియు అన్నదానం';
        let donationWords = '';
        if (donation.type === 'money') {
          const amountWords = this.numberToTeluguWords(donation.amount);
          donationWords = `${amountWords} రూపాయలు`;
        } else if (donation.type === 'item') {
          donationWords = donation.item + (donation.itemQty ? ` (${donation.itemQty})` : '');
        } else if (donation.type === 'both') {
          const amountWords = this.numberToTeluguWords(donation.amount);
          donationWords = `${amountWords} రూపాయల నగదు మరియు ${donation.item}`;
        }
        return script
          .replace(/\{పేరు\}/g, name)
          .replace(/\{name\}/gi, name)
          .replace(/\{ఊరు\}/g, place ? place : '')
          .replace(/\{place\}/gi, place ? place : '')
          .replace(/\{గోత్రం\}/g, gothram ? gothram : '')
          .replace(/\{gothram\}/gi, gothram ? gothram : '')
          .replace(/\{విరాళం\}/g, donationWords)
          .replace(/\{donation\}/gi, donationWords)
          .replace(/\{amount\}/gi, donationWords)
          .replace(/\{సందర్భం\}/g, purpose)
          .replace(/\{purpose\}/gi, purpose);
      }
      return script;
    }

    const name = (donation.name || 'భక్తుడు').trim();
    const place = donation.place ? donation.place.trim() : '';
    const gothram = donation.gothram ? donation.gothram.trim() : '';
    const purpose = donation.purpose ? donation.purpose.trim() : 'స్వామివారి నిత్య పూజ మరియు అన్నదానం';

    let donationWords = '';
    if (donation.type === 'money') {
      const amountWords = this.numberToTeluguWords(donation.amount);
      donationWords = `${amountWords} రూపాయలు (${donation.amount.toLocaleString('en-IN')} రూపాయల నగదు)`;
    } else if (donation.type === 'item') {
      donationWords = donation.item + (donation.itemQty ? ` (${donation.itemQty})` : '');
    } else if (donation.type === 'both') {
      const amountWords = this.numberToTeluguWords(donation.amount);
      donationWords = `${amountWords} రూపాయల నగదు మరియు ${donation.item}`;
    }

    // Check if the user defined a custom master template
    const customTemplate = localStorage.getItem('vinayaka_custom_template');
    if (customTemplate && customTemplate.trim()) {
      return customTemplate
        .replace(/\{పేరు\}/g, name)
        .replace(/\{name\}/gi, name)
        .replace(/\{ఊరు\}/g, place ? place : '')
        .replace(/\{place\}/gi, place ? place : '')
        .replace(/\{గోత్రం\}/g, gothram ? gothram : '')
        .replace(/\{gothram\}/gi, gothram ? gothram : '')
        .replace(/\{విరాళం\}/g, donationWords)
        .replace(/\{donation\}/gi, donationWords)
        .replace(/\{amount\}/gi, donationWords)
        .replace(/\{సందర్భం\}/g, purpose)
        .replace(/\{purpose\}/gi, purpose);
    }

    // Check if Celebrity Persona dialogue injection is active
    // Note: Authentic audio punchline clip is merged directly into the audio by the server when includeCelebrityDialogues is active
    if (this.templateStyle === 'quick') {
      return `శ్రీ ${name} గారు, ${place ? place + ' నుండి, ' : ''}${purpose} నిమిత్తం ${donationWords} సమర్పించారు. బోలో గణపతి బప్పా మోరియా!`;
    }

    if (this.templateStyle === 'celebration') {
      return `శ్రీ వినాయక స్వామి వారి దివ్య కృపాకటాక్షాలతో... ${place ? place + ' నివాసి ' : ''}శ్రీ ${name} గారు, మన గణపతి ఉత్సవాల సందర్భంగా ${purpose} కొరకు ${donationWords} అత్యంత భక్తితో సమర్పించుకున్నారు. గణపతి మహారాజ్ కి జై!`;
    }

    return `శ్రీ వినాయక స్వామి వారి కృపాకటాక్షాలతో... ${place ? place + ' నివాసి ' : ''}శ్రీ ${name} గారు, స్వామివారి ${purpose} నిమిత్తం ${donationWords} భక్తిశ్రద్ధలతో సమర్పించుకున్నారు. వినాయక స్వామి వారి అనుగ్రహంతో వీరి కుటుంబం ఆయురారోగ్య ఐశ్వర్యాలతో సదా వర్ధిల్లాలని కోరుకుంటున్నాము. భక్తులందరూ గట్టిగా జై కొట్టండి... బోలో గణపతి బప్పా మోరియా!`;
  }

  /**
   * Speaks the text using Edge Neural TTS or Android Native TTS fallback
   */
  async speak(text, options = {}) {
    this.stop();
    this.isPlaying = true;

    if (this.onStartCallback) this.onStartCallback(text);

    // 1. Dispatch Neural TTS fetch immediately in parallel with intro bell
    const serverUrl = this.getServerBaseUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

    const isCeleb = (this.selectedPersona !== 'mohan' && this.selectedPersona !== 'shruti');
    const celebIntro = options.celebIntro !== undefined
      ? options.celebIntro
      : (this.includeCelebrityDialogues && isCeleb ? this.selectedPersona : null);

    const useClone = options.useClone !== undefined
      ? options.useClone
      : (this.useVoiceClone && isCeleb);

    const celebId = options.celebId || (isCeleb ? this.selectedPersona : null);

    const ttsFetchPromise = fetch(`${serverUrl}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        text: text,
        voice: options.voice || this.selectedVoice,
        rate: options.rate !== undefined ? options.rate : this.rate,
        pitch: options.pitch !== undefined ? options.pitch : this.pitch,
        celebIntro: celebIntro,
        useClone: useClone,
        celebId: celebId
      })
    }).then(async (res) => {
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return data.audioUrl ? (data.audioUrl.startsWith('http') ? data.audioUrl : `${serverUrl}${data.audioUrl}`) : null;
      }
      return null;
    }).catch(err => {
      clearTimeout(timeoutId);
      console.warn("Neural TTS server unreachable or timed out:", err.message);
      return null;
    });

    // 2. Play Temple Bell chime or Shankham in parallel (Zero Dead Silence)
    if (options.withShankh && window.pandalAudio) {
      window.pandalAudio.playShankham();
      await new Promise(r => setTimeout(r, 1200));
    } else if (options.withBell && window.pandalAudio) {
      window.pandalAudio.playTempleBell();
      // Strike occurs instantly (0-300ms); waiting only 350ms lets speech start seamlessly
      // right as the bell resonates into its warm brass decay, with ZERO awkward gap!
      await new Promise(r => setTimeout(r, 350));
    }

    // Duck background music
    if (window.pandalAudio) {
      window.pandalAudio.duckBGM(true);
    }

    let playedSuccessfully = false;

    // 3. Await pre-fetched TTS audio URL
    try {
      const fullAudioUrl = await ttsFetchPromise;
      if (fullAudioUrl && this.isPlaying) {
        await this.playAudioUrl(fullAudioUrl);
        playedSuccessfully = true;
      }
    } catch (err) {
      console.warn("Audio playback error:", err);
    }

    // 2. If Neural TTS server was unreachable, use Native Android TTS
    if (!playedSuccessfully) {
      try {
        await this.speakNativeOrWebFallback(text);
        playedSuccessfully = true;
      } catch (fallbackErr) {
        console.error("All TTS options failed:", fallbackErr);
        alert("స్వరం ప్లే కాలేదు. దయచేసి సెట్టింగ్స్ లో కంప్యూటర్ Wi-Fi IP (" + this.getServerBaseUrl() + ") సరిగ్గా ఉందో లేదో తనిఖీ చేయండి.");
      }
    }

    this.isPlaying = false;
    if (window.pandalAudio) {
      window.pandalAudio.duckBGM(false);
    }
    if (this.onEndCallback) this.onEndCallback();
  }

  /**
   * Plays the generated MP3 through Web Audio with optional loudspeaker echo
   */
  playAudioUrl(url) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = url;
      this.currentAudio = audio;

      audio.oncanplay = () => {
        if (window.pandalAudio && window.pandalAudio.echoEnabled) {
          window.pandalAudio.attachLoudspeakerEcho(audio);
        }
      };

      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = (e) => {
        this.currentAudio = null;
        reject(e);
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Native Android TTS and Web Speech Fallback
   */
  speakNativeOrWebFallback(text) {
    return new Promise((resolve) => {
      const rateNum = 1.0 + (parseInt(this.rate) || 0) / 100.0;
      const pitchNum = this.selectedVoice.includes('Shruti') ? 1.2 : 0.95;

      // Priority 1: Capacitor Native AndroidTTS Plugin
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AndroidTTS) {
        console.log("Using Capacitor.Plugins.AndroidTTS...");
        window.Capacitor.Plugins.AndroidTTS.speak({
          text: text,
          rate: rateNum,
          pitch: pitchNum
        }).then(() => resolve())
          .catch((err) => {
            console.warn("Capacitor AndroidTTS error:", err);
            trySecondary();
          });
        return;
      }

      trySecondary();

      function trySecondary() {
        // Priority 2: Native Android TextToSpeech Bridge via JavascriptInterface
        if (window.AndroidNativeTTS && window.AndroidNativeTTS.isAvailable && window.AndroidNativeTTS.isAvailable()) {
          console.log("Using AndroidNativeTTS JavascriptInterface...");
          window.onAndroidTTSDone = () => {
            window.onAndroidTTSDone = null;
            resolve();
          };
          window.AndroidNativeTTS.speak(text, rateNum, pitchNum);
          const estDuration = Math.max(3500, text.length * 100);
          setTimeout(() => resolve(), estDuration);
          return;
        }

        // Priority 3: Browser Web Speech API (Chrome / Mobile Safari)
        if ('speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'te-IN';

            const voices = window.speechSynthesis.getVoices();
            const teluguVoice = voices.find(v => v.lang && (v.lang.startsWith('te') || v.lang.includes('TELUGU')));
            if (teluguVoice) utterance.voice = teluguVoice;

            utterance.rate = 0.95;
            utterance.pitch = pitchNum;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            window.speechSynthesis.speak(utterance);
            return;
          } catch (e) {
            console.warn("speechSynthesis error:", e);
          }
        }

        console.warn("No active TTS engine found. Showing announcement text visually.");
        resolve();
      }
    });
  }

  /**
   * Stops any currently playing speech
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (window.AndroidNativeTTS && window.AndroidNativeTTS.isAvailable()) {
      window.AndroidNativeTTS.stop();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    if (window.pandalAudio) {
      window.pandalAudio.duckBGM(false);
    }
  }

  /**
   * Generates or fetches Neural TTS audio URL from the server
   */
  async generateAudioUrl(text, options = {}) {
    if (!text || !text.trim()) throw new Error("ప్రకటన పాఠం ఖాళీగా ఉంది (Empty announcement text)");
    const serverUrl = this.getServerBaseUrl();
    const voice = options.voice || this.selectedVoice || 'te-IN-MohanNeural';
    const rate = options.rate !== undefined ? options.rate : this.rate;
    const pitch = options.pitch !== undefined ? options.pitch : this.pitch;

    const isCeleb = (this.selectedPersona !== 'mohan' && this.selectedPersona !== 'shruti');
    const celebIntro = options.celebIntro !== undefined
      ? options.celebIntro
      : (this.includeCelebrityDialogues && isCeleb ? this.selectedPersona : null);

    const useClone = options.useClone !== undefined
      ? options.useClone
      : (this.useVoiceClone && isCeleb);

    const celebId = options.celebId || (isCeleb ? this.selectedPersona : null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch(`${serverUrl}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          text: text.trim(),
          voice: voice,
          rate: rate,
          pitch: pitch,
          celebIntro: celebIntro,
          useClone: useClone,
          celebId: celebId
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `సర్వర్ లోపం: ${res.status}`);
      }

      const data = await res.json();
      if (!data.audioUrl) throw new Error("ఆడియో URL రాలేదు");

      const fullAudioUrl = data.audioUrl.startsWith('http') ? data.audioUrl : `${serverUrl}${data.audioUrl}`;
      return {
        audioUrl: data.audioUrl,
        fullAudioUrl: fullAudioUrl,
        cached: data.cached,
        voice: voice,
        text: text,
        celebIntro: data.celebIntro
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error("ఆడియో జనరేషన్ టైమౌట్ అయింది. దయచేసి మళ్ళీ ప్రయత్నించండి.");
      }
      throw err;
    }
  }

  /**
   * Plays the authentic celebrity audio punchline clip alone
   */
  async playCelebrityClip(celebId) {
    const key = (celebId || this.selectedPersona).replace('celebrity-', '').trim().toLowerCase();
    const serverUrl = this.getServerBaseUrl();
    const clipUrl = `${serverUrl}/audio/celebrities/${key}.mp3?t=${Date.now()}`;
    await this.playAudioUrl(clipUrl);
  }

  /**
   * Uploads user's custom MP3 clip to replace default celebrity audio
   */
  async uploadCelebrityClip(celebId, file) {
    if (!file) throw new Error("ఆడియో ఫైల్ ఎంచుకోలేదు");
    if (file.size > 25 * 1024 * 1024) {
      throw new Error("ఆడియో ఫైల్ సైజు 25MB కంటే తక్కువగా ఉండాలి");
    }

    const key = (celebId || this.selectedPersona).replace('celebrity-', '').trim().toLowerCase();
    const serverUrl = this.getServerBaseUrl();

    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("ఫైల్ చదవడం విఫలమైంది"));
      reader.readAsDataURL(file);
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

    try {
      const res = await fetch(`${serverUrl}/api/celebrity-clip/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          audioBase64: base64Data,
          filename: file.name
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `అప్‌లోడ్ విఫలమైంది (${res.status})`);
      }
      return await res.json();
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        throw new Error("ఆడియో అప్‌లోడ్ టైమౌట్ అయింది. దయచేసి చిన్న ఫైల్ ఎంచుకోండి.");
      }
      throw fetchErr;
    }
  }

  /**
   * Resets custom clip back to original default starter clip
   */
  async resetCelebrityClip(celebId) {
    const key = (celebId || this.selectedPersona).replace('celebrity-', '').trim().toLowerCase();
    const serverUrl = this.getServerBaseUrl();
    const res = await fetch(`${serverUrl}/api/celebrity-clip/${key}/reset`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Reset failed');
    return await res.json();
  }

  /**
   * Generates and downloads MP3 audio file to the device/browser.
   * Guarantees strict .mp3 format with audio/mpeg MIME type across native Android, PWA, and all web browsers.
   */
  async downloadMp3(text, suggestedFilename = 'Vinayaka_Announcement.mp3', options = {}) {
    let cleanName = (suggestedFilename || 'Vinayaka_Announcement.mp3').trim();
    if (!cleanName.toLowerCase().endsWith('.mp3')) cleanName += '.mp3';

    // 1. Generate audio on server
    const audioData = await this.generateAudioUrl(text, options);
    const audioUrl = audioData.fullAudioUrl;

    // 2. Build direct attachment download URL (forces Content-Disposition and audio/mpeg)
    const directDownloadUrl = `${audioUrl}${audioUrl.includes('?') ? '&' : '?'}download=1&name=${encodeURIComponent(cleanName)}`;

    // 3. Priority 1: Native Android Downloader bridge (direct save into Android Downloads folder as .mp3)
    if (window.AndroidNativeDownloader && typeof window.AndroidNativeDownloader.saveMp3 === 'function') {
      try {
        const resp = await fetch(directDownloadUrl);
        if (resp.ok) {
          const blob = await resp.blob();
          const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const saved = window.AndroidNativeDownloader.saveMp3(base64Data, cleanName);
          if (saved) {
            this._showDirectDownloadLink(directDownloadUrl, cleanName);
            return directDownloadUrl;
          }
        }
      } catch (nativeErr) {
        console.warn("Native Android downloader encountered an issue, falling back to web download:", nativeErr);
      }
    }

    // 4. Priority 2: Web Browser Blob Download with explicit audio/mpeg MIME type
    let downloadSuccess = false;
    try {
      const response = await fetch(directDownloadUrl);
      if (response.ok) {
        const rawBlob = await response.blob();
        // CRITICAL: Explicitly declare audio/mpeg so OS/Browser guarantees .mp3 format
        const audioBlob = new Blob([rawBlob], { type: 'audio/mpeg' });
        const blobUrl = window.URL.createObjectURL(audioBlob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = cleanName;
        a.setAttribute('download', cleanName);
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          if (a.parentNode) a.parentNode.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        }, 10000);
        downloadSuccess = true;
      }
    } catch (blobErr) {
      console.warn("Blob download attempt had an issue:", blobErr);
    }

    // 5. Priority 3: Direct anchor click fallback (only if Blob download failed)
    if (!downloadSuccess) {
      try {
        const aLink = document.createElement('a');
        aLink.style.display = 'none';
        aLink.href = directDownloadUrl;
        aLink.setAttribute('download', cleanName);
        aLink.setAttribute('target', '_blank');
        document.body.appendChild(aLink);
        aLink.click();
        setTimeout(() => {
          if (aLink.parentNode) aLink.parentNode.removeChild(aLink);
        }, 3000);
        downloadSuccess = true;
      } catch (aErr) {
        console.warn("Anchor fallback trigger error:", aErr);
      }
    }

    // 6. Confirmation Banner with one-click direct MP3 download button
    this._showDirectDownloadLink(directDownloadUrl, cleanName);

    return directDownloadUrl;
  }

  /**
   * Shows a floating download confirmation pill with a direct clickable link
   */
  _showDirectDownloadLink(downloadUrl, filename) {
    const existing = document.getElementById('vinayaka-download-pill');
    if (existing) existing.remove();

    const pill = document.createElement('div');
    pill.id = 'vinayaka-download-pill';
    pill.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      background: linear-gradient(135deg, #1A1208, #2A1D0D);
      border: 2px solid #FFD54F;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(255,213,79,0.3);
      padding: 12px 18px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: inherit;
      animation: slideInUp 0.3s ease-out;
    `;

    pill.innerHTML = `
      <div style="font-size: 1.4rem;">📥</div>
      <div style="flex: 1;">
        <div style="font-size: 0.85rem; font-weight: 700; color: #FFF;">MP3 ఆడియో సిద్ధమైంది!</div>
        <div style="font-size: 0.72rem; color: #FFD54F; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${filename}</div>
      </div>
      <a href="${downloadUrl}" download="${filename}" type="audio/mpeg" target="_blank" style="
        background: #FF9800;
        color: #000;
        text-decoration: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.78rem;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      ">💾 సేవ్ చేయండి</a>
      <button onclick="this.parentElement.remove()" style="
        background: transparent;
        border: none;
        color: #999;
        font-size: 1rem;
        cursor: pointer;
        padding: 2px;
      ">✕</button>
    `;

    document.body.appendChild(pill);
    setTimeout(() => {
      if (pill.parentNode) pill.remove();
    }, 12000);
  }

  /**
   * Generates announcement script for a donation and downloads strictly as .mp3
   */
  async downloadDonationMp3(donation, options = {}) {
    if (!donation) throw new Error("Donation data is missing");
    const script = this.generateAnnouncementScript(donation);
    const rawDevotee = (donation.name || 'భక్తుడు').trim()
      .replace(/[\/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_');
    const filename = `వినాయక_విరాళం_${rawDevotee || 'భక్తుడు'}.mp3`;
    return await this.downloadMp3(script, filename, options);
  }
}

window.teluguTTS = new TeluguTTSAnnouncer();
