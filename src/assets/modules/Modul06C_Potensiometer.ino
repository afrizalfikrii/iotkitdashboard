// MODUL 06 Bagian 3 - Potensiometer (OLED)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"
#define POT_PIN A0                     // Pin potensiometer terhubung ke A0 NodeMCU

FirebaseData fbdo;
String user = "user_id";
int pot_adc;                           // Data ADC potensiometer
char pot_data[16];

void setup() {
  Serial.begin(115200);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);

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
  display.clearDisplay();
}

void loop() {
  pot_adc = analogRead(POT_PIN);
  sprintf(pot_data, "POT: %4d", pot_adc);

  Firebase.setInt(fbdo, "/" + user + "/gauge1", pot_adc);

  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(1, 1);
  display.print("ADC Potensiometer");
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(1, 25);
  display.print(pot_data);

  display.display();
  display.clearDisplay();
}
