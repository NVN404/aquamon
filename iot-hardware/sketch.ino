#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Set the LCD address to 0x27 for a 20 chars and 4 line display
LiquidCrystal_I2C lcd(0x27, 20, 4);

const char* ssid = "Wokwi-GUEST"; 
const char* password = "";        
const char* relayerUrl = "https://chfut-106-51-70-43.free.pinggy.net/api/telemetry"; // Active Live Tunnel

const int VALVE_PIN = 34; // Slider potentiometer pin
float totalLiters = 0.0;
float intervalVolume = 0.0;
unsigned long lastSendTime = 0;
unsigned long lastLoopTime = 0;
unsigned long statusHoldUntil = 0;
String currentStatus = "Status: STANDBY   ";

void setup() {
  Serial.begin(115200);
  
  // Setup LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("   AQUAMON DEPIN");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi...");

  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  lcd.setCursor(0, 1);
  lcd.print("WiFi: CONNECTED   ");
  delay(1000);
  lcd.clear();
  lastLoopTime = millis();
}

void loop() {
  unsigned long now = millis();
  float dt = (now - lastLoopTime) / 1000.0; 
  lastLoopTime = now;

  int valveState = analogRead(VALVE_PIN);
  
  float flowRateLPS = 0.0;
  if (valveState > 100) {
    float ratio = (valveState - 100) / 3995.0;
    flowRateLPS = (ratio * ratio * 6.0) + (ratio * 1.5); 
  }
  
  float deltaLiters = flowRateLPS * dt;
  totalLiters += deltaLiters;
  intervalVolume += deltaLiters;

  // 3. Update LCD Screen Live
  lcd.setCursor(0, 0);
  lcd.print("METER: UNIT-101   ");
  
  lcd.setCursor(0, 1);
  lcd.print("Flow: ");
  lcd.print(flowRateLPS, 2);
  lcd.print(" L/s   "); 
  
  lcd.setCursor(0, 2);
  lcd.print("Total: ");
  lcd.print(totalLiters, 2);
  lcd.print(" L    ");

  // 4. Dispatch Telemetry Packet to Relayer every 800ms (High Speed Real-Time Stream)
  if (now - lastSendTime > 800) {
    lastSendTime = now;
    
    if (intervalVolume > 0.02 && flowRateLPS > 0.05) {
      currentStatus = "Monad: ATTESTING..";
      lcd.setCursor(0, 3);
      lcd.print(currentStatus);

      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(relayerUrl);
        http.addHeader("Content-Type", "application/json");

        String payload = "{\"deviceId\":\"AQUAMON-UNIT-101\","
                         "\"litersUsed\":" + String(intervalVolume, 2) + ","
                         "\"timestamp\":" + String(now / 1000) + ","
                         "\"signature\":\"0x88a9b8c7d6e5f4\","
                         "\"status\":\"" + (intervalVolume < 0.6 ? "CONSERVING" : "HIGH_VOLUME") + "\"}";

        int httpResponseCode = http.POST(payload);
        
        if (httpResponseCode > 0) {
          currentStatus = "Monad: ATTESTED OK";
        } else {
          currentStatus = "Monad: RELAY FAIL ";
        }
        http.end();
        statusHoldUntil = now + 800;
      }
      intervalVolume = 0.0;
    } else {
      intervalVolume = 0.0;
      if (now > statusHoldUntil) {
        currentStatus = "Status: STANDBY   ";
      }
    }
  }

  if (now > statusHoldUntil && flowRateLPS <= 0.05) {
    currentStatus = "Status: STANDBY   ";
  }
  lcd.setCursor(0, 3);
  lcd.print(currentStatus);
  
  delay(50);
}