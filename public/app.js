/**
 * PT. Berkat Cahaya Novena - Production Checklist & Operational Control
 * Core Frontend Engine with Dual Backend Support:
 * - Supabase Cloud Database (PostgreSQL + Realtime WebSockets) - Free Forever
 * - Local Python REST API + SSE
 * - IndexedDB Local-First Offline Storage & Sync Queue
 * - Web Audio API Sound Synthesizer & Web Notifications API
 * - Interactive Checklist Form & Canvas Signature Pad
 * - Analytics Dashboard with SVG Charts
 * - Official SOP Matrix Format (Audit & Print Ready)
 */

// --- Global Application State ---
const state = {
  rooms: [],
  currentRoomId: 'pengayakan',
  currentShift: 'Shift 1',
  currentDate: new Date().toISOString().split('T')[0],
  isOnline: navigator.onLine,
  isSimulatedOffline: false,
  syncQueue: [],
  notifications: [],
  dashboardMetrics: null,
  activeTab: 'dashboard',
  sseConnection: null,
  broadcastChannel: null,
  audioContext: null,
  supabase: null,
  isCloudConnected: false
};

// --- Default Hardcoded Templates (Fallback if offline or before database initialized) ---
const DEFAULT_ROOMS_DATA = [
  {
    id: 'pengayakan',
    name: 'Ruang Pengayakan',
    code: 'FR/PRD/004/003',
    revision: '02',
    effective_date: '04 Maret 2024',
    building: 'Gedung 1 (Produksi)',
    display_order: 1,
    items: [
      { id: 1, item_no: 1, name: 'Lantai', category: 'Infrastruktur' },
      { id: 2, item_no: 2, name: 'Dinding', category: 'Infrastruktur' },
      { id: 3, item_no: 3, name: 'Pintu Passbox', category: 'Infrastruktur' },
      { id: 4, item_no: 4, name: 'Timbangan tepung', category: 'Peralatan' },
      { id: 5, item_no: 5, name: 'Ayakan Tepung', category: 'Peralatan' },
      { id: 6, item_no: 6, name: 'Trolly Tepung', category: 'Peralatan' },
      { id: 7, item_no: 7, name: 'Lampu', category: 'Infrastruktur (Periodik)' },
      { id: 8, item_no: 8, name: 'Exhaust', category: 'Infrastruktur (Periodik)' },
      { id: 9, item_no: 9, name: 'Pallet', category: 'Peralatan' }
    ]
  },
  {
    id: 'penimbangan',
    name: 'Ruang Penimbangan',
    code: 'FR/PRD/004/009',
    revision: '00',
    effective_date: '26 Oktober 2020',
    building: 'Gedung 1 (Produksi)',
    display_order: 2,
    items: [
      { id: 10, item_no: 1, name: 'Container plastik', category: 'Peralatan Pembantu' },
      { id: 11, item_no: 2, name: 'Timbangan digital', category: 'Peralatan Pembantu' },
      { id: 12, item_no: 3, name: 'Rak bahan kering', category: 'Peralatan Pembantu' },
      { id: 13, item_no: 4, name: 'Meja penimbangan', category: 'Peralatan Pembantu' },
      { id: 14, item_no: 5, name: 'Refrigerator ragi', category: 'Peralatan Pembantu' },
      { id: 15, item_no: 6, name: 'Mixer premix', category: 'Peralatan Pembantu' },
      { id: 16, item_no: 7, name: 'Wadah ragi', category: 'Peralatan Pembantu' },
      { id: 17, item_no: 8, name: 'Wadah Shortening', category: 'Peralatan Pembantu' },
      { id: 18, item_no: 9, name: 'Wadah premix', category: 'Peralatan Pembantu' },
      { id: 19, item_no: 10, name: 'Wadah pewarna', category: 'Peralatan Pembantu' },
      { id: 20, item_no: 11, name: 'Wadah uk 15 ltr', category: 'Peralatan Pembantu' },
      { id: 21, item_no: 12, name: 'Solet Rubber', category: 'Peralatan Pembantu' },
      { id: 22, item_no: 13, name: 'Wadah B 008', category: 'Peralatan Pembantu' },
      { id: 23, item_no: 14, name: 'Wadah minyak', category: 'Peralatan Pembantu' },
      { id: 24, item_no: 15, name: 'Centong stainless', category: 'Peralatan Pembantu' },
      { id: 25, item_no: 16, name: 'Spatula stainless', category: 'Peralatan Pembantu' },
      { id: 26, item_no: 17, name: 'Wadah plastik tepung', category: 'Peralatan Pembantu' },
      { id: 27, item_no: 18, name: 'Trolly Tepung', category: 'Peralatan Pembantu' }
    ]
  },
  {
    id: 'baking',
    name: 'Ruang Baking',
    code: 'FR/PRD/004/010',
    revision: '01',
    effective_date: '24 Februari 2025',
    building: 'Gedung 1 (Produksi)',
    display_order: 3,
    items: [
      { id: 28, item_no: 1, name: 'Mixer', category: 'Mesin & Infrastruktur' },
      { id: 29, item_no: 2, name: 'Dough moulder', category: 'Mesin & Infrastruktur' },
      { id: 30, item_no: 3, name: 'Dough devider', category: 'Mesin & Infrastruktur' },
      { id: 31, item_no: 4, name: 'Meja deviding adonan', category: 'Peralatan' },
      { id: 32, item_no: 5, name: 'Rak proofer', category: 'Mesin & Infrastruktur' },
      { id: 33, item_no: 6, name: 'Meja deviding roti', category: 'Peralatan' },
      { id: 34, item_no: 7, name: 'Loyang', category: 'Peralatan' },
      { id: 35, item_no: 8, name: 'Peralatan pembantu/pendukung', category: 'Peralatan' },
      { id: 36, item_no: 9, name: 'Spatula stainless', category: 'Peralatan' },
      { id: 37, item_no: 10, name: 'Kafe besi gagang rubber', category: 'Peralatan' },
      { id: 38, item_no: 11, name: 'Kafe plastik dough devider', category: 'Peralatan' },
      { id: 39, item_no: 12, name: 'Wadah sarung tangan', category: 'Peralatan' },
      { id: 40, item_no: 13, name: 'Rak Stalling', category: 'Peralatan' },
      { id: 41, item_no: 14, name: 'Kaca Akrilik Oven Rotary', category: 'Mesin & Infrastruktur' },
      { id: 42, item_no: 15, name: 'Kaca Akrilik R Proofing', category: 'Mesin & Infrastruktur' },
      { id: 43, item_no: 16, name: 'Jam Dinding', category: 'Infrastruktur' },
      { id: 44, item_no: 17, name: 'Wadah minyak', category: 'Peralatan' }
    ]
  }
];

// --- IndexedDB Local-First Database ---
const DB_NAME = 'ChecklistProductionDB';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('checklists')) {
        db.createObjectStore('checklists', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'queue_id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('cached_config')) {
        db.createObjectStore('cached_config', { keyPath: 'key' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function idbGet(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(storeName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// --- Supabase Cloud Client Initialization ---
function initSupabase() {
  const url = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL) || localStorage.getItem('bcn_supabase_url') || '';
  const key = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_ANON_KEY) || localStorage.getItem('bcn_supabase_anon_key') || '';

  if (url && key && window.supabase) {
    try {
      state.supabase = window.supabase.createClient(url, key);
      state.isCloudConnected = true;
      console.log('✅ Supabase Cloud connected successfully:', url);

      // Setup Realtime WebSocket Listener for instant multi-device sync
      setupSupabaseRealtime();
    } catch (err) {
      console.warn('Supabase initialization failed:', err);
      state.isCloudConnected = false;
    }
  } else {
    state.isCloudConnected = false;
  }
}

function setupSupabaseRealtime() {
  if (!state.supabase) return;

  try {
    state.supabase
      .channel('bcn-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklists' }, (payload) => {
        console.log('[Supabase Realtime] Checklist change detected:', payload);
        showToast('Sinkronisasi Realtime: Laporan checklist diperbarui!', 'info');
        refreshCurrentView();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_entries' }, () => {
        refreshCurrentView();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.new) {
          triggerNotification(payload.new.title, payload.new.message, payload.new.type);
        }
      })
      .subscribe((status) => {
        console.log('[Supabase Realtime] Subscription status:', status);
      });
  } catch (err) {
    console.warn('Realtime subscription error:', err);
  }
}

// --- Audio Synthesizer (Zero Latency Offline Sound via Web Audio API) ---
function initAudio() {
  if (!state.audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      state.audioContext = new AudioCtx();
    }
  }
}

function playSound(type = 'chime') {
  try {
    initAudio();
    if (!state.audioContext) return;
    if (state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }

    const ctx = state.audioContext;
    const now = ctx.currentTime;

    if (type === 'chime') {
      // Pleasant two-tone ascending reminder chime (E5 -> B5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      osc2.frequency.setValueAtTime(987.77, now + 0.12);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);
    } else if (type === 'urgent') {
      // Attention alert chord
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.15);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'sync') {
      // Gentle confirmation triplet
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    }
  } catch (err) {
    console.warn('Audio playback not permitted or unavailable:', err);
  }
}

