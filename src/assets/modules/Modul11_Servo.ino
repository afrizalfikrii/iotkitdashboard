// MODUL 11 - Kendali Aktuator Presisi (Motor Servo)
// Library ESP8266 WiFi, Firebase ESP8266, dan Servo
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <Servo.h>

#define SERVO_PIN D0

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"

FirebaseData fbdo;                     // Firebase objek
Servo servo;                           // Servo objek
String user = "user_id";               // Nama pengguna pada Aplikasi IoT

void setup() {
  Serial.begin(115200);
  servo.attach(SERVO_PIN);

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
}

void loop() {
  // switch1 true -> servo ke 180 derajat, false -> servo ke 0 derajat
  if (Firebase.getString(fbdo, "/" + user + "/switch1")) {
    if (fbdo.to<bool>() == true) {
      servo.write(180);
      Serial.println("Servo 180 derajat");
    } else {
      servo.write(0);
      Serial.println("Servo 0 derajat");
    }
  }
}
