export interface FirebaseConfig {
  apiKey: string;
  databaseURL: string;
  projectId: string;
  devicePrefix: string; // e.g. "" or "kelompok_1" if students have custom subpaths
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface TelemetryState {
  switches: Record<number, boolean>;
  indicators: Record<number, boolean>;
  gauges: {
    gauge1: number;
    gauge2: number;
  };
  hlevels: {
    hlevel1: number;
    hlevel2: number;
  };
  rawValues: Record<string, unknown>;
  latencyMs: number | null;
  lastUpdate: Date | null;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  channel: string;
  direction: 'TX' | 'RX' | 'SYS';
  payload: string;
  status: 'ok' | 'warn' | 'err';
}
