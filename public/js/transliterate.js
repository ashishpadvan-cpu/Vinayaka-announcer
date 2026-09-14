/**
 * English to Telugu Transliteration Engine
 * Converts English phonetic typing into Telugu script (e.g. "vasana" -> "వాసన")
 * Uses Google Indic Transliteration API with built-in comprehensive offline fallback.
 */

class TeluguTransliterationEngine {
  constructor() {
    this.enabled = true;
    this.cache = new Map();
    this.commonWords = {
      // Names & Honorifics
      "shri": "శ్రీ", "sri": "శ్రీ", "shree": "శ్రీ", "shrimati": "శ్రీమతి", "srimathi": "శ్రీమతి",
      "garu": "గారు", "gaaru": "గారు",
      "vasana": "వాసన", "vaasana": "వాసన",
      "srinivasa": "శ్రీనివాస", "srinivas": "శ్రీనివాస్", "sreenivasa": "శ్రీనివాస",
      "rao": "రావు", "raavu": "రావు",
      "ramu": "రాము", "raamu": "రాము",
      "ramesh": "రమేష్", "suresh": "సురేష్", "naidu": "నాయుడు", "reddy": "రెడ్డి", "kumar": "కుమార్",
      "satyanarayana": "సత్యనారాయణ", "lakshmi": "లక్ష్మి", "prasanna": "ప్రసన్న",
      "venkateswara": "వెంకటేశ్వర", "venkateswararao": "వెంకటేశ్వరరావు", "parvathamma": "పార్వతమ్మ",
      "kiran": "కిరణ్", "bandi": "బండి", "kondapalli": "కొండపల్లి", "maddipati": "మద్దిపాటి",
      "potluri": "పొట్లూరి", "akula": "ఆకుల", "chekuri": "చేకూరి", "ganta": "గంటా",
      "chowdary": "చౌదరి", "varma": "వర్మ", "raju": "రాజు", "sharma": "శర్మ", "krishna": "కృష్ణ",

      // Places & Streets
      "gandhi": "గాంధీ", "nagar": "నగర్", "road": "రోడ్", "main": "మెయిన్",
      "veedhi": "వీధి", "vidhi": "వీధి", "street": "స్ట్రీట్", "colony": "కాలనీ",
      "shivaji": "శివాజీ", "ramalayam": "రామాలయం", "shanti": "శాంతి", "subhash": "సుభాష్",
      "vinayaka": "వినాయక", "ganesh": "గణేష్", "bappa": "బప్పా", "morya": "మోరియా",

      // Items & Donations
      "laddu": "లడ్డూ", "ladduu": "లడ్డూ", "ghee": "నెయ్యి", "neyyi": "నెయ్యి",
      "biyyam": "బియ్యం", "basta": "బస్తా", "kg": "కేజీ", "keji": "కేజీ", "kilo": "కిలో", "kilola": "కిలోల",
      "godugu": "గొడుగు", "vendi": "వెండి", "pattu": "పట్టు", "vastralu": "వస్త్రాలు",
      "peethambaralu": "పీతాంబరాలు", "chatram": "ఛత్రం", "puja": "పూజా", "pooja": "పూజా",
      "samagri": "సామగ్రి", "dravyam": "ద్రవ్యం", "dravyalu": "ద్రవ్యాలు",
      "pandlu": "పండ్లు", "puvvulu": "పువ్వులు", "dandalu": "దండలు", "garland": "మాల",
      "annadanam": "అన్నదానం", "annasantharpana": "అన్నసంతర్పణ", "prasadam": "ప్రసాదం",
      "mandapam": "మండపం", "kharchulu": "ఖర్చులు", "nimajjanam": "నిమజ్జనం", "decoration": "డెకరేషన్",
      "lighting": "లైటింగ్", "mike": "మైక్", "sound": "సౌండ్",
      "koraku": "కొరకు", "nimitham": "నిమిత్తం", "nimittam": "నిమిత్తం",
      "samarpana": "సమర్పణ", "samarpincharu": "సమర్పించారు", "samarpinchukunnaru": "సమర్పించుకున్నారు",
      "bhakthudu": "భక్తుడు", "bhakthulu": "భక్తులు", "bhakthi": "భక్తి", "bhakthitho": "భక్తితో",
      "kutumbam": "కుటుంబం", "kutumba": "కుటుంబ", "sabhyulu": "సభ్యులు",
      "hyderabad": "హైదరాబాద్", "vijayawada": "విజయవాడ", "vizag": "వైజాగ్", "visakhapatnam": "విశాఖపట్నం",
      "guntur": "గుంటూరు", "tirupati": "తిరుపతి", "kakinada": "కాకినాడ", "rajahmundry": "రాజమండ్రి",
      "warangal": "వరంగల్", "nellore": "నెల్లూరు", "tenali": "తెనాలి", "ongole": "ఒంగోలు",
      "padaru": "పాడారు", "datha": "దాత", "dathalu": "దాతలు", "ayurarogya": "ఆయురారోగ్య",
      "aiswaryam": "ఐశ్వర్యం", "vardhillalani": "వర్ధిల్లాలని", "bolo": "బోలో",
      "ganapathi": "గణపతి", "maharaj": "మహారాజ్", "ki": "కి", "jai": "జై",
      "nundi": "నుండి", "nunchi": "నుంచి", "lo": "లో", "tho": "తో", "icharu": "ఇచ్చారు", "chesaru": "చేశారు",

      // Numbers & Currencies
      "rupayalu": "రూపాయలు", "rupees": "రూపాయలు", "velu": "వేలు", "vela": "వేల",
      "vandalu": "వందలు", "laksha": "లక్ష", "koti": "కోటి", "nookalu": "నూకలు"
    };

    // Offline Phonetic Map
    this.vowels = {
      "aa": "ఆ", "ee": "ఈ", "oo": "ఊ", "ae": "ఏ", "ai": "ఐ", "au": "ఔ", "ou": "ఔ",
      "a": "అ", "i": "ఇ", "u": "ఉ", "e": "ఎ", "o": "ఒ"
    };

    this.matras = {
      "aa": "ా", "ee": "ీ", "oo": "ూ", "ae": "ే", "ai": "ై", "au": "ౌ", "ou": "ౌ",
      "a": "", "i": "ి", "u": "ు", "e": "ె", "o": "ొ"
    };

    this.consonants = {
      "ksha": "క్ష", "tra": "త్ర", "jna": "జ్ఞ", "shh": "ష్", "sh": "శ్", "ch": "చ్", "jh": "ఝ్",
      "th": "త్", "dh": "ధ్", "ph": "ఫ్", "bh": "భ్", "gh": "ఘ్", "kh": "ఖ్",
      "k": "క్", "g": "గ్", "j": "జ్", "t": "ట్", "d": "ద్", "n": "న్", "p": "ప్",
      "b": "బ్", "m": "మ్", "y": "య్", "r": "ర్", "l": "ల్", "v": "వ్", "w": "వ్", "s": "స్", "h": "హ్"
    };
  }

