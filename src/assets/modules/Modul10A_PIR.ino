// MODUL 10 Bagian 1 - Deteksi Gerakan (Sensor PIR)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"
#define PIR_PIN D0                         // Pin sensor PIR terhubung ke D0 NodeMCU

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
String user = "user_id";

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);                 // Pin PIR sebagai input
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Trainer Kit IoT");
  lcd.setCursor(0, 1);
  lcd.print("Connecting-WiFi");

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
  lcd.print("Deteksi Gerakan:");

  // Jika PIR mendeteksi gerakan, output bernilai HIGH
  if (digitalRead(PIR_PIN) == HIGH) {
    lcd.setCursor(0, 1);
    lcd.print("Gerak Terdeteksi");
    Firebase.setString(fbdo, "/" + user + "/indicator1", "Gerakan Terdeteksi");
  } else {
    lcd.setCursor(0, 1);
    lcd.print("Tidak Terdeteksi");
    Firebase.setString(fbdo, "/" + user + "/indicator1", "Tidak Terdeteksi");
  }
}