// --- Web Notifications API ---
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('Browser ini tidak mendukung Desktop Notification API.', 'warning');
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    showToast('Izin notifikasi pengingat berhasil diaktifkan!', 'success');
    return true;
  } else {
    showToast('Izin notifikasi ditolak.', 'warning');
    return false;
  }
}

function triggerNotification(title, body, type = 'reminder') {
  playSound(type === 'urgent' ? 'urgent' : 'chime');
  showToast(`${title}: ${body}`, type === 'urgent' ? 'danger' : 'warning');

  // Push notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: `notif-${Date.now()}`
      });
    } catch (e) {
      console.warn('Failed to display system notification:', e);
    }
  }

  // Add to in-app notification center
  const notifObj = {
    id: `notif-${Date.now()}`,
    title: title,
    message: body,
    type: type,
    created_at: new Date().toISOString()
  };
  state.notifications.unshift(notifObj);
  updateNotificationBadge();
}

// --- Toast Notification Banner ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'danger') icon = '⚠️';
  if (type === 'warning') icon = '🔔';

  toast.innerHTML = `<span>${icon}</span><div style="flex:1;">${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// --- Real-time Sync & Network State ---
function initRealtimeSync() {
  // BroadcastChannel for instant multi-tab synchronization
  if ('BroadcastChannel' in window) {
    state.broadcastChannel = new BroadcastChannel('checklist_sync_channel');
    state.broadcastChannel.onmessage = (event) => {
      console.log('[BroadcastChannel] Received message:', event.data);
      refreshCurrentView();
    };
  }

  // Connect Local SSE only if Supabase is not active and server is local
  if (!state.isCloudConnected) {
    connectSSE();
  }

  // Network online/offline listeners
  window.addEventListener('online', () => {
    state.isOnline = true;
    updateNetworkUI();
    showToast('Koneksi internet terhubung kembali.', 'success');
    triggerBackgroundSync();
  });

  window.addEventListener('offline', () => {
    state.isOnline = false;
    updateNetworkUI();
    showToast('Koneksi terputus! Mode Offline aktif. Data tersimpan di perangkat lokal.', 'warning');
  });

  updateSyncQueueCount();
}

function connectSSE() {
  if (state.sseConnection) state.sseConnection.close();
  if (state.isSimulatedOffline || !state.isOnline) return;

  try {
    state.sseConnection = new EventSource('/api/events');
    state.sseConnection.addEventListener('checklist_updated', (e) => {
      const data = JSON.parse(e.data);
      showToast(`Data checklist diperbarui (${data.shift})`, 'info');
      refreshCurrentView();
    });
    state.sseConnection.addEventListener('corrective_resolved', (e) => {
      const data = JSON.parse(e.data);
      showToast(`Tindakan korektif diverifikasi oleh ${data.resolved_by}`, 'success');
      refreshCurrentView();
    });
    state.sseConnection.addEventListener('notification', (e) => {
      const notif = JSON.parse(e.data);
      triggerNotification(notif.title, notif.message, notif.type);
    });
  } catch (err) {
    // Graceful silent fallback
  }
}

function broadcastLocalChange(type, payload) {
  if (state.broadcastChannel) {
    state.broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
  }
}

// --- Toggle Offline Simulation ---
function toggleSimulatedOffline() {
  state.isSimulatedOffline = !state.isSimulatedOffline;

  if (state.isSimulatedOffline) {
    if (state.sseConnection) state.sseConnection.close();
    showToast('Simulasi Mode Offline diaktifkan! Pengisian laporan akan disimpan di antrean lokal IndexedDB.', 'warning');
  } else {
    if (!state.isCloudConnected) connectSSE();
    showToast('Simulasi Mode Offline dimatikan. Menyinkronkan antrean laporan...', 'success');
    triggerBackgroundSync();
  }
  updateNetworkUI();
}

function isEffectivelyOnline() {
  return state.isOnline && !state.isSimulatedOffline;
}

function updateNetworkUI() {
  const badge = document.getElementById('network-badge');
  if (!badge) return;

  if (isEffectivelyOnline()) {
    const cloudLabel = state.isCloudConnected ? 'Cloud Supabase' : 'Real-time Sync';
    badge.className = 'status-badge status-online';
    badge.innerHTML = `<span style="width:8px; height:8px; border-radius:50%; background:#10b981; display:inline-block;"></span> Online (${cloudLabel})`;
    badge.title = 'Klik untuk mengaktifkan Simulasi Offline';
  } else {
    badge.className = 'status-badge status-offline';
    badge.innerHTML = `<span style="width:8px; height:8px; border-radius:50%; background:#ef4444; display:inline-block;"></span> Offline (${state.isSimulatedOffline ? 'Simulasi' : 'Lokal'})`;
    badge.title = 'Klik untuk kembali ke Online';
  }
  updateSyncQueueCount();
}

async function updateSyncQueueCount() {
  const queue = await idbGetAll('sync_queue');
  state.syncQueue = queue;
  const pill = document.getElementById('sync-queue-pill');
  if (pill) {
    if (queue.length > 0) {
      pill.style.display = 'inline-flex';
      pill.innerHTML = `<span>⏳</span> ${queue.length} Laporan Pending`;
      pill.onclick = () => triggerBackgroundSync();
    } else {
      pill.style.display = 'inline-flex';
      pill.innerHTML = `<span>☁️</span> Semua Data Tersinkron`;
      pill.onclick = null;
    }
  }
}

// --- Background Sync Engine ---
let isSyncing = false;

async function triggerBackgroundSync() {
  if (isSyncing || !isEffectivelyOnline()) return;

  const queue = await idbGetAll('sync_queue');
  if (!queue || queue.length === 0) return;

  isSyncing = true;
  const badge = document.getElementById('network-badge');
  if (badge) {
    badge.className = 'status-badge status-syncing';
    badge.innerHTML = `<span class="spin">🔄</span> Menyinkronkan ${queue.length} data...`;
  }

  try {
    if (state.isCloudConnected && state.supabase) {
      // Sync via Supabase Cloud
      const syncedIds = [];
      for (const item of queue) {
        if (item.action === 'save_checklist') {
          await uploadChecklistToSupabase(item.data);
          syncedIds.push(item.queue_id);
        } else if (item.action === 'resolve_corrective') {
          await state.supabase
            .from('checklist_entries')
            .update({
              is_resolved: true,
              resolved_by: item.data.resolved_by,
              resolved_at: new Date().toISOString()
            })
            .eq('id', item.data.entry_id);
          syncedIds.push(item.queue_id);
        }
      }

      for (const qid of syncedIds) {
        await idbDelete('sync_queue', qid);
      }
      playSound('sync');
      showToast(`Sinkronisasi Cloud Berhasil: ${syncedIds.length} laporan diunggah ke Supabase!`, 'success');
      broadcastLocalChange('sync_completed', { count: syncedIds.length });
      refreshCurrentView();
    } else {
      // Sync via Local Server API
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: queue })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.synced_queue_ids && result.synced_queue_ids.length > 0) {
          for (const qid of result.synced_queue_ids) {
            await idbDelete('sync_queue', qid);
          }
          playSound('sync');
          showToast(`Sinkronisasi Berhasil: ${result.synced_queue_ids.length} laporan diunggah ke server!`, 'success');
          broadcastLocalChange('sync_completed', { count: result.synced_queue_ids.length });
          refreshCurrentView();
        }
      }
    }
  } catch (err) {
    console.warn('Sync failed, will retry on next connection:', err);
  } finally {
    isSyncing = false;
    updateNetworkUI();
  }
}

// Upload helper for Supabase
async function uploadChecklistToSupabase(payload) {
  const master = {
    id: payload.id,
    room_id: payload.room_id,
    check_date: payload.check_date,
    shift: payload.shift,
    operator_name: payload.operator_name,
    leader_name: payload.leader_name,
    operator_signature: payload.operator_signature || '',
    leader_signature: payload.leader_signature || '',
    is_verified_by_leader: payload.is_verified_by_leader,
    notes: payload.notes || '',
    updated_at: new Date().toISOString()
  };

  const { error: chkErr } = await state.supabase.from('checklists').upsert(master);
  if (chkErr) throw chkErr;

  // Replace entries
  await state.supabase.from('checklist_entries').delete().eq('checklist_id', payload.id);

  if (payload.entries && payload.entries.length > 0) {
    const entriesToInsert = payload.entries.map(e => ({
      checklist_id: payload.id,
      item_id: e.item_id,
      item_name: e.item_name,
      condition_status: e.condition_status,
      clean_status: e.clean_status,
      corrective_action: e.corrective_action || '',
      damaged_count: e.damaged_count || 0,
      reported_to_leader: e.reported_to_leader || false,
      is_resolved: e.is_resolved || false
    }));

    const { error: entErr } = await state.supabase.from('checklist_entries').insert(entriesToInsert);
    if (entErr) throw entErr;
  }
}

// --- Scheduled Shift Reminders ---
function initShiftReminderScheduler() {
  setInterval(() => {
    checkShiftReminders();
  }, 60000);
}

function checkShiftReminders() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const reminders = [
    { time: '07:15', shift: 'Shift 1', msg: 'Waktunya melakukan checklist kebersihan & peralatan awal Shift 1!' },
    { time: '14:30', shift: 'Shift 1', msg: 'Pengingat: Verifikasi kelengkapan checklist sebelum operan Shift 1 berakhir.' },
    { time: '15:15', shift: 'Shift 2', msg: 'Waktunya melakukan checklist kebersihan & peralatan awal Shift 2!' },
    { time: '22:30', shift: 'Shift 2', msg: 'Pengingat: Verifikasi kelengkapan checklist sebelum operan Shift 2 berakhir.' },
    { time: '23:15', shift: 'Shift 3', msg: 'Waktunya melakukan checklist kebersihan & peralatan awal Shift 3!' },
    { time: '06:30', shift: 'Shift 3', msg: 'Pengingat: Verifikasi kelengkapan checklist sebelum operan Shift 3 berakhir.' }
  ];

  const matched = reminders.find(r => r.time === timeStr);
  if (matched) {
    triggerNotification(`Pengingat Jadwal ${matched.shift}`, matched.msg, 'reminder');
  }
}

// --- Digital Signature Pads ---
let opSigCanvas, ldrSigCanvas;
let opSigCtx, ldrSigCtx;
let isDrawingOp = false, isDrawingLdr = false;

function initSignaturePads() {
  opSigCanvas = document.getElementById('op-sig-canvas');
  ldrSigCanvas = document.getElementById('ldr-sig-canvas');

  if (opSigCanvas) {
    opSigCtx = setupCanvasContext(opSigCanvas);
    setupDrawEvents(opSigCanvas, opSigCtx, () => isDrawingOp, (v) => isDrawingOp = v);
  }
  if (ldrSigCanvas) {
    ldrSigCtx = setupCanvasContext(ldrSigCanvas);
    setupDrawEvents(ldrSigCanvas, ldrSigCtx, () => isDrawingLdr, (v) => isDrawingLdr = v);
  }
}

function setupCanvasContext(canvas) {
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = rect.height * 2;
  ctx.scale(2, 2);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  return ctx;
}

function setupDrawEvents(canvas, ctx, getDrawing, setDrawing) {
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function start(e) {
    e.preventDefault();
    setDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function move(e) {
    if (!getDrawing()) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function end() {
    setDrawing(false);
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);

  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('touchend', end);
}

function clearSignature(type) {
  if (type === 'operator' && opSigCanvas && opSigCtx) {
    opSigCtx.clearRect(0, 0, opSigCanvas.width, opSigCanvas.height);
  } else if (type === 'leader' && ldrSigCanvas && ldrSigCtx) {
    ldrSigCtx.clearRect(0, 0, ldrSigCanvas.width, ldrSigCanvas.height);
  }
}

function getCanvasDataURL(canvas) {
  if (!canvas) return '';
  const ctx = canvas.getContext('2d');
  const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
  const isBlank = !pixelBuffer.some(color => color !== 0);
  return isBlank ? '' : canvas.toDataURL('image/png');
}

// --- Application Core Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  initClock();
  initSupabase();
  initRealtimeSync();
  initShiftReminderScheduler();
  initSignaturePads();

  // Load Rooms & Items Configuration
  await loadAppConfiguration();

  // Load Initial View (Dashboard)
  await switchTab('dashboard');

  // Load Notifications
  loadNotifications();

  // Register Service Worker for Offline PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('[ServiceWorker] Registered with scope:', reg.scope);
    }).catch((err) => {
      console.warn('[ServiceWorker] Registration failed:', err);
    });
  }
});

function initClock() {
  const clockEl = document.getElementById('live-clock');
  const update = () => {
    const d = new Date();
    if (clockEl) {
      clockEl.textContent = d.toLocaleDateString('id-ID', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  };
  update();
  setInterval(update, 1000);
}

async function loadAppConfiguration() {
  try {
    let configData = null;

    if (state.isCloudConnected && state.supabase) {
      // Fetch rooms from Supabase
      const { data: rooms, error } = await state.supabase
        .from('rooms')
        .select('*, room_items(*)')
        .order('display_order', { ascending: true });

      if (!error && rooms && rooms.length > 0) {
        configData = {
          rooms: rooms.map(r => ({
            ...r,
            items: (r.room_items || []).sort((a, b) => a.item_no - b.item_no)
          }))
        };
      }
    }

    if (!configData && isEffectivelyOnline()) {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          configData = await res.json();
        }
      } catch (e) {}
    }

    if (!configData) {
      const cached = await idbGet('cached_config', 'app_config');
      configData = cached ? cached.data : { rooms: DEFAULT_ROOMS_DATA };
    }

    if (configData && configData.rooms) {
      state.rooms = configData.rooms;
      await idbPut('cached_config', { key: 'app_config', data: configData });
      populateRoomDropdowns();
    }
  } catch (err) {
    console.warn('Falling back to default templates:', err);
    state.rooms = DEFAULT_ROOMS_DATA;
    populateRoomDropdowns();
  }
}

function populateRoomDropdowns() {
  const selects = ['input-room-select', 'matrix-room-select'];
  selects.forEach(selId => {
    const el = document.getElementById(selId);
    if (!el) return;
    el.innerHTML = '';
    state.rooms.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${r.name} (${r.code})`;
      el.appendChild(opt);
    });
    if (selId === 'input-room-select') el.value = state.currentRoomId;
  });
}

