#include <Arduino.h>
#include <M5Unified.h>

namespace
{
constexpr int kSdaPin = 0;
constexpr int kSclPin = 26;
constexpr uint8_t kLegacyAddress = 0x38;
constexpr uint8_t kV11Address = 0x36;
constexpr uint8_t kServoPowerRegister = 0x30;
constexpr uint8_t kServoCount = 8;
constexpr uint16_t kStopPulseUs = 1500;
constexpr uint16_t kRunPulseUs = 1600;
constexpr uint32_t kRunDurationMs = 5000;
constexpr uint32_t kStopFeedbackDurationMs = 500;

enum class MotionState
{
  Idle,
  Running,
  StopFeedback,
  Error,
};

uint8_t g_hat_address = 0;
m5::I2C_Class g_hat_i2c;
MotionState g_motion_state = MotionState::Idle;
uint32_t g_state_started_ms = 0;

void showStatus(uint32_t background, uint32_t foreground,
                const char *title, const char *detail)
{
  M5.Display.fillScreen(background);
  M5.Display.setTextColor(foreground, background);
  M5.Display.setTextSize(2);
  M5.Display.setCursor(8, 12);
  M5.Display.println(title);
  M5.Display.setTextSize(1);
  M5.Display.setCursor(8, 48);
  M5.Display.println(detail);
}

void showIdle()
{
  showStatus(TFT_DARKGREEN, TFT_WHITE, "READY", "Button A: run all servos");
}

void showRunning()
{
  showStatus(TFT_BLUE, TFT_WHITE, "RUNNING", "CH1-CH8 / 5 seconds");
}

void showStopped()
{
  showStatus(TFT_RED, TFT_WHITE, "STOPPED", "Emergency stop");
}

void showError(const char *message)
{
  showStatus(TFT_RED, TFT_WHITE, "ERROR", message);
}

bool deviceResponds(uint8_t address)
{
  return g_hat_i2c.scanID(address, 100000);
}

bool writeRegister(uint8_t reg, uint8_t value)
{
  return g_hat_i2c.writeRegister8(g_hat_address, reg, value, 100000);
}

bool writePulse(uint8_t channel, uint16_t pulse_us)
{
  if (channel >= kServoCount || pulse_us < 500 || pulse_us > 2500)
  {
    return false;
  }

  const uint8_t reg = static_cast<uint8_t>(0x10 + channel * 2);
  const uint8_t data[] = {
      static_cast<uint8_t>(pulse_us >> 8),
      static_cast<uint8_t>(pulse_us & 0xff),
  };
  return g_hat_i2c.writeRegister(g_hat_address, reg, data, sizeof(data), 100000);
}

bool setAllPulses(uint16_t pulse_us)
{
  bool all_ok = true;
  for (uint8_t channel = 0; channel < kServoCount; ++channel)
  {
    all_ok = writePulse(channel, pulse_us) && all_ok;
  }
  return all_ok;
}

void enterState(MotionState state)
{
  g_motion_state = state;
  g_state_started_ms = millis();
}

void stopMotion(bool emergency)
{
  setAllPulses(kStopPulseUs);
  if (emergency)
  {
    showStopped();
    enterState(MotionState::StopFeedback);
    Serial.println("Emergency stop");
  }
  else
  {
    showIdle();
    enterState(MotionState::Idle);
    Serial.println("Five-second run complete; CH1-CH8 stopped");
  }
}

void startMotion()
{
  showRunning();
  if (!setAllPulses(kRunPulseUs))
  {
    setAllPulses(kStopPulseUs);
    showError("Servo command failed");
    enterState(MotionState::Error);
    Serial.println("ERROR: failed to start one or more servo channels");
    return;
  }

  enterState(MotionState::Running);
  Serial.println("Button accepted: CH1-CH8 running for 5 seconds");
}

void updateMotion()
{
  const uint32_t elapsed = millis() - g_state_started_ms;
  switch (g_motion_state)
  {
  case MotionState::Running:
    if (elapsed >= kRunDurationMs)
    {
      stopMotion(false);
    }
    break;

  case MotionState::StopFeedback:
    if (elapsed >= kStopFeedbackDurationMs)
    {
      setAllPulses(kStopPulseUs);
      showIdle();
      enterState(MotionState::Idle);
    }
    break;

  case MotionState::Idle:
    if (elapsed >= 250)
    {
      setAllPulses(kStopPulseUs);
      g_state_started_ms = millis();
    }
    break;

  case MotionState::Error:
    break;
  }
}

void handleInput()
{
  M5.update();
  if (M5.BtnA.wasPressed())
  {
    if (g_motion_state == MotionState::Running)
    {
      stopMotion(true);
    }
    else if (g_motion_state != MotionState::Error)
    {
      startMotion();
    }
  }

  while (Serial.available() > 0)
  {
    const char command = static_cast<char>(Serial.read());
    if (command == 's' || command == 'S')
    {
      stopMotion(true);
    }
    else if ((command == 't' || command == 'T') &&
             g_motion_state != MotionState::Error)
    {
      startMotion();
    }
  }
}
} // namespace

void setup()
{
  auto config = M5.config();
  M5.begin(config);
  Serial.begin(115200);
  delay(300);
  Serial.println("\nM5StickC 8Servos HAT button controller");

  M5.Display.setRotation(1);
  showStatus(TFT_BLACK, TFT_WHITE, "STARTING", "Detecting 8Servos HAT");

  // M5StickC uses I2C port 1 internally. Keep the HAT isolated on port 0.
  if (!g_hat_i2c.begin(I2C_NUM_0, kSdaPin, kSclPin))
  {
    showError("I2C setup failed");
    Serial.println("ERROR: failed to initialize HAT I2C bus");
    enterState(MotionState::Error);
    return;
  }

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
    showError("HAT not found");
    Serial.println("ERROR: 8Servos HAT not found at 0x36 or 0x38");
    enterState(MotionState::Error);
    return;
  }

  if (!setAllPulses(kStopPulseUs))
  {
    showError("Initial stop failed");
    Serial.println("ERROR: failed to set initial stop pulses");
    enterState(MotionState::Error);
    return;
  }

  if (g_hat_address == kV11Address && !writeRegister(kServoPowerRegister, 1))
  {
    showError("Power enable failed");
    Serial.println("ERROR: failed to enable v1.1 servo power");
    enterState(MotionState::Error);
    return;
  }

  showIdle();
  enterState(MotionState::Idle);
  Serial.println("Button A: start 5-second run; press again to stop");
  Serial.println("Serial commands: 't' starts, 's' stops immediately");
}

void loop()
{
  handleInput();
  updateMotion();
  delay(5);
}
