export interface CustomLabels {
  switches: Record<number, string>;
  indicators: Record<number, string>;
  hlevels: Record<number, string>;
  gauges: Record<number, { label: string; unit: string; max: number }>;
}

const STORAGE_KEY = 'iot_kit_custom_labels_v2';

export const DEFAULT_LABELS: CustomLabels = {
  switches: {
    1: 'Sakelar 1',
    2: 'Sakelar 2',
    3: 'Sakelar 3',
    4: 'Sakelar 4',
    5: 'Sakelar 5',
    6: 'Sakelar 6',
    7: 'Sakelar 7',
    8: 'Sakelar 8',
  },
  indicators: {
    1: 'Indikator 1',
    2: 'Indikator 2',
    3: 'Indikator 3',
    4: 'Indikator 4',
    5: 'Indikator 5',
    6: 'Indikator 6',
    7: 'Indikator 7',
    8: 'Indikator 8',
  },
  hlevels: {
    1: 'Level Bar 1',
    2: 'Level Bar 2',
  },
  gauges: {
    1: { label: 'Gauge 1', unit: '°C', max: 100 },
    2: { label: 'Gauge 2', unit: 'RPM', max: 1000 },
  }
};

export function loadSavedLabels(): CustomLabels {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        switches: { ...DEFAULT_LABELS.switches, ...(parsed.switches || {}) },
        indicators: { ...DEFAULT_LABELS.indicators, ...(parsed.indicators || {}) },
        hlevels: { ...DEFAULT_LABELS.hlevels, ...(parsed.hlevels || {}) },
        gauges: { ...DEFAULT_LABELS.gauges, ...(parsed.gauges || {}) },
      };
    }
  } catch (e) {
    console.error('Failed to load saved labels', e);
  }
  return DEFAULT_LABELS;
}

export function saveLabels(labels: CustomLabels) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
  } catch (e) {
    console.error('Failed to save labels', e);
  }
}