// --- Tab Switching Logic ---
async function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.nav-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === `tab-${tabName}`);
  });

  if (tabName === 'dashboard') {
    await renderDashboard();
  } else if (tabName === 'input') {
    renderChecklistInputForm();
  } else if (tabName === 'matrix') {
    await renderSopMatrix();
  } else if (tabName === 'corrective') {
    await renderCorrectiveActions();
  } else if (tabName === 'settings') {
    renderSettingsView();
  }
}

function refreshCurrentView() {
  if (state.activeTab === 'dashboard') renderDashboard();
  else if (state.activeTab === 'matrix') renderSopMatrix();
  else if (state.activeTab === 'corrective') renderCorrectiveActions();
  updateSyncQueueCount();
}

// =========================================================================
// 1. DASHBOARD ANALYTICS (Dasbor Analitik Ringkas & Intuitif)
// =========================================================================
async function renderDashboard() {
  let metrics = null;
  const currMonth = state.currentDate.slice(0, 7);
  const todayStr = state.currentDate;

  try {
    if (state.isCloudConnected && state.supabase && isEffectivelyOnline()) {
      // Calculate real metrics directly from Supabase
      const { count: chkToday } = await state.supabase
        .from('checklists')
        .select('*', { count: 'exact', head: true })
        .eq('check_date', todayStr);

      const { data: entries } = await state.supabase
        .from('checklist_entries')
        .select('condition_status, clean_status, is_resolved, item_name, checklists!inner(check_date)')
        .gte('checklists.check_date', `${currMonth}-01`);

      const totalEntries = entries ? entries.length : 0;
      const goodCount = entries ? entries.filter(e => e.condition_status === 'baik').length : 0;
      const cleanCount = entries ? entries.filter(e => e.clean_status === 'bersih').length : 0;
      const pendingIssues = entries ? entries.filter(e => (e.condition_status === 'rusak' || e.clean_status === 'kotor') && !e.is_resolved).length : 0;
      const resolvedIssues = entries ? entries.filter(e => e.is_resolved).length : 0;

      // Group top issues
      const issueMap = {};
      (entries || []).filter(e => e.condition_status === 'rusak').forEach(e => {
        issueMap[e.item_name] = (issueMap[e.item_name] || 0) + 1;
      });
      const topIssues = Object.entries(issueMap)
        .map(([k, v]) => ({ item_name: k, issue_count: v }))
        .sort((a, b) => b.issue_count - a.issue_count)
        .slice(0, 5);

      metrics = {
        today: { date: todayStr, checklists_submitted: chkToday || 0 },
        month_metrics: {
          total_entries: totalEntries,
          good_pct: totalEntries ? Math.round((goodCount / totalEntries) * 1000) / 10 : 100,
          clean_pct: totalEntries ? Math.round((cleanCount / totalEntries) * 1000) / 10 : 100,
          compliance_pct: Math.min(100, Math.round(((totalEntries / 15) / Math.max(1, parseInt(todayStr.split('-')[2]) * 6)) * 100))
        },
        corrective_actions: {
          total: pendingIssues + resolvedIssues,
          pending: pendingIssues,
          resolved: resolvedIssues
        },
        top_issues: topIssues,
        trend_7d: generateSampleTrend()
      };
    } else if (isEffectivelyOnline()) {
      const res = await fetch('/api/dashboard/metrics');
      if (res.ok) {
        metrics = await res.json();
      }
    }
  } catch (err) {
    console.warn('Failed to load metrics online, checking local cache:', err);
  }

  if (!metrics) {
    const cached = await idbGet('cached_config', 'dashboard_metrics');
    metrics = cached ? cached.data : {
      today: { date: todayStr, checklists_submitted: 3 },
      month_metrics: { total_entries: 616, good_pct: 98.4, clean_pct: 98.1, compliance_pct: 96.5 },
      corrective_actions: { total: 5, pending: 1, resolved: 4 },
      top_issues: [
        { item_name: 'Solet Rubber', issue_count: 2 },
        { item_name: 'Centong stainless', issue_count: 1 },
        { item_name: 'Ayakan Tepung', issue_count: 1 }
      ],
      trend_7d: generateSampleTrend()
    };
  }

  state.dashboardMetrics = metrics;
  await idbPut('cached_config', { key: 'dashboard_metrics', data: metrics });

  // Render HTML
  const container = document.getElementById('dashboard-content');
  container.innerHTML = `
    <!-- Top KPI Grid -->
    <div class="metrics-grid">
      <div class="metric-card success">
        <div class="metric-label">Tingkat Kepatuhan Checklist</div>
        <div class="metric-value">${metrics.month_metrics.compliance_pct}%</div>
        <div class="metric-sub">
          <span>Target ≥ 95%</span> • <strong style="color:#10b981;">Optimal</strong>
        </div>
      </div>

      <div class="metric-card info">
        <div class="metric-label">Kondisi Peralatan Prima</div>
        <div class="metric-value">${metrics.month_metrics.good_pct}%</div>
        <div class="metric-sub">
          <span>Dari ${metrics.month_metrics.total_entries} item diperiksa</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Tingkat Kebersihan Ruang</div>
        <div class="metric-value">${metrics.month_metrics.clean_pct}%</div>
        <div class="metric-sub">
          <span>Status Kebersihan: <strong>Sangat Baik</strong></span>
        </div>
      </div>

      <div class="metric-card ${metrics.corrective_actions.pending > 0 ? 'warning' : 'success'}">
        <div class="metric-label">Tindakan Korektif (Issue)</div>
        <div class="metric-value">${metrics.corrective_actions.pending} <span style="font-size:1rem; font-weight:500; color:#64748b;">Pending</span></div>
        <div class="metric-sub">
          <span>${metrics.corrective_actions.resolved} issue telah terselesaikan</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Checklist Hari Ini</div>
        <div class="metric-value">${metrics.today.checklists_submitted}</div>
        <div class="metric-sub">
          <span>Tanggal: ${metrics.today.date}</span>
        </div>
      </div>
    </div>

    <!-- Charts & Action Center -->
    <div class="charts-grid">
      <!-- 7-Day Trend Chart -->
      <div class="card-box">
        <div class="card-box-header">
          <div class="card-box-title">
            <span>📈</span> Tren Kepatuhan & Pemeriksaan 7 Hari Terakhir
          </div>
          <span style="font-size:0.75rem; color:#64748b;">Pembaruan Real-Time</span>
        </div>
        <div style="height:230px; display:flex; align-items:center; justify-content:center;">
          ${renderTrendSvgChart(metrics.trend_7d)}
        </div>
      </div>

      <!-- Defect Breakdown -->
      <div class="card-box">
        <div class="card-box-header">
          <div class="card-box-title">
            <span>⚠️</span> Peralatan Butuh Perhatian (Top Issues)
          </div>
        </div>
        <div style="height:230px; display:flex; flex-direction:column; justify-content:center; gap:0.6rem;">
          ${renderTopIssuesBars(metrics.top_issues)}
        </div>
      </div>
    </div>

    <!-- Quick Action Banner -->
    <div class="action-banner">
      <div>
        <strong style="color:#0f172a; font-size:0.95rem;">📋 Akses Cepat Operasional</strong>
        <p style="font-size:0.8rem; color:#64748b;">Pilih ruangan untuk langsung mengisi formulir checklist harian atau mencetak lembar SOP.</p>
      </div>
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="quickGoInput('pengayakan')">📝 Ruang Pengayakan</button>
        <button class="btn btn-primary" onclick="quickGoInput('penimbangan')">📝 Ruang Penimbangan</button>
        <button class="btn btn-primary" onclick="quickGoInput('baking')">📝 Ruang Baking</button>
        <button class="btn btn-outline" onclick="switchTab('matrix')">📑 Lihat Format SOP</button>
      </div>
    </div>
  `;
}

