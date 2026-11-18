// MODUL 10 Bagian 2 - Pengukuran Jarak (Ultrasonik HC-SR04)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <NewPing.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"

// Nama pin diganti dari "T" dan "E" agar tidak bentrok dengan nama template/library lain
#define TRIG_PIN D5                    // PIN T (Trig) terhubung ke D5 NodeMCU
#define ECHO_PIN D6                    // PIN E (Echo) terhubung ke D6 NodeMCU
#define MAKS 200                       // Jarak maksimal yang diukur (cm)
NewPing us(TRIG_PIN, ECHO_PIN, MAKS);

FirebaseData fbdo;
String user = "user_id";
int jarak;                             // Data pembacaan sensor
char val_jarak[8];

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
  jarak = us.ping_cm();
  sprintf(val_jarak, "%3d", jarak);

  Serial.println("Jarak: " + String(jarak) + " cm");
  Firebase.setInt(fbdo, "/" + user + "/hlevel1", jarak);

  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(1, 1);
  display.print("Jarak (cm)");
  display.setTextSize(3);
  display.setTextColor(WHITE);
  display.setCursor(1, 25);
  display.print(val_jarak);

  display.display();
  display.clearDisplay();
}
