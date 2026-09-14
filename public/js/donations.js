/**
 * Donation Data Store & State Management
 * Handles multi-mobile real-time sync with conflict-free smart merge,
 * background polling, deletion tracking, offline storage, and JSON/CSV export-import.
 */

class DonationStore {
  constructor() {
    this.donations = [];
    this.filter = 'all'; // 'all', 'money', 'item', 'both', 'unread', 'read'
    this.searchQuery = '';
    this.onUpdateListeners = [];
    this.deletedIds = this.loadDeletedLocal();
    this.lastSyncTime = null;
    this.syncStatus = 'checking'; // 'online', 'offline', 'checking'
    this._syncInterval = null;
  }

  getServerUrl() {
    if (window.teluguTTS && window.teluguTTS.getServerBaseUrl) {
      return window.teluguTTS.getServerBaseUrl();
    }
    const saved = localStorage.getItem('vinayaka_server_url');
    if (saved && saved.trim()) return saved.trim().replace(/\/+$/, '');
    return window.location.origin || 'http://192.168.0.105:8080';
  }

  loadDeletedLocal() {
    try {
      const stored = localStorage.getItem('vinayaka_deleted_ids');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveDeletedLocal() {
    try {
      localStorage.setItem('vinayaka_deleted_ids', JSON.stringify(this.deletedIds));
    } catch (e) {}
  }

  async load() {
    // 1. First try loading from LocalStorage for instant UI display
    const local = localStorage.getItem('vinayaka_donations');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.donations = parsed;
          this.notify();
        }
      } catch (err) {}
    }

    // 2. Perform live sync with server
    await this.syncServer(false);

