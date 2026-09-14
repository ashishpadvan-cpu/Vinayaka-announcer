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
  voiceMohanRadio.addEventListener('change', () => {
    tts.selectedVoice = 'te-IN-MohanNeural';
  });
  voiceShrutiRadio.addEventListener('change', () => {
    tts.selectedVoice = 'te-IN-ShrutiNeural';
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
              <button class="btn-action btn-download" data-action="download" data-id="${d.id}" title="ఆడియో డౌన్‌లోడ్ చేయండి">
                ⬇️
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
      const script = tts.generateAnnouncementScript(donation);
      btn.textContent = '⏳';
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: script,
            voice: tts.selectedVoice,
            rate: tts.rate,
            pitch: tts.pitch
          })
        });
        const data = await res.json();
        if (data.audioUrl) {
          const a = document.createElement('a');
          a.href = data.audioUrl;
          a.download = `వినాయక_విరాళం_${donation.name.replace(/\s+/g, '_')}.mp3`;
          a.click();
        }
      } catch (err) {
        alert("ఆడియో డౌన్‌లోడ్ చేయడంలో సమస్య ఏర్పడింది.");
      } finally {
        btn.textContent = '⬇️';
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
      bulkImportBatchMatter, bulkImportText
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
  window.addEventListener('remote-donations-added', (e) => {
    const { count, donors } = e.detail || {};
    if (!remoteSyncToast || !count) return;

    audioFX?.playBell(); // subtle divine temple bell chime

    const sample = donors && donors[0];
    const sampleInfo = sample ? `${sample.name} (${sample.amount ? '₹' + sample.amount : sample.item})` : '';
    if (remoteSyncToastText) {
      remoteSyncToastText.textContent = `🔔 మరో ఫోన్ నుండి ${count} కొత్త విరాళం నమోదయింది: ${sampleInfo}`;
    }
    remoteSyncToast.classList.add('show');

    if (remoteToastTimer) clearTimeout(remoteToastTimer);
    remoteToastTimer = setTimeout(() => {
      remoteSyncToast.classList.remove('show');
    }, 4500);
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

  // 9. Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service Worker registration notice:', err);
    });
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

  // Load initial data (instant local cache + background server sync)
  await store.load();

  if (startupStatusText) {
    startupStatusText.textContent = 'సర్వం సిద్ధం! స్వాగతం... 🙏';
  }

  // Smoothly fade out after 1.1s for a majestic first impression
  setTimeout(dismissSplash, 1100);
});