  /**
   * Transliterates an English word to Telugu
   */
  async transliterateWord(word) {
    const cleanWord = word.toLowerCase().trim();
    if (!cleanWord || !/^[a-z]+$/i.test(cleanWord)) return word;

    // Check memory cache
    if (this.cache.has(cleanWord)) {
      return this.cache.get(cleanWord);
    }

    // Check predefined common Telugu festive words
    if (this.commonWords[cleanWord]) {
      const tel = this.commonWords[cleanWord];
      this.cache.set(cleanWord, tel);
      return tel;
    }

    // Attempt Online Google Indic API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const url = `https://inputtools.google.com/request?text=${encodeURIComponent(cleanWord)}&itc=te-t-i0-und&num=3`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1].length > 0) {
          const topMatch = data[1][0][1][0];
          this.cache.set(cleanWord, topMatch);
          return topMatch;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    // Fallback: Rule-based transliterator
    const fallbackTel = this.offlinePhonetic(cleanWord);
    this.cache.set(cleanWord, fallbackTel);
    return fallbackTel;
  }

  /**
   * Transliterates all English words in a multi-word phrase/sentence into Telugu
   */
  async transliterateSentence(text) {
    if (!text || typeof text !== 'string') return text;
    const parts = text.split(/([a-zA-Z]+)/);
    const converted = await Promise.all(parts.map(async p => {
      if (/^[a-zA-Z]+$/.test(p)) {
        return await this.transliterateWord(p);
      }
      return p;
    }));
    return converted.join('');
  }

