// MODUL 13 - Program READ (Membaca / Verifikasi Sidik Jari)
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

int id = 0;                        // Variabel untuk ID yang tersimpan
String id_name = "IoT KIT";        // Variabel untuk nama ID yang tersimpan

// Deklarasi fungsi
int getFingerprintIDez();
void buzz_scan();
void buzz_match();
void buzz_not_match();

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

void loop() {
  lcd.setCursor(0, 0);
  lcd.print(" SELAMAT DATANG ");
  lcd.setCursor(0, 1);
  lcd.print(" SCAN JARI ANDA ");

  // Membaca ID yang tersimpan
  id = getFingerprintIDez();
  delay(50);

  // ID 1 terdaftar: tampilkan sapaan; jika tidak terdaftar, tampilkan penolakan
  if (id == 1) {
    lcd.clear();
    buzz_match();
    lcd.setCursor(0, 0);
    lcd.print("ID TERDAFTAR    ");
    lcd.setCursor(0, 1);
    lcd.print("Hai, " + id_name);
    delay(2000);
    id = 0;
    lcd.clear();
  } else {
    buzz_not_match();
    lcd.setCursor(0, 0);
    lcd.print("TIDAK TERDAFTAR!");
    lcd.setCursor(0, 1);
    lcd.print("Silahkan Reg. fp");
    delay(2000);
    id = 0;
    lcd.clear();
  }
}

// Fungsi untuk mencari ID yang tersimpan
// Mengembalikan ID (1-127) bila ditemukan, atau -1 bila gagal
int getFingerprintIDez() {
  int p = -1;

  // Memindai sidik jari
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_OK) {
      Serial.println("Memindai sidik jari");
      buzz_scan();
      break;
    }
    delay(10);
  }

  // Mengonversi sidik jari
  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) {
    Serial.println("Konversi bermasalah");
    return -1;
  }
  Serial.println("Konversi sidik jari");

  // Mencari sidik jari yang cocok
  p = finger.fingerFastSearch();
  if (p != FINGERPRINT_OK) {
    Serial.println("Sidik jari tidak ditemukan");
    return -1;
  }
  Serial.println("Sidik jari ditemukan");

  // Mencetak ID dengan konfidensi pada serial monitor
  Serial.print("ID Ditemukan #");
  Serial.print(finger.fingerID);
  Serial.print(" dengan konfidensi ");
  Serial.println(finger.confidence);

  return finger.fingerID;      // Mengembalikan nilai ID
}

// Nada Buzzer: memindai sidik jari
void buzz_scan() {
  for (int x = 0; x < 8; x++) {
    digitalWrite(BUZZ_PIN, HIGH); delay(50);
    digitalWrite(BUZZ_PIN, LOW);  delay(30);
  }
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
