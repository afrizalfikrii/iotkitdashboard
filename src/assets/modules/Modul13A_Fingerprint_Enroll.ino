// MODUL 13 - Program ENROLL (Mendaftarkan Sidik Jari)
// Serial Monitor: baudrate 115200, pilih "Newline" pada pengaturan line ending
// Library Sidik Jari
#include <Adafruit_Fingerprint.h>
// Library LCD 16x2 I2C
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
// Library Software Serial
#include <SoftwareSerial.h>

#define BUZZ_PIN D3

LiquidCrystal_I2C lcd(0x27, 16, 2);

// Koneksi PIN Fingerprint ke PIN NodeMCU: TX D5, RX D6
SoftwareSerial FP_Serial(D5, D6);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&FP_Serial);

int id;    // Variabel untuk menyimpan ID

// Deklarasi fungsi
int baca_id();
uint8_t getFingerprintEnroll();
void buzz_scan();
void buzz_notif();
void buzz_match();
void buzz_not_match();
void buzz_store_id();

void setup() {
  Serial.begin(115200);
  pinMode(BUZZ_PIN, OUTPUT);
  digitalWrite(BUZZ_PIN, LOW);
  finger.begin(57600);
  lcd.init();
  lcd.backlight();
  lcd.print("Trainer Kit IoT");
  delay(2000);
  lcd.clear();

  if (finger.verifyPassword()) {
    lcd.setCursor(0, 0);
    lcd.print("Sensor ditemukan");
    Serial.println("Sensor ditemukan");
    delay(1000);
    lcd.clear();
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Tidak Ada Sensor");
    Serial.println("Tidak Ada Sensor");
    delay(1000);
    lcd.clear();
  }
}

// Membaca angka (ID) dari serial monitor
int baca_id() {
  int num = 0;
  while (num < 1 || num > 127) {
    while (!Serial.available()) { delay(10); }   // delay agar watchdog ESP8266 tidak reset
    num = Serial.parseInt();
  }
  buzz_notif();
  return num;
}

void loop() {
  Serial.println("Ketik ID (1-127) yang akan didaftarkan!");
  lcd.setCursor(0, 0);
  lcd.print("Ketik ID (1-127)");
  lcd.setCursor(0, 1);
  lcd.print(" Serial Monitor ");

  id = baca_id();
  if (id == 0) { return; }

  Serial.print("Mendaftar ID#");
  Serial.println(id);

  while (!getFingerprintEnroll());
}

// Fungsi pendaftaran sidik jari
uint8_t getFingerprintEnroll() {
  int p = -1;

  // Memindai sidik jari (1)
  lcd.setCursor(0, 0);
  lcd.print("Tempel jari anda");
  lcd.setCursor(0, 1);
  lcd.print("................");
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_OK) {
      buzz_scan();
      lcd.setCursor(0, 0);
      lcd.print("Scanning sensor ");
      delay(2000);
      Serial.println("Memindai sidik jari (1)");
      break;
    }
    delay(10);
  }

  // Konversi sidik jari (1)
  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) { return p; }
  Serial.println("Konversi sidik jari (1)");
  Serial.println("Lepas jari");
  buzz_notif();
  lcd.setCursor(0, 0);
  lcd.print("Lepas jari      ");
  delay(2000);

  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
    delay(10);
  }

  // Memindai sidik jari (2)
  p = -1;
  Serial.println("Letakkan lagi jari yang sama");
  lcd.setCursor(0, 0);
  lcd.print("Letakkan kembali");
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_OK) {
      buzz_scan();
      Serial.println("Memindai sidik jari (2)");
      break;
    }
    delay(10);
  }

  // Konversi sidik jari (2)
  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) { return p; }
  Serial.println("Konversi sidik jari (2)");

  // Pencocokan sidik jari (1) dengan (2)
  p = finger.createModel();
  if (p == FINGERPRINT_OK) {
    Serial.println("Sidik jari cocok");
    buzz_match();
    lcd.setCursor(0, 0);
    lcd.print("Sidik jari cocok");
    delay(2000);
  } else if (p == FINGERPRINT_ENROLLMISMATCH) {
    Serial.println("Sidik jari tidak cocok");
    buzz_not_match();
    lcd.setCursor(0, 0);
    lcd.print("Tidak cocok     ");
    lcd.setCursor(0, 1);
    lcd.print("Ulangi proses   ");
    delay(2000);
    return p;
  } else {
    return p;
  }

  // Menyimpan data sidik jari ke ID
  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("Sidik jari disimpan!");
    buzz_store_id();
    lcd.setCursor(0, 0);
    lcd.print("Menyimpan data..");
    lcd.setCursor(0, 1);
    lcd.print("ID " + String(id) + " Tersimpan ");
    delay(3000);
    lcd.clear();
  } else {
    Serial.println("Sidik jari gagal disimpan!");
    buzz_not_match();
    lcd.setCursor(0, 0);
    lcd.print("Gagal Menyimpan ");
    lcd.setCursor(0, 1);
    lcd.print("Ulangi proses   ");
    delay(3000);
    return p;
  }

  return true;
}

// Nada Buzzer: memindai sidik jari
void buzz_scan() {
  for (int x = 0; x < 8; x++) {
    digitalWrite(BUZZ_PIN, HIGH); delay(50);
    digitalWrite(BUZZ_PIN, LOW);  delay(30);
  }
}

// Nada Buzzer: notifikasi
void buzz_notif() {
  digitalWrite(BUZZ_PIN, HIGH); delay(200);
  digitalWrite(BUZZ_PIN, LOW);  delay(100);
}

// Nada Buzzer: sidik jari cocok
void buzz_match() {
  for (int x = 0; x < 2; x++) {
    digitalWrite(BUZZ_PIN, HIGH); delay(200);
    digitalWrite(BUZZ_PIN, LOW);  delay(100);
  }
}

// Nada Buzzer: sidik jari tidak cocok
void buzz_not_match() {
  digitalWrite(BUZZ_PIN, HIGH); delay(1000);
  digitalWrite(BUZZ_PIN, LOW);  delay(100);
}

// Nada Buzzer: berhasil menyimpan ID sidik jari
void buzz_store_id() {
  for (int x = 0; x < 2; x++) {
    digitalWrite(BUZZ_PIN, HIGH); delay(200);
    digitalWrite(BUZZ_PIN, LOW);  delay(100);
  }
  digitalWrite(BUZZ_PIN, HIGH); delay(500);
  digitalWrite(BUZZ_PIN, LOW);  delay(100);
}
