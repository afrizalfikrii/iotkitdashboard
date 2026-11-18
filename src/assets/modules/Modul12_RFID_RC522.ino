// MODUL 12 - Identifikasi Berbasis RFID (MFRC522)
// Library ESP8266 WiFi dan Firebase ESP8266
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
// Library LCD 16x2 I2C
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
// Library RFID
#include <SPI.h>
#include <MFRC522.h>

// Koneksi PIN RFID ke PIN NodeMCU
// RST/Reset   RST         D0
// SPI SS      SDA (SS)    D8
// SPI MOSI    MOSI        D7
// SPI MISO    MISO        D6
// SPI SCK     SCK         D5
#define RST_PIN D0
#define SS_PIN  D8

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"

// PIN Buzzer terhubung ke PIN D3 NodeMCU
#define BUZZ_PIN D3

FirebaseData fbdo;                              // Firebase objek
LiquidCrystal_I2C lcd(0x27, 16, 2);             // LCD objek, alamat I2C 0x27, 16x2 karakter
MFRC522 mfrc522(SS_PIN, RST_PIN);               // MFRC522 objek
String user = "user_id";                        // Nama pengguna pada Aplikasi IoT KIT

String nuid;                                    // Variabel penyimpan NUID kartu yang terbaca
String rfid_tag = "12e44a1b";                   // NUID kartu terdaftar (kartu master) - huruf kecil

// Deklarasi fungsi buzzer
void buzz_auth();
void buzz_accepted();
void buzz_denied();

void setup() {
  Serial.begin(115200);
  pinMode(BUZZ_PIN, OUTPUT);                    // Pin Buzzer sebagai output
  digitalWrite(BUZZ_PIN, LOW);                  // Kondisi awal Buzzer OFF

  SPI.begin();                                  // Memulai komunikasi SPI dengan RFID
  mfrc522.PCD_Init();                           // Inisialisasi RFID

  lcd.init();
  lcd.backlight();
  lcd.print("Trainer Kit IoT");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  Firebase.begin(DATABASE_URL, API_KEY);
  Firebase.reconnectWiFi(true);
  delay(2000);
  lcd.clear();
}

void loop() {
  lcd.setCursor(0, 0);
  lcd.print("RFID READER");
  lcd.setCursor(0, 1);
  lcd.print("NUID:");

  // Membaca dan verifikasi kartu
  if (!mfrc522.PICC_IsNewCardPresent()) { return; }
  if (!mfrc522.PICC_ReadCardSerial())   { return; }

  Serial.print("UID tag : ");
  String tag_id = "";

  // NUID disatukan dan disimpan pada 'tag_id' (setiap byte dibuat 2 digit HEX)
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) tag_id += "0";
    tag_id.concat(String(mfrc522.uid.uidByte[i], HEX));
  }
  nuid = tag_id;   // Menyimpan NUID ke variabel global 'nuid'

  // Pencocokan NUID yang tersimpan dengan yang terbaca
  // Nada Buzzer berbeda untuk akses diterima dan ditolak
  if (rfid_tag == nuid) {
    buzz_auth();
    buzz_accepted();
  } else {
    buzz_auth();
    buzz_denied();
  }

  if (nuid.length() > 0) {
    // Mengirim data NUID ke database dengan alamat /user/indicator1
    Firebase.setString(fbdo, "/" + user + "/indicator1", nuid);
  }

  // Mencetak NUID pada LCD dan serial monitor
  lcd.setCursor(5, 1);
  lcd.print(nuid);
  Serial.println(nuid);

  mfrc522.PICC_HaltA();        // Hentikan kartu agar tidak terbaca berulang
  mfrc522.PCD_StopCrypto1();
}

// Fungsi nada Buzzer saat memindai kartu
void buzz_auth() {
  for (int x = 0; x < 8; x++) {
    digitalWrite(BUZZ_PIN, HIGH);
    delay(50);
    digitalWrite(BUZZ_PIN, LOW);
    delay(30);
  }
  delay(500);
}

// Fungsi nada Buzzer saat akses diterima
void buzz_accepted() {
  for (int x = 0; x < 2; x++) {
    digitalWrite(BUZZ_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZ_PIN, LOW);
    delay(100);
  }
}

// Fungsi nada Buzzer saat akses ditolak
void buzz_denied() {
  digitalWrite(BUZZ_PIN, HIGH);
  delay(1000);
  digitalWrite(BUZZ_PIN, LOW);
  delay(100);
}
