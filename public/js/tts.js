/**
 * Telugu Announcement Formatter and TTS Client
 * Converts numbers & donations to natural Telugu pandal microphone scripts
 * and handles Edge-TTS Neural voice generation with Android Native TTS & Web Speech fallbacks.
 */

class TeluguTTSAnnouncer {
  constructor() {
    this.selectedVoice = 'te-IN-MohanNeural'; // Default: Mohan (Male)
    this.rate = '+0%';
    this.pitch = '+0Hz';
    this.currentAudio = null;
    this.isPlaying = false;
    this.templateStyle = 'traditional'; // 'traditional', 'quick', 'celebration'
    this.onStartCallback = null;
    this.onEndCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * Resolves the server base URL for API calls
   */
  getServerBaseUrl() {
    const saved = localStorage.getItem('vinayaka_server_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
    // If not localhost or in web browser connected to computer IP
    if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
    // Default LAN IP detected when building
    return 'http://192.168.0.105:8080';
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

    // Play Temple Bell chime or Shankham first if enabled
    if (options.withShankh && window.pandalAudio) {
      window.pandalAudio.playShankham();
      await new Promise(r => setTimeout(r, 2200));
    } else if (options.withBell && window.pandalAudio) {
      window.pandalAudio.playTempleBell();
      await new Promise(r => setTimeout(r, 1200));
    }

    // Duck background music
    if (window.pandalAudio) {
      window.pandalAudio.duckBGM(true);
    }

    let playedSuccessfully = false;

    // 1. Attempt Server-side Edge Neural TTS
    try {
      const serverUrl = this.getServerBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const res = await fetch(`${serverUrl}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          text: text,
          voice: this.selectedVoice,
          rate: this.rate,
          pitch: this.pitch
        })
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          const fullAudioUrl = data.audioUrl.startsWith('http') ? data.audioUrl : `${serverUrl}${data.audioUrl}`;
          await this.playAudioUrl(fullAudioUrl);
          playedSuccessfully = true;
        }
      }
    } catch (err) {
      console.warn("Neural TTS server unreachable or timed out:", err.message);
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
}

window.teluguTTS = new TeluguTTSAnnouncer();
