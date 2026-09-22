#include <Arduino.h>
#include <Wire.h>

namespace
{
constexpr int kSdaPin = 19;
constexpr int kSclPin = 22;
constexpr uint8_t kLegacyAddress = 0x38;
constexpr uint8_t kV11Address = 0x36;
constexpr uint8_t kServoPowerRegister = 0x30;
constexpr uint16_t kStopPulseUs = 1500;
constexpr uint16_t kSlowForwardPulseUs = 1575;
constexpr uint16_t kSlowReversePulseUs = 1425;
constexpr uint32_t kMoveDurationMs = 1200;
constexpr uint32_t kPauseDurationMs = 1800;

enum class DemoState
{
  Waiting,
  Forward,
  Pause,
  Reverse,
  Stopped,
};

uint8_t g_hat_address = 0;
DemoState g_demo_state = DemoState::Waiting;
uint32_t g_state_started_ms = 0;

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

void enterState(DemoState state)
{
  g_demo_state = state;
  g_state_started_ms = millis();
}

void startDemo()
{
  stopBoth();
  Serial.println("Demo starts in 3 seconds. Send 's' to stop.");
  enterState(DemoState::Waiting);
}

void updateDemo()
{
  const uint32_t elapsed = millis() - g_state_started_ms;

  switch (g_demo_state)
  {
  case DemoState::Waiting:
    if (elapsed >= 3000)
    {
      Serial.println("CH1 forward / CH2 reverse (slow)");
      driveBoth(kSlowForwardPulseUs, kSlowReversePulseUs);
      enterState(DemoState::Forward);
    }
    break;

  case DemoState::Forward:
    if (elapsed >= kMoveDurationMs)
    {
      stopBoth();
      Serial.println("Stopped");
      enterState(DemoState::Pause);
    }
    break;

  case DemoState::Pause:
    if (elapsed >= kPauseDurationMs)
    {
      Serial.println("CH1 reverse / CH2 forward (slow)");
      driveBoth(kSlowReversePulseUs, kSlowForwardPulseUs);
      enterState(DemoState::Reverse);
    }
    break;

  case DemoState::Reverse:
    if (elapsed >= kMoveDurationMs)
    {
      stopBoth();
      Serial.println("Demo complete; both channels stopped");
      enterState(DemoState::Stopped);
    }
    break;

  case DemoState::Stopped:
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

void handleSerial()
{
  while (Serial.available() > 0)
  {
    const char command = static_cast<char>(Serial.read());
    if (command == 's' || command == 'S')
    {
      stopBoth();
      enterState(DemoState::Stopped);
      Serial.println("Emergency stop");
    }
    else if (command == 't' || command == 'T')
    {
      startDemo();
    }
  }
}
} // namespace

void setup()
{
  Serial.begin(115200);
  delay(500);
  Serial.println("\nATOM 8Servos HAT safe test");

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
    return;
  }

  // Program safe pulses before enabling the v1.1 MOSFET power rail.
  if (!stopBoth())
  {
    Serial.println("ERROR: failed to set initial stop pulses");
    return;
  }

  if (g_hat_address == kV11Address && !writeRegister(kServoPowerRegister, 1))
  {
    Serial.println("ERROR: failed to enable v1.1 servo power");
    return;
  }

  Serial.println("Commands: 't' reruns demo, 's' stops immediately");
  Serial.println("Ready and stopped. Send 't' to start the short demo.");
  enterState(DemoState::Stopped);
}

void loop()
{
  if (g_hat_address == 0)
  {
    delay(1000);
    return;
  }

  handleSerial();
  updateDemo();
  delay(5);
}
