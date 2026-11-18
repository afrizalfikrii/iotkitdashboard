// MODUL 06 Bagian 2 - Sensor Cahaya BH1750
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <BH1750.h>

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
BH1750 lightMeter;
String user = "user_id";
unsigned int lux;                        // Data pembacaan sensor
char light[16];

void setup() {
  Serial.begin(115200);
  Wire.begin();
  lightMeter.begin();
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
  lux = lightMeter.readLightLevel();
  sprintf(light, "LIGHT:%5d lx", lux);

  lcd.setCursor(0, 0);
  lcd.print("Light Meter (lx)");
  lcd.setCursor(0, 1);
  lcd.print(light);

  Serial.print("Cahaya : " + String(lux) + " lx");
  Serial.println();

  Firebase.setInt(fbdo, "/" + user + "/gauge1", lux);

  delay(150);    // Jeda agar perubahan nilai lebih halus
}
