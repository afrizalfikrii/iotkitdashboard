import { initializeApp, getApps, deleteApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get, update, Database, Unsubscribe } from 'firebase/database';
import { FirebaseConfig } from '../types';

export const DEFAULT_CONFIG: FirebaseConfig = {
  apiKey: "",
  databaseURL: "",
  projectId: "",
  devicePrefix: ""
};

const STORAGE_KEY = 'iot_kit_firebase_cfg_v3';

// Sample credentials that might have been saved in browser cache from early testing
const SAMPLE_URL_PATTERNS = ['ei-iot-kit', 'proyek-anda-default-rtdb'];
const SAMPLE_KEY_PATTERNS = ['AIzaSyAjmbErDFZLgEKaUcRGVmsAp913ylqhOY4'];

export function extractProjectId(databaseURL: string): string {
  try {
    const raw = databaseURL.trim().replace(/^https?:\/\//i, '');
    const host = raw.split('/')[0];
    const sub = host.split('.')[0];
    return sub.replace(/-default-rtdb$/i, '') || '';
  } catch {
    return '';
  }
}

export function formatDatabaseUrl(url: string): string {
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean) return '';
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  return clean;
}

export function clearSavedConfig(): void {
  try {
    localStorage.removeItem('iot_kit_firebase_cfg_v1');
    localStorage.removeItem('iot_kit_firebase_cfg_v2');
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear config", err);
  }
}

