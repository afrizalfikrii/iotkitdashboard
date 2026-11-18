// MODUL 06 Bagian 1 - Sensor Cahaya Analog (LDR / Photodiode)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"
#define LS A0                            // Pin sensor cahaya LDR/Photodiode

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
String user = "user_id";
int ls_adc, ls_value;                    // Data ADC & hasil konversi sensor
char ls_data[16];

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
  ls_adc = analogRead(LS);
  ls_value = map(ls_adc, 0, 1024, 0, 100);   // konversi ke persen 0-100%

  Serial.print("Cahaya : " + String(ls_value) + " %");
  Serial.println();

  Firebase.setInt(fbdo, "/" + user + "/gauge1", ls_value);

  lcd.setCursor(0, 0);
  lcd.print("Light Sensor (%)");
  lcd.setCursor(0, 1);
  sprintf(ls_data, "LS: %3d", ls_value);
  lcd.print(ls_data);

  delay(150);    // Jeda agar perubahan nilai lebih halus
}
