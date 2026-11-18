// MODUL 02 - Contoh struktur dasar program (LED berkedip di D4)
void setup() {
  pinMode(D4, OUTPUT);           // mengeset pin D4 sebagai output
}

void loop() {
  digitalWrite(D4, HIGH);        // nyalakan LED pada pin D4
  delay(1000);                   // jeda 1 detik
  digitalWrite(D4, LOW);         // matikan LED pada pin D4
  delay(1000);                   // jeda 1 detik
}