  offlinePhonetic(text) {
    // Basic syllabic parser
    let res = "";
    let i = 0;
    while (i < text.length) {
      // Match consonant clusters first
      let matchedCons = null;
      let consLen = 0;
      for (const [eng, tel] of Object.entries(this.consonants)) {
        if (text.startsWith(eng, i)) {
          matchedCons = tel;
          consLen = eng.length;
          break;
        }
      }

      if (matchedCons) {
        i += consLen;
        // Check for attached vowel (matra)
        let matchedMatra = null;
        let matraLen = 0;
        for (const [eng, matra] of Object.entries(this.matras)) {
          if (text.startsWith(eng, i)) {
            matchedMatra = matra;
            matraLen = eng.length;
            break;
          }
        }

        if (matchedMatra !== null) {
          // Remove the virama ('్') from consonant and append matra
          const baseChar = matchedCons.replace(/్$/, '');
          res += baseChar + matchedMatra;
          i += matraLen;
        } else {
          // Default consonant without explicit vowel has inherent 'a' sound
          res += matchedCons.replace(/్$/, '');
        }
      } else {
        // Standalone vowel
        let matchedVowel = null;
        let vowelLen = 0;
        for (const [eng, tel] of Object.entries(this.vowels)) {
          if (text.startsWith(eng, i)) {
            matchedVowel = tel;
            vowelLen = eng.length;
            break;
          }
        }
        if (matchedVowel) {
          res += matchedVowel;
          i += vowelLen;
        } else {
          res += text[i];
          i++;
        }
      }
    }
    return res;
  }

  /**
   * Attaches real-time English-to-Telugu typing to an input or textarea element.
   * Handles Desktop keydown, Mobile virtual keyboard input events, and blur.
   */
  attach(inputElement) {
    if (!inputElement || inputElement._translitAttached) return;
    inputElement._translitAttached = true;

    let isConverting = false;

    // 1. Keydown handler (Desktop & physical keyboards: Space, Enter, Comma)
    inputElement.addEventListener('keydown', async (e) => {
      if (!this.enabled || isConverting) return;

      if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
        const text = inputElement.value;
        const cursorPos = inputElement.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPos);

        const match = textBeforeCursor.match(/([a-zA-Z]+)$/);
        if (match) {
          const engWord = match[1];
          const startIdx = cursorPos - engWord.length;

          e.preventDefault();
          isConverting = true;
          try {
            const telWord = await this.transliterateWord(engWord);
            const delimiter = e.key === 'Enter' ? '\n' : (e.key === ' ' ? ' ' : e.key);
            const newText = text.substring(0, startIdx) + telWord + delimiter + text.substring(cursorPos);
            inputElement.value = newText;
            const newCursorPos = startIdx + telWord.length + delimiter.length;
            inputElement.setSelectionRange(newCursorPos, newCursorPos);
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          } finally {
            isConverting = false;
          }
        }
      }
    });

    // 2. Input event handler (Crucial for Mobile Virtual Keyboards on Android Chrome/WebView)
    inputElement.addEventListener('input', async (e) => {
      if (!this.enabled || isConverting) return;

      const text = inputElement.value;
      const cursorPos = inputElement.selectionStart;
      const textBefore = text.substring(0, cursorPos);

      // Check if user just typed space, comma, or newline following an English word
      const match = textBefore.match(/([a-zA-Z]+)([\s,\n]+)$/);
      if (match) {
        const engWord = match[1];
        const delimiter = match[2];
        const wordStart = cursorPos - engWord.length - delimiter.length;

        isConverting = true;
        try {
          const telWord = await this.transliterateWord(engWord);
          const newText = text.substring(0, wordStart) + telWord + delimiter + text.substring(cursorPos);
          inputElement.value = newText;
          const newPos = wordStart + telWord.length + delimiter.length;
          inputElement.setSelectionRange(newPos, newPos);
          inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        } finally {
          isConverting = false;
        }
      }
    });

    // 3. Blur handler: When leaving input or clicking outside, convert any remaining English word!
    inputElement.addEventListener('blur', async () => {
      if (!this.enabled || isConverting) return;
      const text = inputElement.value;
      if (/[a-zA-Z]/.test(text)) {
        isConverting = true;
        try {
          const converted = await this.transliterateSentence(text);
          if (converted !== text) {
            inputElement.value = converted;
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } finally {
          isConverting = false;
        }
      }
    });
  }
}

window.teluguTransliterate = new TeluguTransliterationEngine();
