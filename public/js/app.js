/**
 * Main Application Orchestrator for Vinayaka Donation Announcer
 * Manages the "Read All" sequential announcement engine, UI bindings,
 * modals, quick-fill buttons, and audio visualizations.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Components
  const store = window.donationStore;
  const tts = window.teluguTTS;
  const audio = window.pandalAudio;

  // State
  let isQueueRunning = false;
  let isQueuePaused = false;
  let queueIndex = -1;
  let activeQueueList = [];
  let queueTimer = null;
  let onlyUnreadQueue = false;
  let pauseDurationSec = 4;
  let editingId = null;

  // DOM Elements
  const playAllBtn = document.getElementById('btn-play-all');
  const pauseAllBtn = document.getElementById('btn-pause-all');
  const stopAllBtn = document.getElementById('btn-stop-all');
  const nextDevoteeBtn = document.getElementById('btn-next-devotee');
  const queueStatusBanner = document.getElementById('queue-status-banner');
  const liveSpeakerName = document.getElementById('live-speaker-name');
  const liveSpeakerText = document.getElementById('live-speaker-text');
  const liveWaveAnim = document.getElementById('live-wave-anim');
  const countdownBadge = document.getElementById('countdown-badge');

  const voiceMohanRadio = document.getElementById('voice-mohan');
  const voiceShrutiRadio = document.getElementById('voice-shruti');
  const rateSlider = document.getElementById('rate-slider');
  const rateValueLabel = document.getElementById('rate-value');
  const echoToggle = document.getElementById('toggle-echo');
  const bellToggle = document.getElementById('toggle-bell');
  const shankhToggle = document.getElementById('toggle-shankh');
  const bgmToggle = document.getElementById('toggle-bgm');
  const templateSelect = document.getElementById('select-template');

  const devoteesList = document.getElementById('devotees-list');
  const searchInput = document.getElementById('search-input');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const onlyUnreadCheck = document.getElementById('check-only-unread');

  // Stats DOM
  const statTotalCash = document.getElementById('stat-total-cash');
  const statTotalDonors = document.getElementById('stat-total-donors');
  const statTotalItems = document.getElementById('stat-total-items');
  const statPendingCount = document.getElementById('stat-pending-count');

  // Modal DOM
  const addModal = document.getElementById('donation-modal');
  const modalTitle = document.getElementById('modal-title');
  const openAddModalBtn = document.getElementById('btn-open-add-modal');
  const closeModalBtn = document.getElementById('btn-close-modal');
  const donationForm = document.getElementById('donation-form');
  const typeRadioMoney = document.getElementById('type-money');
  const typeRadioItem = document.getElementById('type-item');
  const typeRadioBoth = document.getElementById('type-both');
  const moneyGroup = document.getElementById('group-money');
  const itemGroup = document.getElementById('group-item');
  const inputName = document.getElementById('input-name');
  const inputPlace = document.getElementById('input-place');
  const inputAmount = document.getElementById('input-amount');
  const inputItem = document.getElementById('input-item');
  const inputItemQty = document.getElementById('input-item-qty');
  const inputPurpose = document.getElementById('input-purpose');
  const previewScriptBox = document.getElementById('preview-announcement-script');

  // Mobile Connect Modal
  const mobileConnectModal = document.getElementById('mobile-connect-modal');
  const btnOpenMobileConnect = document.getElementById('btn-open-mobile-connect');
  const btnCloseMobileConnect = document.getElementById('btn-close-mobile-connect');
  const mobileIpAddressText = document.getElementById('mobile-ip-address');
  const qrContainer = document.getElementById('qr-code-display');

  const inputServerUrl = document.getElementById('input-server-url');
  const btnSaveServerUrl = document.getElementById('btn-save-server-url');
  const serverStatusPill = document.getElementById('server-status-pill');

  // Multi-Mobile Live Sync DOM
  const headerSyncPill = document.getElementById('header-sync-pill');
  const modalSyncStatus = document.getElementById('modal-sync-status');
  const modalSyncTime = document.getElementById('modal-sync-time');
  const btnManualSyncNow = document.getElementById('btn-manual-sync-now');
  const btnCopySyncUrl = document.getElementById('btn-copy-sync-url');
  const inputSyncCloudUrl = document.getElementById('input-sync-cloud-url');
  const btnSaveCloudUrl = document.getElementById('btn-save-cloud-url');
  const btnExportJsonSync = document.getElementById('btn-export-json-sync');
  const btnShareWhatsappSync = document.getElementById('btn-share-whatsapp-sync');
  const btnTriggerImportJson = document.getElementById('btn-trigger-import-json');
  const inputFileImportJson = document.getElementById('input-file-import-json');
  const remoteSyncToast = document.getElementById('remote-sync-toast');
  const remoteSyncToastText = document.getElementById('remote-sync-toast-text');

  // Bulk Selection & Import State
  const selectedDonorIds = new Set();
  let isSelectModeActive = false;
  let parsedBulkList = [];

  // Bulk Toolbar DOM
  const bulkActionsToolbar = document.getElementById('bulk-actions-toolbar');
  const bulkSelectedCount = document.getElementById('bulk-selected-count');
  const btnOpenBulkImport = document.getElementById('btn-open-bulk-import');
  const btnToggleSelectMode = document.getElementById('btn-toggle-select-mode');
  const btnExportCsv = document.getElementById('btn-export-csv');

  const btnBulkSelectAll = document.getElementById('btn-bulk-select-all');
  const btnBulkMarkRead = document.getElementById('btn-bulk-mark-read');
  const btnBulkMarkUnread = document.getElementById('btn-bulk-mark-unread');
  const btnBulkOpenUpdateModal = document.getElementById('btn-bulk-open-update-modal');
  const btnBulkDelete = document.getElementById('btn-bulk-delete');
  const btnBulkCancel = document.getElementById('btn-bulk-cancel');

  // Bulk Update Modal DOM
  const bulkUpdateModal = document.getElementById('bulk-update-modal');
  const btnCloseBulkUpdate = document.getElementById('btn-close-bulk-update');
  const btnCancelBulkUpdate = document.getElementById('btn-cancel-bulk-update');
  const btnApplyBulkUpdate = document.getElementById('btn-apply-bulk-update');
  const bulkUpdateCountLabel = document.getElementById('bulk-update-count-label');

  const checkBulkStatus = document.getElementById('check-bulk-status');
  const groupBulkStatus = document.getElementById('group-bulk-status');
  const selectBulkStatus = document.getElementById('select-bulk-status');

  const checkBulkPurpose = document.getElementById('check-bulk-purpose');
  const groupBulkPurpose = document.getElementById('group-bulk-purpose');
  const inputBulkPurpose = document.getElementById('input-bulk-purpose');

  const checkBulkPlace = document.getElementById('check-bulk-place');
  const groupBulkPlace = document.getElementById('group-bulk-place');
  const inputBulkPlace = document.getElementById('input-bulk-place');

  const checkBulkAmount = document.getElementById('check-bulk-amount');
  const groupBulkAmount = document.getElementById('group-bulk-amount');
  const inputBulkAmount = document.getElementById('input-bulk-amount');

  const checkBulkMatter = document.getElementById('check-bulk-matter');
  const groupBulkMatter = document.getElementById('group-bulk-matter');
  const inputBulkMatter = document.getElementById('input-bulk-matter');
  const bulkImportBatchMatter = document.getElementById('bulk-import-batch-matter');

  // Bulk Import Modal DOM
  const bulkImportModal = document.getElementById('bulk-import-modal');
  const btnCloseBulkImport = document.getElementById('btn-close-bulk-import');
  const btnCancelBulkImport = document.getElementById('btn-cancel-bulk-import');
  const btnFillSampleBulk = document.getElementById('btn-fill-sample-bulk');
  const btnParseBulk = document.getElementById('btn-parse-bulk');
  const btnSaveBulkImport = document.getElementById('btn-save-bulk-import');
  const bulkImportText = document.getElementById('bulk-import-text');
  const checkBulkTranslitAuto = document.getElementById('check-bulk-translit-auto');
  const bulkPreviewSection = document.getElementById('bulk-preview-section');
  const bulkParsedCount = document.getElementById('bulk-parsed-count');
  const bulkParsedTbody = document.getElementById('bulk-parsed-tbody');
  const bulkSaveCount = document.getElementById('bulk-save-count');

  // Initialize Server URL
  if (inputServerUrl) {
    inputServerUrl.value = tts.getServerBaseUrl();

    btnSaveServerUrl?.addEventListener('click', async () => {
      const val = inputServerUrl.value.trim();
      if (val) {
        localStorage.setItem('vinayaka_server_url', val);
        if (serverStatusPill) {
          serverStatusPill.textContent = 'తనిఖీ చేస్తోంది...';
          serverStatusPill.style.color = '#FFB300';
        }
        try {
          const res = await fetch(`${val}/api/voices`);
          if (res.ok) {
            serverStatusPill.textContent = 'కనెక్ట్ అయింది ✓';
            serverStatusPill.style.color = '#00E676';
            store.load();
          } else {
            throw new Error('Not ok');
          }
        } catch (e) {
          serverStatusPill.textContent = 'ఆఫ్‌లైన్ (Native TTS)';
          serverStatusPill.style.color = '#FF9100';
        }
      }
    });
  }

  // 1. Setup Voice & Audio Controls
  const personaRadios = document.querySelectorAll('input[name="voiceSelect"]');
  const activePersonaBadge = document.getElementById('active-persona-badge');
  const toggleCelebrityDialogues = document.getElementById('toggle-celebrity-dialogues');
  const celebControlBox = document.getElementById('celeb-clip-control-box');
  const celebClipBadge = document.getElementById('celeb-clip-badge');
  const celebClipQuote = document.getElementById('celeb-clip-quote');
  const btnPlayCelebClip = document.getElementById('btn-play-celeb-clip');
  const btnUploadCelebClip = document.getElementById('btn-upload-celeb-clip');
  const btnResetCelebClip = document.getElementById('btn-reset-celeb-clip');
  const inputCelebFile = document.getElementById('input-celeb-file');

  const CELEB_INFOS = {
    'balayya': {
      badge: '🦁 బాలయ్య మాస్ డైలాగ్',
      quote: '"జై బాలయ్య! దెబ్బకు దయ్యం వదలాలి... మైక్ మోత మోగిపోవాలి! ఫ్లూట్ జింక ముందు ఊదు... సింహం ముందు కాదు! జై బాలయ్య!"'
    },
    'baahubali': {
      badge: '👑 బాహుబలి రాయల్ డైలాగ్',
      quote: '"శ్రీ వినాయక మహారాజ్ దివ్య సమక్షంలో... అమరేంద్ర బాహుబలి అను నేను... స్వామివారి భక్తులకు సర్వదా శుభం కలగాలని ఆకాంక్షిస్తున్నాను! జై గణపతి దేవా!"'
    },
    'pawankalyan': {
      badge: '⚡ పవన్ కళ్యాణ్ పవర్ పంచ్',
      quote: '"భక్తజనులందరికీ నా హృదయపూర్వక నమస్కారాలు! మనం చేసే ప్రతి మంచి సంకల్పంలో వినాయక స్వామి వారి ఆశీస్సులు ఉంటాయి... జై హింద్! బోలో గణపతి బప్పా మోరియా!"'
    },
    'chiranjeevi': {
      badge: '🌟 మెగాస్టార్ చిరంజీవి డైలాగ్',
      quote: '"నమస్తే అండీ... మీ చిరంజీవిని. మన వినాయక చవితి పందిరిలో... మీ కుటుంబాలన్నీ ఆయురారోగ్య ఐశ్వర్యాలతో సదా సంతోషంగా వర్ధిల్లాలని మనసారా కోరుకుంటున్నాను. గణపతి మహారాజ్ కి జై!"'
    },
    'brahmanandam': {
      badge: '🎭 బ్రహ్మానందం కామెడీ డైలాగ్',
      quote: '"ఆహా... ఏమి భక్తి! ఏమి చందా! నేనండి మీ ఖాన్ దాదా... కాదు కాదు, మన వినాయక భక్తుడుని! ఆనందో బ్రహ్మ! బోలో గణపతి బప్పా మోరియా!"'
    }
  };

  // Voice Cloning DOM Elements
  const celebCloneStatusPill = document.getElementById('celeb-clone-status-pill');
  const btnTriggerVoiceClone = document.getElementById('btn-trigger-voice-clone');
  const btnTriggerCloneText = document.getElementById('btn-trigger-clone-text');
  const btnTestClonedAudio = document.getElementById('btn-test-cloned-audio');
  const btnDeleteCurrentClone = document.getElementById('btn-delete-current-clone');
  const toggleUseVoiceClone = document.getElementById('toggle-use-voice-clone');
  const btnOpenVoiceCloning = document.getElementById('btn-open-voice-cloning');
  const btnOpenCloneSettingsLink = document.getElementById('btn-open-clone-settings-link');
  const voiceCloningModal = document.getElementById('voice-cloning-modal');
  const btnCloseVoiceCloning = document.getElementById('btn-close-voice-cloning');
  const btnCloseVoiceCloningFooter = document.getElementById('btn-close-voice-cloning-footer');
  const cloneConnIndicator = document.getElementById('clone-conn-indicator');
  const cloneConnText = document.getElementById('clone-conn-text');
  const cloneTierPill = document.getElementById('clone-tier-pill');
  const cloneQuotaDisplay = document.getElementById('clone-quota-display');
  const cloneQuotaNumbers = document.getElementById('clone-quota-numbers');
  const cloneQuotaBar = document.getElementById('clone-quota-bar');
  const inputElevenlabsKey = document.getElementById('input-elevenlabs-key');
  const btnSaveElevenlabsKey = document.getElementById('btn-save-elevenlabs-key');
  const btnClearElevenlabsKey = document.getElementById('btn-clear-elevenlabs-key');
  const modalClonedVoicesList = document.getElementById('modal-cloned-voices-list');
  const cloneTestTextarea = document.getElementById('clone-test-textarea');
  const cloneTestCelebSelect = document.getElementById('clone-test-celeb-select');
  const btnPreviewCloneSpeech = document.getElementById('btn-preview-clone-speech');
  const btnDownloadCloneSample = document.getElementById('btn-download-clone-sample');

  // Hidden file input for uploading MP3 to clone voice
  let inputCloneFile = document.getElementById('input-clone-file');
  if (!inputCloneFile) {
    inputCloneFile = document.createElement('input');
    inputCloneFile.type = 'file';
    inputCloneFile.id = 'input-clone-file';
    inputCloneFile.accept = 'audio/*';
    inputCloneFile.style.display = 'none';
    document.body.appendChild(inputCloneFile);
  }

  function updateMainVoicePersona(personaKey) {
    const isCeleb = (personaKey !== 'mohan' && personaKey !== 'shruti');
    const includeClips = isCeleb ? (toggleCelebrityDialogues ? toggleCelebrityDialogues.checked : true) : false;
    const persona = tts.setPersona(personaKey, includeClips);
    if (persona && activePersonaBadge) {
      activePersonaBadge.textContent = persona.name;
    }
    // Update rate slider to match persona
    if (persona && rateSlider && rateValueLabel) {
      const rateVal = parseInt(persona.rate) || 0;
      rateSlider.value = rateVal;
      rateValueLabel.textContent = (rateVal >= 0 ? '+' : '') + rateVal + '%';
    }

    if (celebControlBox) {
      if (isCeleb) {
        celebControlBox.style.display = 'block';
        const info = CELEB_INFOS[personaKey] || { badge: persona.name, quote: persona.intro || '' };
        if (celebClipBadge) celebClipBadge.textContent = info.badge;
        if (celebClipQuote) celebClipQuote.textContent = info.quote;

        // Update Voice Cloning UI status
        updateCelebCloneUIStatus(personaKey);
      } else {
        celebControlBox.style.display = 'none';
      }
    }
  }

  function updateCelebCloneUIStatus(personaKey) {
    if (!celebCloneStatusPill) return;
    const isCloned = tts.isCelebrityCloned(personaKey);
    const hasKey = tts.hasVoiceCloningApiKey;

    if (isCloned) {
      celebCloneStatusPill.className = 'clone-status-pill active';
      celebCloneStatusPill.textContent = '✨ AI వాయిస్ క్లోన్ యాక్టివ్!';
      if (btnTriggerCloneText) btnTriggerCloneText.textContent = '🔄 కొత్త MP3తో రీ-క్లోన్ చేయండి';
      if (btnTestClonedAudio) btnTestClonedAudio.style.display = 'inline-flex';
      if (btnDeleteCurrentClone) btnDeleteCurrentClone.style.display = 'inline-flex';
    } else if (hasKey) {
      celebCloneStatusPill.className = 'clone-status-pill unconfigured';
      celebCloneStatusPill.textContent = '⚪ AI క్లోన్ చేయలేదు';
      if (btnTriggerCloneText) btnTriggerCloneText.textContent = '🧬 ఈ MP3 నుండి AI వాయిస్ క్లోన్ చేయండి';
      if (btnTestClonedAudio) btnTestClonedAudio.style.display = 'none';
      if (btnDeleteCurrentClone) btnDeleteCurrentClone.style.display = 'none';
    } else {
      celebCloneStatusPill.className = 'clone-status-pill unconfigured';
      celebCloneStatusPill.textContent = '🔑 ElevenLabs API కీ అవసరం';
      if (btnTriggerCloneText) btnTriggerCloneText.textContent = '🧬 AI వాయిస్ క్లోనింగ్ సెటప్ చేయండి';
      if (btnTestClonedAudio) btnTestClonedAudio.style.display = 'none';
      if (btnDeleteCurrentClone) btnDeleteCurrentClone.style.display = 'none';
    }
  }

  personaRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        updateMainVoicePersona(radio.value);
      }
    });
  });

  if (toggleCelebrityDialogues) {
    toggleCelebrityDialogues.checked = tts.includeCelebrityDialogues;
  }

  toggleCelebrityDialogues?.addEventListener('change', (e) => {
    tts.includeCelebrityDialogues = e.target.checked;
    localStorage.setItem('vinayaka_include_celeb_dialogues', e.target.checked ? 'true' : 'false');
  });

  toggleUseVoiceClone?.addEventListener('change', (e) => {
    tts.useVoiceClone = e.target.checked;
  });

  // Authentic celebrity clip playback and custom upload
  let isCelebClipPlaying = false;
  btnPlayCelebClip?.addEventListener('click', async () => {
    if (isCelebClipPlaying) {
      tts.stop();
      isCelebClipPlaying = false;
      btnPlayCelebClip.querySelector('span:last-child').textContent = 'డైలాగ్ వినండి (Play)';
      btnPlayCelebClip.querySelector('.btn-icon').textContent = '▶️';
      return;
    }

    try {
      isCelebClipPlaying = true;
      btnPlayCelebClip.querySelector('span:last-child').textContent = 'ఆగు (Stop)';
      btnPlayCelebClip.querySelector('.btn-icon').textContent = '⏹️';

      await tts.playCelebrityClip(tts.selectedPersona);
    } catch (e) {
      console.warn("Celebrity clip play error:", e);
    } finally {
      isCelebClipPlaying = false;
      btnPlayCelebClip.querySelector('span:last-child').textContent = 'డైలాగ్ వినండి (Play)';
      btnPlayCelebClip.querySelector('.btn-icon').textContent = '▶️';
    }
  });

  btnUploadCelebClip?.addEventListener('click', () => {
    inputCelebFile?.click();
  });

  inputCelebFile?.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const labelSpan = btnUploadCelebClip?.querySelector('span:last-child') || btnUploadCelebClip;
    const iconSpan = btnUploadCelebClip?.querySelector('.btn-icon');

    try {
      if (btnUploadCelebClip) {
        btnUploadCelebClip.disabled = true;
        btnUploadCelebClip.style.opacity = '0.7';
      }
      if (iconSpan) iconSpan.textContent = '⏳';
      if (labelSpan) labelSpan.textContent = 'అప్‌లోడ్ అవుతోంది...';

      await tts.uploadCelebrityClip(tts.selectedPersona, file);
      showToastNotification(`✅ ${file.name} విజయవంతంగా అప్‌లోడ్ చేయబడింది! మీ సెలబ్రిటీ వాయిస్ అప్‌డేట్ అయింది.`);
      // Preview the newly uploaded clip
      tts.playCelebrityClip(tts.selectedPersona);

      // Offer to clone if ElevenLabs API key is connected
      if (tts.hasVoiceCloningApiKey) {
        if (confirm(`ఈ అప్‌లోడ్ చేసిన MP3 నుండి ${tts.selectedPersona} స్వరాన్ని ElevenLabs AI లో క్లోన్ చేయమంటారా? (ఇకపై భక్తుల పేర్లు అన్నీ ఈ స్వరంలోనే చదువుతుంది)`)) {
          startVoiceCloneFlow(tts.selectedPersona, file);
        }
      }
    } catch (err) {
      console.error("Celebrity clip upload error:", err);
      alert(`అప్‌లోడ్ లోపం: ${err.message}`);
    } finally {
      if (btnUploadCelebClip) {
        btnUploadCelebClip.disabled = false;
        btnUploadCelebClip.style.opacity = '1';
      }
      if (iconSpan) iconSpan.textContent = '📁';
      if (labelSpan) labelSpan.textContent = 'రియల్ MP3 అప్‌లోడ్ చేయండి';
      inputCelebFile.value = '';
    }
  });

  btnResetCelebClip?.addEventListener('click', async () => {
    if (!confirm('ఈ సెలబ్రిటీకి ఒరిజినల్ డిఫాల్ట్ ఆడియోని పునరుద్ధరించాలా? (Reset default audio?)')) return;
    try {
      await tts.resetCelebrityClip(tts.selectedPersona);
      showToastNotification('డిఫాల్ట్ ఆడియో పునరుద్ధరించబడింది!');
      tts.playCelebrityClip(tts.selectedPersona);
    } catch (err) {
      alert(`రీసెట్ లోపం: ${err.message}`);
    }
  });

  // Voice Cloning Action Handlers
  async function startVoiceCloneFlow(celebId, file = null) {
    if (!tts.hasVoiceCloningApiKey) {
      openVoiceCloningModal();
      showToastNotification("ℹ️ దయచేసి ముందుగా మీ ఉచిత ElevenLabs API Key ని నమోదు చేయండి.");
      inputElevenlabsKey?.focus();
      return;
    }

    if (!file) {
      // Prompt user: use current server file or choose a new file
      const chooseNew = confirm(`మీ ఫోన్/కంప్యూటర్ నుండి కొత్త MP3 ఎంచుకోవాలా?\n(రద్దు చేస్తే సర్వర్‌లో ఇప్పటికే ఉన్న MP3 నుండి క్లోన్ చేస్తుంది)`);
      if (chooseNew) {
        inputCloneFile.onchange = async (ev) => {
          const selectedFile = ev.target.files && ev.target.files[0];
          if (selectedFile) {
            await executeVoiceCloning(celebId, selectedFile);
          }
          inputCloneFile.value = '';
        };
        inputCloneFile.click();
        return;
      }
    }

    await executeVoiceCloning(celebId, file);
  }

  async function executeVoiceCloning(celebId, file = null) {
    const origText = btnTriggerCloneText ? btnTriggerCloneText.textContent : '';
    try {
      if (btnTriggerVoiceClone) {
        btnTriggerVoiceClone.disabled = true;
        btnTriggerVoiceClone.style.opacity = '0.75';
      }
      if (btnTriggerCloneText) {
        btnTriggerCloneText.textContent = '⏳ AI వాయిస్ క్లోన్ అవుతోంది (10-25 సెకన్లు)...';
      }
      showToastNotification("🧬 ElevenLabs AI ద్వారా వాయిస్ మోడల్ సిద్ధమవుతోంది... దయచేసి వేచి ఉండండి.");

      const info = CELEB_INFOS[celebId];
      const celebName = info ? info.badge : `Celebrity ${celebId}`;
      await tts.cloneCelebrityVoice(celebId, file, celebName);

      showToastNotification(`🎉 అద్భుతం! ${celebName} వాయిస్ విజయవంతంగా క్లోన్ చేయబడింది! ఇకపై భక్తుల ప్రకటనలు మొత్తం ఈ స్వరంలోనే చదువుతుంది!`);
      updateCelebCloneUIStatus(celebId);
      refreshVoiceCloningModalList();

      // Automatically test the newly cloned voice with a celebratory sample
      const sampleText = `శ్రీ వినాయక మహారాజ్ దివ్య సమక్షంలో... రామయ్య గారి కుమారుడు రమేష్ గారు 5,116 రూపాయలు విరాళం సమర్పించారు. గణపతి బప్పా మోరియా!`;
      await tts.speak(sampleText, { useClone: true, celebId: celebId });
    } catch (err) {
      console.error("executeVoiceCloning error:", err);
      alert(`వాయిస్ క్లోనింగ్ గమనిక:\n\n${err.message}`);
      showToastNotification(`⚠️ ${err.message}`);
    } finally {
      if (btnTriggerVoiceClone) {
        btnTriggerVoiceClone.disabled = false;
        btnTriggerVoiceClone.style.opacity = '1';
      }
      updateCelebCloneUIStatus(celebId);
    }
  }

  btnTriggerVoiceClone?.addEventListener('click', () => {
    startVoiceCloneFlow(tts.selectedPersona);
  });

  btnTestClonedAudio?.addEventListener('click', async () => {
    try {
      const sampleText = `శ్రీ వినాయక మహారాజ్ దివ్య సమక్షంలో... రామయ్య గారి కుమారుడు రమేష్ గారు 5,116 రూపాయలు విరాళం సమర్పించారు. గణపతి బప్పా మోరియా!`;
      showToastNotification("🔊 అసలైన సెలబ్రిటీ డైలాగ్ + తెలుగు AI విరాళం ప్రకటన ప్లే అవుతోంది...");
      await tts.speak(sampleText, {
        useClone: true,
        celebId: tts.selectedPersona,
        celebIntro: tts.includeCelebrityDialogues ? tts.selectedPersona : null
      });
    } catch (err) {
      alert(`టెస్ట్ ఆడియో లోపం: ${err.message}`);
    }
  });

  btnDeleteCurrentClone?.addEventListener('click', async () => {
    if (!confirm(`ఈ సెలబ్రిటీ (${tts.selectedPersona}) క్లోన్ చేసిన AI వాయిస్‌ను తొలగించాలా?`)) return;
    try {
      await tts.deleteClonedVoice(tts.selectedPersona);
      showToastNotification("క్లోన్ వాయిస్ తొలగించబడింది.");
      updateCelebCloneUIStatus(tts.selectedPersona);
      refreshVoiceCloningModalList();
    } catch (err) {
      alert(`డిలీట్ లోపం: ${err.message}`);
    }
  });

  // Modal open / close handlers
  function openVoiceCloningModal() {
    if (voiceCloningModal) {
      voiceCloningModal.classList.add('active');
      refreshVoiceCloningModalState();
    }
  }

  function closeVoiceCloningModal() {
    if (voiceCloningModal) {
      voiceCloningModal.classList.remove('active');
    }
  }

  btnOpenVoiceCloning?.addEventListener('click', openVoiceCloningModal);
  btnOpenCloneSettingsLink?.addEventListener('click', openVoiceCloningModal);
  btnCloseVoiceCloning?.addEventListener('click', closeVoiceCloningModal);
  btnCloseVoiceCloningFooter?.addEventListener('click', closeVoiceCloningModal);
  voiceCloningModal?.addEventListener('click', (e) => {
    if (e.target === voiceCloningModal) closeVoiceCloningModal();
  });

  async function refreshVoiceCloningModalState() {
    const config = await tts.fetchVoiceCloningConfig();
    const hasKey = Boolean(config && config.hasApiKey);
    const sub = config ? config.subscription : null;

    if (hasKey) {
      if (cloneConnIndicator) cloneConnIndicator.className = 'conn-dot-online';
      if (cloneConnText) {
        cloneConnText.textContent = 'ElevenLabs AI కనెక్ట్ అయింది ✓';
        cloneConnText.style.color = '#00E676';
      }
      if (btnClearElevenlabsKey) btnClearElevenlabsKey.style.display = 'inline-block';
      if (inputElevenlabsKey && config.maskedKey) {
        inputElevenlabsKey.value = config.maskedKey;
      }
      if (sub && cloneTierPill) {
        cloneTierPill.style.display = 'inline-block';
        cloneTierPill.textContent = (sub.tier || 'Free') + ' Tier';
      }
      if (sub && cloneQuotaDisplay) {
        cloneQuotaDisplay.style.display = 'block';
        const limit = sub.character_limit || 10000;
        const used = sub.character_count || 0;
        const remaining = Math.max(0, limit - used);
        const pct = Math.max(0, Math.min(100, (remaining / limit) * 100));
        if (cloneQuotaNumbers) {
          cloneQuotaNumbers.textContent = `${remaining.toLocaleString()} / ${limit.toLocaleString()} అక్షరాలు మిగిలి ఉన్నాయి`;
        }
        if (cloneQuotaBar) {
          cloneQuotaBar.style.width = `${pct}%`;
        }
      }
    } else {
      if (cloneConnIndicator) cloneConnIndicator.className = 'conn-dot-offline';
      if (cloneConnText) {
        cloneConnText.textContent = 'ElevenLabs AI కనెక్ట్ కాలేదు';
        cloneConnText.style.color = 'var(--color-text-main)';
      }
      if (btnClearElevenlabsKey) btnClearElevenlabsKey.style.display = 'none';
      if (cloneTierPill) cloneTierPill.style.display = 'none';
      if (cloneQuotaDisplay) cloneQuotaDisplay.style.display = 'none';
    }

    refreshVoiceCloningModalList();
  }

  function refreshVoiceCloningModalList() {
    if (!modalClonedVoicesList) return;
    modalClonedVoicesList.innerHTML = '';

    const celebList = [
      { id: 'balayya', name: '🦁 బాలయ్య మాస్ (Balakrishna)', badge: 'మాస్ పంచ్ స్టైల్' },
      { id: 'baahubali', name: '👑 బాహుబలి ప్రభాస్ (Prabhas)', badge: 'రాయల్ బేస్ స్వరం' },
      { id: 'pawankalyan', name: '⚡ పవన్ కళ్యాణ్ (Pawan Kalyan)', badge: 'పవర్ పంచ్ స్పీచ్' },
      { id: 'chiranjeevi', name: '🌟 మెగాస్టార్ చిరంజీవి (Chiranjeevi)', badge: 'రాయల్ బారిటోన్' },
      { id: 'brahmanandam', name: '🎭 బ్రహ్మానందం (Brahmanandam)', badge: 'కామెడీ కింగ్' }
    ];

    celebList.forEach(c => {
      const isCloned = tts.isCelebrityCloned(c.id);
      const row = document.createElement('div');
      row.className = `cloned-voice-row ${isCloned ? 'active-clone' : ''}`;
      row.innerHTML = `
        <div class="cloned-voice-info">
          <div>
            <div class="cloned-voice-name">${c.name}</div>
            <div style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 2px;">
              ${isCloned ? '<span style="color: #00E676; font-weight: 700;">✨ AI క్లోన్ రెడీ (చదివే టెక్స్ట్ ఈ స్వరంలో వస్తుంది)</span>' : '⚪ AI క్లోన్ చేయలేదు (Edge TTS మోహన్ వాడుతుంది)'}
            </div>
          </div>
        </div>
        <div class="cloned-voice-actions">
          ${isCloned ? `
            <button type="button" class="btn-xs-gold btn-test-modal-clone" data-id="${c.id}" title="ఈ క్లోన్ స్వరంతో శాంపిల్ వినండి">
              ▶️ టెస్ట్
            </button>
            <button type="button" class="btn-celeb-action clone-hero btn-reclone-modal" data-id="${c.id}" style="padding: 4px 10px; font-size: 0.72rem;" title="కొత్త MP3 తో రీ-క్లోన్ చేయండి">
              🔄 రీ-క్లోన్
            </button>
            <button type="button" class="btn-celeb-action delete-clone btn-del-modal-clone" data-id="${c.id}" style="padding: 4px 8px; font-size: 0.72rem;" title="ఈ క్లోన్ తొలగించండి">
              🗑️
            </button>
          ` : `
            <button type="button" class="btn-celeb-action clone-hero btn-clone-modal-voice" data-id="${c.id}" style="padding: 5px 12px; font-size: 0.74rem;" title="MP3 తో వాయిస్ క్లోన్ చేయండి">
              🧬 క్లోన్ చేయండి
            </button>
          `}
        </div>
      `;
      modalClonedVoicesList.appendChild(row);
    });

    // Wire action buttons inside modal
    modalClonedVoicesList.querySelectorAll('.btn-clone-modal-voice, .btn-reclone-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        startVoiceCloneFlow(id);
      });
    });

    modalClonedVoicesList.querySelectorAll('.btn-test-modal-clone').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const sampleText = `శ్రీ వినాయక మహారాజ్ దివ్య సమక్షంలో... రామయ్య గారి కుమారుడు రమేష్ గారు 5,116 రూపాయలు విరాళం సమర్పించారు. గణపతి బప్పా మోరియా!`;
        showToastNotification(`🔊 ${id} క్లోన్ చేసిన స్వరంతో విరాళం ప్రకటన ప్లే అవుతోంది...`);
        await tts.speak(sampleText, { useClone: true, celebId: id });
      });
    });

    modalClonedVoicesList.querySelectorAll('.btn-del-modal-clone').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm(`ఈ సెలబ్రిటీ (${id}) క్లోన్ AI వాయిస్‌ను తొలగించాలా?`)) return;
        try {
          await tts.deleteClonedVoice(id);
          showToastNotification("క్లోన్ వాయిస్ తొలగించబడింది.");
          refreshVoiceCloningModalList();
          updateCelebCloneUIStatus(tts.selectedPersona);
        } catch (err) {
          alert(`డిలీట్ లోపం: ${err.message}`);
        }
      });
    });
  }

  // Save ElevenLabs API Key
  btnSaveElevenlabsKey?.addEventListener('click', async () => {
    const key = (inputElevenlabsKey?.value || '').trim();
    if (!key) {
      alert("దయచేసి మీ ElevenLabs API Key ని నమోదు చేయండి.");
      return;
    }

    try {
      btnSaveElevenlabsKey.disabled = true;
      btnSaveElevenlabsKey.textContent = 'ధృవీకరిస్తోంది...';
      const res = await tts.saveVoiceCloningApiKey(key);
      showToastNotification(`✅ ElevenLabs API కీ విజయవంతంగా కనెక్ట్ అయింది! (${res.tier || 'Free'} Tier)`);
      await refreshVoiceCloningModalState();
      updateCelebCloneUIStatus(tts.selectedPersona);
    } catch (err) {
      alert(`API Key ధృవీకరణ విఫలమైంది: ${err.message}`);
    } finally {
      btnSaveElevenlabsKey.disabled = false;
      btnSaveElevenlabsKey.textContent = '💾 కనెక్ట్ చేయండి';
    }
  });

  // Clear ElevenLabs API Key
  btnClearElevenlabsKey?.addEventListener('click', async () => {
    if (!confirm("ElevenLabs API Key ని తొలగించి డిస్‌కనెక్ట్ చేయాలా?")) return;
    try {
      await tts.saveVoiceCloningApiKey('');
      if (inputElevenlabsKey) inputElevenlabsKey.value = '';
      showToastNotification("ElevenLabs API కీ తొలగించబడింది.");
      await refreshVoiceCloningModalState();
      updateCelebCloneUIStatus(tts.selectedPersona);
    } catch (err) {
      alert(`లోపం: ${err.message}`);
    }
  });

  // Modal Voice Synthesizer Preview & Download
  btnPreviewCloneSpeech?.addEventListener('click', async () => {
    const text = (cloneTestTextarea?.value || '').trim();
    const celebId = cloneTestCelebSelect?.value || 'balayya';
    if (!text) {
      alert("టెక్స్ట్ నమోదు చేయండి.");
      return;
    }
    try {
      showToastNotification(`🔊 ${celebId} స్వరంలో ప్లే అవుతోంది...`);
      await tts.speak(text, { useClone: true, celebId: celebId });
    } catch (err) {
      alert(`ప్లే లోపం: ${err.message}`);
    }
  });

  btnDownloadCloneSample?.addEventListener('click', async () => {
    const text = (cloneTestTextarea?.value || '').trim();
    const celebId = cloneTestCelebSelect?.value || 'balayya';
    if (!text) {
      alert("టెక్స్ట్ నమోదు చేయండి.");
      return;
    }
    try {
      showToastNotification(`⏳ MP3 ఆడియో సిద్ధమవుతోంది...`);
      await tts.downloadMp3(text, `వినాయక_శాంపిల్_${celebId}.mp3`, { useClone: true, celebId: celebId });
      showToastNotification("✅ MP3 విజయవంతంగా డౌన్‌లోడ్ చేయబడింది!");
    } catch (err) {
      alert(`డౌన్‌లోడ్ లోపం: ${err.message}`);
    }
  });

  // Also fetch initial voice cloning config on page load
  tts.fetchVoiceCloningConfig().then(() => {
    updateCelebCloneUIStatus(tts.selectedPersona);
  });

  rateSlider.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    const sign = val >= 0 ? '+' : '';
    tts.rate = `${sign}${val}%`;
    rateValueLabel.textContent = `${sign}${val}%`;
  });

  echoToggle.addEventListener('change', (e) => {
    audio.echoEnabled = e.target.checked;
  });

  bellToggle.addEventListener('change', (e) => {
    audio.bellEnabled = e.target.checked;
  });

  shankhToggle.addEventListener('change', (e) => {
    audio.shankhEnabled = e.target.checked;
  });

  bgmToggle.addEventListener('change', (e) => {
    audio.bgmEnabled = e.target.checked;
    if (e.target.checked) {
      audio.startDevotionalBGM();
    } else {
      audio.stopDevotionalBGM();
    }
  });

  templateSelect.addEventListener('change', (e) => {
    tts.templateStyle = e.target.value;
    updateModalPreview();
  });

  document.getElementById('btn-test-bell')?.addEventListener('click', () => {
    audio.playTempleBell();
  });

  document.getElementById('btn-test-shankh')?.addEventListener('click', () => {
    audio.playShankham();
  });

  document.getElementById('btn-test-voice')?.addEventListener('click', async () => {
    const sampleText = "శ్రీ వినాయక స్వామి వారి భక్తులందరికీ నమస్కారం. బోలో గణపతి బప్పా మోరియా!";
    await tts.speak(sampleText, { withBell: audio.bellEnabled, withShankh: audio.shankhEnabled });
  });

  // 2. Setup TTS Callbacks for Live Visualizer
  tts.onStartCallback = (text) => {
    liveWaveAnim.classList.add('speaking');
    liveSpeakerText.textContent = text;
  };

  tts.onEndCallback = () => {
    liveWaveAnim.classList.remove('speaking');
  };

  // 3. Render Donation List & Stats
  store.subscribe(({ stats, donations }) => {
    // Update stats
    statTotalCash.textContent = `₹${stats.totalCash.toLocaleString('en-IN')}`;
    statTotalDonors.textContent = stats.totalDonors;
    statTotalItems.textContent = stats.totalItems;
    statPendingCount.textContent = stats.pendingCount;

    // Render cards
    renderDevoteeCards(donations);
  });

  function renderDevoteeCards(donations) {
    if (donations.length === 0) {
      devoteesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🕉️</div>
          <h3>విరాళాలు ఏవీ కనుగొనబడలేదు</h3>
          <p>కొత్త విరాళాన్ని నమోదు చేయడానికి క్రింది బటన్ నొక్కండి.</p>
        </div>
      `;
      updateBulkSelectionUI();
      return;
    }

    devoteesList.innerHTML = donations.map((d, index) => {
      let badgeClass = 'badge-money';
      let badgeLabel = 'నగదు విరాళం';
      let donationHighlight = `₹${Number(d.amount).toLocaleString('en-IN')}`;

      if (d.type === 'item') {
        badgeClass = 'badge-item';
        badgeLabel = 'వస్తు రూప విరాళం';
        donationHighlight = `${d.item} ${d.itemQty ? '(' + d.itemQty + ')' : ''}`;
      } else if (d.type === 'both') {
        badgeClass = 'badge-both';
        badgeLabel = 'నగదు + వస్తువు';
        donationHighlight = `₹${Number(d.amount).toLocaleString('en-IN')} + ${d.item}`;
      }

      const isCurrentActive = isQueueRunning && activeQueueList[queueIndex]?.id === d.id;
      const isSelected = selectedDonorIds.has(d.id);

      return `
        <div class="donation-card ${d.isRead ? 'is-read' : ''} ${isCurrentActive ? 'now-speaking-card' : ''} ${isSelected ? 'card-selected' : ''}" id="card-${d.id}" data-id="${d.id}">
          <div class="card-header">
            <div class="donor-profile">
              <input type="checkbox" class="donor-card-checkbox" data-id="${d.id}" ${isSelected ? 'checked' : ''} title="ఎంచుకోండి">
              <div class="donor-avatar">${index + 1}</div>
              <div class="donor-info">
                <h4 class="donor-name">${escapeHtml(d.name)}</h4>
                <div class="donor-subtext">
                  ${d.place ? `<span class="donor-place">📍 ${escapeHtml(d.place)}</span>` : ''}
                  ${d.gothram ? `<span class="donor-gothram">గోత్రం: ${escapeHtml(d.gothram)}</span>` : ''}
                </div>
              </div>
            </div>
            <span class="donation-badge ${badgeClass}">${badgeLabel}</span>
          </div>

          <div class="donation-body">
            <div class="donation-details">
              <span class="detail-amount">${escapeHtml(donationHighlight)}</span>
              ${d.purpose ? `<span class="detail-purpose">నిమిత్తం: ${escapeHtml(d.purpose)}</span>` : ''}
              ${d.customScript ? `<span class="detail-custom-matter-badge" title="${escapeHtml(d.customScript)}" style="display:inline-block; font-size: 0.72rem; color: #FFD54F; background: rgba(255,179,0,0.12); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,179,0,0.25); margin-top: 4px;">🎙️ ప్రత్యేక మైక్ పాఠం: "${escapeHtml(d.customScript.slice(0, 32))}${d.customScript.length > 32 ? '...' : ''}"</span>` : ''}
            </div>
          </div>

          <div class="card-footer">
            <div class="status-indicator">
              <button class="btn-toggle-read ${d.isRead ? 'read' : 'unread'}" data-action="toggle-read" data-id="${d.id}" title="చదివినట్లు గుర్తించు">
                ${d.isRead ? '✓ చదివారు' : '○ ఇంకా చదవలేదు'}
              </button>
            </div>

            <div class="card-actions">
              <button class="btn-action btn-announce" data-action="announce" data-id="${d.id}" title="ఈ విరాళాన్ని మైక్ లో ప్రకటించండి">
                <span class="btn-icon">📢</span> ప్రకటించండి
              </button>
              <button class="btn-action btn-download" data-action="download" data-id="${d.id}" title="ఈ విరాళం మైక్ ఆడియోను MP3 గా డౌన్‌లోడ్ చేయండి">
                <span class="btn-icon">⬇️</span> MP3
              </button>
              <button class="btn-action btn-edit" data-action="edit" data-id="${d.id}" title="సవరించండి">
                ✏️
              </button>
              <button class="btn-action btn-delete" data-action="delete" data-id="${d.id}" title="తొలగించండి">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    updateBulkSelectionUI();
  }

  // Checkbox selection listener
  devoteesList.addEventListener('change', (e) => {
    if (e.target.classList.contains('donor-card-checkbox')) {
      const id = e.target.dataset.id;
      if (e.target.checked) {
        selectedDonorIds.add(id);
      } else {
        selectedDonorIds.delete(id);
      }
      updateBulkSelectionUI();
    }
  });

  // 4. Card Action Delegation (Announce, Download, Edit, Delete, Read, Select)
  devoteesList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('donor-card-checkbox')) {
      return;
    }

    // Toggle card selection when clicking card body/header in select mode
    if (isSelectModeActive && !e.target.closest('button')) {
      const card = e.target.closest('.donation-card');
      if (card && card.dataset.id) {
        const id = card.dataset.id;
        if (selectedDonorIds.has(id)) {
          selectedDonorIds.delete(id);
        } else {
          selectedDonorIds.add(id);
        }
        updateBulkSelectionUI();
        return;
      }
    }

    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const donation = store.donations.find(d => d.id === id);
    if (!donation && action !== 'add') return;

    if (action === 'announce') {
      // Announce single donation immediately
      highlightCard(id);
      const script = tts.generateAnnouncementScript(donation);
      liveSpeakerName.textContent = donation.name;
      liveSpeakerText.textContent = script;
      queueStatusBanner.classList.add('active');

      await tts.speak(script, { withBell: audio.bellEnabled, withShankh: audio.shankhEnabled });
      store.update(id, { isRead: true });
      queueStatusBanner.classList.remove('active');
    } else if (action === 'download') {
      // Download MP3 of announcement
      const origHtml = btn.innerHTML;
      btn.classList.add('loading');
      btn.innerHTML = `<span class="btn-icon">⏳</span> డౌన్‌లోడ్...`;
      try {
        await tts.downloadDonationMp3(donation);
        btn.innerHTML = `<span class="btn-icon">✓</span> సేవ్ అయింది`;
        showToastNotification(`✅ '${donation.name}' గారి విరాళం MP3 విజయవంతంగా డౌన్‌లోడ్ అయింది!`);
      } catch (err) {
        console.error("Donation MP3 download error:", err);
        alert(`ఆడియో డౌన్‌లోడ్ చేయడంలో సమస్య ఏర్పడింది: ${err.message}\nదయచేసి సర్వర్ IP సరిగ్గా ఉందో లేదో తనిఖీ చేయండి.`);
      } finally {
        setTimeout(() => {
          btn.innerHTML = origHtml;
          btn.classList.remove('loading');
        }, 2500);
      }
    } else if (action === 'toggle-read') {
      store.toggleRead(id);
    } else if (action === 'edit') {
      openEditModal(donation);
    } else if (action === 'delete') {
      if (confirm(`'${donation.name}' గారి విరాళాన్ని తొలగించాలా?`)) {
        store.delete(id);
      }
    }
  });

  function highlightCard(id) {
    document.querySelectorAll('.donation-card').forEach(c => c.classList.remove('now-speaking-card'));
    const target = document.getElementById(`card-${id}`);
    if (target) {
      target.classList.add('now-speaking-card');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // 5. Sequential "Read All Donations" Engine (అన్ని విరాళాలు వరుసగా చదవండి)
  playAllBtn.addEventListener('click', () => {
    if (isQueueRunning && isQueuePaused) {
      resumeQueue();
    } else {
      startSequentialQueue();
    }
  });

  pauseAllBtn.addEventListener('click', () => {
    pauseQueue();
  });

  stopAllBtn.addEventListener('click', () => {
    stopSequentialQueue();
  });

  nextDevoteeBtn.addEventListener('click', () => {
    if (isQueueRunning) {
      clearTimeout(queueTimer);
      tts.stop();
      playNextInQueue();
    }
  });

  onlyUnreadCheck.addEventListener('change', (e) => {
    onlyUnreadQueue = e.target.checked;
  });

  function startSequentialQueue() {
    activeQueueList = onlyUnreadQueue
      ? store.donations.filter(d => !d.isRead)
      : [...store.donations];

    if (activeQueueList.length === 0) {
      alert("ప్రకటించడానికి విరాళాలు ఏవీ లేవు!");
      return;
    }

    isQueueRunning = true;
    isQueuePaused = false;
    queueIndex = -1;

    playAllBtn.style.display = 'none';
    pauseAllBtn.style.display = 'inline-flex';
    stopAllBtn.style.display = 'inline-flex';
    nextDevoteeBtn.style.display = 'inline-flex';
    queueStatusBanner.classList.add('active');

    playNextInQueue();
  }

  async function playNextInQueue() {
    if (!isQueueRunning || isQueuePaused) return;

    queueIndex++;
    if (queueIndex >= activeQueueList.length) {
      // Completed entire list
      liveSpeakerName.textContent = "అన్ని విరాళాల మైక్ ప్రకటన పూర్తయింది! 🙏";
      liveSpeakerText.textContent = "శ్రీ వినాయక స్వామి వారి కృపతో అన్ని విరాళాలు విజయవంతంగా చదవబడ్డాయి. గణపతి బప్పా మోరియా!";
      countdownBadge.textContent = '';
      setTimeout(() => stopSequentialQueue(), 3000);
      return;
    }

    const donation = activeQueueList[queueIndex];
    highlightCard(donation.id);

    liveSpeakerName.textContent = `[${queueIndex + 1}/${activeQueueList.length}] ${donation.name}`;
    countdownBadge.textContent = '🎙️ మైక్ లో మాట్లాడుతున్నారు...';

    const script = tts.generateAnnouncementScript(donation);
    liveSpeakerText.textContent = script;

    // Speak this donation
    await tts.speak(script, {
      withBell: audio.bellEnabled,
      withShankh: audio.shankhEnabled && (donation.amount >= 10000 || queueIndex === 0)
    });

    // Mark as read in store
    store.update(donation.id, { isRead: true });

    if (!isQueueRunning || isQueuePaused) return;

    // Countdown pause before next devotee
    let timeLeft = pauseDurationSec;
    countdownBadge.textContent = `తదుపరి భక్తుడు: ${timeLeft} సెకన్లలో...`;

    queueTimer = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        countdownBadge.textContent = `తదుపరి భక్తుడు: ${timeLeft} సెకన్లలో...`;
      } else {
        clearInterval(queueTimer);
        countdownBadge.textContent = '';
        playNextInQueue();
      }
    }, 1000);
  }

  function pauseQueue() {
    isQueuePaused = true;
    clearTimeout(queueTimer);
    tts.stop();
    playAllBtn.style.display = 'inline-flex';
    pauseAllBtn.style.display = 'none';
    countdownBadge.textContent = 'విరామం (Paused)';
  }

  function resumeQueue() {
    isQueuePaused = false;
    playAllBtn.style.display = 'none';
    pauseAllBtn.style.display = 'inline-flex';
    playNextInQueue();
  }

  function stopSequentialQueue() {
    isQueueRunning = false;
    isQueuePaused = false;
    queueIndex = -1;
    clearTimeout(queueTimer);
    tts.stop();

    playAllBtn.style.display = 'inline-flex';
    pauseAllBtn.style.display = 'none';
    stopAllBtn.style.display = 'none';
    nextDevoteeBtn.style.display = 'none';
    queueStatusBanner.classList.remove('active');
    countdownBadge.textContent = '';
    document.querySelectorAll('.donation-card').forEach(c => c.classList.remove('now-speaking-card'));
  }

  // 6. Search & Filters
  searchInput.addEventListener('input', (e) => {
    store.searchQuery = e.target.value.trim();
    store.notify();
  });

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      store.filter = tab.dataset.filter;
      store.notify();
    });
  });

  // Transliteration & Custom Announcement Matter Elements
  const btnToggleTranslit = document.getElementById('btn-toggle-translit');
  const translitStatus = document.getElementById('translit-status');
  const inputCustomScript = document.getElementById('input-custom-script');
  const btnRegenerateScript = document.getElementById('btn-regenerate-script');

  // Master Template Elements
  const btnOpenTemplateModal = document.getElementById('btn-open-template-modal');
  const btnCloseTemplateModal = document.getElementById('btn-close-template-modal');
  const templateSettingsModal = document.getElementById('template-settings-modal');
  const inputMasterTemplate = document.getElementById('input-master-template');
  const btnSaveMasterTemplate = document.getElementById('btn-save-master-template');
  const btnResetMasterTemplate = document.getElementById('btn-reset-master-template');
  const previewMasterTemplateText = document.getElementById('preview-master-template-text');

  let isCustomScriptManuallyEdited = false;

  // 1. Setup Transliteration (English to Telugu typing)
  if (window.teluguTransliterate) {
    const translitInputs = [
      inputName, inputPlace, inputItem, inputItemQty, inputPurpose,
      inputCustomScript, inputMasterTemplate, searchInput,
      inputBulkPurpose, inputBulkPlace, inputBulkMatter,
      bulkImportBatchMatter, bulkImportText,
      document.getElementById('input-custom-tts-text')
    ];
    translitInputs.forEach(inp => {
      if (inp) window.teluguTransliterate.attach(inp);
    });

    btnToggleTranslit?.addEventListener('click', () => {
      window.teluguTransliterate.enabled = !window.teluguTransliterate.enabled;
      if (translitStatus) {
        translitStatus.textContent = window.teluguTransliterate.enabled ? 'ON' : 'OFF';
        translitStatus.style.color = window.teluguTransliterate.enabled ? '#00E676' : '#BCAAA4';
      }
    });
  }

  // 2. Master Announcement Template Modal Logic
  const DEFAULT_MASTER_TEMPLATE = `శ్రీ వినాయక స్వామి వారి కృపాకటాక్షాలతో... {ఊరు} నివాసి శ్రీ {పేరు} గారు, స్వామివారి {సందర్భం} నిమిత్తం {విరాళం} భక్తిశ్రద్ధలతో సమర్పించుకున్నారు. వినాయక స్వామి వారి అనుగ్రహంతో వీరి కుటుంబం ఆయురారోగ్య ఐశ్వర్యాలతో సదా వర్ధిల్లాలని కోరుకుంటున్నాము. భక్తులందరూ గట్టిగా జై కొట్టండి... బోలో గణపతి బప్పా మోరియా!`;

  function getMasterTemplate() {
    return localStorage.getItem('vinayaka_custom_template') || DEFAULT_MASTER_TEMPLATE;
  }

  function updateMasterTemplatePreview() {
    if (!inputMasterTemplate || !previewMasterTemplateText) return;
    const tpl = inputMasterTemplate.value;
    const sample = tpl
      .replace(/\{పేరు\}/g, 'కొండపల్లి రాము')
      .replace(/\{ఊరు\}/g, 'గాంధీ నగర్')
      .replace(/\{గోత్రం\}/g, 'కౌండిన్యస')
      .replace(/\{విరాళం\}/g, 'పది వేల నూట పదహారు రూపాయలు')
      .replace(/\{సందర్భం\}/g, 'నిత్య అన్నదానం కొరకు');
    previewMasterTemplateText.textContent = sample;
  }

  btnOpenTemplateModal?.addEventListener('click', () => {
    inputMasterTemplate.value = getMasterTemplate();
    updateMasterTemplatePreview();
    templateSettingsModal.classList.add('active');
  });

  // Download MP3 for this specific donation from modal
  const btnModalDownloadMp3 = document.getElementById('btn-modal-download-mp3');
  btnModalDownloadMp3?.addEventListener('click', async () => {
    const script = inputCustomScript.value.trim();
    if (!script) {
      alert("డౌన్‌లోడ్ చేయడానికి మైక్ ప్రకటన పాఠం ఖాళీగా ఉంది.");
      return;
    }
    const name = (inputName.value || 'భక్తుడు').trim().replace(/[\s\/\\]+/g, '_').replace(/[^\w\u0C00-\u0C7F_\-]/g, '');
    const origHtml = btnModalDownloadMp3.innerHTML;
    btnModalDownloadMp3.disabled = true;
    btnModalDownloadMp3.innerHTML = `<span>⏳</span> డౌన్‌లోడ్ అవుతోంది...`;
    try {
      const filename = `వినాయక_విరాళం_${name}.mp3`;
      await tts.downloadMp3(script, filename);
      btnModalDownloadMp3.innerHTML = `<span>✓</span> సేవ్ అయింది!`;
      showToastNotification(`✅ విరాళం మైక్ ఆడియో MP3 గా డౌన్‌లోడ్ అయింది!`);
    } catch (err) {
      alert(`ఆడియో డౌన్‌లోడ్ లోపం: ${err.message}`);
    } finally {
      setTimeout(() => {
        btnModalDownloadMp3.innerHTML = origHtml;
        btnModalDownloadMp3.disabled = false;
      }, 2500);
    }
  });

  btnCloseTemplateModal?.addEventListener('click', () => {
    templateSettingsModal.classList.remove('active');
  });

  templateSettingsModal?.addEventListener('click', (e) => {
    if (e.target === templateSettingsModal) templateSettingsModal.classList.remove('active');
  });

  inputMasterTemplate?.addEventListener('input', updateMasterTemplatePreview);

  document.querySelectorAll('.btn-insert-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      const start = inputMasterTemplate.selectionStart;
      const end = inputMasterTemplate.selectionEnd;
      const text = inputMasterTemplate.value;
      inputMasterTemplate.value = text.substring(0, start) + tag + text.substring(end);
      inputMasterTemplate.focus();
      inputMasterTemplate.setSelectionRange(start + tag.length, start + tag.length);
      updateMasterTemplatePreview();
    });
  });

  document.getElementById('tpl-btn-trad')?.addEventListener('click', () => {
    inputMasterTemplate.value = DEFAULT_MASTER_TEMPLATE;
    updateMasterTemplatePreview();
  });

  document.getElementById('tpl-btn-quick')?.addEventListener('click', () => {
    inputMasterTemplate.value = `శ్రీ {పేరు} గారు, {ఊరు} నుండి, {సందర్భం} నిమిత్తం {విరాళం} సమర్పించారు. బోలో గణపతి బప్పా మోరియా!`;
    updateMasterTemplatePreview();
  });

  document.getElementById('tpl-btn-celeb')?.addEventListener('click', () => {
    inputMasterTemplate.value = `శ్రీ వినాయక స్వామి వారి దివ్య కృపాకటాక్షాలతో... {ఊరు} నివాసి శ్రీ {పేరు} గారు, మన గణపతి ఉత్సవాల సందర్భంగా {సందర్భం} కొరకు {విరాళం} అత్యంత భక్తితో సమర్పించుకున్నారు. గణపతి మహారాజ్ కి జై!`;
    updateMasterTemplatePreview();
  });

  btnSaveMasterTemplate?.addEventListener('click', () => {
    const val = inputMasterTemplate.value.trim();
    if (val) {
      localStorage.setItem('vinayaka_custom_template', val);
      templateSettingsModal.classList.remove('active');
      updateModalPreview();
      store.notify();
    }
  });

  btnResetMasterTemplate?.addEventListener('click', () => {
    if (confirm("ప్రకటన పాఠాన్ని డిఫాల్ట్ శైలికి రీసెట్ చేయాలా?")) {
      localStorage.removeItem('vinayaka_custom_template');
      inputMasterTemplate.value = DEFAULT_MASTER_TEMPLATE;
      updateMasterTemplatePreview();
      updateModalPreview();
      store.notify();
    }
  });

  // 3. Add & Edit Donation Modal Logic
  openAddModalBtn.addEventListener('click', () => {
    editingId = null;
    isCustomScriptManuallyEdited = false;
    modalTitle.textContent = 'కొత్త విరాళం నమోదు చేయండి';
    donationForm.reset();
    typeRadioMoney.checked = true;
    toggleTypeFields('money');
    updateModalPreview();
    addModal.classList.add('active');
  });

  closeModalBtn.addEventListener('click', () => {
    addModal.classList.remove('active');
  });

  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) addModal.classList.remove('active');
  });

  function openEditModal(d) {
    editingId = d.id;
    isCustomScriptManuallyEdited = Boolean(d.customScript);
    modalTitle.textContent = 'విరాళాన్ని సవరించండి';
    inputName.value = d.name;
    inputPlace.value = d.place || '';
    inputPurpose.value = d.purpose || '';

    if (d.type === 'money') {
      typeRadioMoney.checked = true;
      inputAmount.value = d.amount;
      inputItem.value = '';
      inputItemQty.value = '';
    } else if (d.type === 'item') {
      typeRadioItem.checked = true;
      inputAmount.value = '';
      inputItem.value = d.item;
      inputItemQty.value = d.itemQty || '';
    } else if (d.type === 'both') {
      typeRadioBoth.checked = true;
      inputAmount.value = d.amount;
      inputItem.value = d.item;
      inputItemQty.value = d.itemQty || '';
    }

    toggleTypeFields(d.type);

    if (d.customScript) {
      inputCustomScript.value = d.customScript;
    } else {
      updateModalPreview();
    }

    addModal.classList.add('active');
  }

  function toggleTypeFields(type) {
    if (type === 'money') {
      moneyGroup.style.display = 'block';
      itemGroup.style.display = 'none';
      inputAmount.required = true;
      inputItem.required = false;
    } else if (type === 'item') {
      moneyGroup.style.display = 'none';
      itemGroup.style.display = 'block';
      inputAmount.required = false;
      inputItem.required = true;
    } else { // both
      moneyGroup.style.display = 'block';
      itemGroup.style.display = 'block';
      inputAmount.required = true;
      inputItem.required = true;
    }
  }

  [typeRadioMoney, typeRadioItem, typeRadioBoth].forEach(r => {
    r.addEventListener('change', () => {
      toggleTypeFields(r.value);
      updateModalPreview();
    });
  });

  // Quick Amount & Item Preset Buttons
  document.querySelectorAll('.preset-btn[data-amount]').forEach(btn => {
    btn.addEventListener('click', () => {
      inputAmount.value = btn.dataset.amount;
      updateModalPreview();
    });
  });

  document.querySelectorAll('.preset-btn[data-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      inputItem.value = btn.dataset.item;
      if (btn.dataset.qty) inputItemQty.value = btn.dataset.qty;
      updateModalPreview();
    });
  });

  [inputName, inputPlace, inputAmount, inputItem, inputItemQty, inputPurpose].forEach(inp => {
    inp.addEventListener('input', () => {
      if (!isCustomScriptManuallyEdited) {
        updateModalPreview();
      }
    });
  });

  inputCustomScript?.addEventListener('input', () => {
    isCustomScriptManuallyEdited = true;
  });

  btnRegenerateScript?.addEventListener('click', () => {
    isCustomScriptManuallyEdited = false;
    updateModalPreview();
  });

  function updateModalPreview() {
    const type = document.querySelector('input[name="donationType"]:checked')?.value || 'money';
    const tempDonation = {
      name: inputName.value.trim() || 'భక్తుని పేరు',
      place: inputPlace.value.trim(),
      type: type,
      amount: Number(inputAmount.value || 0),
      item: inputItem.value.trim() || 'వస్తువు',
      itemQty: inputItemQty.value.trim(),
      purpose: inputPurpose.value.trim() || 'స్వామివారి సేవా నిమిత్తం'
    };

    const script = tts.generateAnnouncementScript(tempDonation);
    if (inputCustomScript && !isCustomScriptManuallyEdited) {
      inputCustomScript.value = script;
    }
  }

  donationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="donationType"]:checked').value;

    let name = inputName.value.trim();
    let place = inputPlace.value.trim();
    let purpose = inputPurpose.value.trim();
    let item = inputItem.value.trim();
    let customScript = inputCustomScript ? inputCustomScript.value.trim() : '';

    // Auto transliterate English text if enabled
    if (window.teluguTransliterate && window.teluguTransliterate.enabled) {
      if (/[a-zA-Z]/.test(name)) name = await window.teluguTransliterate.transliterateSentence(name);
      if (/[a-zA-Z]/.test(place)) place = await window.teluguTransliterate.transliterateSentence(place);
      if (/[a-zA-Z]/.test(purpose)) purpose = await window.teluguTransliterate.transliterateSentence(purpose);
      if (/[a-zA-Z]/.test(item)) item = await window.teluguTransliterate.transliterateSentence(item);
      if (customScript && /[a-zA-Z]/.test(customScript)) {
        customScript = await window.teluguTransliterate.transliterateSentence(customScript);
      }
    }

    const donationData = {
      name: name,
      place: place,
      type: type,
      amount: type === 'item' ? 0 : Number(inputAmount.value || 0),
      item: type === 'money' ? '' : item,
      itemQty: type === 'money' ? '' : inputItemQty.value.trim(),
      purpose: purpose,
      customScript: customScript
    };

    if (editingId) {
      store.update(editingId, donationData);
    } else {
      store.add(donationData);
    }

    addModal.classList.remove('active');
  });

  // 8. Multi-Mobile Live Sync & Connect Modal
  async function openMobileSyncModal() {
    mobileConnectModal.classList.add('active');
    try {
      const res = await fetch('/api/network-info');
      const data = await res.json();
      if (mobileIpAddressText) mobileIpAddressText.textContent = data.url;

      // Generate visual QR code via quick API
      if (qrContainer) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data.url)}`;
        qrContainer.innerHTML = `<img src="${qrUrl}" alt="Android Connect QR" width="180" height="180" style="border-radius:12px; border:2px solid #FFB300;" />`;
      }
    } catch (e) {
      if (mobileIpAddressText) mobileIpAddressText.textContent = `http://${window.location.host}`;
    }
  }

  btnOpenMobileConnect?.addEventListener('click', openMobileSyncModal);
  headerSyncPill?.addEventListener('click', openMobileSyncModal);

  // Sync Modal Tabs
  const syncTabBtns = document.querySelectorAll('.sync-tab-btn');
  const syncTabPanes = document.querySelectorAll('.sync-tab-pane');
  syncTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      syncTabBtns.forEach(b => b.classList.remove('active'));
      syncTabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Copy Wi-Fi / Server URL
  btnCopySyncUrl?.addEventListener('click', async () => {
    const textToCopy = mobileIpAddressText?.textContent?.trim() || '';
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        btnCopySyncUrl.textContent = '✓ కాపీ అయింది!';
        btnCopySyncUrl.style.borderColor = '#00E676';
        btnCopySyncUrl.style.color = '#00E676';
        setTimeout(() => {
          btnCopySyncUrl.textContent = '📋 కాపీ';
          btnCopySyncUrl.style.borderColor = '';
          btnCopySyncUrl.style.color = '';
        }, 2000);
      } catch (err) {
        prompt("ఈ లింక్‌ను కాపీ చేయండి:", textToCopy);
      }
    }
  });

  // Manual Sync Now button
  btnManualSyncNow?.addEventListener('click', async () => {
    btnManualSyncNow.textContent = '🔄 సింక్ అవుతోంది...';
    btnManualSyncNow.disabled = true;
    try {
      await store.syncServer(false);
      btnManualSyncNow.textContent = '✓ సింక్ పూర్తయింది!';
      btnManualSyncNow.style.color = '#00E676';
    } catch (e) {
      btnManualSyncNow.textContent = '⚠️ విఫలమైంది';
      btnManualSyncNow.style.color = '#FF9100';
    }
    setTimeout(() => {
      btnManualSyncNow.textContent = '🔄 ఇప్పుడే సింక్ చేయండి';
      btnManualSyncNow.style.color = '';
      btnManualSyncNow.disabled = false;
    }, 1500);
  });

  // Save Cloud/Tunnel URL
  btnSaveCloudUrl?.addEventListener('click', async () => {
    const val = inputSyncCloudUrl?.value?.trim()?.replace(/\/+$/, '');
    if (val) {
      localStorage.setItem('vinayaka_server_url', val);
      if (inputServerUrl) inputServerUrl.value = val;
      alert("క్లౌడ్ సర్వర్ లింక్ సేవ్ చేయబడింది! ఇప్పుడు సింక్ తనిఖీ చేస్తోంది...");
      await store.syncServer(false);
    } else {
      alert("దయచేసి సరైన క్లౌడ్ లింక్ ఎంటర్ చేయండి (ఉదా: https://xxxx.loca.lt)");
    }
  });

  // Export / Import JSON for WhatsApp
  btnShareWhatsappSync?.addEventListener('click', () => {
    store.shareViaWhatsApp();
  });

  btnExportJsonSync?.addEventListener('click', () => {
    store.exportJSON();
  });

  btnTriggerImportJson?.addEventListener('click', () => {
    inputFileImportJson?.click();
  });

  inputFileImportJson?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const count = store.importJSON(text);
        alert(`🎉 ${count} కొత్త విరాళాలు విజయవంతంగా దిగుమతి & మెర్జ్ చేయబడ్డాయి!`);
      } catch (err) {
        alert("ఫైల్ చదవడంలో లోపం ఏర్పడింది: " + err.message);
      }
      inputFileImportJson.value = '';
    };
    reader.readAsText(file);
  });

  btnCloseMobileConnect?.addEventListener('click', () => {
    mobileConnectModal.classList.remove('active');
  });

  mobileConnectModal?.addEventListener('click', (e) => {
    if (e.target === mobileConnectModal) mobileConnectModal.classList.remove('active');
  });

  // Live Sync Status Listener
  window.addEventListener('sync-status-changed', (e) => {
    const { status, lastSyncTime, count } = e.detail || {};
    const timeStr = lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('te-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
    if (status === 'online') {
      if (headerSyncPill) {
        headerSyncPill.className = 'header-sync-pill';
        headerSyncPill.innerHTML = `🟢 లైవ్ సింక్`;
      }
      if (modalSyncStatus) {
        modalSyncStatus.innerHTML = `🟢 లైవ్ సింక్ సక్రియం (కనెక్ట్ అయింది)`;
        modalSyncStatus.style.color = '#00E676';
      }
      if (modalSyncTime && timeStr) {
        modalSyncTime.textContent = `చివరి సింక్: ${timeStr} (${count} విరాళాలు సమకాలీకరించబడ్డాయి)`;
      }
    } else {
      if (headerSyncPill) {
        headerSyncPill.className = 'header-sync-pill offline';
        headerSyncPill.innerHTML = `🟠 ఆఫ్‌లైన్`;
      }
      if (modalSyncStatus) {
        modalSyncStatus.innerHTML = `🟠 ఆఫ్‌లైన్ (లోకల్ మోడ్ - సర్వర్ అందుబాటులో లేదు)`;
        modalSyncStatus.style.color = '#FF9100';
      }
    }
  });

  // Remote Donations Arrived Listener (Toast Notification)
  let remoteToastTimer = null;

  function showToastNotification(message) {
    if (!remoteSyncToast) return;
    if (remoteSyncToastText) {
      remoteSyncToastText.textContent = message;
    }
    remoteSyncToast.classList.add('show');
    if (remoteToastTimer) clearTimeout(remoteToastTimer);
    remoteToastTimer = setTimeout(() => {
      remoteSyncToast.classList.remove('show');
    }, 4500);
  }

  window.addEventListener('remote-donations-added', (e) => {
    const { count, donors } = e.detail || {};
    if (!remoteSyncToast || !count) return;

    audioFX?.playBell(); // subtle divine temple bell chime

    const sample = donors && donors[0];
    const sampleInfo = sample ? `${sample.name} (${sample.amount ? '₹' + sample.amount : sample.item})` : '';
    showToastNotification(`🔔 మరో ఫోన్ నుండి ${count} కొత్త విరాళం నమోదయింది: ${sampleInfo}`);
  });

  // ==========================================================================
  // Bulk Actions, Multi-Select, Bulk Update & Bulk Import Logic
  // ==========================================================================

  // Helper: Transliterate multi-word English phrase to Telugu
  async function transliteratePhrase(phrase) {
    if (!phrase || !window.teluguTransliterate) return phrase;
    const words = phrase.split(/(\s+)/);
    const converted = await Promise.all(words.map(async w => {
      if (/^[a-zA-Z]+$/.test(w)) {
        return await window.teluguTransliterate.transliterateWord(w);
      }
      return w;
    }));
    return converted.join('');
  }

  // Helper: Update Bulk Selection UI state
  function updateBulkSelectionUI() {
    if (bulkSelectedCount) {
      bulkSelectedCount.textContent = selectedDonorIds.size;
    }
    const shouldShow = isSelectModeActive || selectedDonorIds.size > 0;
    if (bulkActionsToolbar) {
      if (shouldShow) {
        bulkActionsToolbar.classList.add('active');
      } else {
        bulkActionsToolbar.classList.remove('active');
      }
    }
    if (btnToggleSelectMode) {
      if (isSelectModeActive) {
        btnToggleSelectMode.classList.add('active');
      } else {
        btnToggleSelectMode.classList.remove('active');
      }
    }
    if (shouldShow) {
      document.body.classList.add('select-mode-active');
    } else {
      document.body.classList.remove('select-mode-active');
    }

    // Reflect selection in DOM checkboxes & card highlight
    document.querySelectorAll('.donor-card-checkbox').forEach(cb => {
      const id = cb.dataset.id;
      const isSel = selectedDonorIds.has(id);
      cb.checked = isSel;
      const card = document.getElementById(`card-${id}`);
      if (card) {
        if (isSel) card.classList.add('card-selected');
        else card.classList.remove('card-selected');
      }
    });

    if (btnBulkSelectAll) {
      const visibleList = store.getFilteredDonations();
      if (visibleList.length > 0 && selectedDonorIds.size === visibleList.length) {
        btnBulkSelectAll.textContent = 'అన్నీ తీసివేయి (Deselect)';
      } else {
        btnBulkSelectAll.textContent = 'అన్నీ ఎంచుకో (Select All)';
      }
    }
  }

  // Bulk Toolbar Action Handlers
  btnToggleSelectMode?.addEventListener('click', () => {
    isSelectModeActive = !isSelectModeActive;
    if (!isSelectModeActive && selectedDonorIds.size === 0) {
      document.body.classList.remove('select-mode-active');
    }
    updateBulkSelectionUI();
  });

  btnBulkSelectAll?.addEventListener('click', () => {
    const visibleList = store.getFilteredDonations();
    if (selectedDonorIds.size === visibleList.length && visibleList.length > 0) {
      selectedDonorIds.clear();
    } else {
      visibleList.forEach(d => selectedDonorIds.add(d.id));
    }
    updateBulkSelectionUI();
  });

  btnBulkMarkRead?.addEventListener('click', () => {
    if (selectedDonorIds.size === 0) {
      alert("దయచేసి ముందుగా విరాళాలను ఎంచుకోండి.");
      return;
    }
    const count = selectedDonorIds.size;
    store.bulkUpdate(Array.from(selectedDonorIds), { isRead: true });
    selectedDonorIds.clear();
    isSelectModeActive = false;
    updateBulkSelectionUI();
    alert(`ఎంపిక చేసిన ${count} విరాళాలు 'చదివినవి'గా మార్చబడ్డాయి. ✓`);
  });

  btnBulkMarkUnread?.addEventListener('click', () => {
    if (selectedDonorIds.size === 0) {
      alert("దయచేసి ముందుగా విరాళాలను ఎంచుకోండి.");
      return;
    }
    const count = selectedDonorIds.size;
    store.bulkUpdate(Array.from(selectedDonorIds), { isRead: false });
    selectedDonorIds.clear();
    isSelectModeActive = false;
    updateBulkSelectionUI();
    alert(`ఎంపిక చేసిన ${count} విరాళాలు 'చదవనివి'గా మార్చబడ్డాయి. ○`);
  });

  btnBulkDelete?.addEventListener('click', () => {
    if (selectedDonorIds.size === 0) {
      alert("దయచేసి ముందుగా విరాళాలను ఎంచుకోండి.");
      return;
    }
    const count = selectedDonorIds.size;
    if (confirm(`ఎంపిక చేసిన ${count} విరాళాలను ఖచ్చితంగా తొలగించాలా?`)) {
      store.bulkDelete(Array.from(selectedDonorIds));
      selectedDonorIds.clear();
      isSelectModeActive = false;
      updateBulkSelectionUI();
      alert(`${count} విరాళాలు విజయవంతంగా తొలగించబడ్డాయి.`);
    }
  });

  // Batch download MP3 for selected donations
  const btnBulkDownloadMp3 = document.getElementById('btn-bulk-download-mp3');
  btnBulkDownloadMp3?.addEventListener('click', async () => {
    if (selectedDonorIds.size === 0) {
      alert("దయచేసి ముందుగా విరాళాలను ఎంచుకోండి.");
      return;
    }
    const donorList = store.donations.filter(d => selectedDonorIds.has(d.id));
    if (donorList.length === 0) return;

    if (!confirm(`ఎంపిక చేసిన ${donorList.length} విరాళాల ఆడియోలను వరుసగా MP3 గా డౌన్‌లోడ్ చేయాలా?`)) {
      return;
    }

    const origText = btnBulkDownloadMp3.textContent;
    btnBulkDownloadMp3.disabled = true;
    let successCount = 0;

    for (let i = 0; i < donorList.length; i++) {
      const donor = donorList[i];
      btnBulkDownloadMp3.textContent = `⏳ ${i + 1}/${donorList.length}...`;
      try {
        await tts.downloadDonationMp3(donor);
        successCount++;
        await new Promise(r => setTimeout(r, 600));
      } catch (err) {
        console.error(`Failed to download MP3 for ${donor.name}:`, err);
      }
    }

    btnBulkDownloadMp3.textContent = `✓ ${successCount} పూర్తయ్యాయి!`;
    showToastNotification(`✅ ${successCount} విరాళాల MP3 ఆడియోలు విజయవంతంగా డౌన్‌లోడ్ అయ్యాయి!`);
    setTimeout(() => {
      btnBulkDownloadMp3.textContent = origText;
      btnBulkDownloadMp3.disabled = false;
    }, 3000);
  });

  btnBulkCancel?.addEventListener('click', () => {
    selectedDonorIds.clear();
    isSelectModeActive = false;
    updateBulkSelectionUI();
  });

  btnExportCsv?.addEventListener('click', () => {
    store.exportCSV();
  });

  // Bulk Update Modal Logic
  btnBulkOpenUpdateModal?.addEventListener('click', () => {
    if (selectedDonorIds.size === 0) {
      alert("దయచేసి ముందుగా కనీసం ఒక విరాళాన్ని ఎంచుకోండి.");
      return;
    }
    bulkUpdateCountLabel.textContent = selectedDonorIds.size;
    bulkUpdateModal.classList.add('active');
  });

  function closeBulkUpdateModal() {
    bulkUpdateModal.classList.remove('active');
  }

  btnCloseBulkUpdate?.addEventListener('click', closeBulkUpdateModal);
  btnCancelBulkUpdate?.addEventListener('click', closeBulkUpdateModal);
  bulkUpdateModal?.addEventListener('click', (e) => {
    if (e.target === bulkUpdateModal) closeBulkUpdateModal();
  });

  checkBulkStatus?.addEventListener('change', (e) => {
    groupBulkStatus.classList.toggle('is-inactive', !e.target.checked);
  });
  checkBulkPurpose?.addEventListener('change', (e) => {
    groupBulkPurpose.classList.toggle('is-inactive', !e.target.checked);
  });
  checkBulkPlace?.addEventListener('change', (e) => {
    groupBulkPlace.classList.toggle('is-inactive', !e.target.checked);
  });
  checkBulkAmount?.addEventListener('change', (e) => {
    groupBulkAmount.classList.toggle('is-inactive', !e.target.checked);
  });

  document.querySelectorAll('.btn-bulk-purpose-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      checkBulkPurpose.checked = true;
      groupBulkPurpose.classList.remove('is-inactive');
      inputBulkPurpose.value = btn.dataset.val;
    });
  });

  document.querySelectorAll('.btn-bulk-amount-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      checkBulkAmount.checked = true;
      groupBulkAmount.classList.remove('is-inactive');
      inputBulkAmount.value = btn.dataset.val;
    });
  });

  // Bulk Matter (ప్రకటన పాఠం) controls
  checkBulkMatter?.addEventListener('change', (e) => {
    groupBulkMatter.classList.toggle('is-inactive', !e.target.checked);
  });

  document.querySelectorAll('.btn-bulk-matter-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      checkBulkMatter.checked = true;
      groupBulkMatter.classList.remove('is-inactive');
      const tag = btn.dataset.tag;
      const start = inputBulkMatter.selectionStart;
      const end = inputBulkMatter.selectionEnd;
      const text = inputBulkMatter.value;
      inputBulkMatter.value = text.substring(0, start) + tag + text.substring(end);
      inputBulkMatter.focus();
      inputBulkMatter.setSelectionRange(start + tag.length, start + tag.length);
    });
  });

  document.getElementById('bulk-tpl-trad')?.addEventListener('click', () => {
    checkBulkMatter.checked = true;
    groupBulkMatter.classList.remove('is-inactive');
    inputBulkMatter.value = DEFAULT_MASTER_TEMPLATE;
  });

  document.getElementById('bulk-tpl-quick')?.addEventListener('click', () => {
    checkBulkMatter.checked = true;
    groupBulkMatter.classList.remove('is-inactive');
    inputBulkMatter.value = `శ్రీ {పేరు} గారు, {ఊరు} నుండి, {సందర్భం} నిమిత్తం {విరాళం} సమర్పించారు. బోలో గణపతి బప్పా మోరియా!`;
  });

  document.getElementById('bulk-tpl-laddu')?.addEventListener('click', () => {
    checkBulkMatter.checked = true;
    groupBulkMatter.classList.remove('is-inactive');
    inputBulkMatter.value = `శ్రీ వినాయక స్వామి వారి లడ్డు ప్రసాదం వేలంలో... {ఊరు} నివాసి శ్రీ {పేరు} గారు అత్యంత భక్తితో {విరాళం} సమర్పించుకున్నారు. గణపతి మహారాజ్ కి జై!`;
  });

  document.getElementById('bulk-tpl-annadanam')?.addEventListener('click', () => {
    checkBulkMatter.checked = true;
    groupBulkMatter.classList.remove('is-inactive');
    inputBulkMatter.value = `శ్రీ వినాయక స్వామి వారి నిత్య అన్నదాన మహోత్సవానికి... {ఊరు} నివాసి శ్రీ {పేరు} గారు {విరాళం} సమర్పించుకున్నారు. దాతలకు ఆయురారోగ్య ఐశ్వర్యాలు కలగాలని ప్రార్థిస్తున్నాము!`;
  });

  btnApplyBulkUpdate?.addEventListener('click', async () => {
    const anyChecked = checkBulkStatus.checked || checkBulkPurpose.checked || checkBulkPlace.checked || checkBulkAmount.checked || (checkBulkMatter && checkBulkMatter.checked);
    if (!anyChecked) {
      alert("దయచేసి మార్చాలనుకుంటున్న ఏదైనా ఒక వివరాల పక్కన టిక్ (✓) చేయండి.");
      return;
    }

    const updates = {};
    if (checkBulkStatus.checked) {
      updates.isRead = selectBulkStatus.value === 'read';
    }
    if (checkBulkPurpose.checked) {
      let val = inputBulkPurpose.value.trim();
      if (val) {
        if (window.teluguTransliterate && window.teluguTransliterate.enabled && /[a-zA-Z]/.test(val)) {
          val = await window.teluguTransliterate.transliterateSentence(val);
        }
        updates.purpose = val;
      }
    }
    if (checkBulkPlace.checked) {
      let val = inputBulkPlace.value.trim();
      if (val) {
        if (window.teluguTransliterate && window.teluguTransliterate.enabled && /[a-zA-Z]/.test(val)) {
          val = await window.teluguTransliterate.transliterateSentence(val);
        }
        updates.place = val;
      }
    }
    if (checkBulkAmount.checked) {
      const val = Number(inputBulkAmount.value || 0);
      if (val > 0) {
        updates.amount = val;
        updates.type = 'money';
      }
    }
    if (checkBulkMatter && checkBulkMatter.checked) {
      let val = inputBulkMatter.value.trim();
      if (val) {
        if (window.teluguTransliterate && window.teluguTransliterate.enabled && /[a-zA-Z]/.test(val)) {
          val = await window.teluguTransliterate.transliterateSentence(val);
        }
        updates.customScript = val;
      }
    }

    const count = selectedDonorIds.size;
    store.bulkUpdate(Array.from(selectedDonorIds), updates);
    closeBulkUpdateModal();
    selectedDonorIds.clear();
    isSelectModeActive = false;
    updateBulkSelectionUI();
    alert(`ఎంపిక చేసిన ${count} విరాళాలు విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి! 🙏`);
  });

  // Bulk Add / Import Modal Logic
  btnOpenBulkImport?.addEventListener('click', () => {
    bulkImportModal.classList.add('active');
  });

  function closeBulkImportModal() {
    bulkImportModal.classList.remove('active');
  }

  btnCloseBulkImport?.addEventListener('click', closeBulkImportModal);
  btnCancelBulkImport?.addEventListener('click', closeBulkImportModal);
  bulkImportModal?.addEventListener('click', (e) => {
    if (e.target === bulkImportModal) closeBulkImportModal();
  });

  btnFillSampleBulk?.addEventListener('click', () => {
    bulkImportText.value =
`రమేష్, కాకినాడ, 5116, అన్నదానం, శ్రీ రమేష్ గారు కాకినాడ నుండి అన్నదానం కొరకు 5116 రూపాయలు సమర్పించారు. బోలో గణపతి బప్పా మోరియా!
సురేష్, హైదరాబాద్, 10116, లడ్డు వేలం, గణపతి లడ్డు ప్రసాదం వేలంలో సురేష్ బాబు గారు 10116 రూపాయలు సమర్పించుకున్నారు.
లక్ష్మీపతి, విజయవాడ, 5 బస్తాల బియ్యం, అన్నదానం, శ్రీ లక్ష్మీపతి గారు విజయవాడ నుండి 5 బస్తాల బియ్యం స్వామివారి ప్రసాదానికి సమర్పించారు.
Venkatesh, Guntur, 2116, మండపం అలంకరణ, శ్రీ వెంకటేశ్ గారు గుంటూరు నుండి 2116 రూపాయలు సమర్పించారు.
Kiran Kumar, Rajahmundry, 1000, పూజా సామాగ్రి`;
  });

  async function parseBulkText() {
    const raw = bulkImportText.value.trim();
    if (!raw) {
      alert("దయచేసి విరాళాల జాబితాను నమోదు చేయండి.");
      return;
    }

    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const autoTranslit = checkBulkTranslitAuto ? checkBulkTranslitAuto.checked : true;

    btnParseBulk.textContent = '🔄 విశ్లేషిస్తోంది...';
    btnParseBulk.disabled = true;

    try {
      parsedBulkList = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(/[,;\t]+/).map(p => p.trim());
        if (parts.length === 0 || !parts[0]) continue;

        let name = parts[0] || 'భక్తుడు';
        let place = parts[1] || '';
        let donationRaw = parts[2] || '';
        let purpose = parts[3] || 'స్వామివారి నిత్య పూజ మరియు అన్నదానం';
        let customScript = parts[4] || '';

        // Check if a batch matter template was provided
        const batchMatter = bulkImportBatchMatter ? bulkImportBatchMatter.value.trim() : '';
        if (!customScript && batchMatter) {
          customScript = batchMatter;
        }

        if (autoTranslit && window.teluguTransliterate) {
          if (/[a-zA-Z]/.test(name)) {
            name = await window.teluguTransliterate.transliterateSentence(name);
          }
          if (/[a-zA-Z]/.test(place)) {
            place = await window.teluguTransliterate.transliterateSentence(place);
          }
          if (/[a-zA-Z]/.test(purpose)) {
            purpose = await window.teluguTransliterate.transliterateSentence(purpose);
          }
          if (customScript && /[a-zA-Z]/.test(customScript)) {
            customScript = await window.teluguTransliterate.transliterateSentence(customScript);
          }
        }

        const numOnly = donationRaw.replace(/[^0-9]/g, '');
        const isItem = /[a-zA-Z\u0C00-\u0C7F]/.test(donationRaw) && !/^(rs|inr|రూ|రూపాయలు)/i.test(donationRaw.trim());

        let type = 'money';
        let amount = 0;
        let item = '';

        if (isItem && !/^\d+$/.test(donationRaw.trim())) {
          type = 'item';
          item = donationRaw;
        } else if (numOnly) {
          type = 'money';
          amount = Number(numOnly);
        } else {
          type = 'item';
          item = donationRaw || 'కానుక';
        }

        parsedBulkList.push({
          name,
          place,
          type,
          amount,
          item,
          itemQty: '',
          purpose,
          customScript: customScript.trim(),
          isRead: false
        });
      }

      bulkParsedCount.textContent = parsedBulkList.length;
      bulkSaveCount.textContent = parsedBulkList.length;
      bulkParsedTbody.innerHTML = parsedBulkList.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${escapeHtml(item.name)}</strong></td>
          <td>${escapeHtml(item.place || '-')}</td>
          <td style="color: var(--color-gold-bright); font-weight: 600;">
            ${item.type === 'money' ? `₹${item.amount.toLocaleString('en-IN')}` : escapeHtml(item.item)}
          </td>
          <td>${escapeHtml(item.purpose)}</td>
          <td><small style="color: var(--color-gold);">${escapeHtml(item.customScript || '(డిఫాల్ట్ మాస్టర్ శైలి)')}</small></td>
        </tr>
      `).join('');

      bulkPreviewSection.style.display = 'block';
      btnSaveBulkImport.disabled = parsedBulkList.length === 0;
    } finally {
      btnParseBulk.textContent = '🔍 ప్రివ్యూ చూడండి';
      btnParseBulk.disabled = false;
    }
  }

  btnParseBulk?.addEventListener('click', parseBulkText);

  btnSaveBulkImport?.addEventListener('click', () => {
    if (parsedBulkList.length === 0) return;
    const addedCount = parsedBulkList.length;
    store.bulkAdd(parsedBulkList);
    closeBulkImportModal();
    bulkImportText.value = '';
    if (bulkImportBatchMatter) bulkImportBatchMatter.value = '';
    parsedBulkList = [];
    bulkPreviewSection.style.display = 'none';
    btnSaveBulkImport.disabled = true;
    alert(`విజయవంతంగా ${addedCount} విరాళాలు జోడించబడ్డాయి! 🙏`);
  });

  // 9. Service Worker & Cache Management
  var isNativeEnvironment = !!(window.Capacitor?.isNativePlatform?.() || window.AndroidNativeTTS || window.AndroidNativeDownloader || window.location.hostname === 'localhost' || window.location.protocol === 'file:');
  if (isNativeEnvironment) {
    // In native Android Capacitor app, unregister any service workers to guarantee local bundled APK assets are loaded
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(regs) {
        for (var r of regs) { r.unregister(); }
      });
    }
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (var n of names) { caches.delete(n); }
      });
    }
  } else if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.update();
    }).catch(err => {
      console.log('Service Worker registration notice:', err);
    });
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(k => {
          if (k !== 'vinayaka-announcer-v3.1') {
            console.log('Deleting outdated cache:', k);
            caches.delete(k);
          }
        });
      });
    }
  }

  // Escape helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ==========================================================================
  // 11. Custom Telugu TTS Announcement Studio & MP3 Downloader
  // ==========================================================================
  const btnOpenCustomTts = document.getElementById('btn-open-custom-tts');
  const btnToolbarCustomTts = document.getElementById('btn-toolbar-custom-tts');
  const customTtsModal = document.getElementById('custom-tts-modal');
  const btnCloseCustomTts = document.getElementById('btn-close-custom-tts');
  const inputCustomTtsText = document.getElementById('input-custom-tts-text');
  const btnStudioToggleTranslit = document.getElementById('btn-studio-toggle-translit');
  const studioTranslitStatus = document.getElementById('studio-translit-status');

  const ttsStatChars = document.getElementById('tts-stat-chars');
  const ttsStatWords = document.getElementById('tts-stat-words');
  const ttsStatDuration = document.getElementById('tts-stat-duration');
  const btnTtsCopyText = document.getElementById('btn-tts-copy-text');
  const btnTtsClearText = document.getElementById('btn-tts-clear-text');

  const studioVoiceMohan = document.getElementById('studio-voice-mohan');
  const studioVoiceShruti = document.getElementById('studio-voice-shruti');
  const studioToggleBell = document.getElementById('studio-toggle-bell');
  const studioToggleEcho = document.getElementById('studio-toggle-echo');
  const studioToggleShankh = document.getElementById('studio-toggle-shankh');

  const studioRateSlider = document.getElementById('studio-rate-slider');
  const studioRateValue = document.getElementById('studio-rate-value');
  const studioPitchSlider = document.getElementById('studio-pitch-slider');
  const studioPitchValue = document.getElementById('studio-pitch-value');

  const studioSpeakingBanner = document.getElementById('studio-speaking-banner');
  const studioStatusText = document.getElementById('studio-status-text');
  const btnStudioPlay = document.getElementById('btn-studio-play');
  const btnStudioStop = document.getElementById('btn-studio-stop');
  const btnStudioDownloadMp3 = document.getElementById('btn-studio-download-mp3');
  const btnStudioSaveNotice = document.getElementById('btn-studio-save-notice');

  // Preset announcement scripts
  const TTS_PRESETS = {
    puja: "శ్రీ వినాయక స్వామి వారి భక్తులందరికీ ముఖ్య గమనిక... నేడు సాయంత్రం 7:00 గంటలకు స్వామివారికి విశేష పంచామృతాభిషేకం, మహా మంగళ హారతి మరియు తీర్థ ప్రసాద వితరణ జరుగును. భక్తులందరూ సకుటుంబ సపరివార సమేతంగా విచ్చేసి స్వామివారి దివ్య తీర్థ ప్రసాదాలు స్వీకరించి కృపకు పాత్రులు కాగలరు. బోలో గణపతి బప్పా మోరియా!",
    prasadam: "శ్రీ గణపతి భక్త మహాశయులకు విజ్ఞప్తి... రేపు మధ్యాహ్నం 12:30 గంటల నుండి మన గణపతి మండపం వద్ద స్వామివారి పవిత్ర అన్నప్రసాద వితరణ మరియు మహా అన్నదాన కార్యక్రమం ఏర్పాటు చేయబడింది. భక్తులందరూ పెద్ద సంఖ్యలో విచ్చేసి స్వామివారి మహా ప్రసాదాన్ని స్వీకరించవలసిందిగా కోరుచున్నాము. గణపతి మహారాజ్ కి జై!",
    laddu: "సమస్త భక్తజనుల దృష్టికి... నేటి రాత్రి 8:30 గంటలకు శ్రీ వినాయక స్వామి వారి దివ్య ప్రసాదం మహా లడ్డూ వేలం పాట అత్యంత వైభవంగా నిర్వహించబడుతుంది. ఈ పవిత్ర లడ్డూ ప్రసాదాన్ని దక్కించుకోవాలనుకునే భక్తులు వెంటనే కమిటీ వద్ద పేర్లు నమోదు చేసుకొని, వేలం పాటలో పాల్గొనవలసిందిగా మనవి. గణపతి బప్పా మోరియా!",
    cultural: "ఆధ్యాత్మిక భక్తులకు ఆహ్వానం... నేటి సాయంత్రం 6:30 గంటల నుండి మన మండపం వేదికపై ప్రముఖ కళాకారులచే భక్తి సంగీత విభావరి, భజన కీర్తనలు మరియు చిన్నారుల కోలాట నృత్య ప్రదర్శనలు జరుగును. భక్తులందరూ విచ్చేసి ఈ సాంస్కృతిక కార్యక్రమాలను తిలకించి ఆనందించగలరు.",
    parking: "భక్తులకు ముఖ్య సూచన... మండపం పరిసరాల్లో రద్దీ దృష్ట్యా భక్తులందరూ తమ ద్విచక్ర మరియు నాలుగు చక్రాల వాహనాలను నిర్దేశించిన పార్కింగ్ స్థలంలోనే క్రమపద్ధతిలో నిలపవలసిందిగా మనవి. స్వామివారి దర్శనానికి క్యూ లైన్లలో ఓపికతో వేచి ఉండి కమిటీ వారికి సహకరించగలరు. ధన్యవాదాలు.",
    nimajjanam: "గణపతి భక్తులందరి సమాచారం కొరకు... మన వినాయక స్వామి వారి నిమజ్జన మహోత్సవ శోభాయాత్ర రేపు ఉదయం 10:00 గంటలకు మండపం నుండి ప్రారంభమవుతుంది. డప్పు వాయిద్యాలు, కోలాటాలు, భజనల నడుమ సాగే ఈ దివ్య శోభాయాత్రలో యువత మరియు పెద్దలందరూ అధిక సంఖ్యలో పాల్గొని విజయవంతం చేయవలసిందిగా కోరుచున్నాము. బోలో గణపతి బప్పా మోరియా!",
    wishes: "శ్రీ వినాయక చవితి నవరాత్రి మహోత్సవాల సందర్భంగా మన కాలనీ మరియు చుట్టుపక్కల ప్రాంతాల భక్తజనులందరికీ వినాయక ఉత్సవ కమిటీ తరఫున హృదయపూర్వక శుభాకాంక్షలు! విఘ్నేశ్వరుని దివ్య ఆశీస్సులతో మీ కుటుంబాలన్నీ ఆయురారోగ్యాలు, సుఖసంతోషాలు మరియు అష్టైశ్వర్యాలతో వర్ధిల్లాలని మనసారా ప్రార్థిస్తున్నాము. గణపతి మహారాజ్ కి జై!",
    celeb_balayya: "జై బాలయ్య! దెబ్బకు దయ్యం వదలాలి... మైక్ మోత మోగిపోవాలి! సాక్షాత్తు ఆ వినాయక స్వామి వారి కృపాకటాక్షాలతో... మన గణపతి మండపం వద్ద భక్తజనులందరూ అత్యంత భక్తిశ్రద్ధలతో పూజలు సమర్పిస్తున్నారు. ఫ్లూట్ జింక ముందు ఊదు... సింహం ముందు కాదు! భక్తులందరూ గట్టిగా జై కొట్టండి... జై బాలయ్య! బోలో గణపతి బప్పా మోరియా!",
    celeb_baahubali: "శ్రీ వినాయక మహారాజ్ దివ్య సమక్షంలో... మాహిష్మతీ సామ్రాజ్య భక్తితో చేయబడుతున్న ప్రకటన! అమరేంద్ర బాహుబలి అను నేను... స్వామివారి మండపానికి విచ్చేసిన సమస్త భక్తజనులకు ఆయురారోగ్య అష్టైశ్వర్యాలు కలగాలని, విఘ్నేశ్వరుని కృప సదా వర్ధిల్లాలని మనస్ఫూర్తిగా ప్రార్థిస్తున్నాను! జై గణపతి దేవా! జై బాహుబలి!",
    celeb_pawankalyan: "భక్తజనులందరికీ నా హృదయపూర్వక నమస్కారాలు! మన వినాయక చవితి ఉత్సవాల సందర్భంగా యువత, పెద్దలు అందరూ కలిసికట్టుగా పందిరిని ఇంత అద్భుతంగా నిర్వహించడం నిజంగా గర్వకారణం. మనం చేసే ప్రతి మంచి పనిలో ఆ విఘ్నాధిపతి ఆశీస్సులు ఎల్లప్పుడూ ఉంటాయి. నిజాయితీగా ఉందాం... సమాజానికి సేవ చేద్దాం. జై హింద్! బోలో గణపతి బప్పా మోరియా!",
    celeb_brahmanandam: "ఆహా... ఏమి భక్తి! ఏమి చందా! నేనండి మీ ఖాన్ దాదా... కాదు కాదు, మన వినాయక భక్తుడుని! ఇక్కడ లడ్డూ ప్రసాదం చూస్తుంటే నా కళ్ళలో ఆనందబాష్పాలు వచ్చేస్తున్నాయి. విరాళాలు ఇచ్చే భక్తులందరికీ స్వామివారు కోట్లకు కోట్లు సంపద ఇవ్వాలని ఆకాంక్షిస్తున్నాం... ఆనందో బ్రహ్మ! జై బోలో గణేష్ మహారాజ్ కి జై!"
  };

  function updateStudioStats() {
    if (!inputCustomTtsText) return;
    const text = inputCustomTtsText.value || '';
    const charCount = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const estSec = text.trim() ? Math.max(1, Math.round(text.trim().length / 15)) : 0;

    if (ttsStatChars) ttsStatChars.textContent = charCount;
    if (ttsStatWords) ttsStatWords.textContent = words;
    if (ttsStatDuration) ttsStatDuration.textContent = `~${estSec} సెకన్లు`;
  }

  inputCustomTtsText?.addEventListener('input', updateStudioStats);

  // Studio Voice / Persona Radio Listeners
  const studioPersonaRadios = document.querySelectorAll('input[name="studioVoiceSelect"]');
  const studioCelebBox = document.getElementById('studio-celeb-box');
  const studioCelebTitle = document.getElementById('studio-celeb-title');
  const btnStudioPlayCeleb = document.getElementById('btn-studio-play-celeb');
  const studioToggleCelebIntro = document.getElementById('studio-toggle-celeb-intro');

  studioPersonaRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked && window.CELEBRITY_PERSONAS) {
        const isCeleb = (radio.value !== 'mohan' && radio.value !== 'shruti');
        const persona = window.CELEBRITY_PERSONAS[radio.value];
        if (persona) {
          const rateVal = parseInt(persona.rate) || 0;
          const pitchVal = parseInt(persona.pitch) || 0;
          if (studioRateSlider) {
            studioRateSlider.value = rateVal;
            if (studioRateValue) studioRateValue.textContent = (rateVal >= 0 ? '+' : '') + rateVal + '%';
          }
          if (studioPitchSlider) {
            studioPitchSlider.value = pitchVal;
            if (studioPitchValue) studioPitchValue.textContent = (pitchVal >= 0 ? '+' : '') + pitchVal + 'Hz';
          }
        }
        if (studioCelebBox) {
          if (isCeleb && persona) {
            studioCelebBox.style.display = 'block';
            if (studioCelebTitle) studioCelebTitle.textContent = `🎬 ${persona.name} వాయిస్ క్లిప్:`;
          } else {
            studioCelebBox.style.display = 'none';
          }
        }
      }
    });
  });

  btnStudioPlayCeleb?.addEventListener('click', async () => {
    const selectedRadio = document.querySelector('input[name="studioVoiceSelect"]:checked');
    const val = selectedRadio ? selectedRadio.value : 'balayya';
    try {
      btnStudioPlayCeleb.textContent = '⏹️ ఆగు...';
      await tts.playCelebrityClip(val);
    } catch (e) {
      console.warn("Studio celeb play error:", e);
    } finally {
      btnStudioPlayCeleb.textContent = '▶️ డైలాగ్ వినండి';
    }
  });

  // Preset chips click
  document.querySelectorAll('.tts-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const presetKey = chip.dataset.preset;
      if (TTS_PRESETS[presetKey]) {
        inputCustomTtsText.value = TTS_PRESETS[presetKey];
        updateStudioStats();

        // Auto-select persona if clicking celebrity chip
        if (presetKey.startsWith('celeb_')) {
          const personaKey = presetKey.replace('celeb_', '');
          const targetRadio = document.querySelector(`input[name="studioVoiceSelect"][value="${personaKey}"]`);
          if (targetRadio) {
            targetRadio.checked = true;
            targetRadio.dispatchEvent(new Event('change'));
          }
        }
        inputCustomTtsText.focus();
      }
    });
  });

  // Transliteration studio toggle
  btnStudioToggleTranslit?.addEventListener('click', () => {
    if (!window.teluguTransliterate) return;
    window.teluguTransliterate.enabled = !window.teluguTransliterate.enabled;
    const isOn = window.teluguTransliterate.enabled;
    if (studioTranslitStatus) {
      studioTranslitStatus.textContent = isOn ? 'ON' : 'OFF';
      studioTranslitStatus.style.color = isOn ? '#00E676' : '#BCAAA4';
    }
    if (translitStatus) {
      translitStatus.textContent = isOn ? 'ON' : 'OFF';
      translitStatus.style.color = isOn ? '#00E676' : '#BCAAA4';
    }
  });

  // Sliders input
  studioRateSlider?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (studioRateValue) studioRateValue.textContent = (val >= 0 ? '+' : '') + val + '%';
  });

  studioPitchSlider?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (studioPitchValue) studioPitchValue.textContent = (val >= 0 ? '+' : '') + val + 'Hz';
  });

  // Open & Close Modal
  function openCustomTtsModal() {
    if (!inputCustomTtsText.value.trim()) {
      inputCustomTtsText.value = TTS_PRESETS.puja;
    }
    updateStudioStats();
    customTtsModal.classList.add('active');
  }

  const btnBannerOpenTts = document.getElementById('btn-banner-open-tts');
  const bannerOpenTtsStudio = document.getElementById('banner-open-tts-studio');

  btnOpenCustomTts?.addEventListener('click', openCustomTtsModal);
  btnToolbarCustomTts?.addEventListener('click', openCustomTtsModal);
  btnBannerOpenTts?.addEventListener('click', (e) => {
    e.stopPropagation();
    openCustomTtsModal();
  });
  bannerOpenTtsStudio?.addEventListener('click', openCustomTtsModal);
  btnCloseCustomTts?.addEventListener('click', () => {
    tts.stop();
    setStudioPlayingState(false);
    customTtsModal.classList.remove('active');
  });

  // Copy & Clear
  btnTtsCopyText?.addEventListener('click', async () => {
    const text = inputCustomTtsText.value;
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      showToastNotification("📋 పాఠం కాపీ అయింది!");
    } catch (e) {
      inputCustomTtsText.select();
      document.execCommand('copy');
      showToastNotification("📋 పాఠం కాపీ అయింది!");
    }
  });

  btnTtsClearText?.addEventListener('click', () => {
    if (confirm("ప్రకటన పాఠాన్ని క్లియర్ చేయాలా?")) {
      inputCustomTtsText.value = '';
      updateStudioStats();
    }
  });

  function setStudioPlayingState(isPlaying, statusMsg = "మైక్ ప్రకటన ప్లే అవుతోంది...") {
    if (!btnStudioPlay || !btnStudioStop || !studioSpeakingBanner) return;
    if (isPlaying) {
      btnStudioPlay.style.display = 'none';
      btnStudioStop.style.display = 'inline-flex';
      studioSpeakingBanner.style.display = 'flex';
      if (studioStatusText) studioStatusText.textContent = statusMsg;
    } else {
      btnStudioPlay.style.display = 'inline-flex';
      btnStudioStop.style.display = 'none';
      studioSpeakingBanner.style.display = 'none';
    }
  }

  function getStudioVoiceSettings() {
    const selectedRadio = document.querySelector('input[name="studioVoiceSelect"]:checked');
    const personaKey = selectedRadio ? selectedRadio.value : 'mohan';
    const persona = window.CELEBRITY_PERSONAS ? window.CELEBRITY_PERSONAS[personaKey] : null;
    const voice = persona ? persona.voice : 'te-IN-MohanNeural';

    const rateVal = studioRateSlider ? parseInt(studioRateSlider.value) || 0 : 0;
    const rate = (rateVal >= 0 ? '+' : '') + rateVal + '%';
    const pitchVal = studioPitchSlider ? parseInt(studioPitchSlider.value) || 0 : 0;
    const pitch = (pitchVal >= 0 ? '+' : '') + pitchVal + 'Hz';
    const withBell = studioToggleBell ? studioToggleBell.checked : true;
    const withShankh = studioToggleShankh ? studioToggleShankh.checked : false;
    const withEcho = studioToggleEcho ? studioToggleEcho.checked : true;

    // Celebrity punch dialogue intro clip
    const isCeleb = (personaKey !== 'mohan' && personaKey !== 'shruti');
    const withCelebIntro = isCeleb && (studioToggleCelebIntro ? studioToggleCelebIntro.checked : true);
    const celebIntro = withCelebIntro ? personaKey : null;

    return { voice, personaKey, rate, pitch, withBell, withShankh, withEcho, celebIntro };
  }

  // Play announcement
  btnStudioPlay?.addEventListener('click', async () => {
    let text = inputCustomTtsText.value.trim();
    if (!text) {
      alert("దయచేసి ప్రకటించడానికి ముందుగా ఏదైనా తెలుగు టెక్స్ట్ నమోదు చేయండి.");
      inputCustomTtsText.focus();
      return;
    }

    // If English text exists and transliteration enabled, auto-convert before speaking
    if (window.teluguTransliterate && window.teluguTransliterate.enabled && /[a-zA-Z]/.test(text)) {
      text = await window.teluguTransliterate.transliterateSentence(text);
      inputCustomTtsText.value = text;
      updateStudioStats();
    }

    const settings = getStudioVoiceSettings();
    setStudioPlayingState(true, "మైక్ ప్రకటన ప్రారంభమవుతోంది...");

    // Configure pandal audio echo
    if (window.pandalAudio) {
      window.pandalAudio.echoEnabled = settings.withEcho;
    }

    // Apply voice to TTS
    tts.selectedVoice = settings.voice;
    tts.rate = settings.rate;
    tts.pitch = settings.pitch;

    tts.onEndCallback = () => {
      setStudioPlayingState(false);
    };

    const isCeleb = (settings.personaKey !== 'mohan' && settings.personaKey !== 'shruti');

    try {
      await tts.speak(text, {
        withBell: settings.withBell,
        withShankh: settings.withShankh,
        celebIntro: settings.celebIntro,
        celebId: isCeleb ? settings.personaKey : null,
        useClone: isCeleb
      });
    } catch (e) {
      console.warn("Studio speak error:", e);
    } finally {
      setStudioPlayingState(false);
    }
  });

  btnStudioStop?.addEventListener('click', () => {
    tts.stop();
    setStudioPlayingState(false);
  });

  // Download as MP3
  btnStudioDownloadMp3?.addEventListener('click', async () => {
    let text = inputCustomTtsText.value.trim();
    if (!text) {
      alert("దయచేసి MP3 డౌన్‌లోడ్ చేయడానికి ముందుగా ఏదైనా తెలుగు టెక్స్ట్ నమోదు చేయండి.");
      inputCustomTtsText.focus();
      return;
    }

    // Auto-transliterate English if needed
    if (window.teluguTransliterate && window.teluguTransliterate.enabled && /[a-zA-Z]/.test(text)) {
      text = await window.teluguTransliterate.transliterateSentence(text);
      inputCustomTtsText.value = text;
      updateStudioStats();
    }

    const settings = getStudioVoiceSettings();
    const origHtml = btnStudioDownloadMp3.innerHTML;
    btnStudioDownloadMp3.disabled = true;
    btnStudioDownloadMp3.innerHTML = `<span>⏳</span> MP3 తయారవుతోంది...`;

    try {
      // Smart filename from preview words
      const previewWords = text.replace(/[^\w\u0C00-\u0C7F\s]/g, '').trim().split(/\s+/).slice(0, 3).join('_');
      const filename = `వినాయక_ప్రకటన_${previewWords || 'Custom_TTS'}.mp3`;

      await tts.downloadMp3(text, filename, {
        voice: settings.voice,
        rate: settings.rate,
        pitch: settings.pitch,
        celebIntro: settings.celebIntro,
        celebId: isCeleb ? settings.personaKey : null,
        useClone: isCeleb
      });

      btnStudioDownloadMp3.innerHTML = `<span>✓</span> డౌన్‌లోడ్ పూర్తయింది!`;
      showToastNotification(`✅ MP3 విజయవంతంగా డౌన్‌లోడ్ అయింది! (${filename})`);
    } catch (err) {
      console.error("Studio MP3 download error:", err);
      alert(`MP3 డౌన్‌లోడ్ చేయడంలో సమస్య ఏర్పడింది: ${err.message}\nసర్వర్ అందుబాటులో ఉందో లేదో తనిఖీ చేయండి.`);
    } finally {
      setTimeout(() => {
        btnStudioDownloadMp3.innerHTML = origHtml;
        btnStudioDownloadMp3.disabled = false;
      }, 2500);
    }
  });

  // Save as Notice Card in pandal donations list
  btnStudioSaveNotice?.addEventListener('click', () => {
    const text = inputCustomTtsText.value.trim();
    if (!text) {
      alert("భద్రపరచడానికి ప్రకటన పాఠం ఖాళీగా ఉంది.");
      return;
    }

    const firstLine = text.split('\n')[0].slice(0, 45);
    const noticeItem = {
      id: 'dev_' + Date.now(),
      name: '📢 పందిరి ముఖ్య ప్రకటన (Notice)',
      place: 'మండప మైక్',
      gothram: '',
      type: 'item',
      amount: 0,
      item: firstLine || 'ముఖ్య సమాచారం',
      itemQty: '',
      purpose: 'భక్తులకు ముఖ్య సమాచారం',
      customScript: text,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    store.add(noticeItem);
    showToastNotification("✅ ప్రత్యేక ప్రకటన విరాళాల జాబితాలో భద్రపరచబడింది!");
    customTtsModal.classList.remove('active');
  });

  // 10. Startup Splash Screen & Time Optimizer
  const startupSplash = document.getElementById('startup-splash');
  const startupProgressBar = document.getElementById('startup-progress-bar');
  const startupStatusText = document.getElementById('startup-status-text');
  const btnSkipSplash = document.getElementById('btn-skip-splash');

  function dismissSplash() {
    if (!startupSplash || startupSplash.classList.contains('hidden')) return;
    startupSplash.classList.add('hidden');
    setTimeout(() => {
      startupSplash.style.display = 'none';
    }, 500);
  }

  btnSkipSplash?.addEventListener('click', dismissSplash);
  startupSplash?.addEventListener('click', (e) => {
    if (e.target === startupSplash) dismissSplash();
  });

  // Animate progress bar during startup
  if (startupProgressBar) {
    setTimeout(() => { startupProgressBar.style.width = '65%'; }, 80);
    setTimeout(() => { startupProgressBar.style.width = '100%'; }, 500);
  }

  // Guarantee splash dismisses within 1.2s max on mobile
  setTimeout(dismissSplash, 1200);

  // Load initial data (instant local cache + background server sync)
  try {
    await store.load();
  } catch (err) {
    console.warn("Initial store load notice:", err);
  }

  if (startupStatusText) {
    startupStatusText.textContent = 'సర్వం సిద్ధం! స్వాగతం... 🙏';
  }
  dismissSplash();
});