    // 3. Start background live polling every 4 seconds
    this.startAutoSync(4000);
  }

  saveLocal() {
    localStorage.setItem('vinayaka_donations', JSON.stringify(this.donations));
  }

  startAutoSync(intervalMs = 4000) {
    if (this._syncInterval) clearInterval(this._syncInterval);
    this._syncInterval = setInterval(() => {
      this.syncServer(true);
    }, intervalMs);
  }

  stopAutoSync() {
    if (this._syncInterval) {
      clearInterval(this._syncInterval);
      this._syncInterval = null;
    }
  }

  async syncServer(silent = true) {
    this.saveLocal();
    const serverUrl = this.getServerUrl();
    if (!serverUrl) return;

    try {
      const res = await fetch(`${serverUrl}/api/donations/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donations: this.donations,
          deletedIds: this.deletedIds
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.donations)) {
          const oldIds = new Set(this.donations.map(d => d.id));
          const incoming = data.donations;
          const newlyAddedFromRemote = incoming.filter(d => !oldIds.has(d.id));

          const hasChanges = JSON.stringify(this.donations) !== JSON.stringify(incoming);
          this.donations = incoming;
          this.lastSyncTime = new Date();
          this.syncStatus = 'online';
          this.saveLocal();

          if (hasChanges) {
            this.notify();
          }

          if (newlyAddedFromRemote.length > 0 && silent) {
            window.dispatchEvent(new CustomEvent('remote-donations-added', {
              detail: {
                count: newlyAddedFromRemote.length,
                donors: newlyAddedFromRemote
              }
            }));
          }

          window.dispatchEvent(new CustomEvent('sync-status-changed', {
            detail: {
              status: 'online',
              lastSyncTime: this.lastSyncTime,
              count: this.donations.length
            }
          }));
          return data;
        }
      } else {
        throw new Error(`Sync HTTP ${res.status}`);
      }
    } catch (e) {
      this.syncStatus = 'offline';
      window.dispatchEvent(new CustomEvent('sync-status-changed', {
        detail: {
          status: 'offline',
          lastSyncTime: this.lastSyncTime,
          count: this.donations.length
        }
      }));
    }
  }

  add(donation) {
    const now = new Date().toISOString();
    const newDonation = {
      id: 'dev_' + Date.now(),
      name: donation.name.trim(),
      place: (donation.place || '').trim(),
      gothram: (donation.gothram || '').trim(),
      type: donation.type, // 'money', 'item', 'both'
      amount: donation.type === 'item' ? 0 : Number(donation.amount || 0),
      item: donation.item || '',
      itemQty: donation.itemQty || '',
      purpose: donation.purpose || 'స్వామివారి నిత్య పూజ మరియు అన్నదానం',
      customScript: (donation.customScript || '').trim(),
      isRead: false,
      createdAt: now,
      updatedAt: now
    };
    this.donations.unshift(newDonation);
    this.syncServer(true);
    this.notify();
    return newDonation;
  }

  update(id, updatedFields) {
    const idx = this.donations.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.donations[idx] = {
        ...this.donations[idx],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      this.syncServer(true);
      this.notify();
    }
  }

  delete(id) {
    if (!this.deletedIds.includes(id)) {
      this.deletedIds.push(id);
      this.saveDeletedLocal();
    }
    this.donations = this.donations.filter(d => d.id !== id);
    this.syncServer(true);
    this.notify();
  }

  toggleRead(id) {
    const donation = this.donations.find(d => d.id === id);
    if (donation) {
      donation.isRead = !donation.isRead;
      donation.updatedAt = new Date().toISOString();
      this.syncServer(true);
      this.notify();
    }
  }

  bulkAdd(items) {
    if (!Array.isArray(items) || items.length === 0) return [];
    const now = new Date().toISOString();
    const addedList = items.map((donation, i) => ({
      id: 'dev_' + (Date.now() + i),
      name: (donation.name || 'భక్తుడు').trim(),
      place: (donation.place || '').trim(),
      gothram: (donation.gothram || '').trim(),
      type: donation.type || (donation.amount > 0 ? 'money' : 'item'),
      amount: donation.type === 'item' ? 0 : Number(donation.amount || 0),
      item: donation.item || '',
      itemQty: donation.itemQty || '',
      purpose: donation.purpose || 'స్వామివారి నిత్య పూజ మరియు అన్నదానం',
      customScript: (donation.customScript || '').trim(),
      isRead: false,
      createdAt: now,
      updatedAt: now
    }));
    this.donations.unshift(...addedList);
    this.syncServer(true);
    this.notify();
    return addedList;
  }

  bulkUpdate(ids, updatedFields) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    this.donations.forEach(d => {
      if (idSet.has(d.id)) {
        Object.assign(d, updatedFields, { updatedAt: now });
      }
    });
    this.syncServer(true);
    this.notify();
  }

  bulkDelete(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    ids.forEach(id => {
      if (!this.deletedIds.includes(id)) {
        this.deletedIds.push(id);
      }
    });
    this.saveDeletedLocal();
    const idSet = new Set(ids);
    this.donations = this.donations.filter(d => !idSet.has(d.id));
    this.syncServer(true);
    this.notify();
  }

  exportCSV() {
    if (this.donations.length === 0) {
      alert("ఎగుమతి చేయడానికి విరాళాలు ఏవీ లేవు.");
      return;
    }
    const headers = ["క్రమ సంఖ్య", "భక్తుని పేరు", "ఊరు / కాలనీ", "గోత్రం", "విరాళం రకం", "నగదు మొత్తం (రూ)", "వస్తువు వివరాలు", "సందర్భం", "చదివిన స్థితి", "మైక్ ప్రకటన పాఠం"];
    const rows = this.donations.map((d, idx) => [
      idx + 1,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      `"${(d.place || '').replace(/"/g, '""')}"`,
      `"${(d.gothram || '').replace(/"/g, '""')}"`,
      d.type === 'money' ? 'నగదు' : (d.type === 'item' ? 'వస్తు రూపం' : 'నగదు+వస్తువు'),
      d.amount || 0,
      `"${((d.item || '') + (d.itemQty ? ' ' + d.itemQty : '')).replace(/"/g, '""')}"`,
      `"${(d.purpose || '').replace(/"/g, '""')}"`,
      d.isRead ? 'చదివారు' : 'ఇంకా చదవలేదు',
      `"${(d.customScript || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `వినాయక_విరాళాల_జాబితా_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportJSON() {
    if (this.donations.length === 0) {
      alert("ఎగుమతి చేయడానికి విరాళాలు ఏవీ లేవు.");
      return;
    }
    const dataStr = JSON.stringify(this.donations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `వినాయక_విరాళాలు_బ్యాకప్_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async shareViaWhatsApp() {
    if (this.donations.length === 0) {
      alert("షేర్ చేయడానికి విరాళాలు ఏవీ లేవు.");
      return;
    }
    const stats = this.getStats();
    const dataStr = JSON.stringify(this.donations, null, 2);
    const fileName = `వినాయక_విరాళాలు_${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([dataStr], fileName, { type: 'application/json' });

    const summaryText = `🕉️ *శ్రీ వినాయక చవితి చందా & విరాళాల జాబితా*\n` +
      `📅 తేదీ: ${new Date().toLocaleDateString('te-IN')}\n` +
      `👥 మొత్తం భక్తులు: ${stats.totalDonors}\n` +
      `💰 మొత్తం నగదు: ₹${stats.totalCash.toLocaleString('en-IN')}\n` +
      `📦 వస్తు రూప విరాళాలు: ${stats.totalItems}\n\n` +
      `ఈ ఫైల్‌ను వినాయక అనౌన్సర్ యాప్‌లో 'దిగుమతి & మెర్జ్' ద్వారా ఓపెన్ చేయండి.`;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'వినాయక విరాళాల బ్యాకప్',
          text: summaryText,
          files: [file]
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('Share error:', err);
      }
    }

    // Fallback: Download JSON file and launch WhatsApp
    this.exportJSON();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(summaryText)}`;
    window.open(waUrl, '_blank');
  }

  importJSON(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid format: expected JSON array of donations");
      }
      const existingMap = new Map(this.donations.map(d => [d.id, d]));
      let addedCount = 0;
      parsed.forEach(item => {
        if (item && item.name) {
          const id = item.id || ('dev_' + Date.now() + Math.random().toString(36).substr(2, 5));
          item.id = id;
          if (!existingMap.has(id)) {
            this.donations.unshift(item);
            existingMap.set(id, item);
            addedCount++;
          } else {
            const existing = existingMap.get(id);
            if ((item.updatedAt || item.createdAt || '') >= (existing.updatedAt || existing.createdAt || '')) {
              Object.assign(existing, item);
            }
          }
        }
      });
      this.saveLocal();
      this.syncServer(false);
      this.notify();
      return addedCount;
    } catch (e) {
      console.error("JSON import error:", e);
      throw e;
    }
  }

  markAllAs(isRead = true) {
    const now = new Date().toISOString();
    this.donations.forEach(d => {
      d.isRead = isRead;
      d.updatedAt = now;
    });
    this.syncServer(true);
    this.notify();
  }

  getFilteredDonations() {
    let list = this.donations;

    if (this.filter === 'money') {
      list = list.filter(d => d.type === 'money' || (d.type === 'both' && d.amount > 0));
    } else if (this.filter === 'item') {
      list = list.filter(d => d.type === 'item' || (d.type === 'both' && d.item));
    } else if (this.filter === 'unread') {
      list = list.filter(d => !d.isRead);
    } else if (this.filter === 'read') {
      list = list.filter(d => d.isRead);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(d =>
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.place && d.place.toLowerCase().includes(q)) ||
        (d.item && d.item.toLowerCase().includes(q)) ||
        (d.purpose && d.purpose.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getStats() {
    let totalCash = 0;
    let totalItems = 0;
    let readCount = 0;

    this.donations.forEach(d => {
      if (d.amount) totalCash += Number(d.amount);
      if (d.type === 'item' || (d.type === 'both' && d.item)) totalItems++;
      if (d.isRead) readCount++;
    });

    return {
      totalDonors: this.donations.length,
      totalCash,
      totalItems,
      readCount,
      pendingCount: this.donations.length - readCount
    };
  }

  subscribe(callback) {
    this.onUpdateListeners.push(callback);
  }

  notify() {
    const stats = this.getStats();
    const filtered = this.getFilteredDonations();
    this.onUpdateListeners.forEach(cb => cb({ stats, donations: filtered, all: this.donations }));
  }
}

window.donationStore = new DonationStore();
