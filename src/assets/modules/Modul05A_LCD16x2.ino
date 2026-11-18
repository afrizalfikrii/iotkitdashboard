// MODUL 05 Bagian 1 - Antarmuka LCD 16x2 I2C
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);    // alamat I2C 0x27, ukuran 16x2 karakter
String user = "user_id";

void setup() {
  Serial.begin(115200);
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
  lcd.print("Menampilkan Teks");

  if (Firebase.getString(fbdo, "/" + user + "/switch1")) {
    lcd.setCursor(0, 1);
    if (fbdo.to<bool>() == true) {
      lcd.print("Data Sakelar ON ");
    } else {
      lcd.print("Data Sakelar OFF");
    }
  }
}
