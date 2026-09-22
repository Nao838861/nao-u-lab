#include <Arduino.h>
#include <Adafruit_NeoPixel.h>
#include <Wire.h>

namespace
{
constexpr int kSdaPin = 19;
constexpr int kSclPin = 22;
constexpr int kButtonPin = 39;
constexpr int kLedPin = 27;
constexpr uint16_t kLedCount = 25;
constexpr uint8_t kLegacyAddress = 0x38;
constexpr uint8_t kV11Address = 0x36;
constexpr uint8_t kServoPowerRegister = 0x30;
constexpr uint16_t kStopPulseUs = 1500;
constexpr uint16_t kSlowForwardPulseUs = 1575;
constexpr uint16_t kSlowReversePulseUs = 1425;
constexpr uint32_t kMoveDurationMs = 5000;
constexpr uint32_t kStopFeedbackDurationMs = 500;
constexpr uint32_t kButtonDebounceMs = 35;

enum class MotionState
{
  Idle,
  Running,
  StopFeedback,
};

Adafruit_NeoPixel g_pixels(kLedCount, kLedPin, NEO_GRB + NEO_KHZ800);
uint8_t g_hat_address = 0;
MotionState g_motion_state = MotionState::Idle;
uint32_t g_state_started_ms = 0;
bool g_last_button_reading = false;
bool g_stable_button_pressed = false;
uint32_t g_button_changed_ms = 0;

void showColor(uint8_t red, uint8_t green, uint8_t blue)
{
  const uint32_t color = g_pixels.Color(red, green, blue);
  for (uint16_t i = 0; i < kLedCount; ++i)
  {
    g_pixels.setPixelColor(i, color);
  }
  g_pixels.show();
}

void showIdle()
{
  showColor(0, 28, 0);
}

void showRunning()
{
  showColor(0, 35, 110);
}

void showErrorOrStop()
{
  showColor(100, 0, 0);
}

bool deviceResponds(uint8_t address)
{
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}

bool writeRegister(uint8_t reg, uint8_t value)
{
  Wire.beginTransmission(g_hat_address);
  Wire.write(reg);
  Wire.write(value);
  return Wire.endTransmission() == 0;
}

bool writePulse(uint8_t channel, uint16_t pulse_us)
{
  if (channel >= 8 || pulse_us < 500 || pulse_us > 2500)
  {
    return false;
  }

  const uint8_t reg = static_cast<uint8_t>(0x10 + channel * 2);
  Wire.beginTransmission(g_hat_address);
  Wire.write(reg);
  Wire.write(static_cast<uint8_t>(pulse_us >> 8));
  Wire.write(static_cast<uint8_t>(pulse_us & 0xff));
  return Wire.endTransmission() == 0;
}

bool stopBoth()
{
  const bool ch1_ok = writePulse(0, kStopPulseUs);
  const bool ch2_ok = writePulse(1, kStopPulseUs);
  return ch1_ok && ch2_ok;
}

bool driveBoth(uint16_t ch1_pulse_us, uint16_t ch2_pulse_us)
{
  const bool ch1_ok = writePulse(0, ch1_pulse_us);
  const bool ch2_ok = writePulse(1, ch2_pulse_us);
  return ch1_ok && ch2_ok;
}

void enterState(MotionState state)
{
  g_motion_state = state;
  g_state_started_ms = millis();
}

void stopMotion(bool show_stop_feedback)
{
  stopBoth();
  if (show_stop_feedback)
  {
    showErrorOrStop();
    enterState(MotionState::StopFeedback);
    Serial.println("Emergency stop");
  }
  else
  {
    showIdle();
    enterState(MotionState::Idle);
    Serial.println("Five-second run complete; both channels stopped");
  }
}

void startMotion()
{
  // Give immediate visible feedback, then start both motors within a few ms.
  showRunning();
  if (!driveBoth(kSlowForwardPulseUs, kSlowReversePulseUs))
  {
    stopBoth();
    showErrorOrStop();
    enterState(MotionState::StopFeedback);
    Serial.println("ERROR: failed to start one or both servos");
    return;
  }

  enterState(MotionState::Running);
  Serial.println("Button accepted: CH1 forward / CH2 reverse for 5 seconds");
}

void updateMotion()
{
  const uint32_t elapsed = millis() - g_state_started_ms;

  switch (g_motion_state)
  {
  case MotionState::Running:
    if (elapsed >= kMoveDurationMs)
    {
      stopMotion(false);
    }
    break;

  case MotionState::StopFeedback:
    if (elapsed >= kStopFeedbackDurationMs)
    {
      stopBoth();
      showIdle();
      enterState(MotionState::Idle);
    }
    break;

  case MotionState::Idle:
    // Refresh the stop command so resets or temporary bus errors do not leave
    // a continuous-rotation servo running indefinitely.
    if (elapsed >= 250)
    {
      stopBoth();
      g_state_started_ms = millis();
    }
    break;
  }
}

void handleButton()
{
  const bool pressed = digitalRead(kButtonPin) == LOW;
  if (pressed != g_last_button_reading)
  {
    g_last_button_reading = pressed;
    g_button_changed_ms = millis();
  }

  if ((millis() - g_button_changed_ms) < kButtonDebounceMs ||
      pressed == g_stable_button_pressed)
  {
    return;
  }

  g_stable_button_pressed = pressed;
  if (!pressed)
  {
    return;
  }

  if (g_motion_state == MotionState::Running)
  {
    stopMotion(true);
  }
  else
  {
    startMotion();
  }
}

void handleSerial()
{
  while (Serial.available() > 0)
  {
    const char command = static_cast<char>(Serial.read());
    if (command == 's' || command == 'S')
    {
      stopMotion(true);
    }
    else if (command == 't' || command == 'T')
    {
      startMotion();
    }
  }
}
} // namespace

void setup()
{
  Serial.begin(115200);
  delay(500);
  Serial.println("\nATOM 8Servos HAT button controller");

  pinMode(kButtonPin, INPUT);
  g_pixels.begin();
  g_pixels.setBrightness(32);
  g_pixels.clear();
  g_pixels.show();

  Wire.begin(kSdaPin, kSclPin);
  Wire.setClock(100000);

  if (deviceResponds(kV11Address))
  {
    g_hat_address = kV11Address;
    Serial.println("Detected 8Servos HAT v1.1 at 0x36");
  }
  else if (deviceResponds(kLegacyAddress))
  {
    g_hat_address = kLegacyAddress;
    Serial.println("Detected legacy 8Servos HAT at 0x38");
  }
  else
  {
    Serial.println("ERROR: 8Servos HAT not found at 0x36 or 0x38");
    showErrorOrStop();
    return;
  }

  // Program safe pulses before enabling the v1.1 MOSFET power rail.
  if (!stopBoth())
  {
    Serial.println("ERROR: failed to set initial stop pulses");
    showErrorOrStop();
    return;
  }

  if (g_hat_address == kV11Address && !writeRegister(kServoPowerRegister, 1))
  {
    Serial.println("ERROR: failed to enable v1.1 servo power");
    showErrorOrStop();
    return;
  }

  showIdle();
  Serial.println("Button: start 5-second run; press again to stop");
  Serial.println("Serial commands: 't' starts the same run, 's' stops immediately");
  Serial.println("Ready and stopped (green LED)");
  enterState(MotionState::Idle);
}

void loop()
{
  if (g_hat_address == 0)
  {
    delay(1000);
    return;
  }

  handleSerial();
  handleButton();
  updateMotion();
  delay(5);
}