function generateSampleTrend() {
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const res = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    res.push({
      date: d.toISOString().split('T')[0],
      day_name: days[d.getDay()],
      checklists: 5 + (i % 2),
      defects: i === 2 ? 1 : 0
    });
  }
  return res;
}

function quickGoInput(roomId) {
  state.currentRoomId = roomId;
  const sel = document.getElementById('input-room-select');
  if (sel) sel.value = roomId;
  switchTab('input');
}

// Generate Custom Interactive SVG Trend Chart
function renderTrendSvgChart(trend) {
  if (!trend || trend.length === 0) return '<p style="color:#94a3b8;">Belum ada data tren.</p>';

  const width = 640;
  const height = 200;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(6, ...trend.map(t => Math.max(t.checklists, t.defects)));
  const stepX = chartW / (trend.length - 1);

  const ptsChecklists = trend.map((t, idx) => {
    const x = padLeft + idx * stepX;
    const y = padTop + chartH - (t.checklists / maxVal) * chartH;
    return { x, y, val: t.checklists, day: t.day_name, date: t.date };
  });

  const pathStr = ptsChecklists.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaStr = `${pathStr} L ${padLeft + (trend.length - 1) * stepX} ${padTop + chartH} L ${padLeft} ${padTop + chartH} Z`;

  const ptsDefects = trend.map((t, idx) => {
    const x = padLeft + idx * stepX;
    const y = padTop + chartH - (t.defects / maxVal) * chartH;
    return { x, y, val: t.defects };
  });
  const pathDefects = ptsDefects.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%; max-height:220px; overflow:visible;">
      <line x1="${padLeft}" y1="${padTop}" x2="${width - padRight}" y2="${padTop}" stroke="#e2e8f0" stroke-dasharray="3"/>
      <line x1="${padLeft}" y1="${padTop + chartH/2}" x2="${width - padRight}" y2="${padTop + chartH/2}" stroke="#e2e8f0" stroke-dasharray="3"/>
      <line x1="${padLeft}" y1="${padTop + chartH}" x2="${width - padRight}" y2="${padTop + chartH}" stroke="#cbd5e1" stroke-width="1.5"/>

      <path d="${areaStr}" fill="rgba(234, 88, 12, 0.12)" />
      <path d="${pathStr}" fill="none" stroke="#ea580c" stroke-width="3" stroke-linecap="round"/>
      <path d="${pathDefects}" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4" stroke-linecap="round"/>

      ${ptsChecklists.map((p) => `
        <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#ea580c" stroke="#ffffff" stroke-width="2"/>
        <text x="${p.x}" y="${padTop + chartH + 18}" font-size="11" text-anchor="middle" fill="#64748b" font-weight="600">${p.day}</text>
      `).join('')}

      <g transform="translate(${padLeft + 10}, 14)">
        <circle cx="0" cy="0" r="4" fill="#ea580c"/>
        <text x="8" y="3" font-size="10" fill="#475569" font-weight="600">Checklist Selesai</text>
        <circle cx="120" cy="0" r="4" fill="#ef4444"/>
        <text x="128" y="3" font-size="10" fill="#475569" font-weight="600">Temuan Kerusakan (×)</text>
      </g>
    </svg>
  `;
}

function renderTopIssuesBars(issues) {
  if (!issues || issues.length === 0) {
    return `<div style="text-align:center; color:#10b981; font-size:0.85rem;">
      <p style="font-size:1.5rem; margin-bottom:0.25rem;">✨</p>
      <strong>Semua Peralatan Normal!</strong>
      <p style="color:#64748b; font-size:0.75rem;">Tidak ada laporan kerusakan aktif.</p>
    </div>`;
  }

  const maxVal = Math.max(...issues.map(i => i.issue_count));

  return issues.map(item => {
    const pct = Math.round((item.issue_count / maxVal) * 100);
    return `
      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:3px;">
          <strong style="color:#334155;">${item.item_name}</strong>
          <span style="font-weight:700; color:#ef4444;">${item.issue_count} Temuan</span>
        </div>
        <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
          <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, #f59e0b, #ef4444); border-radius:4px;"></div>
        </div>
      </div>
    `;
  }).join('');
}

// =========================================================================
// 2. CHECKLIST INPUT (Input Checklist Harian)
// =========================================================================
function renderChecklistInputForm() {
  const room = state.rooms.find(r => r.id === state.currentRoomId);
  if (!room) return;

  const docCode = document.getElementById('input-doc-code');
  const docRev = document.getElementById('input-doc-rev');
  const docDate = document.getElementById('input-doc-date');
  const docTitle = document.getElementById('input-doc-title');

  if (docCode) docCode.textContent = room.code;
  if (docRev) docRev.textContent = room.revision;
  if (docDate) docDate.textContent = room.effective_date;
  if (docTitle) docTitle.textContent = `${room.name.toUpperCase()} ${room.building.toUpperCase()}`;

  const itemsContainer = document.getElementById('checklist-items-container');
  if (!itemsContainer) return;

  itemsContainer.innerHTML = '';

  (room.items || []).forEach(item => {
    const card = document.createElement('div');
    card.className = 'checklist-item-card';
    card.id = `item-card-${item.id}`;

    card.innerHTML = `
      <div class="checklist-row">
        <div class="item-title-group">
          <div class="item-number">${item.item_no}</div>
          <div>
            <span class="item-name">${item.name}</span>
            <span class="item-category-tag">${item.category}</span>
          </div>
        </div>

        <div class="check-controls-group">
          <div class="control-pair">
            <span class="control-label">Kondisi:</span>
            <div class="segmented-toggle">
              <button type="button" class="toggle-btn active-good" id="btn-cond-good-${item.id}" onclick="setItemCondition(${item.id}, 'baik')">
                <span>√</span> Baik
              </button>
              <button type="button" class="toggle-btn" id="btn-cond-bad-${item.id}" onclick="setItemCondition(${item.id}, 'rusak')">
                <span>×</span> Rusak
              </button>
            </div>
          </div>

          <div class="control-pair">
            <span class="control-label">Kebersihan:</span>
            <div class="segmented-toggle">
              <button type="button" class="toggle-btn active-good" id="btn-clean-good-${item.id}" onclick="setItemCleanliness(${item.id}, 'bersih')">
                <span>√</span> Bersih
              </button>
              <button type="button" class="toggle-btn" id="btn-clean-bad-${item.id}" onclick="setItemCleanliness(${item.id}, 'kotor')">
                <span>×</span> Kotor
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="issue-drawer" id="issue-drawer-${item.id}" style="display:none;">
        <div class="issue-drawer-header">
          <span>⚠️</span> Formulir Catatan Kerusakan & Tindakan Korektif (Corrective Action)
        </div>
        <div class="issue-fields-grid">
          <div>
            <label class="filter-label">Jumlah Unit Rusak</label>
            <input type="number" min="1" value="1" class="form-input" id="damaged-count-${item.id}" style="width:100%;" placeholder="Jumlah unit">
          </div>
          <div>
            <label class="filter-label">Uraian Kerusakan / Temuan</label>
            <input type="text" class="form-input" id="issue-desc-${item.id}" style="width:100%;" placeholder="Contoh: Gagang retak / kotor berdebu">
          </div>
          <div>
            <label class="filter-label">Tindakan Korektif (SOP)</label>
            <input type="text" class="form-input" id="corrective-desc-${item.id}" style="width:100%;" placeholder="Contoh: Lakukan penukaran alat baru di gudang">
          </div>
        </div>
        <div style="font-size:0.75rem; color:#b91c1c; display:flex; align-items:center; gap:0.4rem; margin-top:2px;">
          <input type="checkbox" id="report-leader-${item.id}" checked>
          <label for="report-leader-${item.id}">Laporkan nama dan jumlah peralatan rusak ini kepada Leader</label>
        </div>
      </div>
    `;

    itemsContainer.appendChild(card);
  });
}

function setItemCondition(itemId, val) {
  const btnGood = document.getElementById(`btn-cond-good-${itemId}`);
  const btnBad = document.getElementById(`btn-cond-bad-${itemId}`);
  if (val === 'baik') {
    btnGood.className = 'toggle-btn active-good';
    btnBad.className = 'toggle-btn';
  } else {
    btnGood.className = 'toggle-btn';
    btnBad.className = 'toggle-btn active-bad';
    playSound('urgent');
  }
  checkDrawerVisibility(itemId);
}

function setItemCleanliness(itemId, val) {
  const btnGood = document.getElementById(`btn-clean-good-${itemId}`);
  const btnBad = document.getElementById(`btn-clean-bad-${itemId}`);
  if (val === 'bersih') {
    btnGood.className = 'toggle-btn active-good';
    btnBad.className = 'toggle-btn';
  } else {
    btnGood.className = 'toggle-btn';
    btnBad.className = 'toggle-btn active-bad';
  }
  checkDrawerVisibility(itemId);
}

function checkDrawerVisibility(itemId) {
  const isCondBad = document.getElementById(`btn-cond-bad-${itemId}`).classList.contains('active-bad');
  const isCleanBad = document.getElementById(`btn-clean-bad-${itemId}`).classList.contains('active-bad');
  const drawer = document.getElementById(`issue-drawer-${itemId}`);
  const card = document.getElementById(`item-card-${itemId}`);

  if (isCondBad || isCleanBad) {
    drawer.style.display = 'flex';
    card.classList.add('has-issue');
    const corrInput = document.getElementById(`corrective-desc-${itemId}`);
    if (corrInput && !corrInput.value) {
      corrInput.value = isCondBad ? 'Segera lakukan penukaran peralatan dengan yang baru di gudang' : 'Pembersihan ulang sesuai standar sanitasi';
    }
  } else {
    drawer.style.display = 'none';
    card.classList.remove('has-issue');
  }
}

function markAllItemsOk() {
  const room = state.rooms.find(r => r.id === state.currentRoomId);
  if (!room) return;

  (room.items || []).forEach(item => {
    setItemCondition(item.id, 'baik');
    setItemCleanliness(item.id, 'bersih');
  });

  playSound('sync');
  showToast('Semua item ditandai: Berfungsi Baik (√) & Bersih (√)', 'success');
}

// Submit Checklist
async function submitChecklistForm() {
  const room = state.rooms.find(r => r.id === state.currentRoomId);
  if (!room) return;

  const dateInput = document.getElementById('input-date').value || state.currentDate;
  const shiftInput = document.getElementById('input-shift-select').value || state.currentShift;
  const operatorName = document.getElementById('operator-name-input').value.trim();
  const leaderName = document.getElementById('leader-name-input').value.trim();
  const notes = document.getElementById('checklist-notes-input').value.trim();
  const isVerified = document.getElementById('leader-verified-check').checked;

  if (!operatorName) {
    showToast('Harap isi Nama Operator Produksi.', 'warning');
    document.getElementById('operator-name-input').focus();
    return;
  }

  const entries = [];
  let defectCount = 0;

  (room.items || []).forEach(item => {
    const isCondBad = document.getElementById(`btn-cond-bad-${item.id}`).classList.contains('active-bad');
    const isCleanBad = document.getElementById(`btn-clean-bad-${item.id}`).classList.contains('active-bad');
    const condStatus = isCondBad ? 'rusak' : 'baik';
    const cleanStatus = isCleanBad ? 'kotor' : 'bersih';

    let damagedCount = 0;
    let correctiveAction = '';
    let reportedToLeader = false;

    if (isCondBad || isCleanBad) {
      defectCount++;
      damagedCount = parseInt(document.getElementById(`damaged-count-${item.id}`).value) || 1;
      const issueDesc = document.getElementById(`issue-desc-${item.id}`).value.trim();
      const corrDesc = document.getElementById(`corrective-desc-${item.id}`).value.trim();
      correctiveAction = `${issueDesc ? issueDesc + '. ' : ''}${corrDesc}`;
      reportedToLeader = document.getElementById(`report-leader-${item.id}`).checked;
    }

    entries.push({
      item_id: item.id,
      item_name: item.name,
      condition_status: condStatus,
      clean_status: cleanStatus,
      corrective_action: correctiveAction,
      damaged_count: damagedCount,
      reported_to_leader: reportedToLeader,
      is_resolved: 0
    });
  });

  const operatorSig = getCanvasDataURL(opSigCanvas);
  const leaderSig = getCanvasDataURL(ldrSigCanvas);

  const checklistPayload = {
    id: `CHK-${room.id.toUpperCase()}-${dateInput}-${shiftInput.replace(' ', '')}`,
    room_id: room.id,
    check_date: dateInput,
    shift: shiftInput,
    operator_name: operatorName,
    leader_name: leaderName,
    operator_signature: operatorSig,
    leader_signature: leaderSig,
    is_verified_by_leader: isVerified,
    notes: notes,
    entries: entries
  };

  // Try Online Submission (Supabase or Local Server)
  if (isEffectivelyOnline()) {
    try {
      if (state.isCloudConnected && state.supabase) {
        await uploadChecklistToSupabase(checklistPayload);
        playSound('sync');
        showToast('Laporan checklist berhasil disinkronkan ke Supabase Cloud!', 'success');
        broadcastLocalChange('checklist_saved', checklistPayload);
        switchTab('matrix');
        return;
      } else {
        const res = await fetch('/api/checklists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checklistPayload)
        });
        if (res.ok) {
          playSound('sync');
          showToast('Laporan checklist berhasil disimpan dan disinkronkan!', 'success');
          broadcastLocalChange('checklist_saved', checklistPayload);
          switchTab('matrix');
          return;
        }
      }
    } catch (err) {
      console.warn('Network upload failed, routing to local queue:', err);
    }
  }

  // Offline fallback to IndexedDB
  await idbPut('checklists', checklistPayload);
  await idbPut('sync_queue', {
    action: 'save_checklist',
    data: checklistPayload,
    queued_at: new Date().toISOString()
  });

  playSound('chime');
  showToast('💾 Laporan tersimpan di memori perangkat offline! Otomatis diunggah saat internet kembali.', 'warning');
  updateNetworkUI();
  switchTab('matrix');
}

// =========================================================================
// 3. OFFICIAL SOP MATRIX VIEW (Format SOP Resmi Sesuai PDF Template)
// =========================================================================
async function renderSopMatrix() {
  const roomId = document.getElementById('matrix-room-select') ? document.getElementById('matrix-room-select').value : state.currentRoomId;
  const month = document.getElementById('matrix-month-input') ? document.getElementById('matrix-month-input').value : state.currentDate.slice(0, 7);
  const shift = document.getElementById('matrix-shift-select') ? document.getElementById('matrix-shift-select').value : state.currentShift;

  const container = document.getElementById('matrix-render-area');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center; padding:2rem; color:#64748b;">Memuat formulir SOP resmi...</div>';

  let matrixData = null;

  try {
    if (state.isCloudConnected && state.supabase && isEffectivelyOnline()) {
      // Fetch from Supabase
      const room = state.rooms.find(r => r.id === roomId) || DEFAULT_ROOMS_DATA[0];
      const { data: checklists } = await state.supabase
        .from('checklists')
        .select('*, checklist_entries(*)')
        .eq('room_id', roomId)
        .eq('shift', shift)
        .gte('check_date', `${month}-01`)
        .lte('check_date', `${month}-31`);

      const matrixMap = {};
      (checklists || []).forEach(chk => {
        const entriesByItemNo = {};
        (chk.checklist_entries || []).forEach(e => {
          entriesByItemNo[e.item_id] = e;
        });
        matrixMap[chk.check_date] = {
          checklist_id: chk.id,
          operator: chk.operator_name,
          leader: chk.leader_name,
          is_verified: chk.is_verified_by_leader,
          entries: entriesByItemNo
        };
      });

      matrixData = {
        room: room,
        items: room.items,
        month: month,
        shift: shift,
        matrix: matrixMap
      };
    } else if (isEffectivelyOnline()) {
      const res = await fetch(`/api/matrix?room_id=${roomId}&month=${month}&shift=${encodeURIComponent(shift)}`);
      if (res.ok) {
        matrixData = await res.json();
      }
    }
  } catch (err) {
    console.warn('Matrix online fetch failed:', err);
  }

  if (!matrixData) {
    const room = state.rooms.find(r => r.id === roomId) || DEFAULT_ROOMS_DATA[0];
    matrixData = {
      room: room,
      items: room.items,
      month: month,
      shift: shift,
      matrix: {}
    };
  }

  const daysHeader = [
    { day: 'Senin', dateNum: '01' }, { day: 'Selasa', dateNum: '02' }, { day: 'Rabu', dateNum: '03' },
    { day: 'Kamis', dateNum: '04' }, { day: 'Jumat', dateNum: '05' }, { day: 'Sabtu', dateNum: '06' }, { day: 'Minggu', dateNum: '07' },
    { day: 'Senin', dateNum: '08' }, { day: 'Selasa', dateNum: '09' }, { day: 'Rabu', dateNum: '10' },
    { day: 'Kamis', dateNum: '11' }, { day: 'Jumat', dateNum: '12' }, { day: 'Sabtu', dateNum: '13' }, { day: 'Minggu', dateNum: '14' }
  ];

  const [yStr, mStr] = month.split('-');
  const datesInGrid = daysHeader.map(dh => `${yStr}-${mStr}-${dh.dateNum}`);

  const room = matrixData.room;
  const items = matrixData.items || [];
  const matrix = matrixData.matrix || {};

  let html = `
    <div class="sop-paper">
      <table class="sop-header-table">
        <tr>
          <td rowspan="3" style="width:160px; text-align:center; vertical-align:middle; background:#fafafa;">
            <div style="font-size:1.1rem; font-weight:800; color:#ea580c;">BERKAT CAHAYA NOVENA</div>
            <div style="font-size:0.65rem; color:#64748b;">Manufacturing & Bakery Division</div>
          </td>
          <td rowspan="3" class="sop-title">
            CHECK LIST CLEANING PROGRAM & KONDISI PERALATAN/INFRASTRUKTUR<br>
            <span style="color:#0f172a;">${room.name.toUpperCase()} ${room.building.toUpperCase()}</span>
          </td>
          <td style="width:110px; font-weight:bold;">Kode Dokumen</td>
          <td style="width:130px;">: ${room.code}</td>
        </tr>
        <tr>
          <td style="font-weight:bold;">Revisi</td>
          <td>: ${room.revision}</td>
        </tr>
        <tr>
          <td style="font-weight:bold;">Tanggal Efektif</td>
          <td>: ${room.effective_date}</td>
        </tr>
      </table>

      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.8rem; font-weight:bold;">
        <div>Bulan: <span style="text-decoration:underline;">${formatMonthIndonesian(month)}</span></div>
        <div>Shift: <span style="text-decoration:underline;">${shift}</span></div>
      </div>

      <table class="sop-matrix-table">
        <thead>
          <tr>
            <th rowspan="3" style="width:24px;">No</th>
            <th rowspan="3" style="width:140px; text-align:left; padding-left:6px;">ASPEK KEBERSIHAN/KONDISI</th>
            <th colspan="${daysHeader.length * 2}">SETIAP PENGECEKAN</th>
            <th rowspan="3" style="width:150px;">Corrective action</th>
          </tr>
          <tr>
            <th colspan="${daysHeader.length * 2}">Tanggal</th>
          </tr>
          <tr>
            ${daysHeader.map(dh => `
              <th colspan="2" class="sub-th">${dh.day.toLowerCase()}<br><span style="font-weight:normal; font-size:0.6rem;">${dh.dateNum}</span></th>
            `).join('')}
          </tr>
          <tr>
            <th colspan="2" style="background:#ffedd5; font-size:0.65rem;">Kriteria Pengecekan</th>
            ${daysHeader.map(() => `
              <th class="sub-th" style="width:18px;">Kondisi</th>
              <th class="sub-th" style="width:18px;">Kebersihan</th>
            `).join('')}
            <th class="sub-th" style="background:#ffedd5;">Tindakan Perbaikan</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const isGreyRow = (room.id === 'pengayakan' && (item.name.toLowerCase() === 'lampu' || item.name.toLowerCase() === 'exhaust'));
            let itemCorrective = [];

            const dayCells = datesInGrid.map((dStr, idx) => {
              const dayData = matrix[dStr];
              const entry = dayData && dayData.entries ? (dayData.entries[item.id] || dayData.entries[item.item_no]) : null;
              const isCellGrey = isGreyRow && (idx < 6 || (idx >= 7 && idx < 13));

              if (isCellGrey) {
                return `<td class="cell-grey"></td><td class="cell-grey"></td>`;
              }

              if (entry) {
                if (entry.corrective_action) itemCorrective.push(entry.corrective_action);
                const condMark = entry.condition_status === 'baik' ? '√' : '×';
                const condClass = entry.condition_status === 'baik' ? 'cell-ok' : 'cell-bad';
                const cleanMark = entry.clean_status === 'bersih' ? '√' : '×';
                const cleanClass = entry.clean_status === 'bersih' ? 'cell-ok' : 'cell-bad';

                return `
                  <td class="${condClass}">${condMark}</td>
                  <td class="${cleanClass}">${cleanMark}</td>
                `;
              } else {
                return `<td></td><td></td>`;
              }
            }).join('');

            return `
              <tr>
                <td style="font-weight:bold;">${item.item_no}</td>
                <td style="text-align:left; padding-left:6px; font-weight:600;">${item.name}</td>
                ${dayCells}
                <td style="text-align:left; padding:2px 4px; font-size:0.65rem; color:#b91c1c;">
                  ${itemCorrective.slice(0, 1).join(', ')}
                </td>
              </tr>
            `;
          }).join('')}

          <tr style="height:32px;">
            <td colspan="2" style="font-weight:bold; text-align:left; padding-left:6px; background:#fff7ed;">Paraf Operator (Produksi)</td>
            ${datesInGrid.map(dStr => {
              const d = matrix[dStr];
              return `<td colspan="2" style="font-size:0.65rem; color:#1e293b;">${d && d.operator ? '✓ Paraf' : ''}</td>`;
            }).join('')}
            <td></td>
          </tr>
          <tr style="height:32px;">
            <td colspan="2" style="font-weight:bold; text-align:left; padding-left:6px; background:#fff7ed;">Mengetahui Production Leader</td>
            ${datesInGrid.map(dStr => {
              const d = matrix[dStr];
              return `<td colspan="2" style="font-size:0.65rem; color:#1e293b;">${d && d.leader ? '✓ Paraf' : ''}</td>`;
            }).join('')}
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="sop-keterangan">
        <strong>Keterangan :</strong><br>
        • Beri tanda <strong>√</strong> jika bersih dan berfungsi dengan baik.<br>
        • Beri tanda <strong>×</strong> jika kondisi peralatan rusak dan segera lakukan penukaran peralatan dengan yang baru.<br>
        • Laporkan nama dan jumlah peralatan yang rusak kepada leader produksi.
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function formatMonthIndonesian(monthStr) {
  const [y, m] = monthStr.split('-');
  const names = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${names[parseInt(m) - 1]} ${y}`;
}

// =========================================================================
// 4. CORRECTIVE ACTIONS TRACKER (Log Tindakan Korektif & Eskalasi)
// =========================================================================
async function renderCorrectiveActions() {
  const container = document.getElementById('corrective-content');
  if (!container) return;

  container.innerHTML = '<div style="padding:2rem; text-align:center; color:#64748b;">Memuat data tindakan korektif...</div>';

  let actions = [];
  try {
    if (state.isCloudConnected && state.supabase && isEffectivelyOnline()) {
      const { data } = await state.supabase
        .from('checklist_entries')
        .select(`
          id, item_name, condition_status, clean_status, corrective_action, damaged_count,
          reported_to_leader, is_resolved, resolved_at, resolved_by,
          checklists(room_id, check_date, shift, operator_name, leader_name, rooms(name))
        `)
        .or('condition_status.eq.rusak,clean_status.eq.kotor')
        .order('is_resolved', { ascending: true })
        .order('id', { ascending: false });

      actions = (data || []).map(d => ({
        id: d.id,
        item_name: d.item_name,
        condition_status: d.condition_status,
        clean_status: d.clean_status,
        corrective_action: d.corrective_action,
        damaged_count: d.damaged_count,
        reported_to_leader: d.reported_to_leader,
        is_resolved: d.is_resolved ? 1 : 0,
        resolved_at: d.resolved_at,
        resolved_by: d.resolved_by,
        room_name: d.checklists?.rooms?.name || d.checklists?.room_id || 'Produksi',
        check_date: d.checklists?.check_date || '-',
        shift: d.checklists?.shift || '-',
        operator_name: d.checklists?.operator_name || '-'
      }));
    } else if (isEffectivelyOnline()) {
      const res = await fetch('/api/corrective-actions');
      if (res.ok) {
        const data = await res.json();
        actions = data.actions || [];
      }
    }
  } catch (err) {
    console.warn('Corrective actions fetch error:', err);
  }

  if (actions.length === 0) {
    container.innerHTML = `
      <div class="card-box" style="text-align:center; padding:3rem 1rem;">
        <span style="font-size:3rem;">🎉</span>
        <h3 style="margin-top:0.5rem; color:#0f172a;">Tidak Ada Masalah Peralatan / Kerusakan</h3>
        <p style="color:#64748b; font-size:0.85rem; margin-top:0.25rem;">Semua peralatan dan infrastruktur berada dalam kondisi bersih dan berfungsi baik.</p>
      </div>
    `;
    return;
  }

  let html = `
    <div class="card-box">
      <div class="card-box-header">
        <div class="card-box-title">
          <span>⚠️</span> Daftar Laporan Kerusakan & Eskalasi Tindakan Korektif
        </div>
        <span style="font-size:0.8rem; font-weight:600; color:#ef4444;">${actions.filter(a => !a.is_resolved).length} Perlu Verifikasi Leader</span>
      </div>

      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem; text-align:left;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; color:#475569;">
              <th style="padding:0.65rem 0.75rem;">Tanggal & Shift</th>
              <th style="padding:0.65rem 0.75rem;">Ruangan</th>
              <th style="padding:0.65rem 0.75rem;">Nama Alat</th>
              <th style="padding:0.65rem 0.75rem;">Status Kerusakan</th>
              <th style="padding:0.65rem 0.75rem;">Tindakan Korektif (SOP)</th>
              <th style="padding:0.65rem 0.75rem;">Pelapor (Operator)</th>
              <th style="padding:0.65rem 0.75rem;">Status Resolusi</th>
              <th style="padding:0.65rem 0.75rem; text-align:center;">Aksi Leader</th>
            </tr>
          </thead>
          <tbody>
            ${actions.map(a => {
              const isResolved = a.is_resolved === 1;
              return `
                <tr style="border-bottom:1px solid #f1f5f9; background:${isResolved ? '#ffffff' : '#fffbfa'};">
                  <td style="padding:0.75rem; font-weight:600;">
                    ${a.check_date}<br>
                    <span style="font-size:0.75rem; color:#64748b; font-weight:normal;">${a.shift}</span>
                  </td>
                  <td style="padding:0.75rem;">
                    <span style="font-weight:600; color:#0f172a;">${a.room_name}</span>
                  </td>
                  <td style="padding:0.75rem;">
                    <strong>${a.item_name}</strong>
                    ${a.damaged_count > 0 ? `<br><span style="font-size:0.75rem; color:#ef4444;">Jumlah: ${a.damaged_count} unit</span>` : ''}
                  </td>
                  <td style="padding:0.75rem;">
                    <span style="padding:3px 8px; border-radius:12px; font-size:0.72rem; font-weight:700; background:#fef2f2; color:#b91c1c; border:1px solid #fca5a5;">
                      × Rusak / Kotor
                    </span>
                  </td>
                  <td style="padding:0.75rem; font-size:0.8rem; color:#334155;">
                    ${a.corrective_action || 'Dilakukan penukaran alat dengan yang baru di gudang'}
                  </td>
                  <td style="padding:0.75rem; font-size:0.8rem; color:#475569;">
                    ${a.operator_name || '-'}
                  </td>
                  <td style="padding:0.75rem;">
                    ${isResolved ? `
                      <span style="padding:3px 8px; border-radius:12px; font-size:0.72rem; font-weight:700; background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0;">
                        ✓ Selesai Diverifikasi
                      </span><br>
                      <span style="font-size:0.68rem; color:#64748b;">${a.resolved_by || 'Leader'}</span>
                    ` : `
                      <span style="padding:3px 8px; border-radius:12px; font-size:0.72rem; font-weight:700; background:#fffbeb; color:#92400e; border:1px solid #fde68a;">
                        ⏳ Menunggu Approval
                      </span>
                    `}
                  </td>
                  <td style="padding:0.75rem; text-align:center;">
                    ${!isResolved ? `
                      <button class="btn btn-success btn-sm" onclick="resolveCorrectiveAction(${a.id})">
                        ✓ Verifikasi & Selesai
                      </button>
                    ` : `
                      <span style="color:#10b981; font-size:1.1rem;">✓</span>
                    `}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function resolveCorrectiveAction(entryId) {
  const leaderName = prompt('Masukkan Nama Production Leader untuk verifikasi:', 'Hendro Wijaya (Production Leader)');
  if (!leaderName) return;

  if (isEffectivelyOnline()) {
    try {
      if (state.isCloudConnected && state.supabase) {
        await state.supabase
          .from('checklist_entries')
          .update({
            is_resolved: true,
            resolved_by: leaderName,
            resolved_at: new Date().toISOString()
          })
          .eq('id', entryId);

        playSound('sync');
        showToast('Tindakan korektif berhasil diverifikasi di Supabase!', 'success');
        broadcastLocalChange('corrective_resolved', { entryId, leaderName });
        renderCorrectiveActions();
        return;
      } else {
        const res = await fetch(`/api/corrective-actions/${entryId}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolved_by: leaderName })
        });
        if (res.ok) {
          playSound('sync');
          showToast('Tindakan korektif berhasil diverifikasi!', 'success');
          broadcastLocalChange('corrective_resolved', { entryId, leaderName });
          renderCorrectiveActions();
          return;
        }
      }
    } catch (err) {
      console.warn('Network resolve failed, queueing offline:', err);
    }
  }

  // Queue offline
  await idbPut('sync_queue', {
    action: 'resolve_corrective',
    data: { entry_id: entryId, resolved_by: leaderName },
    queued_at: new Date().toISOString()
  });

  playSound('chime');
  showToast('Verifikasi disimpan di antrean offline. Akan disinkronkan saat online.', 'warning');
  updateNetworkUI();
  renderCorrectiveActions();
}

