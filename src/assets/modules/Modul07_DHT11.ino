// MODUL 07 - Monitoring Suhu & Kelembaban (DHT11)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"
#define DHT_PIN D5                     // Pin DHT11 terhubung ke D5 NodeMCU

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHT_PIN, DHT11);
String user = "user_id";
float t, h;                            // Data suhu dan kelembaban

void setup() {
  Serial.begin(115200);
  dht.begin();
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
  t = dht.readTemperature();           // Membaca suhu dalam Celsius
  h = dht.readHumidity();              // Membaca kelembaban udara

  // Jika pembacaan gagal, tampilkan pesan dan lewati siklus ini
  if (isnan(t) || isnan(h)) {
    Serial.println("Tidak dapat membaca sensor DHT11!");
    delay(2000);                       // DHT11 butuh jeda antar pembacaan
    return;
  }

  Serial.println("Temp:" + String(t) + " C");
  Serial.println("Humd:" + String(h) + " %");
  Serial.println();

  Firebase.setFloat(fbdo, "/" + user + "/gauge1", t);
  Firebase.setFloat(fbdo, "/" + user + "/gauge2", h);

  lcd.setCursor(0, 0);
  lcd.print("Temp: " + String(t) + char(223) + "C");
  lcd.setCursor(0, 1);
  lcd.print("Humd: " + String(h) + " %");
}
