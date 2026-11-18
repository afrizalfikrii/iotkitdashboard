// MODUL 09 - Smart Agriculture: Sensor Kelembaban Tanah / Sensor Hujan
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"
#define AS_PIN A0                   // Pin Analog Sensor (Kelembaban Tanah/Hujan) ke A0 NodeMCU

FirebaseData fbdo;
LiquidCrystal_I2C lcd(0x27, 16, 2);
String user = "user_id";
int as_adc, as_value;                  // Data ADC & hasil konversi sensor
char as_data[16];

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
  as_adc = analogRead(AS_PIN);

  // Nilai 760 adalah nilai ADC saat sensor dicelupkan ke air (kondisi basah maksimal).
  // Ganti nilai 760 dengan nilai ADC air jika dipakai untuk sensor hujan.
  as_value = map(as_adc, 0, 760, 0, 100);
  if (as_value > 100) as_value = 100;
  if (as_value < 0) as_value = 0;

  Serial.println("ADC   : " + String(as_adc));
  Serial.println("Nilai : " + String(as_value) + " %");
  Serial.println();

  Firebase.setInt(fbdo, "/" + user + "/gauge1", as_value);

  lcd.setCursor(0, 0);
  lcd.print("Analog Sens (%)");
  sprintf(as_data, "AS: %3d", as_value);
  lcd.setCursor(0, 1);
  lcd.print(as_data);

  delay(150);   // Jeda agar perubahan nilai lebih halus
}
