// MODUL 14 - Antarmuka Sensor Gesture APDS9960 + 3 LED + LCD
// Library LCD 16x2 I2C
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
// Library APDS9960
#include <SparkFun_APDS9960.h>

// Koneksi PIN APDS-9960 ke PIN NodeMCU
#define APDS9960_SDA D2
#define APDS9960_SCL D1
#define APDS9960_INT D5

LiquidCrystal_I2C lcd(0x27, 16, 2);

// Variabel Global APDS9960
SparkFun_APDS9960 apds = SparkFun_APDS9960();
volatile bool isr_flag = false;

// Fungsi interupsi pada IRAM (wajib di ESP8266)
void IRAM_ATTR interruptRoutine();

// Variabel data, pin, dan status lampu
int pos = 0;
int lamp_pin[3] = {D0, D6, D7};
boolean lamp_state[3] = {false, false, false};
String state = "OFF";

void handleGesture();

void setup() {
  Serial.begin(115200);
  Wire.begin(APDS9960_SDA, APDS9960_SCL);       // Memulai komunikasi I2C

  pinMode(APDS9960_INT, INPUT);
  attachInterrupt(digitalPinToInterrupt(APDS9960_INT), interruptRoutine, FALLING);

  if (apds.init()) {                            // Inisialisasi APDS9960
    Serial.println("APDS9960 siap");
  } else {
    Serial.println("APDS9960 gagal diinisialisasi, cek kabel!");
  }
  apds.enableGestureSensor(true);               // Mengaktifkan mode gesture

  // Mengatur pin lampu sebagai output dengan kondisi awal LOW
  for (int i = 0; i <= 2; i++) {
    Serial.println(i);
    pinMode(lamp_pin[i], OUTPUT);
    digitalWrite(lamp_pin[i], LOW);
  }

  lcd.init();
  lcd.backlight();
  lcd.print("Trainer Kit IoT");
  delay(2000);
  lcd.clear();
}

void loop() {
  // Membaca status ISR, menjalankan fungsi handleGesture()
  if (isr_flag == true) {
    detachInterrupt(digitalPinToInterrupt(APDS9960_INT));
    handleGesture();
    isr_flag = false;
    attachInterrupt(digitalPinToInterrupt(APDS9960_INT), interruptRoutine, FALLING);
  }

  // Mengatur variabel pos: > 2 jadi 0, < 0 jadi 2 (wrap-around 3 LED)
  if (pos > 2) pos = 0;
  if (pos < 0) pos = 2;

  // Menyalakan/mematikan lampu sesuai pin & status pada indeks 'pos'
  digitalWrite(lamp_pin[pos], lamp_state[pos]);

  // Mengubah status lamp_state menjadi teks
  if (lamp_state[pos] == true) state = "ON ";
  else                         state = "OFF";

  // Mencetak teks, posisi lampu (pos), dan status lampu pada LCD
  lcd.setCursor(0, 0);
  lcd.print("Lampu Gesture   ");
  lcd.setCursor(0, 1);
  lcd.print("> Lampu");
  lcd.setCursor(8, 1);
  lcd.print(pos + 1);
  lcd.setCursor(9, 1);
  lcd.print(":");
  lcd.setCursor(11, 1);
  lcd.print(state);
}

// Fungsi Interrupt Routine
void IRAM_ATTR interruptRoutine() {
  isr_flag = true;
}

// Fungsi handleGesture: membaca arah gesture, mengatur 'pos' dan 'lamp_state'
void handleGesture() {
  if (apds.isGestureAvailable()) {
    switch (apds.readGesture()) {
      case DIR_UP:
        lamp_state[pos] = true;
        Serial.println("ATAS");
        break;
      case DIR_DOWN:
        lamp_state[pos] = false;
        Serial.println("BAWAH");
        break;
      case DIR_LEFT:
        pos--;
        Serial.println("KIRI");
        break;
      case DIR_RIGHT:
        pos++;
        Serial.println("KANAN");
        break;
      default:
        Serial.println("TIDAK ADA");
    }
  }
}
