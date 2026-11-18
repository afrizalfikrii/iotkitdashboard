// MODUL 04 - Kendali Output Digital (LED, Buzzer, Relay)
// Library ESP8266 WiFi dan Firebase ESP8266
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

#define WIFI_SSID "SSID_WIFI"
#define WIFI_PASSWORD "PASS_WIFI"
#define DATABASE_URL "project_id.firebaseio.com"
#define API_KEY "database_secret"

FirebaseData fbdo;                     // Firebase objek
String user = "user_id";               // Nama pengguna pada Aplikasi IoT

// PIN LED, Buzzer, dan Relay
#define LED_PIN   D0
#define BUZZ_PIN  D1
#define RELAY_PIN D2

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZ_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);

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
  // switch1 -> LED, switch2 -> Buzzer, switch3 -> Relay
  if (Firebase.getString(fbdo, "/" + user + "/switch1")) {
    if (fbdo.to<bool>() == true) {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED On");
    } else {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED Off");
    }
  }

  if (Firebase.getString(fbdo, "/" + user + "/switch2")) {
    if (fbdo.to<bool>() == true) {
      digitalWrite(BUZZ_PIN, HIGH);
      Serial.println("Buzzer On");
    } else {
      digitalWrite(BUZZ_PIN, LOW);
      Serial.println("Buzzer Off");
    }
  }

  if (Firebase.getString(fbdo, "/" + user + "/switch3")) {
    if (fbdo.to<bool>() == true) {
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("Relay On");
    } else {
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("Relay Off");
    }
  }
}
