import { FirebaseConfig } from '../types';

export interface PraktikumModule {
  id: string;
  modul: string;
  title: string;
  description: string;
  fileName: string;
  usesFirebase: boolean;
  code: string;
}

const rawModules = import.meta.glob('../assets/modules/*.ino', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const getRawCode = (fileName: string): string => {
  const key = `../assets/modules/${fileName}`;
  return rawModules[key] || '';
};

interface ModuleMeta {
  id: string;
  modul: string;
  title: string;
  description: string;
  fileName: string;
  usesFirebase: boolean;
}

const MODULE_LIST: ModuleMeta[] = [
  {
    id: 'modul-02',
    modul: 'Modul 02',
    title: 'Blink LED Dasar (D4)',
    description: 'Contoh struktur dasar program Arduino (setup & loop) untuk menyalakan LED pada pin D4.',
    fileName: 'Modul02_Blink.ino',
    usesFirebase: false,
  },
  {
    id: 'modul-04',
    modul: 'Modul 04',
    title: 'Kendali Output Digital (LED, Buzzer, Relay)',
    description: 'Mengontrol LED, Buzzer, dan Relay secara realtime melalui switch1 - switch8 di Firebase.',
    fileName: 'Modul04_LED_Buzzer_Relay.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-05a',
    modul: 'Modul 05A',
    title: 'Antarmuka LCD 16x2 I2C',
    description: 'Menampilkan status dan teks dari dashboard ke layar karakter LCD 16x2 I2C.',
    fileName: 'Modul05A_LCD16x2.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-05b',
    modul: 'Modul 05B',
    title: 'Antarmuka OLED Display 128x64',
    description: 'Menampilkan informasi dan status IoT pada layar grafis OLED 128x64 I2C.',
    fileName: 'Modul05B_OLED128x64.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-06a',
    modul: 'Modul 06A',
    title: 'Sensor Cahaya Analog (LDR / Photodiode)',
    description: 'Membaca intensitas cahaya analog dengan LDR/Photodiode dan mengirimkannya ke dashboard.',
    fileName: 'Modul06A_LDR_Photodiode.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-06b',
    modul: 'Modul 06B',
    title: 'Sensor Cahaya Digital (BH1750)',
    description: 'Mengukur intensitas cahaya dalam satuan Lux menggunakan sensor I2C BH1750.',
    fileName: 'Modul06B_BH1750.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-06c',
    modul: 'Modul 06C',
    title: 'Potensiometer & OLED',
    description: 'Membaca nilai analog potensiometer, menampilkan ke OLED, dan mengirim data ke Firebase.',
    fileName: 'Modul06C_Potensiometer.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-07',
    modul: 'Modul 07',
    title: 'Monitoring Suhu & Kelembaban (DHT11)',
    description: 'Membaca suhu (°C) dan kelembaban (%) dari sensor DHT11 serta menampilkan ke LCD & Gauge.',
    fileName: 'Modul07_DHT11.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-08',
    modul: 'Modul 08',
    title: 'Monitoring Cuaca & Ketinggian (BMP180)',
    description: 'Membaca tekanan udara, suhu, dan estimasi ketinggian menggunakan sensor BMP180.',
    fileName: 'Modul08_BMP180.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-09',
    modul: 'Modul 09',
    title: 'Smart Agriculture (Soil Moisture & Rain)',
    description: 'Mendeteksi kelembaban tanah dan sensor hujan untuk aplikasi pertanian cerdas.',
    fileName: 'Modul09_SoilMoisture_Rain.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-10a',
    modul: 'Modul 10A',
    title: 'Deteksi Gerakan (Sensor PIR)',
    description: 'Mendeteksi pergerakan manusia menggunakan sensor PIR dan mengirim status ke indikator.',
    fileName: 'Modul10A_PIR.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-10b',
    modul: 'Modul 10B',
    title: 'Pengukuran Jarak (Ultrasonik HC-SR04)',
    description: 'Mengukur jarak/ketinggian objek dalam cm menggunakan sensor ultrasonik HC-SR04.',
    fileName: 'Modul10B_Ultrasonik_HCSR04.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-11',
    modul: 'Modul 11',
    title: 'Kendali Aktuator Presisi (Motor Servo)',
    description: 'Menggerakkan sudut motor servo berdasarkan kontrol nilai dari dashboard Firebase.',
    fileName: 'Modul11_Servo.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-12',
    modul: 'Modul 12',
    title: 'Identifikasi Berbasis RFID (MFRC522)',
    description: 'Membaca UID kartu/tag RFID RC522 untuk sistem akses kontrol dan verifikasi Firebase.',
    fileName: 'Modul12_RFID_RC522.ino',
    usesFirebase: true,
  },
  {
    id: 'modul-13a',
    modul: 'Modul 13A',
    title: 'Fingerprint — Enroll (Daftar Sidik Jari)',
    description: 'Mendaftarkan data sidik jari baru ke memori sensor fingerprint melalui Serial Monitor.',
    fileName: 'Modul13A_Fingerprint_Enroll.ino',
    usesFirebase: false,
  },
  {
    id: 'modul-13b',
    modul: 'Modul 13B',
    title: 'Fingerprint — Read (Verifikasi Sidik Jari)',
    description: 'Membaca dan memverifikasi sidik jari yang sudah terdaftar pada sensor fingerprint.',
    fileName: 'Modul13B_Fingerprint_Read.ino',
    usesFirebase: false,
  },
  {
    id: 'modul-13c',
    modul: 'Modul 13C',
    title: 'Fingerprint — Delete (Hapus Sidik Jari)',
    description: 'Menghapus ID sidik jari tertentu dari memori sensor fingerprint.',
    fileName: 'Modul13C_Fingerprint_Delete.ino',
    usesFirebase: false,
  },
  {
    id: 'modul-14',
    modul: 'Modul 14',
    title: 'Sensor Gesture APDS9960 + 3 LED + LCD',
    description: 'Mendeteksi gerakan tangan (atas, bawah, kiri, kanan) dengan sensor APDS9960.',
    fileName: 'Modul14_Gesture_APDS9960.ino',
    usesFirebase: false,
  },
];

export const PRAKTIKUM_MODULES: PraktikumModule[] = MODULE_LIST.map((meta) => ({
  ...meta,
  code: getRawCode(meta.fileName),
}));

/**
 * Returns module source code, optionally injecting the user's active
 * Firebase RTDB host, secret/key, and User ID into template placeholders.
 */
export function prepareModuleCode(
  mod: PraktikumModule,
  config: FirebaseConfig,
  injectConfig: boolean
): string {
  const isConfigured = Boolean(config.databaseURL.trim() && config.apiKey.trim());
  if (!injectConfig || !mod.usesFirebase || !isConfigured) {
    return mod.code;
  }

  const cleanHost = config.databaseURL
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
  const cleanKey = config.apiKey.trim();
  const cleanUser = config.devicePrefix.trim() || 'user_id';

  return mod.code
    .replace(/#define\s+DATABASE_URL\s+"[^"]*"/, `#define DATABASE_URL "${cleanHost}"`)
    .replace(/#define\s+API_KEY\s+"[^"]*"/, `#define API_KEY "${cleanKey}"`)
    .replace(/String\s+user\s*=\s*"[^"]*";/, `String user = "${cleanUser}";`);
}

/** Triggers a browser file download for the given module code. */
export function downloadModuleFile(fileName: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
