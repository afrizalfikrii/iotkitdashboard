// MODUL 13 - Program DELETE (Menghapus Data Sidik Jari)
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

int id;     // Variabel untuk menyimpan ID

// Deklarasi fungsi
int baca_id();
uint8_t deleteFingerprint(int id);
void buzz_done();
void buzz_deleted();
void buzz_failed();

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
  buzz_done();
  return num;
}

void loop() {
  Serial.println("Ketik ID (1-127) yang akan dihapus!");
  lcd.setCursor(0, 0);
  lcd.print("Ketik ID (1-127)");
  lcd.setCursor(0, 1);
  lcd.print(" Serial Monitor ");

  id = baca_id();
  if (id == 0) { return; }

  Serial.print("Menghapus ID#");
  Serial.println(id);

  deleteFingerprint(id);
}

// Fungsi menghapus data sidik jari yang tersimpan
uint8_t deleteFingerprint(int id) {
  int p = -1;

  p = finger.deleteModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("Sidik jari dihapus!");
    buzz_deleted();
    lcd.setCursor(0, 0);
    lcd.print("Berhasil dihapus");
    delay(2000);
  } else {
    Serial.println("Sidik jari gagal dihapus");
    buzz_failed();
    lcd.setCursor(0, 0);
    lcd.print("Gagal dihapus   ");
    delay(2000);
  }
  return p;
}

// Nada Buzzer: notifikasi ID diterima
void buzz_done() {
  digitalWrite(BUZZ_PIN, HIGH); delay(200);
  digitalWrite(BUZZ_PIN, LOW);  delay(100);
}

// Nada Buzzer: berhasil menghapus data sidik jari
void buzz_deleted() {
  for (int x = 0; x < 2; x++) {
    digitalWrite(BUZZ_PIN, HIGH); delay(200);
    digitalWrite(BUZZ_PIN, LOW);  delay(100);
  }
}

// Nada Buzzer: gagal menghapus data sidik jari
void buzz_failed() {
  digitalWrite(BUZZ_PIN, HIGH); delay(1000);
  digitalWrite(BUZZ_PIN, LOW);  delay(100);
}
