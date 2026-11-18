// MODUL 08 - Monitoring Cuaca & Ketinggian (BMP180)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_BMP085.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"

FirebaseData fbdo;
Adafruit_BMP085 bmp;
String user = "user_id";
int temperature;                       // Data suhu, tekanan, dan ketinggian
int pressure;
int altitude;

void setup() {
  Serial.begin(115200);
  if (!bmp.begin()) {                  // Memulai komunikasi dengan sensor BMP180
    Serial.println("Sensor BMP180 tidak ditemukan, cek kabel!");
  }
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);   // Memulai komunikasi dengan OLED Display

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
  temperature = bmp.readTemperature();
  pressure = bmp.readPressure() / 100;         // konversi Pa -> hPa
  altitude = bmp.readAltitude();

  Serial.println("Temp : " + String(temperature) + " C");
  Serial.println("Pres : " + String(pressure) + " hPa");
  Serial.println("Alt : " + String(altitude) + " meter");
  Serial.println();

  Firebase.setInt(fbdo, "/" + user + "/gauge1", temperature);
  Firebase.setInt(fbdo, "/" + user + "/gauge2", pressure);
  Firebase.setInt(fbdo, "/" + user + "/hlevel1", altitude);

  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(1, 1);
  display.print("BMP180");

  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(1, 25);
  display.print("Temp: " + String(temperature) + " " + char(247) + "C");
  display.setCursor(1, 35);
  display.print("Pres: " + String(pressure) + " hPa");
  display.setCursor(1, 45);
  display.print("Alt : " + String(altitude) + " m");

  display.display();
  display.clearDisplay();
}