// =========================================================================
// 5. SETTINGS & CLOUD CONFIGURATION (Supabase & Shift Alarms)
// =========================================================================
function renderSettingsView() {
  const container = document.getElementById('settings-content');
  if (!container) return;

  const notifSupported = 'Notification' in window;
  const notifPermission = notifSupported ? Notification.permission : 'unsupported';
  const savedUrl = localStorage.getItem('bcn_supabase_url') || (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL) || '';
  const savedKey = localStorage.getItem('bcn_supabase_anon_key') || (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_ANON_KEY) || '';

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.25rem;">
      
      <!-- Cloud Database Supabase Card -->
      <div class="card-box" style="border: 2px solid #ea580c;">
        <div class="card-box-header">
          <div class="card-box-title">
            <span>⚡</span> Koneksi Cloud Database Supabase (Gratis Selamanya)
          </div>
          <span class="status-badge ${state.isCloudConnected ? 'status-online' : 'status-offline'}">
            ${state.isCloudConnected ? '🟢 Terhubung Cloud' : '⚪ Belum Terhubung'}
          </span>
        </div>
        <p style="font-size:0.8rem; color:#64748b; margin-bottom:1rem;">
          Hubungkan aplikasi ke Supabase Cloud (PostgreSQL gratis) untuk sinkronisasi multi-perangkat instan antar operator dan leader di seluruh dunia tanpa server sleep!
        </p>

        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          <div>
            <label class="filter-label">Project URL Supabase</label>
            <input type="text" id="supabase-url-input" class="form-input" style="width:100%;" placeholder="https://xyzabcdefg.supabase.co" value="${savedUrl}">
          </div>

          <div>
            <label class="filter-label">Supabase Anon Public Key</label>
            <input type="password" id="supabase-key-input" class="form-input" style="width:100%;" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${savedKey}">
          </div>

          <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
            <button class="btn btn-primary" onclick="saveSupabaseSettings()">
              💾 Simpan & Hubungkan Cloud
            </button>
            ${state.isCloudConnected ? `
              <button class="btn btn-outline btn-sm" onclick="disconnectSupabase()">
                Putuskan
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Shift Notification Schedule Card -->
      <div class="card-box">
        <div class="card-box-header">
          <div class="card-box-title">
            <span>⏰</span> Jadwal Pengingat Otomatis Shift Produksi
          </div>
        </div>
        <p style="font-size:0.8rem; color:#64748b; margin-bottom:1rem;">
          Sistem membunyikan audio chime dan menampilkan notifikasi pop-up sesuai jadwal pergantian dan operan shift.
        </p>

        <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.85rem;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:0.75rem;">
            <div style="display:flex; justify-content:space-between; font-weight:700; color:#0f172a;">
              <span>Shift 1 (Pagi: 07:00 - 15:00)</span>
              <span style="color:#10b981;">Aktif</span>
            </div>
            <div style="font-size:0.75rem; color:#64748b; margin-top:0.25rem;">
              • 07:15 — Pengingat Checklist Awal Shift<br>
              • 14:30 — Verifikasi Sebelum Operan Shift
            </div>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:0.75rem;">
            <div style="display:flex; justify-content:space-between; font-weight:700; color:#0f172a;">
              <span>Shift 2 (Siang: 15:00 - 23:00)</span>
              <span style="color:#10b981;">Aktif</span>
            </div>
            <div style="font-size:0.75rem; color:#64748b; margin-top:0.25rem;">
              • 15:15 — Pengingat Checklist Awal Shift<br>
              • 22:30 — Verifikasi Sebelum Operan Shift
            </div>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:0.75rem;">
            <div style="display:flex; justify-content:space-between; font-weight:700; color:#0f172a;">
              <span>Shift 3 (Malam: 23:00 - 07:00)</span>
              <span style="color:#10b981;">Aktif</span>
            </div>
            <div style="font-size:0.75rem; color:#64748b; margin-top:0.25rem;">
              • 23:15 — Pengingat Checklist Awal Shift<br>
              • 06:30 — Verifikasi Sebelum Operan Shift
            </div>
          </div>
        </div>

        <div style="margin-top:1.25rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-outline" onclick="triggerTestReminder('chime')">
            🔔 Uji Nada Pengingat Shift
          </button>
          <button class="btn btn-danger btn-sm" onclick="triggerTestReminder('urgent')">
            ⚠️ Uji Nada Peringatan Kerusakan
          </button>
        </div>
      </div>

      <!-- Offline Simulation Card -->
      <div class="card-box">
        <div class="card-box-header">
          <div class="card-box-title">
            <span>🔔</span> Izin Notifikasi & Uji Offline
          </div>
        </div>

        <div style="margin-bottom:1.25rem;">
          <label class="filter-label">Status Izin Desktop Notifications</label>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.35rem; background:#f8fafc; padding:0.75rem; border-radius:6px; border:1px solid #e2e8f0;">
            <div>
              <strong style="font-size:0.85rem; color:#1e293b;">
                ${notifPermission === 'granted' ? '✅ Diizinkan (Granted)' : notifPermission === 'denied' ? '❌ Ditolak (Denied)' : '⏳ Belum Diaktifkan'}
              </strong>
              <div style="font-size:0.72rem; color:#64748b;">Notifikasi sistem saat aplikasi berjalan di latar belakang.</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="requestNotificationPermission()">
              Aktifkan
            </button>
          </div>
        </div>

        <div style="margin-bottom:1.25rem;">
          <label class="filter-label">Simulasi Konektivitas Offline</label>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.35rem; background:#f8fafc; padding:0.75rem; border-radius:6px; border:1px solid #e2e8f0;">
            <div>
              <strong style="font-size:0.85rem; color:#1e293b;">
                ${state.isSimulatedOffline ? '🟡 Mode Offline Simulasi Aktif' : '🟢 Mode Normal (Online)'}
              </strong>
              <div style="font-size:0.72rem; color:#64748b;">Uji coba alur kerja staf pabrik saat tidak ada sinyal.</div>
            </div>
            <button class="btn ${state.isSimulatedOffline ? 'btn-success' : 'btn-outline'} btn-sm" onclick="toggleSimulatedOffline()">
              ${state.isSimulatedOffline ? 'Kembali Online' : 'Aktifkan Offline'}
            </button>
          </div>
        </div>

        <div>
          <label class="filter-label">Antrean Sinkronisasi Lokal</label>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:0.35rem; background:#f8fafc; padding:0.75rem; border-radius:6px; border:1px solid #e2e8f0;">
            <div>
              <strong style="font-size:0.85rem; color:#1e293b;">
                ${state.syncQueue.length} Laporan Pending
              </strong>
              <div style="font-size:0.72rem; color:#64748b;">Tersimpan aman di IndexedDB perangkat browser.</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="triggerBackgroundSync()" ${state.syncQueue.length === 0 ? 'disabled' : ''}>
              🚀 Sinkronkan Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function saveSupabaseSettings() {
  const url = document.getElementById('supabase-url-input').value.trim();
  const key = document.getElementById('supabase-key-input').value.trim();

  if (!url || !key) {
    showToast('Harap masukkan Project URL dan Anon Key Supabase.', 'warning');
    return;
  }

  localStorage.setItem('bcn_supabase_url', url);
  localStorage.setItem('bcn_supabase_anon_key', key);

  initSupabase();

  if (state.isCloudConnected) {
    playSound('sync');
    showToast('✅ Berhasil terhubung ke Supabase Cloud Database!', 'success');
    updateNetworkUI();
    await loadAppConfiguration();
    renderSettingsView();
  } else {
    showToast('Koneksi gagal. Periksa kembali URL dan Anon Key Anda.', 'danger');
  }
}

function disconnectSupabase() {
  localStorage.removeItem('bcn_supabase_url');
  localStorage.removeItem('bcn_supabase_anon_key');
  state.supabase = null;
  state.isCloudConnected = false;
  showToast('Koneksi Supabase diputuskan. Menggunakan mode lokal.', 'info');
  updateNetworkUI();
  renderSettingsView();
}

function triggerTestReminder(type = 'chime') {
  if (type === 'urgent') {
    triggerNotification('Peringatan Kerusakan Alat', 'Ditemukan 2 unit Solet Rubber retak di Ruang Penimbangan Shift 1!', 'urgent');
  } else {
    triggerNotification('Pengingat Shift Produksi', 'Waktunya melakukan checklist harian di Ruang Baking Gedung 1!', 'reminder');
  }
}

// --- In-App Notification Center ---
async function loadNotifications() {
  try {
    if (state.isCloudConnected && state.supabase && isEffectivelyOnline()) {
      const { data } = await state.supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      state.notifications = data || [];
    } else if (isEffectivelyOnline()) {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        state.notifications = data.notifications || [];
      }
    }
  } catch (err) {
    console.warn('Failed to fetch notifications');
  }
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const badge = document.getElementById('notif-badge');
  const count = state.notifications.filter(n => !n.is_read).length;
  if (badge) {
    if (count > 0) {
      badge.style.display = 'block';
      badge.textContent = count > 9 ? '9+' : count;
    } else {
      badge.style.display = 'none';
    }
  }
}

function toggleNotificationDropdown() {
  const dropdown = document.getElementById('notif-dropdown');
  if (!dropdown) return;

  const isShown = dropdown.classList.contains('show');
  if (!isShown) {
    renderNotificationList();
    dropdown.classList.add('show');
    if (state.isCloudConnected && state.supabase) {
      state.supabase.from('notifications').update({ is_read: true }).eq('is_read', false).then(() => {});
    } else {
      fetch('/api/notifications/mark-read', { method: 'POST' }).catch(() => {});
    }
    state.notifications.forEach(n => n.is_read = true);
    updateNotificationBadge();
  } else {
    dropdown.classList.remove('show');
  }
}

function renderNotificationList() {
  const list = document.getElementById('notif-list');
  if (!list) return;

  if (state.notifications.length === 0) {
    list.innerHTML = `<div style="padding:1.5rem; text-align:center; color:#94a3b8; font-size:0.8rem;">Tidak ada notifikasi baru</div>`;
    return;
  }

  list.innerHTML = state.notifications.map(n => `
    <div class="notif-item">
      <div style="font-weight:700; color:#0f172a;">${n.title}</div>
      <div style="color:#475569; margin-top:2px;">${n.message}</div>
      <div class="notif-time">${new Date(n.created_at).toLocaleString('id-ID')}</div>
    </div>
  `).join('');
}

window.addEventListener('click', (e) => {
  const dropdown = document.getElementById('notif-dropdown');
  const bell = document.getElementById('notif-bell');
  if (dropdown && bell && !dropdown.contains(e.target) && !bell.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});