export function loadSavedConfig(): FirebaseConfig {
  try {
    // Purge legacy storage versions
    localStorage.removeItem('iot_kit_firebase_cfg_v1');
    localStorage.removeItem('iot_kit_firebase_cfg_v2');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const url = String(parsed.databaseURL || '');
      const key = String(parsed.apiKey || '');

      // If user had the old sample credentials saved, wipe them completely
      const isSampleUrl = SAMPLE_URL_PATTERNS.some(pat => url.toLowerCase().includes(pat));
      const isSampleKey = SAMPLE_KEY_PATTERNS.some(pat => key.includes(pat));

      if (isSampleUrl || isSampleKey) {
        localStorage.removeItem(STORAGE_KEY);
        return DEFAULT_CONFIG;
      }

      return {
        apiKey: key,
        databaseURL: formatDatabaseUrl(url),
        projectId: parsed.projectId || '',
        devicePrefix: parsed.devicePrefix || ''
      };
    }
  } catch (err) {
    console.error("Failed to load stored config", err);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: FirebaseConfig) {
  try {
    if (!config.databaseURL.trim() && !config.apiKey.trim()) {
      clearSavedConfig();
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error("Failed to save config", err);
  }
}

class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Database | null = null;
  private currentConfig: FirebaseConfig = DEFAULT_CONFIG;
  private subscriptions: Unsubscribe[] = [];

  constructor() {
    this.currentConfig = loadSavedConfig();
  }

  public getConfig(): FirebaseConfig {
    return { ...this.currentConfig };
  }

  public async init(config: FirebaseConfig): Promise<Database | null> {
    const cleanUrl = formatDatabaseUrl(config.databaseURL);
    const cleanApiKey = config.apiKey.trim();
    const cleanProjectId = config.projectId.trim() || extractProjectId(cleanUrl);

    this.currentConfig = {
      ...config,
      databaseURL: cleanUrl,
      apiKey: cleanApiKey,
      projectId: cleanProjectId
    };
    saveConfig(this.currentConfig);

    // Clean up existing subscriptions and app
    this.cleanup();

    if (!cleanUrl || !cleanApiKey) {
      this.app = null;
      this.db = null;
      return null;
    }

    const existingApps = getApps();
    for (const app of existingApps) {
      try {
        await deleteApp(app);
      } catch (e) {
        console.warn("Error disposing existing Firebase app", e);
      }
    }

    const appName = "iot-kit-dashboard-" + Date.now();
    this.app = initializeApp({
      apiKey: cleanApiKey,
      databaseURL: cleanUrl,
      projectId: cleanProjectId || 'iot-project'
    }, appName);

    this.db = getDatabase(this.app);
    return this.db;
  }

  public getDatabase(): Database | null {
    return this.db;
  }

  private resolvePath(childPath: string): string | undefined {
    const prefix = this.currentConfig.devicePrefix.trim().replace(/^\/+|\/+$/g, '');
    const cleanChild = childPath.trim().replace(/^\/+/, '');
    if (!prefix && !cleanChild) return undefined;
    if (!prefix) return cleanChild;
    if (!cleanChild) return prefix;
    return `${prefix}/${cleanChild}`;
  }

  public subscribeToRoot(callback: (snapshotVal: unknown) => void, onError?: (err: Error) => void): Unsubscribe {
    if (!this.db) {
      throw new Error("Firebase database belum terhubung");
    }
    const path = this.resolvePath("");
    const dbRef = path ? ref(this.db, path) : ref(this.db);
    const unsub = onValue(dbRef, (snapshot) => {
      callback(snapshot.val());
    }, (error) => {
      console.error(`Firebase read error at path '${path || "root"}':`, error);
      if (onError) onError(error);
    });

    this.subscriptions.push(unsub);
    return unsub;
  }

  public subscribe(path: string, callback: (snapshotVal: unknown) => void, onError?: (err: Error) => void): Unsubscribe {
    if (!this.db) {
      throw new Error("Firebase database belum terhubung");
    }
    const fullPath = this.resolvePath(path);
    const dbRef = fullPath ? ref(this.db, fullPath) : ref(this.db);
    const unsub = onValue(dbRef, (snapshot) => {
      callback(snapshot.val());
    }, (error) => {
      console.error(`Firebase read error at path '${fullPath || "root"}':`, error);
      if (onError) onError(error);
    });

    this.subscriptions.push(unsub);
    return unsub;
  }

  public async setNodeValue(path: string, value: unknown): Promise<void> {
    if (!this.db) {
      throw new Error("Firebase database tidak terhubung. Harap isi URL & Key terlebih dahulu.");
    }
    const fullPath = this.resolvePath(path);
    const dbRef = fullPath ? ref(this.db, fullPath) : ref(this.db);
    await set(dbRef, value);
  }

  public async initializeSchema(force: boolean = false): Promise<{ createdCount: number }> {
    if (!this.db) {
      throw new Error("Firebase database belum terhubung");
    }
    const path = this.resolvePath("");
    const dbRef = path ? ref(this.db, path) : ref(this.db);

    const defaultNodes: Record<string, unknown> = {
      switch1: false,
      switch2: false,
      switch3: false,
      switch4: false,
      switch5: false,
      switch6: false,
      switch7: false,
      switch8: false,
      indicator1: 0,
      indicator2: 0,
      indicator3: 0,
      indicator4: 0,
      indicator5: 0,
      indicator6: 0,
      indicator7: 0,
      indicator8: 0,
      gauge1: 0,
      gauge2: 0,
      hlevel1: 0,
      hlevel2: 0
    };

    if (force) {
      await update(dbRef, defaultNodes);
      return { createdCount: Object.keys(defaultNodes).length };
    }

    try {
      const snapshot = await get(dbRef);
      const existing = snapshot.val();

      if (!existing || typeof existing !== 'object') {
        // Node di Firebase masih kosong, buat semua 20 node default
        await set(dbRef, defaultNodes);
        return { createdCount: Object.keys(defaultNodes).length };
      }

      // Deteksi node mana saja yang belum ada
      const existingRecord = existing as Record<string, unknown>;
      const missing: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(defaultNodes)) {
        if (!(key in existingRecord) || existingRecord[key] === undefined) {
          missing[key] = val;
        }
      }

      if (Object.keys(missing).length > 0) {
        await update(dbRef, missing);
        return { createdCount: Object.keys(missing).length };
      }

      return { createdCount: 0 };
    } catch (err) {
      console.warn("Gagal membaca sebelum init schema, mencoba update langsung", err);
      await update(dbRef, defaultNodes);
      return { createdCount: Object.keys(defaultNodes).length };
    }
  }

  public cleanup() {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
  }
}

export const firebaseService = new FirebaseService();
